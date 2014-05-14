var asterface = angular.module('asterface', ['ngSanitize']);
var A = new AsterixDBConnection({
  dataverse: "Metadata"
});

asterface.controller('AsterfaceCtrl', function($scope, $http){

  $scope.itemsPerPage = 30;
  $scope.page = 1;
  $scope.currentDataverse = false;
  $scope.currentDataset = false;
  loadDatabase();

  function loadDatabase()
  {
    // Load dataverses
    var query = new FLWOGRExpression()
      .ForClause("$dv", new AExpression("dataset Dataverse"))
      .ReturnClause("$dv");
    
    runQuery(query.val(), function(json){
      $scope.dataverses = {};
      angular.forEach(json, function(row){
        $scope.dataverses[row.DataverseName] = row;
      });
    });
  }
  
  
  function runQuery(query, func)
  {
    A.query(query, function(txt){
      $scope.$apply(function(){
        var json = eval('([' + txt.results + '])');
        func(json);
      });
    });
  }
  
	$scope.loadDataverse = function()
	{
	  var dv = $scope.currentDataverse;
	  $scope.datasets = {};
	  var query = new FLWOGRExpression()
	    .ForClause("$ds", new AExpression("dataset Dataset"))
	    .WhereClause(new AExpression("$ds.DataverseName=\"" + dv + "\""))
	    .ReturnClause("$ds");
	    
    runQuery(query.val(), function(json){
      angular.forEach(json, function(ds){
        $scope.datasets[ds.DatasetName] = ds;
      });

      $scope.currentDataset = false;
      $scope.records = [];
      
    });
	};
	
	$scope.loadDataset = function()
  {
    if(!$scope.currentDataverse || !$scope.currentDataset) return;
    var query = new FLWOGRExpression()
      .ForClause("$d", new AExpression("dataset " + $scope.currentDataverse + "." + $scope.currentDataset))
      .LimitClause(new AExpression($scope.itemsPerPage + " offset " + ($scope.page-1)*$scope.itemsPerPage))
      .ReturnClause("$d");
      
    runQuery(query.val(), function(json){
      $scope.records = [];

      angular.forEach(json, function(row){
        $scope.records.push(row);
      });
    });
  };
  
  $scope.loadQuery = function()
  {
    if(!$scope.currentDataverse){
      alert("You need to select a dataverse!");
      return; // requires dataverse to be selected
    }
    
    runQuery($scope.query, function(json){
      $scope.records = [];
      angular.forEach(json, function(row){
        $scope.records.push(row);
      });
    });
  }
  
  $scope.printValue = function(val)
  {

    if(angular.isObject(val))
    {
      if(val.hasOwnProperty('unorderedlist'))
      {
        var html = '<div class="unorderedlist">';
        for(var k in val.unorderedlist)
        {
          html += '<div class="datum">';
          html += $scope.printValue(val.unorderedlist[k]);
          html += '</div>';
        }
        html += '</div>';
        return html;
      }
      else if(val.hasOwnProperty('orderedlist'))
      {
        var html = '<div class="orderedlist">';
        for(var k in val.orderedlist)
        {
          html += '<div class="datum">';
          html += $scope.printValue(val.orderedlist[k]);
          html += '</div>';
        }
        html += '</div>';
        return html;
      }
      // Integer
      else if(extractInt(val) !== false)
      {
        return '<span class="number">' + extractInt(val) + '</span>';
      }
      else
      {
        var html = '<div class="record">';
        for(var k in val)
        {
          html += '<div class="datum">';
          html += '<div class="field">' + k + '</div>';
          html += '<div class="value">' + $scope.printValue(val[k]) + '</div>';
          html += '</div>';
        }
        html += '</div>';
        return html;
      }
    }
    else
    {
      return val;    
    }
  }
  
  $scope.deleteRecord = function(rid)
  {
    var pk = $scope.datasets[$scope.currentDataset].InternalDetails.PrimaryKey.orderedlist;
    var record = $scope.records[rid];
    var comps = [];
    for(var k in pk)
    {
      var key = pk[k];
      var val = false;
      
      // support integers
      if(extractInt(record[key]) !== false) val = extractInt(record[key]);
      else if(typeof record[key] == "string") val = '"' + record[key] + '"';
      else alert("Unknown value (" + key + "): " + record[key]);
      
      if(val === false){ return }
      
      comps.push(new AExpression("$r." + key + "=" + val));
    }
    
    var where = new WhereClause();
    where.and(comps);
    
    var delStmt = new DeleteStatement("$r", $scope.currentDataverse + "." + $scope.currentDataset, where);
    alert(delStmt.val());
    A.update(delStmt.val(), function(){ $scope.$apply(function(){ $scope.loadDataset(); })});
    
  }
  
  $scope.insertRecord = function()
  {
    var ins = new InsertStatement($scope.currentDataverse + "." + $scope.currentDataset,
      {
        id: $scope.records.length,
        name: "Haha"
      });
    A.update(ins.val(), function(){ $scope.$apply(function(){ $scope.loadDataset(); })});
  }
  
  function extractInt(obj)
  {
    if(typeof obj !== "object") return false;
    if(obj.hasOwnProperty("int32")) return obj["int32"];
    if(obj.hasOwnProperty("int16")) return obj["int16"];
    if(obj.hasOwnProperty("int8")) return obj["int8"];
    return false;
  }
});



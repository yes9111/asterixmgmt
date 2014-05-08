var asterface = angular.module('asterface', ['ngSanitize']);
var A = new AsterixDBConnection({
  dataverse: "Metadata"
});

asterface.controller('AsterfaceCtrl', function($scope, $http){
  function loadDatabase()
  {
    // Load dataverses
    var query = new FLWOGRExpression()
      .ForClause("$dv", new AExpression("dataset Dataverse"))
      .ReturnClause("$dv.DataverseName");
    
    runQuery(query.val(), function(json){
      $scope.dataverses = [];
      angular.forEach(json, function(row){
        $scope.dataverses.push(row);
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
  
  loadDatabase();
  
	$scope.loadDataverse = function()
	{
	  var dv = $scope.currentDataverse;
	  $scope.datasets = [];
	  var query = new FLWOGRExpression()
	    .ForClause("$ds", new AExpression("dataset Dataset"))
	    .WhereClause(new AExpression("$ds.DataverseName=\"" + dv + "\""))
	    .ReturnClause("$ds.DatasetName");
	    
    runQuery(query.val(), function(json){
      angular.forEach(json, function(ds){
        $scope.datasets.push(ds);
      });
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
      else if(val.hasOwnProperty('int32'))
      {
        return '<span class="number">' + val['int32'] + '</span>';
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
  
  $scope.itemsPerPage = 30;
  $scope.page = 1;
});



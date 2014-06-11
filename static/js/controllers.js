var controllers = {};

controllers.BrowseController = function($scope){
  $scope.insert.update = function()
  {
    var record = {};
    
    $(".insert-field").each(function(box){
      var field = $(this);
      var fieldType = field.attr("fieldtype");
      
      switch(fieldType)
      {
      case "int8": case "int16": case "int32": case "int64":
        record[ field.attr("name") ] = new AExpression( field.val() );
        break;
        
      case "string":
        record[ field.attr("name") ] = field.val();
        break;
      default:
        alert("Unknown field type.");
        return;
      }

    });
    
    var insStmt = new InsertStatement($scope.getQualifiedLocation(), record);
    A.update(insStmt.val(), $scope.refreshRecords);
  };
  
  $scope.deleteRecord = function(rid)
  {
    var pk = $scope.data.datasets[$scope.browsing.dataset].InternalDetails.PrimaryKey.orderedlist;
    var record = $scope.data.records[rid];
    var comps = [];
    for(var k in pk)
    {
      var key = pk[k];
      var val = false;
      
      // support integers
      if(parser.extractInt(record[key]) !== false) val = parser.extractInt(record[key]);
      else if(typeof record[key] == "string") val = '"' + record[key] + '"';
      else alert("Unknown value (" + key + "): " + record[key]);
      
      if(val === false){ return }
      
      comps.push(new AExpression("$r." + key + "=" + val));
    }
    
    var where = new WhereClause();
    where.and(comps);
    
    var delStmt = new DeleteStatement("$r", $scope.getQualifiedLocation(), where);
    A.update(delStmt.val(), $scope.refreshRecords);
  };
  
  $scope.toggleForm = function()
  {
    $scope.browsing.showInsertForm = !$scope.browsing.showInsertForm;
  };
  
  
};

controllers.NewDatasetController = function($scope){
  $scope.createDataset = function()
  {
    var query = 'create dataset ' + $scope.datasetForm['name'] + ' (' + $scope.datasetForm['type'] + ') primary key ';
    query += $scope.datasetForm.primarykey;
    
    alert(query);
    A.dataverse($scope.browsing.dataverse).ddl(query, function(){
      alert("Successfully created dataset");
    });
  };
};

// New datatype controller
// Controller for the view for inserting new data types


controllers.NewDatatypeController = function($scope){
  $scope.dataTypeForm = {
    name: "",
    fields: []
  };

  $scope.createDatatype = function()
  {
    // serialize the data
    var query = 'create type ' + $scope.dataTypeForm['name'] + ' as ';
    query += ($scope.dataTypeForm.isOpen ? 'open' : 'closed') + ' {';

    var fields = [];
    
    for(var key in $scope.dataTypeForm.fields)
    {
      var field = $scope.dataTypeForm.fields[key];
      fields.push(field['name'] + ' : ' + field.type);
    }
    
    query += fields.join(',') + '}';
    
    A.dataverse($scope.browsing.dataverse).ddl(query, function(){
      alert("Successfully added type");
    });
  }
  
  $scope.dataTypeForm.addField = function()
  {
    $scope.dataTypeForm.fields.push({
      name: $scope.dataTypeForm.newFieldName,
      type: $scope.dataTypeForm.newFieldType
    });
  };
  
};

controllers.BaseController = function($scope, $http, $location){
  $scope.browsing = { 
    dataverse: false, 
    dataset: false,
    paging: {
      itemsPerPage: 30,
      page: 1
    },
    showInsertForm: false,
  };
  
  $scope.data = {};
  $scope.insert = {};
  
  loadDatabase();

  function loadDatabase()
  {
    // Load dataverses
    var query = new FLWOGRExpression()
      .ForClause("$dv", new AExpression("dataset Dataverse"))
      .ReturnClause("$dv");
    
    runQuery(query.val(), function(json){
      $scope.data.dataverses = {};
      angular.forEach(json, function(row){
        $scope.data.dataverses[row.DataverseName] = row;
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
	  var dv = $scope.browsing.dataverse;
	  $scope.data.datasets = {};
	  $scope.data.datatypes = {};
	  var query = new FLWOGRExpression()
	    .ForClause("$ds", new AExpression("dataset Dataset"))
	    .WhereClause(new AExpression("$ds.DataverseName=\"" + dv + "\""))
	    .ReturnClause("$ds");
	    
    runQuery(query.val(), function(json){
      angular.forEach(json, function(ds){
        $scope.data.datasets[ds.DatasetName] = ds;
      });

      $scope.browsing.dataset = false;
      $scope.data.records = [];
    });
    
    var typesQuery = new FLWOGRExpression()
      .ForClause("$dt", new AExpression("dataset Metadata.Datatype"))
      .WhereClause(new AExpression("$dt.DataverseName=\"" + dv + "\""))
      .ReturnClause("$dt");
    
    runQuery(typesQuery.val(), function(json){
      angular.forEach(json, function(dt){
        $scope.data.datatypes[dt.DatatypeName] = dt;
      });
    });
	};
	
	$scope.loadDataset = function()
  {
    if(!$scope.browsing.dataverse || !$scope.browsing.dataset) return;
    var query = new FLWOGRExpression()
      .ForClause("$d", new AExpression("dataset " + $scope.getQualifiedLocation()))
      .LimitClause(new AExpression($scope.browsing.paging.itemsPerPage + " offset " + ($scope.browsing.paging.page-1)*$scope.browsing.paging.itemsPerPage))
      .ReturnClause("$d");


    runQuery(query.val(), function(json){
      $scope.data.records = [];

      angular.forEach(json, function(row){
        $scope.data.records.push(row);
      });
      
      $scope.loadInsertForm();
      $location.path('/browse');
    });
  };
  
  $scope.loadQuery = function()
  {
    if(!$scope.browsing.dataverse){
      alert("You need to select a dataverse!");
      return; // requires dataverse to be selected
    }
    
    runQuery($scope.browsing.query, function(json){
      $scope.data.records = [];
      angular.forEach(json, function(row){
        $scope.data.records.push(row);
      });
    });
  };
  
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
      else if(parser.extractInt(val) !== false)
      {
        return '<span class="number">' + parser.extractInt(val) + '</span>';
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
  };
  
  $scope.loadInsertForm = function()
  {
    // read current dataset type
//    var searchStmt = new FLWOGRExpression().ForClause("$f", new AExpression("dataset Metadata.Datatype")).WhereClause("$f.Dataset
    var typeName = $scope.data.datasets[$scope.browsing.dataset].DataTypeName;
    var getTypeStmt = new FLWOGRExpression().ForClause("$f", new AExpression("dataset Metadata.Datatype"))
      .WhereClause().and(
        new AExpression("$f.DatatypeName=\"" + typeName + "\""), 
        new AExpression("$f.DataverseName=\"" + $scope.browsing.dataverse + "\""))
      .ReturnClause("$f");

    runQuery(getTypeStmt.val(), function(json){
      var type = json[0];

      $scope.insert.isOpen = type.Derived.Record.IsOpen;
      $scope.insert.fields = type.Derived.Record.Fields.orderedlist;      
    });
  };
  
  $scope.refreshRecords = function()
  {
    $scope.$apply($scope.loadDataset);
  }
  
  $scope.getQualifiedLocation = function()
  {
    return $scope.browsing.dataverse + "." + $scope.browsing.dataset;
  }
};



var controllers = {};

asterface.controller('BrowseController', function($scope, $location){
  $scope.insert.extraFields = [];
  
  $scope.insert.update = function()
  {
    var record = {};
    
    $(".insert-field, .insert-field-extra").each(function(box){
      var field = $(this);
      var fieldType = field.attr("fieldtype");
      
      switch(fieldType)
      {
      case "int8": case "int16": case "int32": case "int64": case "float": case "double":
        record[ field.attr("name") ] = new AExpression( fieldType + "(\"" + field.val() + "\")");
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
  
  $scope.insert.addField = function(){
    $scope.insert.extraFields.push({
      FieldName: $scope.insert.newField.Name,
      FieldType: $scope.insert.newField.Type
    });
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
      if(helper.extractNumber(record[key]) !== false) val = helper.extractNumber(record[key]);
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
  
  $scope.magnifyRecord = function (rid){
    $location.path('/row/' + rid);
  };
  
  $scope.toggleForm = function() {
    $scope.browsing.showInsertForm = !$scope.browsing.showInsertForm;
  };
  
  $scope.getExtraFields = function(fields, exclude){
    var result = {}
    for(var field in fields){
      if(fields.hasOwnProperty(field)){
        result[field] = true;
      }
    }
    
    for(var i in exclude) {
      delete result[exclude[i].FieldName];
    }
    
    return result;
  };
  
  
  $scope.browsing.printValue = function(v){
    if(angular.isString(v)) return v;
    if(helper.extractNumber(v) !== false) return helper.extractNumber(v);
    else  return "Undefined presenter";
  }
});

asterface.controller('RowController', function($scope, $routeParams){
  $scope.rowId = $routeParams.rid;
  
  
  
  $scope.back = function(){
    window.history.back();
  };
});

asterface.controller('NewDatasetController', function($scope){
  $scope.createDataset = function()
  {
    var query = 'create dataset ' + $scope.datasetForm['name'] + ' (' + $scope.datasetForm['type'] + ') primary key ';
    query += $scope.datasetForm.primarykey;
    
    A.dataverse($scope.browsing.dataverse).ddl(query, function(){
      alert("Successfully created dataset");
      $scope.$apply(function(){
        $scope.loadDataverse();
      });
    });
  };
});

// New datatype controller
// Controller for the view for inserting new data types


asterface.controller('NewDatatypeController', function($scope){
  $scope.dataTypeForm = {
    name: "",
    fields: [],
    newFieldOptional: false
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
      fields.push(field['name'] + ' : ' + field.type + (field.isOptional? "?": ""));
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
      type: $scope.dataTypeForm.newFieldType,
      isOptional: $scope.dataTypeForm.newFieldOptional
    });
  };
  
  $scope.dataTypeForm.removeField = function(index)
  {
    $scope.dataTypeForm.fields.splice(index, 1);
  }
  
});

asterface.controller('BaseController', function($scope, $http, $location){
  $scope.browsing = { 
    dataverse: false, 
    dataset: false,
    paging: {
      itemsPerPage: 30,
      page: 1
    },
    showInsertForm: false,
    numCollapsible: 0
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
    
    runQuery('Metadata', query.val(), function(json){
      $scope.data.dataverses = {};
      angular.forEach(json, function(row){
        $scope.data.dataverses[row.DataverseName] = row;
      });
    });
  };
  
  
  function runQuery(dataverse, query, func)
  {
    A.dataverse(dataverse).query(query, function(txt){
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
	  
	  runQuery('Metadata', query.val(), function(json){
	    angular.forEach(json, function(ds){
	      $scope.data.datasets[ds.DatasetName] = ds;
	    });
	    $scope.browsing.dataset = false;
	    $scope.data.records = [];
	  });

    var typesQuery = new FLWOGRExpression()
      .ForClause("$dt", new AExpression("dataset Datatype"))
      .WhereClause(new AExpression("$dt.DataverseName=\"" + dv + "\""))
      .ReturnClause("$dt");
    
    runQuery('Metadata', typesQuery.val(), function(json){
      angular.forEach(json, function(dt){
        $scope.data.datatypes[dt.DatatypeName] = dt;
      });
    });
	};
	
	$scope.loadDataset = function() {
    if(!$scope.browsing.dataverse || !$scope.browsing.dataset) return;
    var query = new FLWOGRExpression()
      .ForClause("$d", new AExpression("dataset " + $scope.getQualifiedLocation()))
      .LimitClause(new AExpression($scope.browsing.paging.itemsPerPage + " offset " + ($scope.browsing.paging.page-1)*$scope.browsing.paging.itemsPerPage))
      .ReturnClause("$d");

    // fill up simpleFields.      
    var datatype = $scope.data.datasets[$scope.browsing.dataset].DataTypeName;
    var simpleFields = $scope.data.datatypes[datatype].Derived.Record.Fields.orderedlist;

    $scope.browsing.simpleFields = [];
    for(var i in simpleFields) {
      if(helper.simpleTypes.hasOwnProperty(simpleFields[i].FieldType)){
        $scope.browsing.simpleFields.push(simpleFields[i]);
      }
    }

    runQuery($scope.browsing.dataverse, query.val(), function(json){
      $scope.data.records = [];
      angular.forEach(json, function(row){
        $scope.data.records.push(row);
      });
      
      $scope.loadInsertForm();
      $location.path('/browse');
    });
  };
  
  $scope.loadInsertForm = function()
  {
    var typeName = $scope.data.datasets[$scope.browsing.dataset].DataTypeName;
    var type = $scope.data.datatypes[typeName];

    $scope.insert.isOpen = type.Derived.Record.IsOpen;
    $scope.insert.fields = type.Derived.Record.Fields.orderedlist;      
  };
  
  $scope.refreshRecords = function()
  {
    $scope.$apply($scope.loadDataset);
  }
  
  $scope.getQualifiedLocation = function()
  {
    return $scope.browsing.dataverse + "." + $scope.browsing.dataset;
  }
  
  $scope.printRowDetail = function(val)
  {
    if(helper.extractNumber(val) !== false) {
        return '<span class="number">' + helper.extractNumber(val) + '</span>';
    }
    else if(angular.isObject(val))
    {
      if(val.hasOwnProperty('unorderedlist'))
      {
        var html = '<div class="collapsible unorderedlist" id="c' + $scope.browsing.numCollapsible + '">';
        html += 'Unordered List</div>';
        html += '<div class="unorderedlist" class="content">';
        for(var k in val.unorderedlist)
        {
          html += '<div class="datum">';
          html += $scope.printRowDetail(val.unorderedlist[k]);
          html += '</div>';
        }
        html += '</div>';
        return html;
      }
      else if(val.hasOwnProperty('orderedlist')){
        var html = '<div class="collapsible orderedlist" id="c' + $scope.browsing.numCollapsible + '">';
        html += 'Ordered List</div>';
        html += '<div class="content orderedlist">';
        for(var k in val.orderedlist) {
          html += '<div class="datum">';
          html += $scope.printRowDetail(val.orderedlist[k]);
          html += '</div>';
        }
        html += '</div>';
        return html;
      }
      else {
        var html='<div class="collapsible record" id="c' + $scope.browsing.numCollapsible + '">';
        html += 'Record</div>';
        html += '<div class="content">';
        html += '<table class="record">';
        for(var k in val) {
          html += '<tr>';
          html += '<td class="field-name">' + k + '</td>';
          html += '<td class="field-value">' + $scope.printRowDetail(val[k]) + '</td>';
          html += '</tr>';
        }
        html += '</table></div>';
        return html;
      }
    }
    else{
      return val;    
    }
  };
});

asterface.controller('QueryController', function($scope){
  $scope.query = {};
  
  $scope.query.loadQuery = function()
  {
    if($scope.browsing.dataverse) A.dataverse($scope.browsing.dataverse);
    A.query($scope.query.txt, function(json){
      var results = eval(json);
      $scope.$apply(function(){
        $scope.query.results = results.results;
      });
    });
  };
});



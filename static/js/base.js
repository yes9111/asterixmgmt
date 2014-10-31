'use strict'
angular.module('asterface')
.controller('BaseController', ['$scope', '$http', '$location', 'asterix', function($scope, $http, $location, asterix){
  var A = asterix.db;
  $scope.browsing = {
    dataverse: false,
    dataset: false,
    paging: {
      itemsPerPage: 30,
      page: 1
    },
    showInsertForm: false,
    numCollapsible: 0,
    getLocation: function(){
      return this.dataverse + '.' + this.dataset;
    }
  };

  $scope.data = {};
  $scope.insert = {};

  $scope.$watch('browsing.dataverse', function(newDV, oldDV){
    if(newDV !== false){
      $scope.loadDataverse();
    }
  });

  $scope.$watch('browsing.dataset', function(newDS, oldDS){
    if(newDS !== false){
      $scope.loadDataset();
    }
  });

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
	  if(!$scope.browsing.dataverse) return;
	  $scope.data.datasets = {};
	  $scope.data.datatypes = {};
	  var query = new FLWOGRExpression()
	    .ForClause("$ds", new AExpression("dataset Dataset"))
	    .WhereClause(new AExpression("$ds.DataverseName=\"" + $scope.browsing.dataverse + "\""))
	    .ReturnClause("$ds");

	  runQuery('Metadata', query.val(), function(json){
	    angular.forEach(json, function(ds){
	      $scope.data.datasets[ds.DatasetName] = ds;
	    });
	    $scope.data.records = [];
	  });

    var typesQuery = new FLWOGRExpression()
      .ForClause("$dt", new AExpression("dataset Datatype"))
      .WhereClause(new AExpression("$dt.DataverseName=\"" + $scope.browsing.dataverse  + "\""))
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
      .ForClause("$d", new AExpression("dataset " + $scope.browsing.getLocation()))
      .LimitClause(new AExpression($scope.browsing.paging.itemsPerPage + " offset " + ($scope.browsing.paging.page-1)*$scope.browsing.paging.itemsPerPage))
      .ReturnClause("$d");

    // fill up simpleFields.
    var datatype = $scope.data.datasets[$scope.browsing.dataset].DataTypeName;
    var simpleFields = $scope.data.datatypes[datatype].Derived.Record.Fields.orderedlist;

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
}])

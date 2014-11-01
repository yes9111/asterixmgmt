'use strict'
angular.module('asterface')
.controller('BaseController', ['$scope', '$http', '$location', 'asterix', function($scope, $http, $location, asterix){
  $scope.browsing = {
    paging: {
      itemsPerPage: 30,
      page: 1
    },
    showInsertForm: false,
    numCollapsible: 0,
  };

  $scope.data = {};
  $scope.insert = {};
  $scope.asterix = asterix;

  loadDatabase();

  function loadDatabase()
  {
    // Load dataverses
    $scope.data.dataverses = {};

    asterix.query('Metadata', 'for $dv in dataset Dataverse return $dv;')
    .then(function(results){
      results.data.forEach(function(row){
        $scope.data.dataverses[row.DataverseName] = row;
      });
    });
  };

	$scope.loadDataverse = function()
	{
	  $scope.data.datasets = {};
	  $scope.data.datatypes = {};

    asterix.query('Metadata', sprintf('for $ds in dataset Dataset where $ds.DataverseName="%s" return $ds',
      asterix.currentDataverse
    )).then(function(results){
      results.data.forEach(function(dataset){
        $scope.data.datasets[dataset.DatasetName] = dataset;
      });
      $scope.data.records = [];
    });

    asterix.query('Metadata', sprintf('for $dt in dataset Datatype where $dt.DataverseName="%s" return $dt',
      asterix.currentDataverse
    )).then(function(results){
      results.data.forEach(function(datatype){
        $scope.data.datatypes[datatype.DatatypeName] = datatype;
      });
    });
	};

	$scope.loadDataset = function() {
    // fill up simpleFields.
    var query = sprintf('for $d in dataset %s.%s limit %d offset %d return $d',
      asterix.currentDataverse,
      asterix.currentDataset,
      $scope.browsing.paging.itemsPerPage,
      ($scope.browsing.paging.page-1)*$scope.browsing.paging.itemsPerPage
    );

    asterix.query('Metadata', query).then(function(results){
      $scope.data.records = results.data;
      $scope.loadInsertForm();
      $location.path('/browse');
    });
  };

  $scope.loadInsertForm = function()
  {
    var typeName = $scope.data.datasets[asterix.currentDataset].DataTypeName;
    var type = $scope.data.datatypes[typeName];

    $scope.insert.isOpen = type.Derived.Record.IsOpen;
    $scope.insert.fields = type.Derived.Record.Fields.orderedlist;
  };
}])

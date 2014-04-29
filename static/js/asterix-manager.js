var asterface = angular.module('asterface', []);
var A = new AsterixDBConnection({
  dataverse: "Metadata"
});

asterface.controller('AsterfaceCtrl', function($scope, $http){
  var getQueryURL = function(queryObj)
  {
    return 'query?query='+encodeURIComponent('use dataverse Metadata;' + queryObj.val());
  };
  
  function loadDatabase()
  {
    // Load dataverses
    var query = new FLWOGRExpression()
      .ForClause("$dv", new AExpression("dataset Dataverse"))
      .ReturnClause("$dv.DataverseName");
    
    runQuery(query, function(json){
      $scope.dataverses = [];
      angular.forEach(json, function(row){
        $scope.dataverses.push(row);
      });
    });
  }
  
  
  function runQuery(query, func)
  {
    A.query(query.val(), function(txt){
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
    runQuery(query, function(json){
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
    runQuery(query, function(json){
      $scope.records = [];
      angular.forEach(json, function(row){
        $scope.records.push(row);
      });
    });
  };
  
  $scope.loadQuery = function()
  {
    if(!$scope.currentDataverse) return; // requires dataverse to be selected
    
    runQuery($scope.query, function(json){
      $scope.records = [];
      angular.forEach(json, function(row){
        $scope.records.push(row);
      });
    });
  }
  
  $scope.itemsPerPage = 30;
  $scope.page = 1;
});



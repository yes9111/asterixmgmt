var asterface = angular.module('asterface', []);

asterface.controller('AsterfaceCtrl', function($scope, $http){
  var getQueryURL = function(queryObj)
  {
    return 'query?query='+encodeURIComponent('use dataverse Metadata;' + queryObj.val());
  };


  // Load dataverses
  var query = new FLWOGRExpression()
    .ForClause("$dv", new AExpression("dataset Dataverse"))
    .ReturnClause("$dv.DataverseName");
    
  
	$http.get(getQueryURL(query)).success(function(data){
   	$scope.dataverses = [];
    angular.forEach(data.results, function(dv){
      $scope.dataverses.push(parseAsterix(dv));
    });
	});
	
	$scope.loadDataverse = function()
	{
	  var dv = $scope.currentDataverse;
	  $scope.datasets = [];
	  var query = new FLWOGRExpression()
	    .ForClause("$ds", new AExpression("dataset Dataset"))
	    .WhereClause(new AExpression("$ds.DataverseName=\"" + dv + "\""))
	    .ReturnClause("$ds.DatasetName");
	  $http.get(getQueryURL(query)).success(function(data){
	    angular.forEach(data.results, function(ds){
	      $scope.datasets.push(parseAsterix(ds));
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
    $http.get(getQueryURL(query)).success(function(data){
      $scope.insideText = '';
      angular.forEach(data.results, function(d){
        $scope.insideText += '<b>Output</b>' + d;
      });
    });
    
  };
	
	$scope.insideText = false;
	$scope.itemsPerPage = 30;
	$scope.page = 1;
});



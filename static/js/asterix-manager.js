var asterface = angular.module('asterface', []);

function parseAsterix(txt)
{
  /*  take Asterix output from the REST API
      and turn it into JSON
      most of the Asterix input can be fed into parseJSON directly, with a few exceptions.
      Records -> Remove quotes around field names
      Ordered Lists -> Fine
      Unordered Lists -> Records with random key names,
      Time, Datetime, Duration, Interval
      Polygon, Circle, Rectangle, Line, Point,
      double, float, ints
  */
  
  
}

asterface.controller('AsterfaceCtrl', function($scope, $http){
  var getQueryURL = function(queryObj)
  {
    return 'query?query='+encodeURIComponent('use dataverse Metadata;' + queryObj.val());
  };


  // Load dataverses
  var query = new FLWOGRExpression()
    .ForClause("$dv", new AExpression("dataset Dataverse"))
    .ReturnClause("$dv");
    
  
	$http.get(getQueryURL(query)).success(function(data){
   	$scope.dataverses = [];
    angular.forEach(data.results, function(dv){
      $scope.dataverses.push($.parseJSON(dv));
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
	      $scope.datasets.push($.parseJSON(ds));
	    });
	  });
	};
	
	$scope.loadDataset = function()
  {
    var query = new FLWOGRExpression()
      .ForClause("$d", new AExpression("dataset " + $scope.currentDataverse + "." + $scope.currentDataset))
      .ReturnClause("$d");
    $http.get(getQueryURL(query)).success(function(data){
      $scope.insideText = '';
      angular.forEach(data.results, function(d){
        $scope.insideText += '<b>Output</b>' + d;
      });
    });
    
  };
	
	$scope.insideText = false;
	
});



angular.module('asterface')
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/query', {
    templateUrl: '/static/partials/query.html',
    controller: 'QueryController'
  });
}])
.controller('QueryController', ['$scope', 'asterix', function($scope, asterix){
  $scope.query = {};
  
  $scope.query.loadQuery = function()
  {
    if($scope.browsing.dataverse) asterix.db.dataverse($scope.browsing.dataverse);
    asterix.db.query($scope.query.txt, function(json){
      var results = eval(json);
      $scope.$apply(function(){
        $scope.query.results = results.results;
      });
    });
  };
}]);



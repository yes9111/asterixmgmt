angular.module('asterface')
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/query', {
    templateUrl: '/static/partials/query.html',
    controller: 'QueryController'
  });
}])
.controller('QueryController', ['$scope', 'asterix', function($scope, asterix){
  $scope.query = {};
  $scope.asterix = asterix;

  $scope.query.loadQuery = function()
  {
    asterix.query(asterix.currentDataverse, $scope.query.txt)
    .then(function(results){
      $scope.query.results = results.data;
    });
  };
}]);

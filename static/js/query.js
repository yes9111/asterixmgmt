angular.module('asterface')
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/query', {
    templateUrl: '/static/partials/query.html',
    controller: 'QueryController'
  });
}])
.controller('QueryController', ['$scope', 'asterix', 'base', function($scope, asterix, base){
  $scope.query = {};
  $scope.asterix = asterix;

  $scope.query.loadQuery = function()
  {
    asterix.query(base.currentDataverse, $scope.query.txt)
    .then(function(results){
      $scope.query.results = results.data;
    });
  };
}]);

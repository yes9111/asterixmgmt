angular.module('asterface')
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/row/:rid', {
    templateUrl: '/static/partials/viewrow.html',
    controller: 'RowController'
  });
}])
.controller('RowController', function($scope, $routeParams){
  $scope.rowId = $routeParams.rid;
  
  $scope.back = function(){
    window.history.back();
  };
})

var testControllers = angular.module('test', []);

testControllers.controller('TestCtrl', function($scope, $http){
  $http.get('data.json').success(function(data){
    $scope.family = data;
  });
});

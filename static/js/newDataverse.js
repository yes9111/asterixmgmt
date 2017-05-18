angular.module('asterface')
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/newdataverse', {
    templateUrl:  '/static/partials/newDataverse.html',
    controller: 'NewDataverseController'
  });
}])
.controller('NewDataverseController', ['$scope', '$location', 'asterix', 'base', function($scope, $location, asterix, base){
  $scope.createDataverse = function(){
    asterix.ddl(sprintf('create dataverse %s', $scope.dataverseName)).then(function(){
      alert('Successfully created dataverse ' + $scope.dataverseName);
    });
    
  };
}])

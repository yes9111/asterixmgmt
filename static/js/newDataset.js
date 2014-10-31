angular.module('asterface')
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/newdataset', {
    templateUrl:  '/static/partials/datasetform.html',
    controller: 'NewDatasetController'
  });
}])
.controller('NewDatasetController', ['$scope', 'asterix', function($scope, asterix){
  const A = asterix.db;
  $scope.datasetForm = {
    primaryKeys: []
  };
  
  $scope.datasetForm.addPrimaryKey = function(){
    $scope.datasetForm.primaryKeys.push($scope.datasetForm.newPrimaryKey);
  };
  
  $scope.datasetForm.removePK = function(pkIndex){
    $scope.datasetForm.primaryKeys.splice(pkIndex, 1);
  };
  
  $scope.datasetForm.createDataset = function()
  {
    var query = 'create dataset ' + $scope.datasetForm['name'] + ' (' + $scope.datasetForm['type'] + ') primary key ';
    var pkString = $scope.datasetForm.primaryKeys.join(',');
    query += pkString;
    
    A.dataverse($scope.browsing.dataverse).ddl(query, function(){
      alert("Successfully created dataset");
      $scope.$apply(function(){
        $scope.loadDataverse();
      });
    });
  };
}])


angular.module('asterface')
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/newdataset', {
    templateUrl:  '/static/partials/datasetform.html',
    controller: 'NewDatasetController'
  });
}])
.controller('NewDatasetController', ['$scope', '$location', 'asterix', 'base', function($scope, $location, asterix, base){
  $scope.datasetForm = {
    primaryKeys: [],
    newPrimaryKey: false
  };

  $scope.datasetForm.addPrimaryKey = function(){
    $scope.datasetForm.primaryKeys.push($scope.datasetForm.newPrimaryKey);
  };

  $scope.datasetForm.removePK = function(pkIndex){
    $scope.datasetForm.primaryKeys.splice(pkIndex, 1);
  };

  $scope.datasetForm.createDataset = function()
  {
    var query = sprintf('create dataset %s (%s) primary key %s',
      $scope.datasetForm['name'],
      $scope.datasetForm['type'],
      $scope.datasetForm.primaryKeys.join(',')
    );

    asterix.ddl(base.currentDataverse, query).then(function(result){
      base.loadDatasets().then(function(){
        base.currentDataset = $scope.datasetForm['name'];
        $location.path('/browse');
      })
    });
  };
}])

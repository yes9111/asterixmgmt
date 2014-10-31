'use strict'
angular.module('asterface')
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/newdatatype', {
    templateUrl: '/static/partials/datatypeform.html',
    controller: 'NewDatatypeController'
  });
}])
.controller('NewDatatypeController', ['$scope', 'asterix', function($scope, asterix){
  var A = asterix.db;

  $scope.dataTypeForm = {
    name: "",
    fields: [],
    newFieldOptional: false
  };

  $scope.createDatatype = function()
  {
    // serialize the data
    var query = 'create type ' + $scope.dataTypeForm['name'] + ' as ';
    query += ($scope.dataTypeForm.isOpen ? 'open' : 'closed') + ' {';

    var fields = [];

    for(var key in $scope.dataTypeForm.fields)
    {
      var field = $scope.dataTypeForm.fields[key];
      fields.push(field['name'] + ' : ' + field.type + (field.isOptional? "?": ""));
    }

    query += fields.join(',') + '}';

    A.dataverse($scope.browsing.dataverse).ddl(query, function(){
      alert("Successfully added type");
    });
  }

  $scope.dataTypeForm.addField = function()
  {
    $scope.dataTypeForm.fields.push({
      name: $scope.dataTypeForm.newFieldName,
      type: $scope.dataTypeForm.newFieldType,
      isOptional: $scope.dataTypeForm.newFieldOptional
    });
  };

  $scope.dataTypeForm.removeField = function(index)
  {
    $scope.dataTypeForm.fields.splice(index, 1);
  }

}])

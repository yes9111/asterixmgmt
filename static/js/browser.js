'use strict'
// Browser.js
angular.module('asterface')
.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/browse', {
    templateUrl: '/static/partials/browser.html',
    controller: 'BrowseController'
  });
}])
.controller('BrowseController', ['$scope', '$location', 'asterix', 'types', 'base', function($scope, $location, asterix, types, base){
  var A = asterix.db;
  $scope.insert.extraFields = [];

  $scope.insert.update = function()
  {
    var record = {};

    $(".insert-field, .insert-field-extra").each(function(box){
      var field = $(this);
      var fieldType = field.attr("fieldtype");

      switch(fieldType)
      {
      case "int8": case "int16": case "int32": case "int64": case "float": case "double": case "string":
        record[ field.attr("name") ] = new types[fieldType](field.val());
        break;
      default:
	  	  record[ field.attr("name") ] = new AExpression(field.val());
        return;
      }

    });

    asterix.insert(base.currentDataverse, base.currentDataset, record).then(function(result){
      alert(JSON.stringify(result));
    })
  };

  $scope.insert.addField = function(){
    $scope.insert.extraFields.push({
      FieldName: $scope.insert.newField.Name,
      FieldType: $scope.insert.newField.Type
    });
  };

  $scope.deleteRecord = function(rid)
  {
    var pk = $scope.data.datasets[$scope.browsing.dataset].InternalDetails.PrimaryKey.orderedlist;
    var record = $scope.data.records[rid];
    var comps = [];
    for(var k in pk)
    {
      var key = pk[k];
      var val = false;

      // support integers
      if(asterix.helper.extractNumber(record[key]) !== false) val = asterix.helper.extractNumber(record[key]);
      else if(typeof record[key] == "string") val = '"' + record[key] + '"';
      else alert("Unknown value (" + key + "): " + record[key]);

      if(val === false){ return }

      comps.push(new AExpression("$r." + key + "=" + val));
    }

    var where = new WhereClause();
    where.and(comps);

    var delStmt = new DeleteStatement("$r", $scope.browsing.getLocation(), where);
    A.update(delStmt.val(), $scope.refreshRecords);
  };

  $scope.magnifyRecord = function (rid){
    $location.path('/row/' + rid);
  };

  $scope.toggleForm = function() {
    $scope.browsing.showInsertForm = !$scope.browsing.showInsertForm;
  };

  $scope.getExtraFields = function(fields, exclude){
    var result = {}
    for(var field in fields){
      if(fields.hasOwnProperty(field)){
        result[field] = true;
      }
    }

    for(var i in exclude) {
      delete result[exclude[i].FieldName];
    }

    return result;
  };
}])

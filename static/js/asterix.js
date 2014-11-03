'use strict'
angular.module('asterface', ['ngSanitize', 'ngRoute'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .otherwise({
    redirectTo: '/browse'
  });
}])
.factory('asterix', ['$http', function($http){
  var appendTransform = function(defaults, newTransformer){
    defaults = angular.isArray(defaults) ? defaults : [defaults];
    return defaults.concat(newTransformer);
  };
  return {
    extractNumber: function(obj){
      if(angular.isNumber(obj)) return obj;
      if(!angular.isObject(obj)) return false;
      var value = false;
      ['int8', 'int16', 'int32', 'int64'].forEach(function(intType){
        if(obj.hasOwnProperty(intType)){
          value = obj[intType];
        }
      });
      return value;
    },
    request: function(endpoint, params){
      return $http({
        url: endpoint,
        params: params,
        transformResponse: appendTransform($http.defaults.transformResponse, function(response){
          return eval('([' + response.results + '])');
        })
      }).catch(function(error){
        console.log('Failed to get response from Asterix backend');
      });
    },
    query: function(queryString){
      if(arguments.length == 1){
        var queryString = arguments[0];
      }
      else if(arguments.length == 2){
        var queryString = 'use dataverse ' + arguments[0] + ';\n' + arguments[1];
      }
      else{
        throw "Invalid number of arguments";
      }
      return this.request('/query', {query: queryString});
    },
    ddl: function(queryString){
      if(arguments.length == 1){
        var queryString = arguments[0];
      }
      else if(arguments.length == 2){
        var queryString = 'use dataverse ' + arguments[0] + ';\n' + arguments[1];
      }
      return this.request('/ddl', {ddl: queryString});
    }
  };
}]);

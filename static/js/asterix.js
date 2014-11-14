'use strict'
angular.module('asterface', ['ngSanitize', 'ngRoute'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .otherwise({
    redirectTo: '/browse'
  });
}])
.factory('types', function(){
  var NumberPrototype = {
    toString: function(){
      if(this.type == 'float' || this.type == 'double'){
        return sprintf('%s("%f")', this.type, this.val);
      }
      return sprintf('%s("%d")', this.type, this.val);
    }
  };

  var types = {
    int8: function(value){
      this.type = 'int8';
      this.val = value;
    },
    int16: function(value){
      this.type = 'int16';
      this.val = value;
    },
    int32: function(value){
      this.type = 'int32';
      this.val = value;
    },
    int64: function(value){
      this.type = 'int64';
      this.val = value;
    },
    float: function(value){
      this.type = 'float';
      this.val = value;
    },
    double: function(value){
      this.type = 'double';
      this.val = value;
    },
    string: function(value){
      this.value = value;
      this.toString = function(){
        return '"' + this.value + '"';
      }
    }
  };
  types.int8.prototype = NumberPrototype;
  types.int16.prototype = NumberPrototype;
  types.int32.prototype = NumberPrototype;
  types.int64.prototype = NumberPrototype;
  types.double.prototype = NumberPrototype;
  types.float.prototype = NumberPrototype;

  return types;
})
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
    },
    insert: function(dataverse, dataset, data){
      var dataFlattened = [];
      for(var row in data){
        dataFlattened.push(
          sprintf('"%s": %s', row, data[row].toString())
        );
      }
      var dataString = sprintf('insert into dataset %s.%s {%s}', dataverse, dataset, dataFlattened.join(','));
      return this.request('/query', {query: dataString});
    }
  };
}]);

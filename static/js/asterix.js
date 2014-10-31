'use strict'
angular.module('asterface', ['ngSanitize', 'ngRoute'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .otherwise({
    redirectTo: '/browse'
  });
}])
.factory('asterix', function(){
  return {
    extractNumber: function(obj){
      if(angular.isNumber(obj)) return obj;
      if(!angular.isObject(obj)) return false;
      ['int8', 'int16', 'int32', 'int64'].forEach(function(intType){
        if(obj.hasOwnProperty(intType)){
          return obj[intType];
        }

      });
      return false;
    },
    db: new AsterixDBConnection({ dataverse: 'Metadata' })
  };
});

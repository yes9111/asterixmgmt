angular.module('asterface', ['ngSanitize', 'ngRoute'])
.factory('asterix', [function(){
  return {
    db: new AsterixDBConnection({ dataverse: 'Metadata' }),
    helper: new AHelper()
  };
}])
.config(['$routeProvider', 
  function($routeProvider) {
    $routeProvider
    .when('/browse', {
      templateUrl: '/static/partials/browser.html',
      controller: 'BrowseController'
    })
    .when('/row/:rid', {
      templateUrl: '/static/partials/viewrow.html',
      controller: 'RowController'
    })
    .when('/query', {
      templateUrl: '/static/partials/query.html',
      controller: 'QueryController'
    })
    .when('/newdataset', {
      templateUrl: '/static/partials/datasetform.html',
      controller: 'NewDatasetController'
    })
    .when('/newdatatype', {
      templateUrl: '/static/partials/datatypeform.html',
      controller: 'NewDatatypeController'
    })
    .otherwise({
      redirectTo: '/browse'
    });
  }]);


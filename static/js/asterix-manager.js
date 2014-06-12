var asterface = angular.module('asterface', ['ngSanitize', 'ngRoute']);
var A = new AsterixDBConnection({
  dataverse: "Metadata"
});

var helper = new AHelper();

asterface.config(['$routeProvider', 
  function($routeProvider) {
    $routeProvider.when('/browse', {
      templateUrl: '/static/partials/browser.html',
      controller: 'BrowseController'
    }).
    when('/row/:rid', {
      templateUrl: '/static/partials/viewrow.html',
      controller: 'RowController'
    }).
    when('/query', {
      templateUrl: '/static/partials/query.html',
      controller: 'QueryController'
    }).
    when('/newdataset', {
      templateUrl: '/static/partials/datasetform.html',
      controller: 'NewDatasetController'
    }).
    when('/newdatatype', {
      templateUrl: '/static/partials/datatypeform.html',
      controller: 'NewDatatypeController'
    }).
    otherwise({
      redirectTo: '/browse'
    });
  }]);


var asterface = angular.module('asterface', ['ngSanitize', 'ngRoute']);
var A = new AsterixDBConnection({
  dataverse: "Metadata"
});



asterface.controller(controllers);

asterface.config(['$routeProvider', 
  function($routeProvider) {
    $routeProvider.when('/browse', {
      templateUrl: '/static/partials/browser.html',
      controller: 'BrowseController'
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


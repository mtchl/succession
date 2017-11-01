

var SuccessionApp = angular.module('SuccessionApp', [
  'ngRoute',
  'successionControllers'
]);



 
SuccessionApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/compositor.html',
        controller: 'CompositorCtrl'
      }).
      when('/saved/:itemID', {
        templateUrl: 'partials/item.html',
        controller: 'SavedItemCtrl',
      }).
      when('/render/:itemID', {
        templateUrl: 'partials/renderitem.html',
        controller: 'SavedItemCtrl',
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);








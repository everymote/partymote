'use strict';


// Declare app level module which depends on filters, and services
angular.module('partymote', ['partymote.filters', 'partymote.services', 'partymote.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/main', {templateUrl: 'partials/main.html', controller: MainCtrl});
    $routeProvider.when('/settings', {templateUrl: 'partials/settings.html', controller: SettingsCtrl});
    $routeProvider.otherwise({redirectTo: '/main'});
  }]);

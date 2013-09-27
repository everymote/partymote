'use strict';


// Declare app level module which depends on filters, and services
angular.module('partymote', ['partymote.filters', 
							'partymote.services', 
							'partymote.directives', 
							'locationService',
							'everymote.service', 
							'localStorageService',
							'settingsService']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/main', {templateUrl: 'partials/main.html', controller: MainCtrl});
    $routeProvider.when('/settings', {templateUrl: 'partials/settings.html', controller: SettingsCtrl});
    $routeProvider.otherwise({redirectTo: '/main'});
  }]).config(function($httpProvider){
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

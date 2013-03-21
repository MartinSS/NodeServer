'use strict';

// app level module which depends on filters, services, and directives
angular.module(('ideaService', ['ideaService.filters', 'ideaService.services', 'ideaService.directives']).
  config(['$routeProvider', $locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/index',
        controller: IndexCtrl
      }).
      when('/addIdea', {
        templateUrl: 'partials/addIdea',
        controller: AddIdeaCtrl
      }).
      when('/editIdea/:id', {
        templateUrl: 'partials/editIdea',
        controller: EditIdeaCtrl
      }).
      otherwise({
        redirectTo: '/'
      });
    $locationProvider.htmml5Mode(true); 
  }]);

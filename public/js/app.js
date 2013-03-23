'use strict';

// app level module which depends on filters, services, and directives
angular.module('ideaService', ['ideaService.filters', 'ideaService.services', 'ideaService.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'index',
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
      when('/idea/:id', {
        templateUrl: 'partials/showIdea',
        controlller: ShowIdeaCtrl
      }).
      otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true); 
  }]);

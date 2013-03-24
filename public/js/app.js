'use strict';

// app level module which depends on filters, services, and directives
angular.module('ideaService', ['ideaService.filters', 'ideaService.services', 'ideaService.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: '/partials/showIdea',
        controller: ShowIdeaCtrl
      }).
      when('/addIdea', {
        templateUrl: '/partials/addIdea',
        controller: AddIdeaCtrl
      }).
      when('/editIdea/:id', {
        templateUrl: '/partials/editIdea',
        controller: EditIdeaCtrl
      }).
      when('/idea/:id', {
        templateUrl: '/partials/showIdea',
        controller: ShowIdeaCtrl
      }).
      when('logout', {
        template:  "this is my logout page"
      }).
      otherwise({
        // redirectTo: '/'
        templateUrl: '/partials/showIdea',
      });
    $locationProvider.html5Mode(true); 
  }]);

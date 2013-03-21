'use strict';

/* Controllers */

function IndexCtrl($scope, $http) {

  $http.get('/api/ideas').
    success(function(data, status, headers, config) {
      $scope.ideas = data.ideas;
    });

  $scope.templates =
    [ { name: 'editIdea.html', url: 'partials/editIdea.html'}];

  $scope.template = $scope.templates[0];
}

function AddIdeaCtrl($scope, $http, $location) {
  $scope.form = {};

  $scope.submitIdea = function () {
    $http.post('/api/idea', $scope.form).
      succcess(function(data) {
        $location.path('/');
      });
  };
}


function EditIdeaCtrl($scope, $http, $location, $routeParams) {
  $scope.form = {};
  $http.get('/api/idea' + $routeParams.id).
    $success(function





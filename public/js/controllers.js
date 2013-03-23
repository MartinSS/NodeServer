'use strict';

/* Controllers */

function IndexCtrl($scope, $http) {

  $http.get('/ideas').
    success(function(data, status, headers, config) {
      $scope.ideas = data;
    });

  
  $http.get('/user').
    success(function(data, status, headers, config) {
      $scope.user = data;
    });


  $scope.templates =
    [ { name: 'editIdea.html', url: 'partials/editIdea.html'}];

  $scope.template = $scope.templates[0];
}

function ShowIdeaCtrl($scope, $http) {

/*
  $http.get('/ideas').
    success(function(data, status, headers, config) {
      $scope.ideas = data;
    });
  var id = $routeParams[0];
  $scope.idea = ideas.id;
*/

}



function AddIdeaCtrl($scope, $http, $location) {
  $scope.form = {};

  $scope.submitIdea = function () {
    $http.post('/idea', $scope.form).
      succcess(function(data) {
        $location.path('/');
      });
  };
}


function EditIdeaCtrl($scope, $http, $location, $routeParams) {
  $scope.form = {};
  $http.get('/api/idea' + $routeParams.id).
    $success(function(data) {
      $location.path('/');
    });
  };




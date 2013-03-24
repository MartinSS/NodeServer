'use strict';

/* Controllers */

function IndexCtrl($scope, $http) {

  $http.get('/api/ideas').
    success(function(data, status, headers, config) {
      $scope.ideas = data;
      if ($scope.ideas.length > 0) {
        $scope.idea = $scope.ideas[0];
      }
    });
  
  
  $http.get('/api/user').
    success(function(data, status, headers, config) {
      $scope.user = data;
    });

  $scope.logout = function () {
    $http.get('/logout');
    window.location = 'login';
  }

}

function ShowIdeaCtrl($scope, $http, $routeParams) {
  var url = '/api/idea/'+$routeParams.id;
  $http.get(url).
    success(function(data, status, headers, config) {
      $scope.idea = data;
    });
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
    $success(function(data) {
      $location.path('/');
    });
  };




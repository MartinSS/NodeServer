'use strict';

/* Controllers */

function LoginCtrl($scope, $http, $location, $window) {

  $scope.user = {};
  $scope.login = function () {
    console.log("posting email:"+$scope.user.email+", password:"+$scope.user.password);
    $http.post('/login', $scope.user).success(function(data) {
      if (data.status) {
        console.log("login successful");
        $location.path('/index');
        $window.location.href = '/index';
      } 
      else {
        $location.path('/login2');
      }
    }).error(function(data) {
      console.log("error posting login credentials"); 
      $location.path('/login2');
    });
  }

}




function IndexCtrl($scope, $http) {

    console.log('in IndexCtrl');
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

  console.log("in index controller");

  $scope.logout = function () {
    $http.get('/logout');
    window.location = 'login';
  }

}

function ShowIdeaCtrl($scope, $http, $routeParams) {
  var url = '/api/idea/'+$routeParams.id;
  console.log('in ShowIdeaCtrl getting:'+url);
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




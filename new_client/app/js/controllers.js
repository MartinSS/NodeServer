'use strict';

/* Controllers */

function PhoneListCtrl($scope, Phone) {
  $scope.phones = Phone.query();
  $scope.orderProp = 'age';
}

function LoginCtrl($scope, $location, $rootScope) {
  $scope.login = function()
  {
    console.log("email: " + $scope.email);
    console.log("password: " + $scope.password);
    console.log("remember me: " + $scope.rememberMe);

    $rootScope.loggedUser = true;

    $location.path("/");
  }
}

function PhoneDetailCtrl($scope, $routeParams, Phone) {
  $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
    $scope.mainImageUrl = phone.images[0];
  });

  $scope.setImage = function(imageUrl) {
    $scope.mainImageUrl = imageUrl;
  }
}


// declare module
var myAppModule = angular.module('myApp', []);


// configure module and create greeting filter
myAppModule.filter('greet', function() {
  return function(name) {
    return 'Hello, ' + name + '!';
  };
});

'use strict';

/* App Module */

angular.module('ideate', ['phonecatFilters', 'phonecatServices']).
config(['$routeProvider', function($routeProvider)
{
	$routeProvider.
	when('/',
	{
		templateUrl: 'partials/home.html'
	}).
	when('/login',
	{
		templateUrl: 'partials/login.html',
		controller: LoginCtrl
	}).
	when('/phones',
	{
		templateUrl: 'partials/phone-list.html',
		controller: PhoneListCtrl
	}).
	when('/phones/:phoneId',
	{
		templateUrl: 'partials/phone-detail.html',
		controller: PhoneDetailCtrl
	}).
	otherwise(
	{
		redirectTo: '/'
	});
}]).
run(function($rootScope, $location)
{

	// register listener to watch route changes
	$rootScope.$on("$routeChangeStart", function(event, next, current)
	{
		console.log("rootscope " + $rootScope.loggedUser);
		console.log("path: " + next.templateUrl );

		if ($rootScope.loggedUser == null)
		{
			// no logged user, we should be going to #login
			if (next.templateUrl == "partials/login.html")
			{
				// already going to #login, no redirect needed
			}
			else
			{
				// not going to #login, we should redirect now
				$location.path("/login");
			}
		}
	});
})
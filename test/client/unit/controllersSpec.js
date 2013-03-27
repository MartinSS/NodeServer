'use strict';

/* jasmine specs for controllers*/
describe('Idea Service controllers', function() {

  describe('IndexCtrl', function() {
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/api/ideas').
        respond([{name: 'idea1'}, {description: 'testing'}]);
      $httpBackend.expectGET('/api/user').
        respond({givenName : 'Frank', email : 'frank@test.com'});
      scope = $rootScope.$new();
      ctrl = $controller(IndexCtrl, {$scope: scope});
    }));


    it ('should initialize the selected idea if ideas is nonempty', function() {

      expect(scope.ideas).toBeUndefined();
      $httpBackend.flush();

      expect(scope.idea).toBeDefined();

    });
  });
});

/*

  describe('ShowIdeaCtrl', function() {



  });


  describe('AddIdeaCtrl', function() {



  });


});

*/

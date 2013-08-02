var userController = require('../../controllers/UserController'),
  assert = require('assert'),
  should = require('should'),
  sinon = require('sinon'),
  // mongoose = require('mongoose'),
  User = require('../../models/user');

var myStub = sinon.stub(User, 'findOne');

var mock = sinon.mock(require('mongoose'));
mock.expects('Schema':


describe( 'UserController', function() {
  it( 'has an asynchronous readUser function', function(done) {
    console.log("typeof userController.readUser:" + typeof userController.readUser);
    console.log("typeof userController:"+ typeof userController );
    assert.ok( typeof userController.readUser == 'function' );
    userController.readUser(function() {
      done();
    });
  });
});

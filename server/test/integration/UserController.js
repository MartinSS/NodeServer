// tests for integration of components to yield correct
// request and response flow
// to run, type 'mocha integration' in test directory
//
var express = require('express'),
    app = require('../../app.js'),
    request = require('supertest')(app),
    should = require('should'),
    superagent = require('superagent'),
    agent = superagent.agent(),
    testUtils = require('../test_utils'),
    integrationTestUtils = require('./integration_test_utils'),
    utils = require('../../utils');

// used to log users in and track their cookies (using superagent module)
var agent;

describe('user controller', function()
{

  var user = testUtils.generateValidUser();
  var changedUser = testUtils.generateValidUser();
  var malUser;

  describe('createUser', function()
  {
    before(function(done)
    {
      done();
    })

    it('should create a new user if valid information is given', function(done)
    {
      var req = request
        .post('/v1/user/create')
        .send(user)
          .end(function(err, res)
          {
            if (err) throw error;
            integrationTestUtils.shouldBeSuccess(res, 201);
            done();
          })
    })

    it('should create a user which can successfully login', function(done)
    {
      loginUser(user,done);
    })

    it('should not attempt to create a user if givenName not provided', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.givenName = undefined;
      caseInvalidCreate(malUser, function()
      {
        done();
      });
    })

    it('should not attempt to create a user if givenName is empty string', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.givenName = "";
      caseInvalidCreate(malUser, function()
      {
        done();
      });
    })

    it('should not attempt to create a user if familyName not provided', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.familyName = undefined;
      caseInvalidCreate(malUser, function()
      {
        done();
      });
    })

    it('should not attempt to create a user if email not provided', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.email = undefined;
      caseInvalidCreate(malUser, function()
      {
        done();
      });
    })

    it('should not attempt to create a user if email is invalid', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.email = "eca2222yyyyg";
      caseInvalidCreate(malUser, function()
      {
        done();
      });
    })


    it('cannnot create a user if email is duplicate', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.email = user.email;
      caseInvalidCreate(malUser, function()
      {
        done();
      });
    })

    it('should not attempt to create a user if password not provided', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.password = undefined;
      caseInvalidCreate(malUser, function()
      {
        done();
      });
    })

    it('should not attempt to create a user if password is invalid', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.password = "aaa";  // invalid as has less than eight characters
      caseInvalidCreate(malUser, function()
      {
        done();
      });
    })

    after(function(done)
    {
      integrationTestUtils.deleteUserFromDB(user, function()
      {
        done();
      });
    })

  })


  describe('readUser', function()
  {
    before(function(done) 
    {
      integrationTestUtils.createUser(user, function()
      {
        loginUser(user, function()
        {
          done();
        });
      });
    }); 

    it('should read the logged in user profile information', function(done)
    {
      var req = request
        .get('/v1/user/read');
        agent.attachCookies(req);
        req.end(function(err, res)
        {
          if (err) return done(err);
          var re = new RegExp(user.givenName+".*");
          res.text.should.match(re);
          integrationTestUtils.shouldBeSuccess(res, 200);
          done();
        })
    })

    it('should fail if user not authenticated', function(done)
    {
      var req = request
        .get('/logout');
        req = request
          .get('/v1/user/read')
          .end(function(err, res)
        {
          integrationTestUtils.shouldBeFailure(res, 401);
          done();
        })
    })

    after(function(done)
    {
      integrationTestUtils.deleteUserFromDB(user, function()
      {
        done();
      });
    })

  })


  describe('updateUser', function()
  {

    before(function(done) 
    {
      integrationTestUtils.createUser(user, function()
      {
        loginUser(user, function()
        {
          done();
        });
      });
    }); 

    it('should change the information in a user profile', function(done)
    {
      var req = request
        .post('/v1/user/update');
        agent.attachCookies(req);
        req.send({"givenName": changedUser.givenName, "familyName": changedUser.familyName, email: changedUser.email, password: changedUser.password})  
          .end(function(err, res)
          {
            integrationTestUtils.shouldBeSuccess(res, 200);
            // check content changed
            req = request
            .get('/v1/user/read');
            agent.attachCookies(req);
            req.end(function(err, res)
            {
              res.body.result.givenName.should.equal(changedUser.givenName);
              res.body.result.familyName.should.equal(changedUser.familyName);
              integrationTestUtils.shouldBeSuccess(res, 200);
            })
            done();
          });
    })


    it('should update a user which can successfully login', function(done)
    {
      loginUser(changedUser,done);
    })

    it('should not attempt to update a user if givenName not provided', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.givenName = undefined;
      caseInvalidUpdate(malUser, function()
      {
        done();
      });
    })

    it('should not attempt to update a user if givenName is empty string', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.givenName = "";
      caseInvalidUpdate(malUser, function()
      {
        done();
      });
    })

    it('should not attempt to update a user if familyName not provided', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.familyName = undefined;
      caseInvalidUpdate(malUser, function()
      {
        done();
      });
    })

    it('should not attempt to update a user if email not provided', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.email = undefined;
      caseInvalidUpdate(malUser, function()
      {
        done();
      });
    })

    it('should not attempt to update a user if email is invalid', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.email = "eca2222yyyyg";
      caseInvalidUpdate(malUser, function()
      {
        done();
      });
    })

    it('should not attempt to update a user if password not provided', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.password = undefined;
      caseInvalidUpdate(malUser, function()
      {
        done();
      });
    })

    it('should not attempt to update a user if password is invalid', function(done)
    {
      malUser = testUtils.generateValidUser();
      malUser.password = "aaa";  // invalid as has less than eight characters
      caseInvalidUpdate(malUser, function()
      {
        done();
      });
    })


    after(function(done)
    {
      integrationTestUtils.deleteUserFromDB(changedUser, function()
      {
        done();         
      });
    })

  })

})

// login a given user and call done
var loginUser = function (user, callback)
{
  integrationTestUtils.login(request, {email: user.email, password: user.password}, function(loginAgent)
  {
    agent = loginAgent;
    callback();
  });
}


var caseInvalidCreate = function (user, callback)
{
  var req = request
    .post('/v1/user/create')
    .send(user)  
    .end(function(err, res)
    {
      integrationTestUtils.shouldBeFailure(res, 400);
      callback();
    });
}


var caseInvalidUpdate = function (user, callback)
{
  var req = request
    .post('/v1/user/update')
    .send(user)  
    .end(function(err, res)
    {
      integrationTestUtils.shouldBeFailure(res, 401);
      callback();
    });
}



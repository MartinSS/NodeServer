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
    MongoClient = require('mongodb').MongoClient,
    testUtils = require('../test_utils'),
    integrationTestUtils = require('./integration_test_utils');

// used to log users in and track their cookies (using superagent module)
var agent;

describe('user controller', function()
{

  var user;
  var malUser;
  var changedUser;

  describe('createUser', function()
  {
    before(function()
    {
      user = testUtils.generateValidUser();
      malUser = testUtils.generateInvalidUser();
    })

    it('should create a new user if valid information is given', function(done)
    {
      var req = request
        .post('/v1/user/create')
        .send(user)
          .end(function(err, res)
          {
            if (err) throw error;
            integrationTestUtils.shouldBeSuccess(res);
            done();
          })
    })

    it('should create a user which can successfully login', function(done)
    {
      loginUser(user,done);
    })

    it('should not attempt to create a user if insufficient information provided', function(done)
    {
      var req = request
        .post('/v1/user/create')
        .send(malUser)  
          .end(function(err, res)
          {
            integrationTestUtils.shouldBeFailure(res);
            done();
          })
    })

    after(function(done)
    {
      integrationTestUtils.deleteUser(done);
    })

  })


  describe('readUser', function()
  {
    before(function(done) 
    {
      user = testUtils.generateValidUser();
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
        req.expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res)
        {
          if (err) return done(err);
          res.text.should.match(/success.*true/);
          var re = new RegExp(user.givenName+".*");
          res.text.should.match(re);
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
          res.text.should.match(/success.*false/);
          done();
        })
    })

    after(function(done)
    {
      integrationTestUtils.deleteUser(function()
      {
        done();
      });
    })

  })


  describe('updateUser', function()
  {

    before(function(done) 
    {
      user = testUtils.generateValidUser();
      changedUser = testUtils.generateValidUser();
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
        req.send({"givenName": changedUser.givenName, "familyName": changedUser.familyName})  
          .end(function(err, res)
          {
            integrationTestUtils.shouldBeSuccess(res);
            // check content changed
            req = request
            .get('/v1/user/read');
            agent.attachCookies(req);
            req.end(function(err, res)
            {
              res.body.result.givenName.should.equal(changedUser.givenName);
              res.body.result.familyName.should.equal(changedUser.familyName);
            })
            done();
          });
    })

    after(function(done)
    {
      integrationTestUtils.deleteUser(done);
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

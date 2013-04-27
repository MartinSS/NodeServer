// tests for integration/functionality of login and logout
// code 
// to run, type 'mocha login_logout' in test directory
//
var express = require('express'),
    app = require('../../app.js'),
    request = require('supertest')(app),
    should = require('should'),
    superagent = require('superagent'),
    agent = superagent.agent(),
    redis = require('redis'),
    redisClient = redis.createClient();
    User = require('../../models/user').User,
    testUtils = require('../test_utils'),
    integrationTestUtils = require('./integration_test_utils'),
    utils = require('../../utils');

// used to log users in and track their cookies (using superagent module)
var agent;

var idea;
var user;
var unknownUser;
var ideaId;

var userSessionHash;

describe('login user', function()
{

  before(function(done)
  {
    user = testUtils.generateValidUser();
    unknownUser = testUtils.generateValidUser();
    idea = testUtils.generateValidIdea();

    integrationTestUtils.createUser(user, function()
    {
      loginUser(user, function()
      {
        integrationTestUtils.createIdea(idea, function() 
        {
          integrationTestUtils.readFirstIdeaId(function(id)
          {
            ideaId = id;
            integrationTestUtils.logoutUser(function()
            {
              done();
            });
          });
        })
      })
    });
  })


  it('should validate input fields', function(done)
  {
    // to do
    // how to do this validation?

    done();
  })

  it('should only log in an existing user', function(done)
  {
    request
    .post('/login')
    .send(unknownUser)
    .end(function (err, res)
    {
      if (err) 
      {
        console.log("error logging in");
        throw error;
      }
      var re = new RegExp("(Unknown|Unauthorized)"+".*");
      res.text.should.match(re);
      done();
    });
  })

  it('should login user such that user can access profile and ideas', function(done)
  {
    loginUser(user, function()
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
          var url = '/v1/idea/read/'+ideaId;
          req = request.get(url);
          agent.attachCookies(req);
          req.end(function(err, res)
          {
            if (err) return done(err);
            var re = new RegExp(idea.title+".*");
            res.text.should.match(re);
            integrationTestUtils.shouldBeSuccess(res, 200);
            done();
          });
        })
    });
  });

  after(function(done)
  {
    tearDown(function()
    {
      done();
    });
  });

})



describe('logout user', function()
{

  before(function(done)
  {
    user = testUtils.generateValidUser();
    unknownUser = testUtils.generateValidUser();
    integrationTestUtils.createUser(user, function()
    {
      done();
    });
  })

  beforeEach(function(done)
  {
    loginUser(user, function()
    {
      done();
    });
  });

  it('should not logout a non-authenticated user', function(done)
  {
    var req = request
      .get('/logout');
      agent.attachCookies(req);
      req.end(function(err, res)
      {
        if (err) throw error;
        integrationTestUtils.shouldBeSuccess(res);
        req = request
        .get('/logout')
        agent.attachCookies(req);
        req.end(function(err, res)
        {
          if (err) throw error;
          integrationTestUtils.shouldBeFailure(res, 401);
          done();
        });
      })
  })


  it('should only logout the same user as in the authenticated session', function(done)
  {
    // todo: implement this test case

    done();
  })


  it('should logout users so that they can no longer access their profile and ideas', function(done)
  {
    integrationTestUtils.logoutUser(function()
    {
      var req = request
        .get('/v1/user/read')
        .end(function(err, res) // send the request
        {
          integrationTestUtils.shouldBeFailure(res, 401);
          req = request
            .get('/v1/idea/read') // get all ideas
            .end(function(err, res)
            {
              integrationTestUtils.shouldBeFailure(res, 401);
              done();
            });
        })
    });
  })

  it('removes the session cache once the user has logged out', function(done)
  {
    // get the session hash
    User.findOne(
    {
      email: user.email
    }, function(err, usr)
    {
      if (err) throw error;
      userSessionHash = utils.getSessionHash(usr._id);
      integrationTestUtils.logoutUser(function()
      {
        redisClient.hgetall(userSessionHash, function(err, session)
        {
          if (err) throw error;
          should.not.exist(session);
          done();
        }); 
      })

    });
  })

  after(function(done)
  {
    tearDown(function()
    {
      done();
    });
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

var tearDown = function(callback)
{
  loginUser(user, function()
  {
    integrationTestUtils.deleteIdeas(function()
    {
      integrationTestUtils.deleteUser(function()
      {
        callback();
      });
    });
  });
}

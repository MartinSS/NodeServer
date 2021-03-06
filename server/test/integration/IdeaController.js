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
    utils = require('../../utils'),
    testUtils = require('../test_utils'),
    integrationTestUtils = require('../integration_test_utils');

// used to log users in and track their cookies (using superagent module)
var testAgent;

// valid users
var testUser, otherUser;

// some valid ideas 
var idea1, idea2, idea3, idea4, idea5;

describe('idea controller', function() 
{

  before(function(done) 
  {
    // user = testUtils.generateValidUser();
    otherUser = testUtils.generateValidUser();
    idea1 = testUtils.generateValidIdea();
    idea2 = testUtils.generateValidIdea();
    idea3 = testUtils.generateValidIdea();
    idea4 = testUtils.generateValidIdea();
    idea5 = testUtils.generateValidIdea();
    done();
  })

  describe('create idea', function()
  {
    var ideaId, ideaId2;
    before(function(done)
    {
      setup(function()
      {
        done();
      });
    })

    it('should create a new idea', function(done)
    {
      var req = request
        .post('/v1/idea/create');
        testAgent.attachCookies(req);
        req.send({title:idea1.title, content: idea1.content})
           .end(function(err, res) 
           {
             integrationTestUtils.shouldBeSuccess(res, 201);
             ideaId = res.body.result.id;
             done();
           });
    })

    it('should not create an idea if insufficient information provided', function(done)
    {
      var req = request
        .post('/v1/idea/create');
        testAgent.attachCookies(req);
        req.send({title:"", content: undefined})
           .end(function(err, res) 
           {
             integrationTestUtils.shouldBeFailure(res, 400);
             done();
           });
    });

    it('should not create an idea if title contains special characters', function(done)
    {
      var req = request
        .post('/v1/idea/create');
        testAgent.attachCookies(req);
        req.send({title:"< script x", content: undefined})
           .end(function(err, res) 
           {
             integrationTestUtils.shouldBeFailure(res, 400);
             done();
           });
    });


    it('should create an idea if either the title or content has one character', function(done)
    {
      var req = request
        .post('/v1/idea/create');
        testAgent.attachCookies(req);
        req.send({title:" ", content: undefined})
           .end(function(err, res) 
           {
             integrationTestUtils.shouldBeSuccess(res, 201);
             ideaId2 = res.body.result.id;
             done();
           });
    });

    it('should create and encode an idea if the body contains malicious characters but they will be encoded', function(done)
    {
      var req = request
        .post('/v1/idea/create');
        testAgent.attachCookies(req);
        req.send({title:"", content: "<"})
          .end(function(err, res) 
          {
            integrationTestUtils.shouldBeSuccess(res, 201);
            ideaId2 = res.body.result.id;
            var url = '/v1/idea/read/'+ideaId2;
            var req = request
             .get(url)
            testAgent.attachCookies(req);
            req.end(function(err,res)
            {
              integrationTestUtils.shouldBeSuccess(res, 200);
              res.body.result.content.should.equal("&lt;"); 
              done();
            });
          });
    });


    after(function(done)
    {
      integrationTestUtils.deleteIdea(ideaId, function()
      {
        integrationTestUtils.deleteIdea(ideaId2, function()
        {
          integrationTestUtils.deleteUserFromDB(testUser, function()
          {
            done();
          });
        });
      });
    })

  })


  describe('updateIdea', function()
  {
    var ideaId2;
    before(function(done)
    {
      setup(function()
      {
        setupEditAndGet(function()
        {
          done();
        });
      });
    });        

    it('should update an existing idea', function(done)
    {
      integrationTestUtils.readFirstIdeaId(function(id)
      {
        var url = '/v1/idea/update/'+id;
        var req = request
          .post(url);
        testAgent.attachCookies(req);
        req.send({title:idea2.title, content: idea2.content})
           .end(function(err, res) 
           {
             if (err) throw error;
             integrationTestUtils.shouldBeSuccess(res, 200);
             var url = '/v1/idea/read/'+id;
             var req = request
              .post(url);
              testAgent.attachCookies(req);
              req.end(function(err, res) 
              {
                res.body.result.title.should.equal(idea2.title);
                res.body.result.content.should.equal(idea2.content);
                integrationTestUtils.shouldBeSuccess(res, 200);
                done();
              });
           });
        });
    })

    it('should not update an idea if title contains special characters', function(done)
    {

      integrationTestUtils.readFirstIdeaId(function(id)
      {
        var url = '/v1/idea/update/'+id;
        var req = request
          .post(url);
        testAgent.attachCookies(req);
        req.send({title:"<script>", content: idea2.content})
           .end(function(err, res) 
           {
             if (err) throw error;
             integrationTestUtils.shouldBeFailure(res, 400);
             done();
           });
      });
    });


    it('should update an idea if either the title or content has one character', function(done)
    {
      integrationTestUtils.readFirstIdeaId(function(id)
      {
        var url = '/v1/idea/update/'+id;
        var req = request
          .post(url);
        testAgent.attachCookies(req);
        req.send({title:" ", content: undefined})
           .end(function(err, res) 
           {
             integrationTestUtils.shouldBeSuccess(res, 200);
             ideaId2 = res.body.result.id;
             done();
           });
        });
    });

    it('should update and encode an idea if the body contains malicious characters but they will be encoded', function(done)
    {
      integrationTestUtils.readFirstIdeaId(function(id)
      {
        var url = '/v1/idea/update/'+id;
        var req = request
          .post(url);
        testAgent.attachCookies(req);
        req.send({title:"", content: "<"})
          .end(function(err, res) 
          {
            integrationTestUtils.shouldBeSuccess(res, 200);
            var url = '/v1/idea/read/'+id;
            var req = request
             .get(url)
            testAgent.attachCookies(req);
            req.end(function(err,res)
            {
              integrationTestUtils.shouldBeSuccess(res, 200);
              res.body.result.content.should.equal("&lt;"); 
              done();
            });
          });
       });
    });

    it('should not update an idea of other user', function(done)
    {
      integrationTestUtils.logoutUser(function()
      {
        loginUser(otherUser, function()
        {
          integrationTestUtils.readFirstIdeaId(function(id)
          {
            integrationTestUtils.logoutUser(function()
            {
              loginUser(testUser, function()
              {
                var url = '/v1/idea/update/'+id;
                var req = request
                  .post(url);
                testAgent.attachCookies(req);
                req.send({title:idea1.title, content: undefined})
                  .end(function(err, res) 
                  {
                    integrationTestUtils.shouldBeFailure(res, 400);
                    done();
                  });
              });
            });
          });
        });
      });
    })

    it('should fail if idea id invalid', function(done)
    {
      var id = 'x12';
      var url = '/v1/idea/update/'+id;
      var req = request
        .post(url);
        testAgent.attachCookies(req);
        req.send({title:idea1.title, content: undefined})
           .end(function(err, res) 
           {
             integrationTestUtils.shouldBeFailure(res, 400);
             done();
           });
    });

    after(function(done)
    {
      breakdownEditAndGet(function()
      {
        integrationTestUtils.deleteUserFromDB(testUser, function()
        {
          done();
        });
      });
    });

  })


  describe('read ideas', function()
  {
    before(function(done)
    {
      setup(function()
      {
        var req = request
          .post('/v1/idea/create');
          testAgent.attachCookies(req);
          req.send({title:idea3.title, content: idea3.content})
             .end(function(err, res) 
             {
               req = request
               .post('/v1/idea/create');
               testAgent.attachCookies(req);
               req.send({title:idea4.title, content: idea4.content})
               .end(function(err, res)
               {
                 integrationTestUtils.shouldBeSuccess(res, 201);
                 done();
               });
             });
      });
    })

    it('should read all ideas of the authenticated user', function(done)
    {
      var req = request
        .get('/v1/idea/read');
      testAgent.attachCookies(req); 
      req.end(function(err, res)
      {
        res.body.result.length.should.equal(2);
        integrationTestUtils.shouldBeSuccess(res, 200);
        done();
      });
    })

    it('should not read ideas if the user is not authenticated', function(done)
    {
      var req = request
        .get('/logout');
        req = request
          .get('/v1/idea/read')
          .end(function(err, res)
        {
          integrationTestUtils.shouldBeFailure(res, 401);
          loginUser(testUser, function()
          {
            done();
          });
        })
    })

    after(function(done)
    {
      integrationTestUtils.deleteIdeas(function()
      {
        integrationTestUtils.deleteUserFromDB(testUser, function()
        {
          done();
        }); 
      });
    })
  })


  describe('readIdea', function()
  {
    before(function(done)
    {
      setup(function()
      {
        setupEditAndGet(function()
        {
          done();
        });
      });
    });        

    it('should read an idea by id', function(done)
    {
      integrationTestUtils.readFirstIdeaId(function(id)
      {
        var url = '/v1/idea/read/'+id;
        var req = request
          .get(url);
        testAgent.attachCookies(req);
        req.end(function(err, res) 
        {
          integrationTestUtils.shouldBeSuccess(res, 200);
          done();
        });
      });
    })

    it('should fail if the idea id is invalid', function(done)
    {
      var id = 'x12';
      var url = '/v1/idea/read/'+id;
      var req = request
        .get(url);
        testAgent.attachCookies(req);
        req.end(function(err, res) 
        {
          integrationTestUtils.shouldBeFailure(res, 500);
          done();
        });
    })

    it('should fail if the idea is owned by another user', function(done)
    {
      integrationTestUtils.logoutUser(function()
      {
        loginUser(otherUser, function()
        {
          integrationTestUtils.readFirstIdeaId(function(id)
          {
            integrationTestUtils.logoutUser(function()
            {
              loginUser(testUser, function()
              {
                var url = '/v1/idea/read/'+id;
                var req = request
                  .get(url);
                testAgent.attachCookies(req);
                req.end(function(err, res) 
                {
                  integrationTestUtils.shouldBeFailure(res, 403);
                  done();
                });
              }); 
            });
          });
        });
      });
    })
    
    after(function(done)
    {
      breakdownEditAndGet(function()
      {
        integrationTestUtils.deleteUserFromDB(testUser, function()
        {
          done();
        });
      });
    });

  })

  after(function(done)
  {
    done();
  })

})

// login a given user and call done
var loginUser = function (user, callback)
{
  integrationTestUtils.login(request, {email: user.email, password: user.password}, function(loginAgent)
  {
    testAgent = loginAgent;
    callback();
  });
}

var setupEditAndGet = function(callback)
{
  integrationTestUtils.createIdea(idea1, function()
  {
    integrationTestUtils.logoutUser(function()
    {
      integrationTestUtils.createUser(otherUser, function()
      {
        loginUser(otherUser, function()
        {
          integrationTestUtils.createIdea(idea5, function()
          {
            integrationTestUtils.logoutUser(function()
            {
              loginUser(testUser, function()
              {
                callback();
              });
            });
          }); 
        });
      });
    });
  });
}

var breakdownEditAndGet = function(callback)
{
  integrationTestUtils.deleteIdeas(function()
  {
    integrationTestUtils.logoutUser(function()
    {
      loginUser(otherUser, function()
      {
        integrationTestUtils.deleteIdeas(function()
        {
          integrationTestUtils.deleteUserFromDB(otherUser, function()
          {
            loginUser(testUser, function()
            {
              callback(); 
            });
          });
        });
      });
    });
  });
}


var setup = function(callback)
{
  integrationTestUtils.createAndLoginUser(function(user,agent)
  {
    testUser = user;
    testAgent = agent;
    callback();
  });
}

// tests for integration of components to yield correct
// request and response flow
// to run, type 'mocha integration' in test directory
//
var express = require('express'),
    app = require('../app.js'),
    request = require('supertest')(app),
    should = require('should'),
    superagent = require('superagent'),
    agent = superagent.agent(),
    MongoClient = require('mongodb').MongoClient;

var user =
{
  givenName: 'timmy',
  familyName: 'redman',
  email: 'timmy@example.com',
  "password": 'aaaaaa'
}
var otherUser =
{
  givenName: 'Timothy',
  familyName: 'redman',
  email: 'timmy2@example.com',
  password: 'aaaaaa'
}
var changedUser =
{
  givenName: 'timmy2',
  familyName: 'redman2',
  email: 'timmy@example.com',
  password: 'aaaaaa'
}
var malUser =
{
  familyName: 'redman',
  email: 'timmy@example.com',
  password: 'aaaaaa'
}
var idea1 =
{
  name: 'idea21',
  content: 'Lorem ipsum dolor sit amet,...'
}
var idea2 =
{
  name: 'idea22',
  content: 'Lorem ipsum ,...'
}
var idea3 =
{
  name: 'idea23',
  content: 'Lorem ipsum dolor sit amet,...'
}
var idea4 =
{
  name: 'idea24',
  content: 'Lorem ipsum ,...'
}
var idea5 =
{
  name: 'idea25',
  content: 'Lorem ipsum ,...'
}

// used to log users in and track their cookies (using superagent module)
var agent;

describe('user controller', function()
{

  describe('addUser', function()
  {

    it('should add a new user if valid information is given', function(done)
    {
      var req = request
        .post('/v1/user/signup')
        .send(user)
          .end(function(err, res)
          {
            shouldBeSuccess(res);
            done();
          })
    })

    it('should add a user which can successfully login', function(done)
    {
      loginUser(user,done);
    })

    it('should not attempt to add a user if insufficient information provided', function(done)
    {
      var req = request
        .post('/v1/user/signup')
        .send(malUser)  
          .end(function(err, res)
          {
            shouldBeFailure(res);
            done();
          })
    })

    after(function(done)
    {
      deleteUser(done);
    })

  })


  describe('getUser', function()
  {

    before(function(done) 
    {
      addUser(user, function()
      {
        loginUser(user, function()
        {
          done();
        });
      });
    }); 

    it('should get the logged in user profile information', function(done)
    {
      var req = request
        .get('/v1/user/get');
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
          .get('/v1/user/get')
          .end(function(err, res)
        {
          res.text.should.match(/success.*false/);
          done();
        })
    })

    after(function(done)
    {
      deleteUser(function()
      {
        done();
      });
    })

  })


  describe('editUser', function()
  {

    before(function(done) 
    {
      addUser(user, function()
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
        .post('/v1/user/edit');
        agent.attachCookies(req);
        req.send({"givenName": changedUser.givenName, "familyName": changedUser.familyName})  
          .end(function(err, res)
          {
            shouldBeSuccess(res);
            // check content changed
            req = request
            .get('/v1/user/get');
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
      deleteUser(done);
    })
  })

})



describe('idea controller', function() 
{
  before(function(done) 
  {
    addUser(user, function()
    {
      loginUser(user, function()
      {
        done();
      });
    });
  })


  describe('add idea', function()
  {

    var ideaId;
    before(function(done)
    {
      done();
    })

    it('should create a new idea', function(done)
    {
      var req = request
        .post('/v1/idea/add');
        agent.attachCookies(req);
        req.send({ideaName:idea1.name, ideaContent: idea1.content})
           .end(function(err, res) 
           {
             shouldBeSuccess(res);
             ideaId = res.body.result.id;
             done();
           });
    })

    it('should not create an idea if insufficient information provided', function(done)
    {
      var req = request
        .post('/v1/idea/add');
        agent.attachCookies(req);
        req.send({ideaName:idea1.name, ideaContent: undefined})
           .end(function(err, res) 
           {
             shouldBeFailure(res);
             done();
           });
    });

    after(function(done)
    {
      deleteIdea(ideaId,done);
    })

  })


  describe('editIdea', function()
  {

    before(function(done)
    {
      setupEditAndGet(function()
      {
         done();
      });
    });        

    it('should edit an existing idea', function(done)
    {
      getFirstIdeaId(function(id)
      {
        var url = '/v1/idea/edit/'+id;
        var req = request
          .post(url);
        agent.attachCookies(req);
        req.send({ideaName:idea2.name, ideaContent: idea2.content})
           .end(function(err, res) 
           {
             if (err) throw error;
             shouldBeSuccess(res);
             var url = '/v1/idea/get/'+id;
             var req = request
              .post(url);
              agent.attachCookies(req);
              req.end(function(err, res) 
              {
                res.body.result.name.should.equal(idea2.name);
                res.body.result.content.should.equal(idea2.content);
                done();
              });
           });
        });
    })

    it('should not update an idea of other user', function(done)
    {
      logoutUser(function()
      {
        loginUser(otherUser, function()
        {
          getFirstIdeaId(function(id)
          {
            logoutUser(function()
            {
              loginUser(user, function()
              {
                var url = '/v1/idea/edit/'+id;
                var req = request
                  .post(url);
                agent.attachCookies(req);
                req.send({ideaName:idea1.name, ideaContent: undefined})
                  .end(function(err, res) 
                  {
                    shouldBeFailure(res);
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
      var url = '/v1/idea/edit/'+id;
      var req = request
        .post(url);
        agent.attachCookies(req);
        req.send({ideaName:idea1.name, ideaContent: undefined})
           .end(function(err, res) 
           {
             shouldBeFailure(res);
             done();
           });
    });

    after(function(done)
    {
      breakdownEditAndGet(function()
      {
        done();
      });
    });

  })


  describe('get ideas', function()
  {
    before(function(done)
    {
      var req = request
        .post('/v1/idea/add');
        agent.attachCookies(req);
        req.send({ideaName:idea3.name, ideaContent: idea3.content})
           .end(function(err, res) 
           {
             req = request
             .post('/v1/idea/add');
             agent.attachCookies(req);
             req.send({ideaName:idea4.name, ideaContent: idea4.content})
             .end(function(err, res)
             {
               done();
             });
           });
    })

    it('should get all ideas of the authenticated user', function(done)
    {
      var req = request
        .get('/v1/idea/get');
      agent.attachCookies(req); 
      req.end(function(err, res)
      {
        res.body.result.length.should.equal(2);
        shouldBeSuccess(res);
        done();
      });
    })

    it('should not get ideas if the user is not authenticated', function(done)
    {
      var req = request
        .get('/logout');
        req = request
          .get('/v1/idea/get')
          .end(function(err, res)
        {
          res.text.should.match(/success.*false/);
          login(request, {email: user.email, password: user.password}, function(loginAgent)
          {
            agent = loginAgent;
            done();
          });
        })
    })

    after(function(done)
    {
      deleteIdeas(done);
    })
  })


  describe('getIdea', function()
  {
    before(function(done)
    {
      setupEditAndGet(function()
      {
         done();
      });
    });        

    it('should get an idea by id', function(done)
    {
      getFirstIdeaId(function(id)
      {
        var url = '/v1/idea/get/'+id;
        var req = request
          .get(url);
        agent.attachCookies(req);
        req.end(function(err, res) 
        {
          shouldBeSuccess(res);
          done();
        });
      });
    })

    it('should fail if the idea id is invalid', function(done)
    {
      var id = 'x12';
      var url = '/v1/idea/get/'+id;
      var req = request
        .get(url);
        agent.attachCookies(req);
        req.end(function(err, res) 
        {
          shouldBeFailure(res);
          done();
        });
    })

    it('should fail if the idea is owned by another user', function(done)
    {
      logoutUser(function()
      {
        loginUser(otherUser, function()
        {
          getFirstIdeaId(function(id)
          {
            logoutUser(function()
            {
              loginUser(user, function()
              {
                var url = '/v1/idea/get/'+id;
                var req = request
                  .get(url);
                agent.attachCookies(req);
                req.end(function(err, res) 
                {
                  shouldBeFailure(res);
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
        done();
      });
    });
  })

  after(function(done)
  {
    deleteUser(done);
  })
})



/*
 Utility functions used by all integration tests follow.
*/

var shouldBeSuccess = function (res)
{
  res.should.be.json;
  res.statusCode.should.equal(200);
  res.text.should.match(/success.*true/);
}
var shouldBeFailure = function (res)
{
  res.should.be.json;
  res.statusCode.should.equal(200);
  res.text.should.match(/success.*false/);
}

var getFirstIdeaId = function (callback)
{
  var req = request
    .get('/v1/idea/get');
  agent.attachCookies(req); 
  req.end(function(err, res)
  {
    if (res.body.result.length > 0)
    {
      callback(res.body.result[0]._id);
    }
    else
    {
      callback(undefined);
    }
  });
}

// login a given user and call done
var loginUser = function (user, callback)
{
  login(request, {email: user.email, password: user.password}, function(loginAgent)
  {
    agent = loginAgent;
    callback();
  });
}

var addUser = function(user, callback)
{
  var req = request
    .post('/v1/user/signup')
    .send(user)
    .end(function(err)
    {
      if (err) throw error;
      callback();
    });
}

var login = function (request, user, done)
{
  request
    .post('/login')
    .send(user)
    .end(function (err, res)
    {
      if (err) throw error;
      agent.saveCookies(res);
      done(agent);
    });
};

// delete the currently logged in user
var deleteUser = function (callback)
{
  var req = request
    .post('/v1/user/delete');
    agent.attachCookies(req);
    req.end(function(err)
    {
      if (err) throw error;
      callback();
    })
}

// add an idea
var addIdea = function (idea, callback)
{
  var req = request
    .post('/v1/idea/add');
  agent.attachCookies(req);
  req.send({ideaName:idea.name, ideaContent: idea.content})
    .end(function(err, res)
    {
      callback();
    });
}

// delete all ideas of logged in user
var deleteIdeas = function(done)
{
  var req = request
    .post('/v1/idea/delete/');
    agent.attachCookies(req);
    req.end(function(err, res) 
    {
      if (err) throw error;
      done();
    });
}

var deleteIdea = function(id, callback)
{
  // delete idea ideaId
  var url = '/v1/idea/delete/'+id;
  var req = request
    .post(url);
    agent.attachCookies(req);
    req.end(function(err)
    {
      if (err) throw error;
    });
  callback();
}

var logoutUser = function(callback)
{

  // logout regular user
  var req = request
    .get('/logout');
  agent.attachCookies(req);
  req.end(function(err)
  {
    if (err) throw error;
  });

  callback();
}

var setupEditAndGet = function(callback)
{
  addIdea(idea1, function()
  {
    logoutUser(function()
    {
      addUser(otherUser, function()
      {
        loginUser(otherUser, function()
        {
          addIdea(idea5, function()
          {
            logoutUser(function()
            {
              loginUser(user, function()
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
  deleteIdeas(function()
  {
    logoutUser(function()
    {
      loginUser(otherUser, function()
      {
        deleteIdeas(function()
        {
          deleteUser(function()
          {
            loginUser(user, function()
            {
              callback(); 
            });
          });
        });
      });
    });
  });
}

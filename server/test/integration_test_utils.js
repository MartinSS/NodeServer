var app = require('../app.js'),
    request = require('supertest')(app),
    superagent = require('superagent'),
    agent = superagent.agent(),
    utils = require('../utils'),
    User = require('../models/user').User,
    Idea = require('../models/idea').Idea,
    testUtils = require('./test_utils'),
    should = require('should');

/*
 Utility functions used by all integration tests follow.
*/


var integrationUtils =
{

  shouldBeSuccess: function (res, status)
  {
    res.should.be.json;
    res.text.should.match(/success.*true/);
    if (status)
    {
      res.statusCode.should.equal(status)
    }
  },

  shouldBeFailure: function (res, status)
  {
    res.should.be.json;
    res.text.should.match(/success.*false/);
    if (status)
    {
      res.statusCode.should.equal(status)
    }
  },
  
  readFirstIdeaId: function (callback)
  {
    var req = request
      .get('/v1/idea/read');
    agent.attachCookies(req); 
    req.end(function(err, res)
    {
      if (res.body.result.length > 0)
      {
        integrationUtils.shouldBeSuccess(res,200);
        callback(res.body.result[0]._id);
      }
      else
      {
        callback(undefined);
      }
    });
  },

  login: function (request, user, done)
  { 
    request
      .post('/login')
      .send(user)
      .end(function (err, res)
      {
        if (err) throw error;
        agent.saveCookies(res);
        integrationUtils.shouldBeSuccess(res,200);
        done(agent);
      });
  },

  createUser: function(user, callback)
  {
    var req = request
      .post('/v1/user/create')
      .send(user)
      .end(function(err,res)
      {
        if (err) throw error;
        integrationUtils.shouldBeSuccess(res,201);
        callback();
      });
  },

  // generates valid user, creates user in system, then logs user in
  createAndLoginUser: function(callback)
  {
    var user = testUtils.generateValidUser();
    integrationUtils.createUser(user, function()
    {
      loginUser(user, function()
      {
        callback(user,agent);
      });
    });
  },

  // create delete 

  // delete the currently logged in user
  deleteUser: function (callback)
  {
  
    var req = request
      .post('/v1/user/delete'); // remove this should do in db
      agent.attachCookies(req);
      req.end(function(err,res)
      {
        if (err) throw error;
        integrationUtils.shouldBeSuccess(res,200);
        callback();
      })
  },


  // delete the currently logged in user directly from db
  deleteUserFromDB: function (user, callback)
  {
    User.findOne(
    {
      email: user.email
    }, function(err, usr)
    {
      if (err) throw "Error in deleteUserFromDB finding user";
      if (!usr) throw "No user found in deleteUserFromDB";
      integrationUtils.logoutUser(function()
      {
        User.remove(
        {
          email: user.email
        }, function(err)
        {
          if (err) throw "Error in deleteUserFromDB removing user";
          else
          {
            // delete ideas of user
            Idea.remove(
            {
              userId: user.email
            }, function(err, ideas)
            {
              if (err) throw "Error in deleteUserFromDB removing ideas of user";
              else
              {
                callback();
              }
            });
          }
        });
      });
    });
  },


  
  // create an idea
  createIdea: function (idea, callback)
  {
    var req = request
      .post('/v1/idea/create');
    agent.attachCookies(req);
    req.send({title:idea.title, content: idea.content})
      .end(function(err, res)
      {
        integrationUtils.shouldBeSuccess(res,201);
        callback();
      });
  },
  
  // delete all ideas of logged in user
  deleteIdeas: function(done)
  {
    var req = request
    .post('/v1/idea/delete/');
    agent.attachCookies(req);
    req.end(function(err, res) 
    {
      if (err) throw error;
      integrationUtils.shouldBeSuccess(res,200);
      done();
    });
  },
  
  deleteIdea: function(id, callback)
  {
    // delete idea ideaId
    var url = '/v1/idea/delete/'+id;
    var req = request
      .post(url);
      agent.attachCookies(req);
      req.end(function(err, res)
      {
        if (err) throw error;
        integrationUtils.shouldBeSuccess(res,200);
        callback();
      });
  },
  
  logoutUser: function(callback)
  {
  
    // logout regular user
    var req = request
      .get('/logout');
    agent.attachCookies(req);
    req.end(function(err, res)
    {
      if (err) throw error;
      integrationUtils.shouldBeSuccess(res,200);
      callback();
    });
  }
};


module.exports = integrationUtils;


var loginUser = function (user, callback)
{
  integrationUtils.login(request, {"email": user.email, "password": user.password}, function(loginAgent)
  {
    agent = loginAgent;
    callback();
  });
}










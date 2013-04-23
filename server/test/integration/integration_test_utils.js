var app = require('../../app.js'),
    request = require('supertest')(app),
    superagent = require('superagent'),
    agent = superagent.agent();

/*
 Utility functions used by all integration tests follow.
*/

module.exports =
{

  shouldBeSuccess: function (res)
  {
    res.should.be.json;
    res.statusCode.should.equal(200);
    res.text.should.match(/success.*true/);
  },

  shouldBeFailure: function (res)
  {
    res.should.be.json;
    res.statusCode.should.equal(200);
    res.text.should.match(/success.*false/);
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
        callback();
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
        callback();
      })
  },
  
  // create an idea
  createIdea: function (idea, callback)
  {
    var req = request
      .post('/v1/idea/create');
    agent.attachCookies(req);
    req.send({ideaName:idea.name, ideaContent: idea.content})
      .end(function(err, res)
      {
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
      req.end(function(err)
      {
        if (err) throw error;
      });
    callback();
  },
  
  logoutUser: function(callback)
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
};

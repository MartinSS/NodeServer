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
  password: 'aaaaaa'
}

var otherUser =
{
  givenName: 'timmy',
  familyName: 'redman',
  email: 'timmy@example.com',
  password: 'aaaaaa'
}

var changedUser =
{
  givenName: 'timmy2',
  familyName: 'redman2',
  email: 'timmy@example.com',
  password: 'aaaaaa'
}

var malChangedUser =
{
  givenName: 'timmy2',
  familyName: 'redman2',
  email: 'timmy2@example.com',
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

var malIdea =
{
  name: "",
  content: 'Lorem ipsum ,...'
}

var insertIdea =
{
  name: 'idea 23',
  content:  'Lorem ipsum dolor sit amet,...',
  userId: 'test@example.com'
}

var login = function (request, done)
{
  request
    .post('/login')
    .send(user)
    .end(function (err, res)
    {
      if (err) 
      {
        throw err;
      }
      agent.saveCookies(res);
      done(agent);
    });
};


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
            res.should.be.json;
            res.text.should.match(/success.*true/);
            done();
          })
    })

    it('should not attempt to add a user if insufficient information provided', function(done)
    {
      var req = request
        .post('/v1/user/signup')
        .send(malUser)  
          .end(function(err, res)
          {
            res.should.be.json;
            res.text.should.match(/success.*false/);
            done();
          })
    })
  })


  describe('getUser', function()
  {
    var agent;
    before(function(done) 
    {
      login(request, function(loginAgent)
      {
        agent = loginAgent;
        done();
      });
    })

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
  })


  describe('editUser', function()
  {
    var agent;
    before(function(done) 
    {
      login(request, function(loginAgent)
      {
        agent = loginAgent;
        done();
      });
    })

    it('should change the information in a user profile', function(done)
    {
      var req = request
        .post('/v1/user/edit');
        agent.attachCookies(req);
        req.send(changedUser)  
          .end(function(err, res)
          {
            res.should.be.json;
            res.text.should.match(/success.*true/);
            MongoClient.connect("mongodb://localhost:27017/idea_service", function(err, db)
            {
              var collection = db.collection('users'); 
              collection.findOne({email:changedUser.email}, function(err, doc)
              {
                if (err) throw err; 
                doc.givenName.should.equal(changedUser.givenName);  
                done();
              });
            });
          })
    })

    it('should not permit operation if incomplete data provided', function(done)
    {
      var req = request
        .post('/v1/user/edit')
        agent.attachCookies(req);
        req.send(malUser)
          .end(function(err, res)
          {
            res.should.be.json;
            res.text.should.match(/success.*false/);
            done();
          })
    })
  })
})


describe('idea controller', function() 
{
  var agent;
  before(function(done) 
  {
    login(request, function(loginAgent)
    {
      agent = loginAgent;
      done();
    });
  })


  describe('add idea', function()
  {

    it('should create a new idea', function(done)
    {
      var req = request
        .post('/v1/idea/add');
        agent.attachCookies(req);
        req.send({ideaName:idea1.name, ideaContent: idea1.content})
           .end(function(err, res) 
           {
             res.should.be.json;
             res.text.should.match(/success.*true/);
             res.statusCode.should.equal(200);
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
             res.should.be.json;
             res.text.should.match(/success.*false/);
             res.statusCode.should.equal(200);
             done();
           });
    });

    after(function(done)
    {
      MongoClient.connect("mongodb://localhost:27017/idea_service", function(err, db)
      {
        var collection = db.collection('ideas'); 
        collection.remove({userId:user.email}, function(err)
        {
          if (err) throw err; 
          done();
        });
      });
    })

  })


  describe('editIdea', function()
  {

    var id;
    before(function(done)
    {
      MongoClient.connect("mongodb://localhost:27017/idea_service", function(err, db)
      {
        var collection = db.collection('ideas'); 
        collection.insert({userId:user.email, name: idea1.name, content: idea1.content}, function(err)
        {
          if (err) throw err; 
        });
        collection.findOne({userId:user.email}, function(err, doc)
        {
          if (err) throw err; 
          id = doc._id;
          done();

        });
      });
    })

    it('should edit an existing idea', function(done)
    {
      var url = '/v1/idea/edit/'+id;
      var req = request
        .post(url);
        agent.attachCookies(req);
        req.send({ideaName:idea2.name, ideaContent: idea2.content})
           .end(function(err, res) 
           {
             res.should.be.json;
             res.text.should.match(/success.*true/);
             res.statusCode.should.equal(200);
           });
      MongoClient.connect("mongodb://localhost:27017/idea_service", function(err, db)
      {
        if (err) throw error;
        var collection = db.collection('ideas');
        collection.findOne({_id:id}, function(err, doc)
        {
          if (err) throw err; 
          doc.name.should.equal(idea2.name);  
          doc.content.should.equal(idea2.content);  
          done();
        });
      });
    })

    it('should not update an idea if insufficient information provided', function(done)
    {
      var url = '/v1/idea/edit/'+id;
      var req = request
        .post(url);
        agent.attachCookies(req);
        req.send({ideaName:idea1.name, ideaContent: undefined})
           .end(function(err, res) 
           {
             res.should.be.json;
             res.text.should.match(/success.*false/);
             res.statusCode.should.equal(200);
             done();
           });
    });

    it('should not update an idea of other user', function(done)
    {
      var id;
      MongoClient.connect("mongodb://localhost:27017/idea_service", function(err, db)
      {
        var collection = db.collection('ideas'); 
        collection.insert(insertIdea, function(err)
        {
          if (err) throw error;
        })
        collection.findOne({userId: insertIdea.userId}, function(err, doc)
        {
          if (err) throw err;
          id = doc._id;
        })
      });

      var url = '/v1/idea/edit/'+id;
      var req = request
        .post(url);
        agent.attachCookies(req);
        req.send({ideaName:idea1.name, ideaContent: undefined})
           .end(function(err, res) 
           {
             res.should.be.json;
             res.text.should.match(/success.*false/);
             res.statusCode.should.equal(200);
             done();
           });
    });

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
             res.should.be.json;
             res.text.should.match(/success.*false/);
             res.statusCode.should.equal(200);
             done();
           });
    });

    after(function(done)
    {
      MongoClient.connect("mongodb://localhost:27017/idea_service", function(err, db)
      {
        var collection = db.collection('ideas'); 
        collection.remove({userId: insertIdea.userId}, function(err)
        {
          if (err) throw error;
        });
        collection.remove({userId:user.email}, function(err)
        {
          if (err) throw err; 
          done();
        });
      });
    })

  })


  describe('get ideas', function()
  {

    before(function(done)
    {
      login(request, function(loginAgent)
      {
        agent = loginAgent;
      });

      MongoClient.connect("mongodb://localhost:27017/idea_service", function(err, db)
      {
        if (err) throw error;
        var collection = db.collection('ideas'); 
        collection.insert({userId: user.email, name: idea3.name, content: idea3.content}, function(err)
        {
          if (err) throw error;
        });
        collection.insert({userId: user.email, name: idea4.name, content: idea4.content}, function(err)
        {
          if (err) throw error;
          done();
        });
      })
    })

    it('should get all ideas of the authenticated user', function(done)
    {
      var req = request
        .get('/v1/idea/get');
      agent.attachCookies(req); 
      req.end(function(err, res)
      {
        res.body.body.length.should.equal(2);
        res.statusCode.should.equal(200);
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
          login(request, function(loginAgent)
          {
            agent = loginAgent;
            done();
          });
        })
    })


    after(function(done)
    {
      MongoClient.connect("mongodb://localhost:27017/idea_service", function(err, db)
      {
        if (err) throw error;
        var collection = db.collection('ideas'); 
        collection.remove({userId: user.email}, function(err)
        {
          if (err) throw error;
          done();
        });
      })
    })

  })


  describe('getIdea', function()
  {

    var id;
    before(function(done)
    {
      MongoClient.connect("mongodb://localhost:27017/idea_service", function(err, db)
      {
        var collection = db.collection('ideas'); 
        collection.insert({userId:user.email, name: idea1.name, content: idea1.content}, function(err)
        {
          if (err) throw err; 
        });
        collection.findOne({userId:user.email}, function(err, doc)
        {
          if (err) throw err; 
          id = doc._id;
          done();
        });
      });
    })


    it('should get an idea by id', function(done)
    {
      var url = '/v1/idea/get/'+id;
      var req = request
        .get(url);
        agent.attachCookies(req);
        req.end(function(err, res) 
        {
          res.should.be.json;
          res.text.should.match(/success.*true/);
          res.statusCode.should.equal(200);
          done();
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
          res.should.be.json;
          res.text.should.match(/success.*false/);
          res.statusCode.should.equal(200);
          done();
        });
    })

    it('should fail if the idea is owned by another user', function(done)
    {
      var id;
      MongoClient.connect("mongodb://localhost:27017/idea_service", function(err, db)
      {
        var collection = db.collection('ideas'); 
        collection.insert(insertIdea, function(err)
        {
          if (err) throw error;
        })
        collection.findOne({userId: insertIdea.userId}, function(err, doc)
        {
          if (err) throw err;
          id = doc._id;
        })
      });

      var url = '/v1/idea/get/'+id;
      var req = request
        .get(url);
        agent.attachCookies(req);
        req.end(function(err, res) 
        {
          res.should.be.json;
          res.text.should.match(/success.*false/);
          res.statusCode.should.equal(200);
          done();
        });
    })

    after (function(done)
    {
      MongoClient.connect("mongodb://localhost:27017/idea_service", function(err, db)
      {
        var collection = db.collection('ideas'); 
        collection.remove({userId: insertIdea.userId}, function(err)
        {
          if (err) throw error;
        });
        collection.remove({userId:user.email}, function(err)
        {
          if (err) throw err; 
          done();
        });
      });
    })

  })

})

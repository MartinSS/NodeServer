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

var idea5 =
{
  name: 'idea25',
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

var login = function (request, user, done)
{
  request
    .post('/login')
    .send(user)
    .end(function (err, res)
    {
      if (err) 
      {
        throw error;
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

    it('should add a user which can successfully login', function(done)
    {
      login(request, {email: user.email, password: user.password}, function(loginAgent)
      {
        agent = loginAgent;
        done();
      });
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

    after(function(done)
    {
      var req = request
        .post('/v1/user/delete');
        agent.attachCookies(req);
        req.end(function(err)
        {
          if (err) throw error;
          done();
        })
    })

  })


  describe('getUser', function()
  {

    var agent;
    before(function(done) 
    {
      var req = request
        .post('/v1/user/signup')
        .send(user)
        .end(function(err)
        {
          if (err) throw error;
        })

      login(request, {email: user.email, password: user.password}, function(loginAgent)
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


    after(function(done)
    {
      var req = request
        .post('/v1/user/delete');
        agent.attachCookies(req);
        req.end(function(err)
        {
          if (err) throw error;
          done();
        })
    })

  })


  describe('editUser', function()
  {
    var agent;
    before(function(done) 
    {
      var req = request
        .post('/v1/user/signup')
        .send(user)
        .end(function(err)
        {
          if (err) throw error;
        })

      login(request, {email: user.email, password: user.password}, function(loginAgent)
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
        req.send({"givenName": changedUser.givenName, "familyName": changedUser.familyName})  
          .end(function(err, res)
          {
            res.should.be.json;
            res.text.should.match(/success.*true/);
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
      var req = request
        .post('/v1/user/delete');
        agent.attachCookies(req);
        req.end(function(err)
        {
          if (err) throw error;
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
    var req = request
      .post('/v1/user/signup')
      .send(user)
      .end(function(err)
      {
        if (err) throw error;
      })
    login(request, {email: user.email, password: user.password}, function(loginAgent)
    {
      agent = loginAgent;
      done();
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
             res.should.be.json;
             res.text.should.match(/success.*true/);
             res.statusCode.should.equal(200);
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
             res.should.be.json;
             res.text.should.match(/success.*false/);
             res.statusCode.should.equal(200);
             done();
           });
    });

    after(function(done)
    {
      var url = '/v1/idea/delete/'+ideaId;
      var req = request
        .post(url);
        agent.attachCookies(req);
        req.end(function(err, res) 
        {
          done();
        });
    })

  })


  describe('editIdea', function()
  {

    var ideaId;
    var otherUserIdeaId
    before(function(done)
    {
      var req = request
        .post('/v1/idea/add');
        agent.attachCookies(req);
        req.send({ideaName:idea1.name, ideaContent: idea1.content})
           .end(function(err, res)
           {
             ideaId = res.body.result.id;
             // add other user
             var req = request
             .post('/v1/user/signup')
             .send(otherUser)
             .end(function(err)
             {
               if (err) throw error;
               // logout regular user
               req = request
               .get('/logout');
               agent.attachCookies(req);
               req.end(function(err)
               {
                 if (err) throw error;
                 // login other user
                 login(request, {email: otherUser.email, password: otherUser.password}, function(loginAgent)
                 {
                   agent = loginAgent;
                   req = request
                   .post('/v1/idea/add');
                   agent.attachCookies(req);
                   req.send({ideaName:idea5.name, ideaContent: idea5.content})
                   .end(function(err, res)
                   {
                     otherUserIdeaId = res.body.result.id;
                     // logout other user
                     req = request
                     .get('/logout');
                     agent.attachCookies(req);
                     req.end(function(err)
                     {
                       if (err) throw error;
                       // log back in regular user
                       login(request, {email: user.email, password: user.password}, function(loginAgent)
                       {
                         agent = loginAgent;
                         done();
                       });
                     })
                   })
                 });
               })
             })
           });
    })


    it('should edit an existing idea', function(done)
    {

      var url = '/v1/idea/edit/'+ideaId;
      var req = request
        .post(url);
        agent.attachCookies(req);
        req.send({ideaName:idea2.name, ideaContent: idea2.content})
           .end(function(err, res) 
           {
             if (err) throw error;
             res.should.be.json;
             res.text.should.match(/success.*true/);
             res.statusCode.should.equal(200);
             var url = '/v1/idea/get/'+ideaId;
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
    })


    it('should not update an idea of other user', function(done)
    {
      var url = '/v1/idea/edit/'+otherUserIdeaId;
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
      var url = '/v1/idea/delete/'+ideaId;
      var req = request
        .post(url);
        agent.attachCookies(req);
        req.end(function(err)
        {
          if (err) throw error;
             // logout regular user
             req = request
             .get('/logout');
             agent.attachCookies(req);
             req.end(function(err)
             {
               if (err) throw error;
               // login other user
               login(request, {email: otherUser.email, password: otherUser.password}, function(loginAgent)
               {
                 agent = loginAgent;
                 var url = '/v1/idea/delete/'+otherUserIdeaId;
                 req = request
                 .post(url);
                 agent.attachCookies(req);
                 req.end(function(err)
                 {
                   // delete other user
                   req = request
                   .post('/v1/user/delete');
                   agent.attachCookies(req);
                   req.end(function(err)
                   {
                     if (err) throw error;

                     // log back in regular user
                     login(request, {email: user.email, password: user.password}, function(loginAgent)
                     {
                       agent = loginAgent;
                       done();
                     });
                   })
                 });
               });
             })
        });
    })
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
             // ideaId = res.body.result.id;
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
          login(request, {email: user.email, password: user.password}, function(loginAgent)
          {
            agent = loginAgent;
            done();
          });
        })
    })


    after(function(done)
    {
      var req = request
        .post('/v1/idea/delete');
        agent.attachCookies(req); 
        req.end(function(err)
        {
          if (err) throw error;
          done();
        })
    })

  })


  describe('getIdea', function()
  {

    var ideaId;
    var otherUserIdeaId
    before(function(done)
    {
      var req = request
        .post('/v1/idea/add');
        agent.attachCookies(req);
        req.send({ideaName:idea1.name, ideaContent: idea1.content})
           .end(function(err, res)
           {
             ideaId = res.body.result.id;
             // add other user
             var req = request
             .post('/v1/user/signup')
             .send(otherUser)
             .end(function(err)
             {
               if (err) throw error;
               // logout regular user
               req = request
               .get('/logout');
               agent.attachCookies(req);
               req.end(function(err)
               {
                 if (err) throw error;
                 // login other user
                 login(request, {email: otherUser.email, password: otherUser.password}, function(loginAgent)
                 {
                   agent = loginAgent;
                   req = request
                   .post('/v1/idea/add');
                   agent.attachCookies(req);
                   req.send({ideaName:idea5.name, ideaContent: idea5.content})
                   .end(function(err, res)
                   {
                     otherUserIdeaId = res.body.result.id;
                     // logout other user
                     req = request
                     .get('/logout');
                     agent.attachCookies(req);
                     req.end(function(err)
                     {
                       if (err) throw error;
                       // log back in regular user
                       login(request, {email: user.email, password: user.password}, function(loginAgent)
                       {
                         agent = loginAgent;
                         done();
                       });
                     })
                   })
                 });
               })
             })
           });
    })


    it('should get an idea by id', function(done)
    {
      var url = '/v1/idea/get/'+ideaId;
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

      var url = '/v1/idea/get/'+otherUserIdeaId;
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


    after(function(done)
    {
      var url = '/v1/idea/delete/'+ideaId;
      var req = request
        .post(url);
        agent.attachCookies(req);
        req.end(function(err)
        {
          if (err) throw error;
             // logout regular user
             req = request
             .get('/logout');
             agent.attachCookies(req);
             req.end(function(err)
             {
               if (err) throw error;
               // login other user
               login(request, {email: otherUser.email, password: otherUser.password}, function(loginAgent)
               {
                 agent = loginAgent;
                 var url = '/v1/idea/delete/'+otherUserIdeaId;
                 req = request
                 .post(url);
                 agent.attachCookies(req);
                 req.end(function(err)
                 {
                   // delete other user
                   req = request
                   .post('/v1/user/delete');
                   agent.attachCookies(req);
                   req.end(function(err)
                   {
                     if (err) throw error;

                     // log back in regular user
                     login(request, {email: user.email, password: user.password}, function(loginAgent)
                     {
                       agent = loginAgent;
                       done();
                     });
                   })
                 });
               });
             })
        });
    })

  })

  after(function(done)
  {
    var req = request
      .post('/v1/user/delete');
      agent.attachCookies(req);
      req.end(function(err)
      {
        if (err) throw error;
        done();
      })
  })
})


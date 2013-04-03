var express = require('express'),
  mongo = require('mongodb'),
  config = require('./config'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  util = require('util'),
  userController = require('./controllers/UserController.js'),
  ideaController = require('./controllers/IdeaController.js'),
  signupController = require('./controllers/SignupController.js'),
  LocalStrategy = require('passport-local').Strategy;

// server configuration
var SERVER = {
  host: 'localhost',
  port: 8888
};

var app = module.exports = express();
var User = require('./models/user').User;
var Session = require('./models/session').Session;

app.configure(function()
{
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session(
  {
    secret: 'purple cow'
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

app.configure('development', function()
{
  app.use(express.errorHandler(
  {
    dumpExceptions: true,
    showStack: true
  }));
});

// set database environment and connect
app.set('dbUrl', config.db[app.settings.env]);
mongoose.connect(app.get('dbUrl'));

// index, we're not rendering and have no endpoint on the root
app.get('/', function(req, res)
{
  console.log("called '/'");
  res.json(
  {
    "success": true,
    "message": "server is working"
  });
});

// REST/JSON api endpoint declaration

app.all('/v1/user/:op', ensureAuthenticated, userController.route);
app.all('/v1/idea/:op/:id?', ensureAuthenticated, ideaController.route);
app.all('/v1/signup/:op', signupController.route);


// login a user
app.post('/login', passport.authenticate('local'), function(req, res)
{
  Session.findOne(
  {
    'ID': req.sessionID
  }, function(err, session)
  {
    if (err)
    {
      res.json(
      {
        status: false,
        message: 'Error occurred while retrieving session'
      });
    }
    else if (!session)
    {
      User.findOne(
      {
        email: req.body.email
      }, function(err, usr)
      {
        var session = new Session(
        {
          ID: req.sessionID,
          givenName: usr.givenName,
          email: usr.email
        });
        session.save(function(err)
        {
          if (err)
          {
            res.json(
            {
              status: false,
              message: 'Error occurred while storing session'
            });
          }
        });
      });
    }
    else
    { // session already exists and user is logging in again
      if (session.email != req.body.email)
      {
        console.log("attempt to login with another user's session");
        res.json(
        {
          status: false,
          message: 'Error invalid session id'
        });
      }
    }
  });

  console.log("returning login status success");
  res.json(
  {
    "status": true,
    "message": "login succesful",
    "sessionID": req.sessionID
  });
});

// log out a user
app.get('/logout', function(req, res)
{
  console.log('get logout called');
  console.log('session id ' + req.sessionID);
  req.logout();
  res.json(
  {
    "success": true,
    "message": "successfully logged out"
  });
});

// PASSPORT //

passport.use(new LocalStrategy(
{
  usernameField: 'email',
  passwordField: 'password'
},

function(usernameField, passwordField, done)
{
  console.log('authenticating email:' + usernameField + ' password:' + passwordField);
  // look up user by email
  User.findOne(
  {
    'email': usernameField
  }, function(err, usr)
  {
    if (err)
    {
      return done(err, false,
      {
        message: 'Error occurred acccessing users collection'
      });
    }
    if (!usr)
    {
      console.log('Unknown user ' + usernameField);
      return done(null, false,
      {
        message: 'Unknown user ' + usernameField
      });
    }
    if (usr.password != passwordField)
    {
      console.log('Invalid password');
      return done(null, false,
      {
        message: 'Invalid password'
      });
    }
    // found a matching user and password
    return done(null, usr);
  });
}));


passport.serializeUser(function(user, done)
{
  done(null, user.id);
});


passport.deserializeUser(function(id, done)
{
  User.findOne(
  {
    _id: id
  }, function(err, user)
  {
    done(err, user);
  });
});


// BOOT THE SERVER //
app.listen(SERVER.port, SERVER.host);
console.log("server started on " + SERVER.host + ":" + SERVER.port);


// OTHER METHODS //

function ensureAuthenticated(req, res, next)
{
  if (req.isAuthenticated())
  {
    return next();
  }
  res.json(
  {
    "success": false,
    "message": "user not authenticated"
  });
}


/* -------------------------------------------------------------------- */
// Not part of application logic, initialization friendly method to add
// some users to test basic authentication.
var populateUsers = function()
{

  var users = [
  {
    "givenName": "Joe",
    "familyName": "Wolosky",
    "email": "joew@example.com",
    "password": "987654"
  },
  {
    "givenName": "Tom",
    "familyName": "Sanchez",
    "email": "toms@example.com",
    "password": "abcdef"
  }];

  db.collection('users', function(err, collection)
  {
    collection.insert(users,
    {
      safe: true
    }, function(err, result)
    {});
  });

};

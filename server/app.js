var express = require('express'),
  config = require('./config'),
  mongo = require('mongodb'),
  mongoose = require('mongoose'),
  redis = require('redis'),
  passport = require('passport'),
  util = require('util'),
  utils = require('./utils'),
  userController = require('./controllers/UserController.js'),
  ideaController = require('./controllers/IdeaController.js'),
  LocalStrategy = require('passport-local').Strategy;

// server configuration
var SERVER = {
  host: 'localhost',
  port: 8888
};

// time for session cache to live in seconds
var ttl = 6000; 

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
  // app.use(express.static(__dirname + '/public'));
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
var redisClient = redis.createClient();

// index, we're not rendering and have no endpoint on the root
app.get('/', function(req, res)
{
  result = {message: 'server is working'};
  res.json(utils.success(result));
});

// REST/JSON api endpoint declaration

app.all('/v1/user/signup', userController.route);
app.all('/v1/user/:op?', ensureAuthenticated, userController.route);
app.all('/v1/idea/:op?/:id?', ensureAuthenticated, ideaController.route);
// app.all('/v1/signup/:op?', signupController.route);


// login a user
app.post('/login', passport.authenticate('local'), function(req, res)
{
  User.findOne(
  {
    email: req.body.email
  }, function(err, usr)
  {
    if (err)
    {
      res.json(utils.failure('an error occured getting user from mongo'));
    }
    else
    {
      var userSessionHash = getSessionHash(usr._id);
      redisClient.hmset([userSessionHash, "sessionID", req.sessionID, "email", usr.email, 
            "givenName", usr.givenName], function(err, usr)
      {
        if (err) 
        {
          res.json(utils.failure('Error occurred while getting session from session store'));
        }
        else
        {
          // set expiration of hash
          redisClient.ttl(userSessionHash, function(err, ttl)
          {
            if (err) 
            {
              res.json(utils.failure('Error occurred while setting time to live on session cache'));
            }
            else
            {
              res.json(utils.success('login successful'));
            }
          })
        }
      });
    }
  });
});


// finds and removes any session hash and logs user out
app.get('/logout', function(req, res)
{
  // remove session hash
  User.find(
  {
    email: req.user.email
  }, function(err, user)
  {
    if (err)
    {
      res.json(utils.failure('error removing session cache'));
    }
    else
    {
      var userSessionHash = getSessionHash(user._id); 
      redisClient.hdel(userSessionHash, function(err)
      {
        if (err)
        {
          res.json(utils.failure('error removing session cache'));
        }
        else
        {
          req.logout();
          res.json(utils.success('successfully logged out'));
        }
      })
    }
  })
});


// PASSPORT //

passport.use(new LocalStrategy(
{
  usernameField: 'email',
  passwordField: 'password'
}, function(usernameField, passwordField, done)
{
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
        message: 'Error occurred accessing users collection'
      });
    }
    else
    {
      if (!usr)
      {
        console.log('Unknown user ' + usernameField);
        return done(null, false,
        {
          message: 'Unknown user ' + usernameField
        });
      }
      else if (usr.password != passwordField)
      {
        console.log('Invalid password');
        return done(null, false,
        {
          message: 'Invalid password'
        });
      }
      else  // found a matching user and password
      {
        return done(null, usr);
      }
    }
  });
}));


passport.serializeUser(function(user, done)
{
  done(null, user._id);
});


passport.deserializeUser(function(id, done)
{
  var userSessionHash = "session:"+id;
  redisClient.hgetall(userSessionHash, function(err, session)
  {
    if (err)
    {
      res.json(utils.failure('Error occurred while getting session cache from session store'));
    }
    else 
    { 
      if (!session) // session expired or not present, so get from database
      {
        User.findOne(
        {
          _id: id
        }, function (err, user)
        {
          var userSessionHash = getSessionHash(usr._id);
          // note that we can save the sessionID if needed in the user's db document 
          redisClient.hmset([userSessionHash, "sessionID", "", "email", usr.email, 
            "givenName", usr.givenName], function(err)
          {
            if (err)  throw error;
          })
        })
      }
      // refresh expiry on session hash
      redisClient.ttl(userSessionHash, function(err, ttl)
      {
        if (err) 
        {
          throw error;
        }
        else
        {
          var user = {email: session.email, givenName: session.givenName};
          done(err, user);
        }
      })
    };
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
  res.json(utils.failure('user not authenticated'));
}

function getSessionHash(id)
{
  return "session:"+id;
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

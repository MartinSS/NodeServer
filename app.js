var flash = require('connect-flash'),
    express = require('express'),
    mongo = require('mongodb'),
    passport = require('passport'),
    util = require('util'),
    LocalStrategy = require('passport-local').Strategy;

var DBServer = mongo.Server,
  Db = mongo.Db,
  BSON = mongo.BSONPure;

var SERVER = {
  host: 'localhost',
  port: 8888
};


var server = new DBServer('localhost', 27017, {safe:false}),
    db = new Db('idea_service', server);

db.open(function(err, db) {
  if(!err) {
    console.log("Connected to 'idea_service' database");
    db.collection('users', {strict:true}, function(err, collection) {
      if (err) {
        console.log("The 'users' collection doesn't exist, creating ....");
        populateUsers();
      }
    });
  }
});


var app = express();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'purple cow' }));
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/../../public'));
});

app.listen(SERVER.port, SERVER.host);

app.get('/', function(req, res) {
  res.render('index', { user: req.user });
});

app.get('/login', function(req, res) {
  console.log("login called");
  res.render('login', { user: req.user, message: req.flash('error') } );
});


app.get('/ideas', ensureAuthenticated, function(req, res) {
  res.set({'Content-Type': 'application/json'});
  res.json(
    {'idea1': 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 
     'idea2': 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
     'idea3': 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    });
  res.render;
});


app.post('/login', 
    passport.authenticate('local', { successRedirect: '/ideas',
                                     failureRedirect: '/login', 
                                     failureFlash: true }) 
);


app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});



passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(usernameField, passwordField, done) {
    process.nextTick(function() {
      db.collection('users', function(error, collection) {
        if (!error) {
          collection.findOne({
            'email': usernameField,
            'password': passwordField
          },  function (err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              console.log('Unknown user ' + usernameField);
              return done(null, false, {message:'Unknown user ' + usernameField});
            }
            if (user.password != passwordField) {
              console.log('Invalid password');
              return done(null, false, {message:'Invalid password'});
            }
            return done(null, user);
          });
        } else {
            console.log(5, 'DB error');
        }
      });
    });
  })
);




passport.serializeUser(function(user, done) {
  done(null, user._id);
});


passport.deserializeUser(function(id, done) {
  var o_id = new BSON.ObjectID(id);
  db.collection("users", function(err, collection) {
    collection.findOne({_id:o_id}, function(err, user) {
      done(err, user);
    });
  });
});


function findByEmail(email, fn) {
  db.collection("users", function(err, collection) {
    collection.find({}, {}, function(err, users) {
      users.each(function(err, user) {
        if (user != null && user.email === email) {
          console.log("found email:"+email);
          return fn(null, user);
        }
      });
      return fn(null, null);
    });
  });
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}


/* -------------------------------------------------------------------- */
// Not part of application logic, initialization friendly method to add
// some users to test basic authentication.
var populateUsers = function() {

  var users = [
  {
    "givenName" : "Joe",
    "familyName" : "Wolosky",
    "email" : "joew@example.com",
    "password" : "987654"
  },
  {
    "givenName" : "Tom",
    "familyName" : "Sanchez",
    "email" : "toms@example.com",
    "password" : "abcdef"
  }];

  db.collection('users', function(err, collection) {
    collection.insert(users, {safe:true}, function(err, result) {});
  });

};



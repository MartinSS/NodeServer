var flash = require('connect-flash'),
    express = require('express'),
    mongo = require('mongodb'),
    config = require('./config'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    util = require('util'),
    api = require('./routes/api');
    LocalStrategy = require('passport-local').Strategy;


var SERVER = {
  host: 'localhost',
  port: 8888
};


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

// environment we are in
app.set('dbUrl', config.db[app.settings.env]);
// connect mongoose to the mongo dbUrl
mongoose.connect(app.get('dbUrl'));

app.get('/', function(req, res) {
  res.render('index', { user: req.user });
});

app.get('/login', function(req, res) {
  console.log("login called");
  res.render('login', { user: req.user, message: req.flash('error') } );
});


// JSON api

app.get('/ideas/:user', ensureAuthenticated, api.ideas);
app.get('/idea/:id', ensureAuthenticated, api.idea);
app.post('/idea/:user', ensureAuthenticated, api.addIdea);
app.put('/idea/:id', ensureAuthenticated, api.editIdea);


app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login', 
                                     failureFlash: true }),
    function(req, res) {
      res.redirect('/ideas/' + req.body.email);
    }
);


app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/users/:username', ensureAuthenticated, function(req, res) {
  User.findOne({'email': req.params.username}, function(err, usr) {
    res.send(usr);
  });
});


var User = require('./models/user').User;
app.listen(SERVER.port, SERVER.host);

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(usernameField, passwordField, done) {
    // look up user by email
    User.findOne({'email': usernameField}, function(err, usr) {
      if (err) {
        return done(err, false, { message: 'Error occurred acccessing users collection'});
      }
      if (!usr) {
        console.log('Unknown user ' + usernameField);
        return done(null, false, {message: 'Unknown user ' + usernameField});
      }
      if (usr.password != passwordField) {
        console.log('Invalid password');
        return done(null, false, {message: 'Invalid password'});
      }
      // found a matching user and password
      return done(null, usr);
    });
  })
);


passport.serializeUser(function(user, done) {
  done(null, user.id);
});


passport.deserializeUser(function(id, done) {
  User.findOne({_id: id}, function(err, user) {
    done(err, user);
  });
});

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



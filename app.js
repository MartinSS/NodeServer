var flash = require('connect-flash'),
    express = require('express'),
    mongo = require('mongodb'),
    config = require('./config'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    api = require('./routes/api'),
    util = require('util'),
    angularRoutes = require('./routes'),
    LocalStrategy = require('passport-local').Strategy;


var SERVER = {
  host: 'localhost',
  port: 8888
};


var app = express();

app.configure(function() {
  app.set('views', __dirname + '/public');
  app.set('view options', {layout: false});
  app.engine('html', require('ejs').renderFile);
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'purple cow' }));
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

// environment we are in
app.set('dbUrl', config.db[app.settings.env]);
// connect mongoose to the mongo dbUrl
mongoose.connect(app.get('dbUrl'));


// Angular routes
// app.get('/:user', ensureAuthenticated, angularRoutes.index);
app.get('/partials/:name', ensureAuthenticated, angularRoutes.partials);

// REST/JSON api
app.get('/ideas', ensureAuthenticated, api.ideas);
app.get('/idea/:id', ensureAuthenticated, api.idea);
app.post('/idea', ensureAuthenticated, api.addIdea);
app.put('/idea', ensureAuthenticated, api.editIdea);
app.get('/user', ensureAuthenticated, api.user);
app.post('/user', ensureAuthenticated, api.addUser);
app.put('/user', ensureAuthenticated, api.editUser);

app.get('/', ensureAuthenticated, function(req, res) {
  res.render('index.html');
});

app.get('/index', ensureAuthenticated, function(req, res) {
  res.render('index.html');
});

app.get('/index.html', ensureAuthenticated, function(req, res) {
  res.render('index.html');
});

app.get('/login', function(req, res) {
  console.log('get login called');
  res.render('login.html');
});


app.get('/logout', function(req, res) {
  req.logout();
  res.render('index.html');
});

// app.get('*', ensureAuthenticated, angularRoutes.index);

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', 
                                   failureFlash: true }),
  function(req, res) {
    // store the session
    console.log('storing session:'+req.sessionID);
    Session.findOne({'ID': req.sessionID}, function(err, session) {
      if (err) {
        return done(err, false, { message: 'Error occurred while storing session'});
      }
      if (!session) {
        User.findOne({email: req.body.email}, function(err, usr) {
          var session = new Session({
            ID: req.sessionID,
            givenName: usr.givenName,
            email: usr.email
          });
          session.save(function (err) {
            if (err) {
              console.log('error storing session');
            }
          });
        });
      }
      else { // session already exists and user is logging in again
        if ( session.email != req.body.email ) {
          console.log("attempt to login with another user's session");
          return done(err, false, { message: 'Error invalid session id'});
        } 
      }
    });
    res.redirect('/');
  }
);

var User = require('./models/user').User;
var Session = require('./models/session').Session;
app.listen(SERVER.port, SERVER.host);

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(usernameField, passwordField, done) {
    console.log('authenticating email:'+usernameField+' password:'+passwordField);
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



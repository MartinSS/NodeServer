var flash = require('connect-flash'),
    express = require('express'),
    mongo = require('mongodb'),
    config = require('./config'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    util = require('util'),
    routes = require('./routes'),
    api = require('./routes/api'),
    LocalStrategy = require('passport-local').Strategy;


var SERVER = {
  host: 'localhost',
  port: 8888
};


var app = express();

app.configure(function() {
  app.set('views', __dirname + '/views'); 
  app.engine('html', require('ejs').renderFile);
  app.set('view options', {layout: false});
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

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true}));
});

// environment we are in
app.set('dbUrl', config.db[app.settings.env]);
// connect mongoose to the mongo dbUrl
mongoose.connect(app.get('dbUrl'));


// routes
// app.get('/',  routes.index);
app.get('/', ensureAuthenticated, function(req, res) {
  res.render('index.html');
});


//app.get('/partials/:name',  routes.partials);
app.get('/partials/:name', ensureAuthenticated, function(req, res) {
  var name = req.params.name;
  res.render('partials/'+name+'.html');
});

// REST/JSON api
app.get('/api/ideas', ensureAuthenticated,  api.ideas);
app.get('/api/idea/:id', ensureAuthenticated,  api.idea);
app.post('/api/idea', ensureAuthenticated,  api.addIdea);
app.put('/api/idea',  ensureAuthenticated, api.editIdea);
app.get('/api/user', ensureAuthenticated,  api.user);
app.post('/api/user',  ensureAuthenticated, api.addUser);
app.put('/api/user',  ensureAuthenticated, api.editUser);


app.get('/login', function(req, res) {
  console.log('get login called');
  res.render('login.html');
});

app.get('/logout', function(req, res) {
  req.logout();
  res.render('login.html');
});


// redirect all others to the index (HTML5 history)
// app.get('*', routes.index);


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



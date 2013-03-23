var mongoose = require('mongoose');
var Idea = require('../models/idea').Idea;
var Session = require('../models/session').Session;


// handles get /ideas
// return all ideas for user with session
// on error returns JSON containing error message
exports.ideas = function (req, res) {
  Session.findOne({ID:req.sessionID}, function(err, sess) {
    if (err || !sess) {
      res.json({message: 'Error accessing session'});
    }
    Idea.find( {userId: sess.email}, function(err, ideas) {
      if (err || !ideas) {
        res.json({message: 'Error accessing ideas'});
      }
      console.log('returning ideas:'+ideas);
      res.json(ideas);
    });
  });
};



// handles get /idea/:id
// return a given idea with id
// expects url parameter with id of idea
// on error returns JSON containing error message
exports.idea = function (req, res) {
  Session.find({ID:req.sessionID}, function(err, sess) {
    if (err || !sess) {
      res.json({message: 'Error accessing session'});
    }
    Idea.find( {_id: req.params.id}, function(err, idea) {
      if (err || !idea || idea.userId != sess.email) {
        res.json({message: 'Error accessing idea'});
      }
      res.json(idea);
    });
  });
};


// handles post /idea
// add idea for user with session
// expects parameters set in body of request with idea data
// on error returns JSON containing error message
// returns 'Success' message otherwise
exports.addIdea = function (req, res) {
  Session.find({ID:req.sessionID}, function(err, sess) {
    if (err || !sess) {
      return {message: 'Error accessing session'};
    }
    new Idea({
      name: req.body.ideaName,
      content: req.body.ideaContent,
      userId: sess.email
    }).save( function( err, idea, count) {
      res.json({message: 'Success'}); 
    });
  });
};



// handles put /idea
// modify idea for user with session
// expects parameters set in body of request with idea data
// on error returns JSON containing error message
// returns 'Success' message otherwise
exports.editIdea = function (req, res) {
  Session.find({ID:req.sessionID}, function(err, sess) {
    if (err || !sess) {
      res.json({message: 'Error accessing session'});
    }
    Idea.find({_id: req.params.id}, function(err, idea) {
      if (err || !idea || sess.email != idea.userID) {
        res.json({message: 'Error occurred accessing session'});
      }
      idea.name = req.body.ideaName,
      idea.content = req.body.ideaContent,
      idea.save();
      res.json({message: 'Success'}); 
    });
  });
};





// handles get /user
// return profile for user with session
exports.user = function (req, res) {
  Session.findOne({ID:req.sessionID}, function(err, sess) {
    if (err || !sess) {
      res.json({message: 'Error accessing session'});
    }
    User.findOne({email: sess.email}, function(err, usr) {
      if (err || !usr) {
        res.json({message: 'Error accessing user'});
      }
      res.json(usr);
    });
  });
};


// handles post /user
// create new profile for user with session
// this is a signup
exports.addUser = function (req, res) {
    new User({
      givenName: req.body.givenName,
      familyName: req.body.familyName,
      email: req.body.email, 
      password: req.body.password
    }).save( function( err, idea, count) {
      res.json({message: 'Success'}); 
    });
};


// handles put /user
// modify profile for user with session
exports.editUser = function (req, res) {
  Session.find({ID:req.sessionID}, function(err, sess) {
    if (err || !sess) {
      res.json({message: 'Error accessing session'});
    }
    User.findOne({email: req.params.id}, function(err, usr) {
      if (err || !usr || sess.email != usr.email) {
        res.json({message: 'Error accessing user'});
      }
      usr.givenName = req.body.givenName;
      usr.familyName = req.body.familyName;
      usr.password = req.body.password;
      usr.save();
      res.json({message: 'Success'}); 
    });
  });
};


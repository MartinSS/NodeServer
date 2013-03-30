var mongoose = require('mongoose');
var Idea = require('../models/idea').Idea;
var Session = require('../models/session').Session;
var User = require('../models/user').User;


// handles get /ideas
// return all ideas for user with session
// on error returns JSON containing error message
exports.ideas = function (req, res) {
  Session.findOne({ID:req.sessionID}, function(err, sess) {
    if (err || !sess) {
      res.json({message: 'Error accessing session'});
    } else {
      Idea.find( {userId: sess.email}, function(err, ideas) {
        if (err || !ideas) {
          res.json({message: 'Error accessing ideas'});
        } else {
          res.json(ideas);
        }
      });
    }
  });
};



// handles get /idea/:id
// return a given idea with id
// expects url parameter with id of idea
// on error returns JSON containing error message
exports.idea = function (req, res) {
  Session.findOne({ID:req.sessionID}, function(err, sess) {
    if (err || !sess) {
      res.json({message: 'Error accessing session'});
    } else {
      Idea.findOne( {_id: req.params.id}, function(err, idea) {
        if (err || !idea || idea.userId != sess.email) {
          res.json({message: 'Error accessing idea'});
        } else {
          res.json(idea);
        }
      });
    }
  });
};


// handles post /idea
// add idea for user with session
// expects parameters set in body of request with idea data
// on error returns JSON containing error message
// returns 'Success' message otherwise
exports.addIdea = function (req, res) {
  Session.findOne({ID:req.sessionID}, function(err, sess) {
    if (err || !sess) {
      return {message: 'Error accessing session'};
    } else {
      new Idea({
        name: req.body.ideaName,
        content: req.body.ideaContent,
        userId: sess.email}).
      save( function( err, idea, count) {
        res.json({message: 'Success'}); 
      });
    }
  });
};



// handles put /idea
// modify idea for user with session
// expects parameters set in body of request with idea data
// on error returns JSON containing error message
// returns 'Success' message otherwise
exports.editIdea = function (req, res) {
  Session.findOne({ID:req.sessionID}, function(err, sess) {
    if (err || !sess) {
      res.json({message: 'Error accessing session'});
    } else  {
      Idea.findOne({_id: req.params.id}, function(err, idea) {
        if (err || !idea || sess.email != idea.userID) {
          res.json({message: 'Error occurred accessing session'});
        } else {
          idea.name = req.body.ideaName,
          idea.content = req.body.ideaContent,
          idea.save();
          res.json({message: 'Success'}); 
        }
      });
    }
  });
};



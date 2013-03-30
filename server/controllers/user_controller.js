var mongoose = require('mongoose');
var Idea = require('../models/idea').Idea;
var Session = require('../models/session').Session;
var User = require('../models/user').User;

// handles get /user
// return profile for user with session
exports.user = function (req, res) {
  console.log("called api.user");
  Session.findOne({ID:req.sessionID}, function(err, sess) {
    if (err || !sess) {
      res.json({message: 'Error accessing session'});
    } else {
      User.findOne({email: sess.email}, function(err, usr) {
        if (err || !usr) {
          res.json({message: 'Error accessing user'});
        } else {
          res.json(usr);
        }
      });
    }
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
    } else {
      User.findOne({email: req.params.id}, function(err, usr) {
        if (err || !usr || sess.email != usr.email) {
          res.json({message: 'Error accessing user'});
        } else {
          usr.givenName = req.body.givenName;
          usr.familyName = req.body.familyName;
          usr.password = req.body.password;
          usr.save();
          res.json({message: 'Success'}); 
        }
      });
    }
  });
};


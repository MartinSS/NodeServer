var mongoose = require('mongoose');
var Idea = require('../models/idea').Idea;

exports.addIdea = function (req, res) {
  new Idea({
    name: req.body.ideaName,
    content: req.body.ideaContent,
    userId: req.params.user
  }).save( function( err, idea, count) {
    res.json( req.ideaContent );
  });
};


exports.editIdea = function (req, res) {


};


exports.ideas = function (req, res) {
  Idea.find( {userId: req.params.user}, function(err, ideas) {
    res.send(ideas);
  });
};


exports.idea = function (req, res) {



};








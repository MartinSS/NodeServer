'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the userSchema
var sessionSchema = new Schema({
  ID : String,
  givenName : String,
  email : String
  });


// Export the user model
exports.Session = mongoose.model('Session', sessionSchema);



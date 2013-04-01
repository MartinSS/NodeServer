'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the userSchema
var userSchema = new Schema(
{
	givenName: String,
	familyName: String,
	email: String,
	password: String
});


// Export the user model
exports.User = mongoose.model('User', userSchema);
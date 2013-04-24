'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the ideaSchema
var ideaSchema = new Schema(
{
	title: String,
	content: String,
	userId: String
});


// Export the idea model
exports.Idea = mongoose.model('Idea', ideaSchema);

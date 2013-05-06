var Validator = require('validator').Validator,
    // check = Validator.check,
    validator = new Validator(),
    utils = require('../utils');
// var check = require('validator').check,

var OWASP_SAFE_TEXT = "^[a-zA-Z0-9\s .\-]+$"; 
var safeText = new RegExp(OWASP_SAFE_TEXT);


Validator.prototype.error = function (msg)
{
  if (this._errors == undefined)
  {
    this._errors = [];
  }

  this._errors.push(msg);
  return this;
}
Validator.prototype.getErrors = function ()
{
  return this._errors;
}
// boolean to return if any errors occurred
Validator.prototype.isError = function()
{
  return this._errors!=undefined && this._errors.length > 0; 
}
Validator.prototype.clearErrors = function()
{
  this._errors = null;
}


// exports module for validation of all controller requests with persistable inputs
module.exports = 
{

  // returns an array of error messages from the validator
  getErrors: function ()
  {
    return validator.getErrors();
  },

  // checks inputs to createUser controller method and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  createUser: function (reqBody)
  {
    validator.clearErrors();
    validator.check(reqBody.givenName, 'Please enter a given name between 1 and 50 characters.').len(1,50).is(safeText);
    validator.check(reqBody.familyName, 'Please enter a family name between 1 and 200 characters.').len(1,200).is(safeText);
    validator.check(reqBody.email, 'Please enter a valid email address.').len(6,64).isEmail();
    validator.check(reqBody.password, 'Please a password between 8 and 20 characters.').len(8,20);
    
    if (validator.isError())
    {
      return false;
    }
    else
    {
      return true;
    }

  },

  // checks inputs to updatUser controller method and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  updateUser: function (reqBody)
  {
    validator.clearErrors();
    validator.check(reqBody.givenName, 'Please enter a given name between 1 and 50 characters.').len(1,50).is(safeText);
    validator.check(reqBody.familyName, 'Please enter a family name between 1 and 200 characters.').len(1,200).is(safeText);
    validator.check(reqBody.email, 'Please enter a valid new email address.').len(6,64).isEmail();
    validator.check(reqBody.password, 'Please a password between 8 and 20 characters.').len(8,20);

    if (validator.isError())
    {
      return false;
    }
    else
    {
      return true;
    }
  },


  // todo:  one method to check body valid for update/crate (also above)
  // checks inputs to createIdea controller method and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  createIdea: function (reqBody)
  {

    validator.clearErrors();

    if ( isEmpty(reqBody.title) && isEmpty(reqBody.content) )
    {
      validator.error('Either idea title or content must be non-empty to create new idea.');
      return false;
    }

    if (reqBody.title && reqBody.title.length > 0)
    {
      validator.check(reqBody.title, 'Please enter a valid title containing no special characters.').is(safeText);
    }

    if (validator.isError())
    {
      return false;
    }
    else
    {
      return true;
    }

  },

  // checks inputs to updateIdea controller method and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  updateIdea: function (reqBody)
  {

    validator.clearErrors();
    if ( isEmpty(reqBody.title) && isEmpty(reqBody.content) )
    {
      validator.error('Either idea title or content must be non-empty to update idea.');
      return false;
    }

    if (reqBody.title && reqBody.title.length > 0)
    {
      validator.check(reqBody.title, 'Please enter a valid title containing no special characters.').is(safeText);
    }

    if (validator.isError())
    {
      return false;
    }
    else
    {
      return true;
    }

  },

  // checks inputs to loginUser controller and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  loginUser: function (reqBody)
  {
    validator.clearErrors();
    validator.check(reqBody.email, 'Please enter a valid email address.').len(6,64).isEmail();
    validator.check(reqBody.password, 'Please a password between 8 and 20 characters.').len(8,20);

    if (validator.isError())
    {
      return false;
    }
    else
    {
      return true;
    }
  }


};


var isEmpty = function(str)
{
  return !str || str.length == 0;
}

var Validator = require('validator'),
    check = Validator.check,
    utils = require('../utils');
// var check = require('validator').check,

var OWASP_SAFE_TEXT = "^[a-zA-Z0-9\s .\-]+$"; 
var safeText = new RegExp(OWASP_SAFE_TEXT);

// exports module for validation of all controller requests with persistable inputs
module.exports = 
{

  // checks inputs to createUser controller method and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  createUser: function (reqBody)
  {
    check(reqBody.givenName, 'Please enter a given name between 1 and 50 characters.').len(1,50).is(safeText);
    check(reqBody.familyName, 'Please enter a family name between 1 and 200 characters.').len(1,200).is(safeText);
    check(reqBody.email, 'Please enter a valid email address.').len(6,64).isEmail();
    check(reqBody.password, 'Please a password between 8 and 20 characters.').len(8,20);

    return reqBody;
  },

  // checks inputs to updatUser controller method and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  updateUser: function (reqBody)
  {
    check(reqBody.givenName, 'Please enter a given name between 1 and 50 characters.').len(1,50).is(safeText);
    check(reqBody.familyName, 'Please enter a family name between 1 and 200 characters.').len(1,200).is(safeText);
    check(reqBody.email, 'Please enter a valid new email address.').len(6,64).isEmail();
    check(reqBody.password, 'Please a password between 8 and 20 characters.').len(8,20);

    return reqBody;
  },


  // todo:  one method to check body valid for update/crate (also above)
  // checks inputs to createIdea controller method and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  createIdea: function (reqBody)
  {
      /// todo: use isempty
    if (  (!reqBody.title || reqBody.title.length == 0) && (!reqBody.content || reqBody.content.length == 0) )
    {
      throw 'Either idea title or content must be non-empty to create new idea.';
    }

    if (reqBody.title && reqBody.title.length > 0)
    {
      check(reqBody.title, 'Please enter a valid title containing no special characters.').is(safeText);
    }

    return reqBody;
  },

  // checks inputs to updateIdea controller method and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  updateIdea: function (reqBody)
  {
    if (  (!reqBody.title || reqBody.title.length == 0) && (!reqBody.content || reqBody.content.length == 0) )
    {
      throw 'Either idea title or content must be non-empty to update idea.';
    }

    if (reqBody.title && reqBody.title.length > 0)
    {
      check(reqBody.title, 'Please enter a valid title containing no special characters.').is(safeText);
    }

    return reqBody;
  },

  // checks inputs to loginUser controller and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  loginUser: function (reqBody)
  {
    check(reqBody.email, 'Please enter a valid email address.').len(6,64).isEmail();
    check(reqBody.password, 'Please a password between 8 and 20 characters.').len(8,20);

    return reqBody;
  }

};

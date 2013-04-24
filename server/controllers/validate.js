var check = require('validator').check,
    utils = require('../utils');


// exports module for validation of all controller requests with persistable inputs
module.exports = 
{

  // checks inputs to createUser controller method and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  createUser: function (reqBody)
  {
    check(reqBody.givenName, 'Please enter a given name between 1 and 50 characters.').len(1,50);
    check(reqBody.familyName, 'Please enter a family name between 1 and 200 characters.').len(1,200);
    check(reqBody.email, 'Please enter a valid email address.').len(6,64).isEmail;
    check(reqBody.password, 'Please a password between 8 and 20 characters.').len(8,20).isEmail;

    return reqBody;
  },

  // checks inputs to updatUser controller method and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  updateUser: function (reqBody)
  {
    check(reqBody.givenName, 'Please enter a given name between 1 and 50 characters.').len(1,50);
    check(reqBody.familyName, 'Please enter a family name between 1 and 200 characters.').len(1,200);
    check(reqBody.email, 'Please enter a valid new email address.').len(6,64).isEmail;
    check(reqBody.password, 'Please a password between 8 and 20 characters.').len(8,20).isEmail;

    return reqBody;
  },


  // checks inputs to createIdea controller method and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  createIdea: function (reqBody)
  {
    if (  (!reqBody.title || reqBody.title.length == 0) && (!reqBody.content || reqBody.content.length == 0) )
    {
      throw 'Either idea title or content must be non-empty to create new idea.';
    }

    check(reqBody.title, 'Please enter a valid title containing no special characters.').is(/^[^<>]+$/);

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

    check(reqBody.title, 'Please enter a valid title containing no special characters.').is(/^[^<>]+$/);

    return reqBody;
  },


  // checks inputs to loginUser controller and throws exception if any
  // the input is invalid any exception thrown is expected to be caught by caller
  loginUser: function (reqBody)
  {
    check(reqBody.email, 'Please enter a valid email address.').len(6,64).isEmail;
    check(reqBody.password, 'Please a password between 8 and 20 characters.').len(8,20).isEmail;

    return reqBody;
  }


};

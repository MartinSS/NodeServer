var sanitize = require('validator').sanitize;


// exports module for sanitization of all controller requests with persistable inputs
module.exports = 
{

  // sanitizes inputs to createIdea controller method which need to be saniitized
  createIdea: function (reqBody)
  {

    // escape %, <, >, and "
    sanitize(reqBody.content).escape();

    return reqBody;
  },

  // sanitizes inputs to createIdea controller method which need to be saniitized
  updateIdea: function (reqBody)
  {

    // escape %, <, >, and "
    sanitize(reqBody.content).escape();

    return reqBody;
  }

};

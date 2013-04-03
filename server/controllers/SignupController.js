var User = require('../models/user').User;


// prevent script injection (e.g. XSS) by encoding (sanitizing) HTML sensitive inputs
// currently encodes &, <, >, and "
//
function encodeHTML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var signupController =
{

  // handles post /user
  // create new profile for user with session
  // this is a signup
  // access with through curl by typing for example: 
  // curl X POST -d "givenName=Brian&familyName=Sonman&password=aaabbb&email=brian@example.com" "http://localhost:8888/api/user"
  signup: function(req, res)
  {
    new User(
    {
      givenName: encodeHTML(req.body.givenName),
      familyName: encodeHTML(req.body.familyName),
      email: encodeHTML(req.body.email),
      password: req.body.password
    }).save(function(err, idea, count)
    {
      res.json(
      {
        message: 'Success'
      });
    });
  }
};




// module method to channel requests to correct handler of controller
// handles following urls:
//    /v1/signup/add --> signup method
// if no or no known operation is specified, returns json error message 
//

function route(req, res)
{
  if (!(typeof req.params.op === 'undefined'))
  {
    switch (req.params.op)
    {
      case 'add':
        signupController.signup(req,res);
        break;
      default:
        res.json(
        {
          message: 'Invalid operation specified'
        });
    }
  }
  else
  {
    res.json(
    {
      message: 'No user operation specified'
    });
  }
}


module.exports.route = route;



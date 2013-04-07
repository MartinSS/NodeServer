var User = require('../models/user').User,
    utils = require('../utils'),
    redis = require('redis');

var redisClient = redis.createClient();

  var userController =
  {

  // handles get /user
  // return profile for user with session
  // access with curl:
  // curl -b cookies.txt "http://localhost:8888/api/user"
  getUser: function(req, res)
  {
    User.findOne(
    {
      email: req.user.email
    }, function(err, usr)
    {
      if (err || !usr)
      {
        res.json(
        {
          success: false,
          message: 'Error accessing user'
        });
      }
      else
      {
        res.json(usr);
      }
    });
  },

  // handles put /user
  // modify profile for user with session
  // access by curl with for example:
  //  curl -b cookies.txt-X PUT -d "givenName=Thomas&familyName=Sanchez&password=abcdef" "http://localhost:8888/api/user" 
  editUser: function(req, res)
  {
    User.findOne(
    {
      email: req.user.email
    }, function(err, usr)
    {
      if (err || !usr || req.user.email != usr.email)
      {
        res.json(
        {
          success: false,
          message: 'Error accessing user'
        });
      }
      else
      {
        usr.givenName = utils.encodeHTML(req.body.givenName);
        usr.familyName = utils.encodeHTML(req.body.familyName);
        usr.password = req.body.password;
        usr.save();
        // update session cache
        var userSessionHash = "session:"+usr._id;
        redisClient.hmset(userSessionHash, "sessionID", req.sessionID, "email", usr.email,
          "givenName", user.givenName)
        res.json(
        {
          success: true
        });
      }
    });
  }

};

// module method to channel requests to correct handler of controller
// handles following urls:
//    /v1/user/get --> getUser method
//    /v1/user/edit --> editUser method
// if no or no known operation is specified, returns json error message 
//

function route(req, res)
{
  if (!(typeof req.params.op === 'undefined'))
  {
    switch (req.params.op)
    {
      case 'get':
        userController.getUser(req,res);
        break;
      case 'edit':
        userController.editUser(req,res);
        break;
      default:
        res.json(
        {
          success: false,
          message: 'Invalid operation specified'
        });
    }
  }
  else
  {
    res.json(
    {
      success: false,
      message: 'No user operation specified'
    });
  }
}


module.exports.route = route;



var User = require('../models/user').User,
    utils = require('../utils'),
    redis = require('redis');

var redisClient = redis.createClient();
var signupUrl = "/v1/user/create";

var userController =
{

  // handles post /v1/user/create
  // create new profile for user with session
  // this is a signup
  // access with through curl by typing for example: 
  // curl X POST -d "givenName=Brian&familyName=Sonman&password=aaabbb&email=brian@example.com" "http://localhost:8888/v1/user/create"
  createUser: function(req, res)
  {
    if (req.body.givenName!=undefined&&req.body.familyName!=undefined&&req.body.email!=undefined&&req.body.password!=undefined)
    {
      new User(
      {
        givenName: utils.encodeHTML(req.body.givenName),
        familyName: utils.encodeHTML(req.body.familyName),
        email: utils.encodeHTML(req.body.email),
        password: req.body.password
      }).save(function(err, idea, count)
      {
        res.json(utils.success({}));
      });
    }
    else
    {
      res.json(utils.failure('Missing or invalid information given for user signup'));
    }
  },


  // handles post /v1/user/delete
  // delete profile for user with session
  // access with through curl by typing for example: 
  // curl X POST -d "givenName=Brian&familyName=Sonman&password=aaabbb&email=brian@example.com" "http://localhost:8888/v1/user/delete"
  deleteUser: function(req, res)
  {
    // delete session cache
    var userSessionHash = utils.getSessionHash(req.user.id);
    redisClient.del(userSessionHash, function(err)
    {
      if (err)
      {
        console.log("error removing session cache userSessionHash:"+userSessionHash);
        res.json(utils.failure('error removing session cache'));
      }
      else
      {
        User.remove(
        {
          email: req.user.email
        }, function(err)
        {
          if (err)
          {
            res.json(utils.failure('Error deleting user'));
          }
          else
          {
            req.logout();
            res.json(utils.success());
          }
        });
      }
    });
  },


  // handles read /user
  // return profile for user with session
  // access with curl:
  // curl -b cookies.txt "http://localhost:8888/v1/user/read"

  readUser: function(req, res)
  {
    User.findOne(
    {
      email: req.user.email
    }, function(err, usr)
    {
      if (err || !usr)
      {
        res.json(utils.failure('Error accessing user'));
      }
      else
      {
        res.json(utils.success(usr));
      }
    });
  },

  // handles put /user
  // modify profile for user with session
  // access by curl with for example:
  //  curl -b cookies.txt-X PUT -d "givenName=Thomas&familyName=Sanchez&password=abcdef" "http://localhost:8888/v1/user/update" 
  updateUser: function(req, res)
  {
    User.findOne(
    {
      email: req.user.email
    }, function(err, usr)
    {
      if (err || !usr )
      {
        res.json(utils.failure('Error accessing user'));
      }
      else
      {
        if (req.body.givenName)
        {
          usr.givenName = utils.encodeHTML(req.body.givenName);
        }
        if (req.body.familyName)
        {
          usr.familyName = utils.encodeHTML(req.body.familyName);
        }
        if (req.body.password)
        {
          usr.password = req.body.password;
        } 
        usr.save();
        // update session cache
        var userSessionHash = "session:"+usr._id;
        redisClient.hmset(userSessionHash, "sessionID", req.sessionID, "email", usr.email,
        "givenName", usr.givenName)
        res.json(utils.success({}));
      }
    });
  }

};

// module method to channel requests to correct handler of controller
// handles following urls:
//    /v1/user/create --> createUser method
//    /v1/user/read --> readUser method
//    /v1/user/update --> updateUser method
//    /v1/user/delete --> deleteUser method
// if no or no known operation is specified, returns json error message 
//

function route(req, res)
{
  if (!(typeof req.params.op === 'undefined'))
  {
    switch (req.params.op)
    {
      case 'read':
        userController.readUser(req,res);
        break;
      case 'update':
        userController.updateUser(req,res);
        break;
      case 'delete':
        userController.deleteUser(req,res);
        break;
      default:
        res.json(utils.failure('Invalid operation specified'));
    }
  }
  else if (req.url == signupUrl) 
  {
    userController.createUser(req,res);
  }
  else
  {
    res.json(utils.failure('No user operation specified'));
  }
}


module.exports.route = route;

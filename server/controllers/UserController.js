var User = require('../models/user').User,
    Idea = require('../models/idea').Idea,
    utils = require('../utils'),
    redis = require('redis'),
    validate = require('./validate');

var redisClient = redis.createClient();
var signupUrl = "/v1/user/create";

var userController =
{

  // handles post /v1/user/create
  // create new profile for user with session
  // this is a signup
  // access with through curl by typing for example: 
  // curl X POST -d "givenName=Brian&familyName=Sonman&password=aaabbb&email=brian@example.com" "http://localhost:8888/v1/user/create"
  // the following status codes are returned:
  // 201: resource created if successful
  // 405: method not allowed if email address already exists
  // 400: bad request if validation or database access fails
  createUser: function(req, res)
  {
    try
    {
      var user = validate.createUser(req.body);

      new User(
      {
        givenName: user.givenName,
        familyName: user.familyName,
        email: user.email,
        password: user.password
      }).save(function(err, idea, count)
      {
        if (count) // save was successful
        {
          res.json(utils.success({})).status(201);
        }
        else
        { // mongo did not save as email is duplicate
          res.json(utils.failure('Email address already being used')).status(405);
        }
      });
    }
    catch (err)
    {
      res.json(utils.failure(err.message)).status(400);
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
            // delete ideas of user
            Idea.remove(
            {
              userId: req.user.email
            }, function(err, ideas)
            {
              if (err)
              {
                res.json(utils.failure('Error deleting ideas.'));
              }
              else
              {
                req.logout();
                res.json(utils.success());
              }
            });
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
        res.json(utils.failure('Error accessing user')).status(500);
      }
      else
      {
        try
        {
          var user = validate.updateUser(req.body);
          usr.givenName = user.givenName;
          usr.familyName = user.familyName;
          usr.email = user.email;
          usr.password = user.password;

          usr.save();
          // update session cache

          var userSessionHash = "session:"+usr._id;
          redisClient.hmset(userSessionHash, "sessionID", req.sessionID, "email", usr.email,
            "givenName", usr.givenName)
          res.json(utils.success({}));
        }
        catch (err)
        {
          res.json(utils.failure(err.message)).status(400);   
        }
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

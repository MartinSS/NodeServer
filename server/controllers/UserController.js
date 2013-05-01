var User = require('../models/user').User,
    Idea = require('../models/idea').Idea,
    utils = require('../utils'),
    redis = require('redis'),
    validate = require('./validate'),
    bcrypt = require('bcrypt');

var WORK_FACTOR = 10;

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
  // 500: server error accessing database
  createUser: function(req, res)
  {
    try
    {
      var user = validate.createUser(req.body);
      User.findOne(
      {
        email: user.email
      }, function(err, usr)
      {
        if (err)
        {
          res.json(utils.failure('Error accessing user')).status(500);
        }
        else
        {
          if (usr) // email already in use
          {
            res.json(utils.failure('Email address already being used')).status(400);
          }
          else
          {
            bcrypt.hash(user.password, WORK_FACTOR, function(err, hash)
            {
              if (err) throw 'Error creating password hash';
              new User(
              {
                givenName: user.givenName,
                familyName: user.familyName,
                email: user.email,
                password: hash
              }).save(function(err, idea, count)
              {
                if (count) // save was successful
                {
                  res.json(utils.success({})).status(201);
                }
                else
                { // error writing to database
                  res.json(utils.failure('Error accessing user')).status(500);
                }
              }) 
            });
          }
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
  // 400: bad request if validation or database access fails
  // 500: server error accessing database

  deleteUser: function(req, res)
  {
    var userSessionHash = utils.getSessionHash(req.user.id);
    var email = req.user.email;
    req.logout();
    // delete session cache
    redisClient.del(userSessionHash, function(err)
    {
      if (err)
      {
        console.log("error removing session cache userSessionHash:"+userSessionHash);
        res.json(utils.failure('error removing session cache')).status(500);
      }
      else
      {
        // delete ideas of user
        Idea.remove(
        {
          'userId': email
        }, function(err, ideas)
        {
          if (err)
          {
            res.json(utils.failure('Error deleting ideas.')).status(500);
          }
          else
          {
            User.remove(
            {
              "email": email
            }, function(err)
            {
              if (err)
              {
                // todo:
                // create generic responnse
                res.json(utils.failure('Error deleting user')).status(500);
              }
              else
              {
                // todo:
                // remove data, logout,, remove user
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
  // 400: bad request if validation or database access fails
  // 500: server error accessing database

  readUser: function(req, res)
  {
    User.findOne(
    {
      email: req.user.email
    }, function(err, usr)
    {
      if (err)
      {
        res.json(utils.failure('Error accessing user')).status(500);
      }
      else if (!usr)
      {
        res.json(utils.failure('User does not exist')).status(400);
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
      if (err)
      {
        res.json(utils.failure('Error accessing user')).status(500);
      }
      else if (!usr)
      {
        res.json(utils.failure('User does not exist')).status(400);
      }
      else
      {
        try
        {
          var user = validate.updateUser(req.body);
          bcrypt.hash(user.password, WORK_FACTOR, function(err, hash)
          {
            if (err) throw new Error("Error creating password hash function");
            usr.givenName = user.givenName;
            usr.familyName = user.familyName;
            usr.email = user.email;
            usr.password = hash;
            usr.save();
            // update session cache
            var userSessionHash = "session:"+usr._id;
            redisClient.hmset(userSessionHash, "sessionID", req.sessionID, "email", usr.email,
            "givenName", usr.givenName)
            res.json(utils.success({}));
          });
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
        res.json(utils.failure('Invalid operation specified')).status(400);
    }
  }
  else if (req.url == signupUrl) 
  {
    userController.createUser(req,res);
  }
  else
  {
    res.json(utils.failure('No user operation specified')).status(400);
  }
}


module.exports.route = route;

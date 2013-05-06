var User = require('../models/user').User,
    Idea = require('../models/idea').Idea,
    utils = require('../utils'),
    response = require('../response'),
    redis = require('redis'),
    validate = require('./validate'),
    bcrypt = require('bcrypt');

var WORK_FACTOR = 10;
var SERVER_ERROR = 500;
var BAD_REQUEST = 400;
var METHOD_NOT_ALLOWED = 405;
var RESOURCE_CREATED = 201;

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
    if (!validate.createUser(req.body))
    {
      response.failure(res,validate.getErrors(),BAD_REQUEST);
    }
    else
    {
      User.findOne(
      {
        email: req.body.email
      }, function(err, usr)
      {
        if (err)
        {
          response.failure(res,'Error accessing user',SERVER_ERROR);
        }
        else
        {
          if (usr) // email already in use
          {
            response.failure(res,'Error accessing user',BAD_REQUEST);
          }
          else
          {
            bcrypt.hash(req.body.password, WORK_FACTOR, function(err, hash)
            {
              if (err) 
              {
                throw 'Error creating password hash';
              }
              new User(
              {
                givenName: req.body.givenName,
                familyName: req.body.familyName,
                email: req.body.email,
                password: hash
              }).save(function(err, idea, count)
              {
                if (count) // save was successful
                {
                  response.success(res, {}, RESOURCE_CREATED);
                }
                else
                { // error writing to database
                  response.failure(res,'Error accessing user',SERVER_ERROR);
                }
              }) 
            });
          }
        }
      });
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
        response.failure(res,'Error removing session cache.', SERVER_ERROR);
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
            response.failure(res,'Error deleting ideas.',SERVER_ERROR);
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
                response.failure(res,'Error deleting user.',SERVER_ERROR);
              }
              else
              {
                // todo:
                // remove data, logout,, remove user
                response.success(res);
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
        response.failure(res,'Error accessing user.',SERVER_ERROR);
      }
      else if (!usr)
      {
        response.failure(res,'User does not exist',BAD_REQUEST);
      }
      else
      {
        response.success(res,usr);
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
        response.failure(res,'Error accessing user.',SERVER_ERROR);
      }
      else if (!usr)
      {
        response.failure(res,'User does not exist',BAD_REQUEST);
      }
      else
      {
          if (!validate.updateUser(req.body))
          {
            response.failure(res,validate.getErrors(),BAD_REQUEST);
          }
          else
          {
            bcrypt.hash(req.body.password, WORK_FACTOR, function(err, hash)
            {
              if (err) throw new Error("Error creating password hash function");
              usr.givenName = req.body.givenName;
              usr.familyName = req.body.familyName;
              usr.email = req.body.email;
              usr.password = hash;
              usr.save();
              // update session cache
              var userSessionHash = "session:"+usr._id;
              redisClient.hmset(userSessionHash, "sessionID", req.sessionID, "email", usr.email, "givenName", usr.givenName)
              res.json(utils.success({}));
            });
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

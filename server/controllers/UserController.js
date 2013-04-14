var User = require('../models/user').User,
    utils = require('../utils'),
    redis = require('redis');

var redisClient = redis.createClient();
var signupUrl = "/v1/user/signup";

var userController =
{

  // handles post /v1/user/signup
  // create new profile for user with session
  // this is a signup
  // access with through curl by typing for example: 
  // curl X POST -d "givenName=Brian&familyName=Sonman&password=aaabbb&email=brian@example.com" "http://localhost:8888/v1/user/signup"
  addUser: function(req, res)
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


  // handles get /user
  // return profile for user with session
  // access with curl:
  // curl -b cookies.txt "http://localhost:8888/v1/user/get"
  getUser: function(req, res)
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
  //  curl -b cookies.txt-X PUT -d "givenName=Thomas&familyName=Sanchez&password=abcdef" "http://localhost:8888/v1/user/edit" 
  editUser: function(req, res)
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
        if (req.body.givenName!=undefined&&req.body.familyName!=undefined&&req.body.password!=undefined)
        {
          usr.givenName = utils.encodeHTML(req.body.givenName);
          usr.familyName = utils.encodeHTML(req.body.familyName);
          usr.password = req.body.password;
          usr.save();
          // update session cache
          var userSessionHash = "session:"+usr._id;
          redisClient.hmset(userSessionHash, "sessionID", req.sessionID, "email", usr.email,
          "givenName", usr.givenName)
          res.json(utils.success({}));
        }
        else
        {
          res.json(utils.failure('insufficient information provided'));
        }
      }
    });
  }

};

// module method to channel requests to correct handler of controller
// handles following urls:
//    /v1/user/signup --> addUser method
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
        res.json(utils.failure('Invalid operation specified'));
    }
  }
  else if (req.url == signupUrl) 
  {
    userController.addUser(req,res);
  }
  else
  {
    res.json(utils.failure('No user operation specified'));
  }
}


module.exports.route = route;

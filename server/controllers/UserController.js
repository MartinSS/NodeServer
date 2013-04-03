var User = require('../models/user').User;


  var userController =
  {

  // handles get /user
  // return profile for user with session
  // access with curl:
  // curl -b cookies.txt "http://localhost:8888/api/user"
  getUser: function(req, res)
  {
    console.log("called api.user");
    User.findOne(
    {
      email: req.user.email
    }, function(err, usr)
    {
      if (err || !usr)
      {
        res.json(
        {
          message: 'Error accessing user'
        });
      }
      else
      {
        res.json(usr);
      }
    });
  },
  
  // handles post /user
  // create new profile for user with session
  // this is a signup
  // access with through curl by typing for example: 
  // curl X POST -d "givenName=Brian&familyName=Sonman&password=aaabbb&email=brian@example.com" "http://localhost:8888/api/user"
  addUser: function(req, res)
  {
    new User(
    {
      givenName: req.body.givenName,
      familyName: req.body.familyName,
      email: req.body.email,
      password: req.body.password
    }).save(function(err, idea, count)
    {
      res.json(
      {
        message: 'Success'
      });
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
          message: 'Error accessing user'
        });
      }
      else
      {
        usr.givenName = req.body.givenName;
        usr.familyName = req.body.familyName;
        usr.password = req.body.password;
        usr.save();
        res.json(
        {
          message: 'Success'
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



var Idea = require('../models/idea').Idea,
    utils = require('../utils'),
    validate = require('./validate'),
    response = require('../response'),
    sanitize = require('./sanitize');


var SERVER_ERROR = 500;
var BAD_REQUEST = 400;
var METHOD_NOT_ALLOWED = 405;
var RESOURCE_CREATED = 201;
var NO_CONTENT = 204;
var NOT_AUTHORIZED = 403;

var ideaController =
{
  
  // handles read /ideas
  // return all ideas for user with session
  // on error returns JSON containing error message
  // curl request with cookie set returned by /login: curl -v --cookie "connect.sid=s%3ANM7ESUG23zCuhiEMlXE%2BSgju.WQkr7LTf5Lp3LflLDUskdKNcoWOeLQgMxvUkGYSQMqM; Path=/;" localhost:8888/v1/idea/read/
  // status codes for response are:
  //  500 internal server error when accessing db
  //  204 no content (no ideas found in db)
  //  200 ok

  readIdeas: function (req, res)
  {
    Idea.find(
    {
      userId: req.user.email
    }, function(err, ideas)
    {
      if (err)
      {
        response.failure(res,'Error accessing ideas database.',SERVER_ERROR);
      }
      else if (!ideas)
      {
        response.failure(res,'No ideas found in database.',NO_CONTENT);
      }
      else
      {
        response.success(res,ideas);
      }
    });
  },
  
  // handles delete /ideas
  // delete all ideas for user with session
  // on error returns JSON containing error message
  // curl request with cookie set returned by /login: curl -v --cookie "connect.sid=s%3ANM7ESUG23zCuhiEMlXE%2BSgju.WQkr7LTf5Lp3LflLDUskdKNcoWOeLQgMxvUkGYSQMqM; Path=/;" localhost:8888/v1/idea/delete/
  //  500 internal server error when accessing db
  //  400 bad request
  deleteIdeas: function (req, res)
  {
    Idea.remove(
    {
      userId: req.user.email
    }, function(err, ideas)
    {
      if (err) 
      {
        response.failure(res,'Error deleting ideas.',SERVER_ERROR);
      }
      else
      {
        response.success(res);
      }
    });
  },

  // handles read /idea/:id
  // return a given idea with id
  // expects url parameter with id of idea
  // on error returns JSON containing error message
  // curl -b cookies.txt "http://localhost:8888/v1/idea/read/514a8726a967f4f1774f7baf"
  // status codes for response are:
  //  500 internal server error when accessing db
  //  204 no content (no ideas found in db)
  //  200 ok

  readIdea: function (req, res)
  {
    Idea.findOne(
    {
      _id: req.params.id // , userId: req.user.email
    }, function(err, idea)
    {
      if (err)
      {
        response.failure(res,'Error accessing idea in database.',SERVER_ERROR);
      }
      else if (!idea)
      {
        response.failure(res,'Idea not in database.', NO_CONTENT);
      }
      else
      {
        if ( idea.userId != req.user.email ) // not authorized
        {
          response.failure(res,'Idea not owned by user',NOT_AUTHORIZED);
        }
        else
        {
          response.success(res,idea);
        }
      }
    });
  },


  // handles delete /idea/:id
  // delete a given idea with id
  // expects url parameter with id of idea
  // on error returns JSON containing error message
  // curl -b cookies.txt "http://localhost:8888/v1/idea/delete/514a8726a967f4f1774f7baf"
  //  500 internal server error when accessing db
  //  400 bad request
  deleteIdea: function (req, res)
  {
    Idea.remove(
    {
      _id: req.params.id
    }, function(err, idea)
    {
      if (err) 
      {
        response.failure(res,'Error deleting idea',SERVER_ERROR);
      }
      else
      {
        response.success(res);
      }
    });
  },


  
  // handles post /idea
  // create idea for user with session
  // expects parameters set in body of request with idea data
  // on error returns JSON containing error message
  // returns 'Success' message otherwise
  // can be accesssed with  the following curl command:
  // curl -b cookies.txt -d "title=idea3&content=consectetur adipisicing elit, sed do eiusmod tempor ncididunt" "http://localhost:8888/api/idea"
  //  500 internal server error when accessing db
  //  400 bad request
  //  201 resource created

  createIdea: function (req, res)
  {

    if (!validate.createIdea(req.body))
    {
      response.failure(res,validate.getErrors(),BAD_REQUEST);
    }
    else
    {
      sanitize.createIdea(req.body);

      var idea = new Idea(
      {
        title: req.body.title,
        content: req.body.content,
        userId: req.user.email
      });
  
      idea.save(function(err)
      {
        if (err)
        {
          response.failure(res,'Failure saving data',SERVER_ERROR);
        }
        Idea.findById(idea, function (err)
        {
          if (err)
          {
            response.failure(res,'Failure reading data',SERVER_ERROR);
          }
          else
          {
            response.success(res,{"id": idea._id},RESOURCE_CREATED);
          }
        });
      });
     }
  },



  // handles put /idea
  // modify idea for user with session
  // expects parameters set in body of request with idea data
  // on error returns JSON containing error message
  // returns 'Success' message otherwise
  // url can be hit by e.g. curl -b cookies.txt -X PUT -d "title=idea4&content=adipisicing elit, sed do eiusmod tempor inciidunt" "http://localhost:8888/api/idea/5158b50f7a41e34b17000003"
  //  500 internal server error when accessing db
  //  400 bad request
  //  201 resource created

  updateIdea: function(req, res)
  {
    Idea.findOne(
    {
      _id: req.params.id, userId: req.user.email
    }, function(err, idea)
    {
      if (err || !idea)
      {
        if (!idea)
        {
          response.failure(res,"Can't update a non-existing idea",BAD_REQUEST);
        }
        else
        {
          response.failure(res,'Error occurred accessing session',SERVER_ERROR);
        }
      }
      else
      {
        if (!validate.createIdea(req.body))
        {
          response.failure(res,validate.getErrors(),BAD_REQUEST);
        }
        else
        {
          sanitize.createIdea(req.body); 
          idea.title = req.body.title;
          idea.content = req.body.content;
          idea.save();
          response.success(res,{}); 
        }
      }
    });
  }
};


// receive a reqeust for /v1/idea/*
// this controller does the mapping to it's internal functions
// -> /v1/idea/read ---> readIdeas function
// -> /v1/idea/read/ideaId ---> readIdea function
// -> /v1/idea/create ---> createIdea function
// -> /v1/idea/update ---> updateIdea function
// exports.route = function(req, res) {
// map the path -> readIdeas -> to the appropriate function
// };

function route(req, res)
{
  if (!(typeof req.params.op === 'undefined'))
  {
    switch (req.params.op)
    {
      case 'read':
        if (typeof req.params.id === 'undefined')
        {
           ideaController.readIdeas(req,res);
        }
        else
        {
          ideaController.readIdea(req,res);
        }
        break;
      case 'delete':
        if (typeof req.params.id === 'undefined')
        {
           ideaController.deleteIdeas(req,res);
        }
        else
        {
          ideaController.deleteIdea(req,res);
        }
        break;
      case 'create':
        ideaController.createIdea(req,res);
        break;
      case 'update':
        ideaController.updateIdea(req,res);
        break;
      default:
        res.json(utils.failure('Invalid operation specified')).status(400);
    }
  }
  else
  {
    res.json(utils.failure('No idea operation specified')).status(400);
  }
}


module.exports.route = route;


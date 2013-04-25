var Idea = require('../models/idea').Idea,
    utils = require('../utils'),
    validate = require('./validate');
    sanitize = require('./sanitize');

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
        res.json(utils.failure('Error accessing ideas database.')).status(500);
      }
      else if (!ideas)
      {
        res.json(utils.failure('No ideas found in database.')).status(204);
      }
      else
      {
        res.json(utils.success(ideas));
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
        res.json(utils.failure('Error deleting ideas')).status(400);
      }
      else
      {
        res.json(utils.success());
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
        res.json(utils.failure('Error accessing idea in database.')).status(500);
      }
      else if (!idea)
      {
        res.json(utils.failure('Idea not in database.')).status(204);
      }
      else
      {
        if ( idea.userId != req.user.email ) // not authorized
        {
          res.json(utils.failure('Idea not owned by user')).status(403);
        }
        else
        {
          res.json(utils.success(idea));
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
        res.json(utils.failure('Error deleting idea')).status(500);
      }
      else
      {
        res.json(utils.success());
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
    try
    {
      var reqIdea = validate.createIdea(req.body);
      reqIdea = sanitize.createIdea(reqIdea); 

      var idea = new Idea(
      {
        title: reqIdea.title,
        content: reqIdea.content,
        userId: req.user.email
      });
  
      idea.save(function(err)
      {
        if (err)
        {
          res.json(utils.failure('Failure saving data')).status(500);
        }
        Idea.findById(idea, function (err)
        {
          if (err)
          {
            res.json(utils.failure('Failure reading data')).status(500); 
          }
          res.json(utils.success({"id": idea._id})).status(201);
        });
      });
     }
     catch (err)
     {
       res.json(utils.failure(err.message)).status(400);
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
          res.json(utils.failure("Can't update a non-existing idea")).status(400);
        }
        else
        {
          res.json(utils.failure('Error occurred accessing session')).status(500);
        }
      }
      else
      {
        try
        {

          var reqIdea = validate.createIdea(req.body);
          reqIdea = sanitize.createIdea(reqIdea); 
          idea.title = reqIdea.title;
          idea.content = reqIdea.content;
          idea.save();
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


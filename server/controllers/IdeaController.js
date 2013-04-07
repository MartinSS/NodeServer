var Idea = require('../models/idea').Idea,
    utils = require('../utils');

var ideaController =
{
  
  // handles get /ideas
  // return all ideas for user with session
  // on error returns JSON containing error message
  // curl request with cookie set returned by /login: curl -v --cookie "connect.sid=s%3ANM7ESUG23zCuhiEMlXE%2BSgju.WQkr7LTf5Lp3LflLDUskdKNcoWOeLQgMxvUkGYSQMqM; Path=/;" localhost:8888/api/ideas
  getIdeas: function (req, res)
  {
    Idea.find(
    {
      userId: req.user.email
    }, function(err, ideas)
    {
      if (err || !ideas)
      {
        res.json(
        {
          success: false,
          message: 'Error accessing ideas'
        });
      }
      else
      {
        res.json(ideas);
      }
    });
  },
  
  // handles get /idea/:id
  // return a given idea with id
  // expects url parameter with id of idea
  // on error returns JSON containing error message
  // curl -b cookies.txt "http://localhost:8888/api/idea/514a8726a967f4f1774f7baf"
  getIdea: function (req, res)
  {
    Idea.findOne(
    {
      _id: req.params.id
    }, function(err, idea)
    {
      if (err || !idea || idea.userId != req.user.email)
      {
        res.json(
        {
          success: false,
          message: 'Error accessing idea'
        });
      }
      else
      {
        res.json(idea);
      }
    });
  },
  
  // handles post /idea
  // add idea for user with session
  // expects parameters set in body of request with idea data
  // on error returns JSON containing error message
  // returns 'Success' message otherwise
  // can be accesssed with  the following curl command:
  // curl -b cookies.txt -d "ideaName=idea3&ideaContent=consectetur adipisicing elit, sed do eiusmod tempor ncididunt" "http://localhost:8888/api/idea"
  
  addIdea: function (req, res)
  {
    new Idea(
    {
      name: utils.encodeHTML(req.body.ideaName),
      content: utils.encodeHTML(req.body.ideaContent),
      userId: req.user.email
    }).
    save(function(err, idea, count)
    {
      res.json(
      {
        success: true
      });
    });
  },
  
  // handles put /idea
  // modify idea for user with session
  // expects parameters set in body of request with idea data
  // on error returns JSON containing error message
  // returns 'Success' message otherwise
  // url can be hit by e.g. curl -b cookies.txt  -X PUT -d "ideaName=idea4&ideaContent=adipisicing elit, sed do eiusmod tempor inciidunt" "http://localhost:8888/api/idea/5158b50f7a41e34b17000003"
  
  editIdea: function(req, res)
  {
    Idea.findOne(
    {
      _id: req.params.id
    }, function(err, idea)
    {
      if (err || !idea || (req.user.email != idea.userId))
      {
        res.json(
        {
          success: false,
          message: 'Error occurred accessing session'
        });
      }
      else
      {
        idea.name = utils.encodeHTML(req.body.ideaName),
        idea.content = utils.encodeHTML(req.body.ideaContent),
        idea.save();
        res.json(
        {
          success: true
        });
      }
    });
  }

};

    
  // receive a reqeust for /v1/idea/*
  // this controller does the mapping to it's internal functions
  // -> /v1/idea/get ---> getIdeas function
  // -> /v1/idea/get/ideaId ---> getIdea function
  // -> /v1/idea/add ---> addIdea function
  // -> /v1/idea/edit ---> editIdea function
  // exports.route = function(req, res) {
  // map the path -> getIdeas -> to the appropriate function
  // };

  function route(req, res)
  {
    if (!(typeof req.params.op === 'undefined')) 
    {
      switch (req.params.op)
      {
        case 'get':
          if (typeof req.params.id === 'undefined')
          {
            ideaController.getIdeas(req,res);
          }
          else
          {
            ideaController.getIdea(req,res);
          }
          break;
        case 'add':
          ideaController.addIdeas(req,res);
          break;
        case 'edit':
          ideaController.editIdea(req,res);
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
        message: 'No idea operation specified'
      });
    }
  }


module.exports.route = route;

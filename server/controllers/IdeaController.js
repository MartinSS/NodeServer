var Idea = require('../models/idea').Idea,
    utils = require('../utils');

var ideaController =
{
  
  // handles get /ideas
  // return all ideas for user with session
  // on error returns JSON containing error message
  // curl request with cookie set returned by /login: curl -v --cookie "connect.sid=s%3ANM7ESUG23zCuhiEMlXE%2BSgju.WQkr7LTf5Lp3LflLDUskdKNcoWOeLQgMxvUkGYSQMqM; Path=/;" localhost:8888/v1/idea/get/
  getIdeas: function (req, res)
  {
    Idea.find(
    {
      userId: req.user.email
    }, function(err, ideas)
    {
      if (err || !ideas)
      {
        res.json(utils.failure('Error accessing ideas'));
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
  deleteIdeas: function (req, res)
  {
    Idea.remove(
    {
      userId: req.user.email
    }, function(err, ideas)
    {
      if (err) 
      {
        res.json(utils.failure('Error deleting ideas'));
      }
      else
      {
        res.json(utils.success());
      }
    });
  },

  // handles get /idea/:id
  // return a given idea with id
  // expects url parameter with id of idea
  // on error returns JSON containing error message
  // curl -b cookies.txt "http://localhost:8888/v1/idea/get/514a8726a967f4f1774f7baf"
  getIdea: function (req, res)
  {
    Idea.findOne(
    {
      _id: req.params.id, userId: req.user.email
    }, function(err, idea)
    {
      if (err || !idea)
      {
        res.json(utils.failure('Error accessing idea'));
      }
      else
      {
        res.json(utils.success(idea));
      }
    });
  },


  // handles delete /idea/:id
  // delete a given idea with id
  // expects url parameter with id of idea
  // on error returns JSON containing error message
  // curl -b cookies.txt "http://localhost:8888/v1/idea/delete/514a8726a967f4f1774f7baf"
  deleteIdea: function (req, res)
  {
    Idea.remove(
    {
      _id: req.params.id
    }, function(err, idea)
    {
      if (err) 
      {
        res.json(utils.failure('Error deleting idea'));
      }
      else
      {
        res.json(utils.success());
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
    if (req.body.ideaName!=undefined&&req.body.ideaContent!=undefined)
    {
      var idea = new Idea(
      {
        name: utils.encodeHTML(req.body.ideaName),
        content: utils.encodeHTML(req.body.ideaContent),
        userId: req.user.email
      });

      idea.save(function(err)
      {
        if (err) res.json(utils.failure('Failure saving data'));
        Idea.findById(idea, function (err)
        {
          if (err) res.json(utils.failure('Failure reading data')); 
          res.json(utils.success({"id": idea._id}));
        });
      });
    }
    else
    {
      res.json(utils.failure('Idea information missing'));
    }
  },




  // handles put /idea
  // modify idea for user with session
  // expects parameters set in body of request with idea data
  // on error returns JSON containing error message
  // returns 'Success' message otherwise
  // url can be hit by e.g. curl -b cookies.txt -X PUT -d "ideaName=idea4&ideaContent=adipisicing elit, sed do eiusmod tempor inciidunt" "http://localhost:8888/api/idea/5158b50f7a41e34b17000003"
            
  editIdea: function(req, res)
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
          res.json(utils.failure("Can't edit a non-existing idea"));
        }
        else
        {
          res.json(utils.failure('Error occurred accessing session'));
        }
      }
      else
      {
        if (req.body.ideaName!=undefined)
        {
          idea.name = utils.encodeHTML(req.body.ideaName);
        }
        if (req.body.ideaContent!=undefined)
        {
          idea.content = utils.encodeHTML(req.body.ideaContent);
        }
          idea.save();
          res.json(utils.success({}));
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
      case 'add':
        ideaController.addIdea(req,res);
        break;
      case 'edit':
        ideaController.editIdea(req,res);
        break;
      default:
        res.json(utils.failure('Invalid operation specified'));
    }
  }
  else
  {
    res.json(utils.failure('No idea operation specified'));
  }
}


module.exports.route = route;


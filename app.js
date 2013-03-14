
var SERVER = {
  host: 'localhost',
  port: 8888
};

var express = require('express');
var app = express();

app.listen(SERVER.port, SERVER.host);

app.get('/', function(req, res) {
  res.set({'Content-Type': 'application/json'});
  res.json({ 'message': 'Please log in'});
  res.render;
});

app.get('/ideas', function(req, res) {
  res.set({'Content-Type': 'application/json'});
  res.json(
    {'idea1': 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 
     'idea2': 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
     'idea3': 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    });
  res.render;
});

app.get('/profiles', function(req, res) {
  res.set({'Content-Type': 'application/json'});
  res.json({'profile': 
    {
      'guid': '033400000000000000000', 
      'nickname': 'johnny58', 
      'image':
      {
        'size': '45x97',
        'imageUrl': 'http://localhost:3000'
      },
      'memberSince': 'oct-13-2011',
      'givenName':'John',
      'familyName':'Smith'
     }
  });
  res.render;
});

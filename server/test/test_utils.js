module.exports = 
{
  generateValidUser: function()
  {
    var result =  
    {
      givenName: Math.random().toString(36).substr(2,Math.random()*15).replace(/\d/g, 'a')+'x',
      familyName: 'redman',
      email: Math.random().toString(36).substr(2,Math.random()*15).replace(/\d/g, 'a')+'y@example.com',
      "password": 'aaaaaa'
    };

    return result;
  },

  // same as valid user but no familyName
  generateInvalidUser: function()
  {
    var result =  
    {
      givenName: Math.random().toString(36).substr(2,Math.random()*15).replace(/\d/g, 'a'),
      email: 'timmy@example.com',
      "password": 'aaaaaa'
    };

    return result;
  },


  generateValidIdea: function()
  {
    var result =
    {
      name: Math.random().toString(36).substr(2,Math.random()*15).replace(/\d/g, 'a'),
      content: words.slice(0,Math.random()*words.length).join(' ')
    };

    return result;
  }

};

var text = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";
var words = text.split(' ');


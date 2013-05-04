var passwordChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>!@#$%^&*()_+-=;'\".,/?";
var nameChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-";
var domainChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.";
var topLevelDomains = ['info', 'com', 'org', 'net', 'edu', 'co', 'biz', 'gov', 'mil'];

// generate a random 'name' of length n
var generateName = function(n)
{
  var result = '';
  for (var i = 0 ; i < n ; i++)
  {
    result += nameChars[Math.floor(Math.random()*nameChars.length)];
  }

  return result;
}

// generate a random domain name of length n
var generateDomainName = function(n)
{
  var result = '';
  for (var i = 0 ; i < n ; i++)
  {
    result += domainChars[Math.floor(Math.random()*domainChars.length)];
  }
  
  while (result.charAt(0) == '-' || result.charAt(0) == '.') // fix ends which can't be hyphens for valid domain
  {
    result = domainChars[Math.floor(Math.random()*domainChars.length)] + result.slice(1);
  }
  while (result.charAt(n-1) == '-' || result.charAt(n-1) == '.') // fix ends which can't be hyphens for valid domain
  {
    result = result.slice(0,n-1) + domainChars[Math.floor(Math.random()*domainChars.length)];
  }

  return result;
}



// generate a random password of length n
var generatePassword = function(n)
{
  var result = '';
  for (var i = 0 ; i < n ; i++ )
  {
    result += passwordChars[Math.floor(Math.random()*passwordChars.length)];
  }

  return result;
}

// generate a random 'email' address of name length m and domain length n
var generateEmailAddress = function(m, n)
{
  var result = generateName(m) + '@' + generateDomainName(n) + '.' + topLevelDomains[Math.floor(Math.random()*topLevelDomains.length)];

  return result;
}


module.exports = 
{
  generateValidUser: function()
  {
    var result =  
    {
      givenName: generateName(10),
      familyName: generateName(15),
      email: generateEmailAddress(7,12),
      password: generatePassword(11)
    };

    return result;
  },

  // same as valid user but no familyName
  generateInvalidUser: function()
  {
    var result =  
    {
      familyName: generateName(15),
      email: generateEmailAddress(7,12),
      password: generatePassword(11)
    };

    return result;
  },


  generateValidIdea: function()
  {
    var result =
    {
      title: generateName(25),
      content: words.slice(0,Math.random()*words.length).join(' ')
    };

    return result;
  }

};

var text = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";
var words = text.split(' ');


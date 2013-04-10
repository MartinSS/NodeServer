
// prevent script injection (e.g. XSS) by encoding (sanitizing) HTML sensitive inputs
// currently encodes &, <, >, and "
//
module.exports = 
{
  encodeHTML: function (s) 
  {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  // check if string is defined and returns value or "" if undefined
  defined: function (s)
  {
    return s==undefined ? "" : s;
  },

  // method to encapsulate successful response
  success: function (body) 
  {
    result =
    {
      success: true,
      body: body
    }
    return result;
  },

  // method to encapsulate response failure
  failure: function (message) 
  {
    result =
    {
      success: false,
      message: message 
    }
    return result;
  }

};

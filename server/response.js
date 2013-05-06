//
module.exports = 
{
  // method to encapsulate successful response
  // res: the express http response object
  // body : an optional body of response
  // code: the optional http status code for the error
  success: function (res, body, code) 
  {
    var result;
    if (body)
    {
      result =
      {
        "success": true,
        "result": body
      }
    }
    else
    {
      result =
      {
        "success": true,
      }
    }

    if (code)
    {
      return res.json(result).status(code);
    }
    else
    {
      return res.json(result);
    }
  },

  // method to encapsulate response failure
  // res: the express http response object
  // messages: a string or array of strings containing error messages
  // code: the http status code for the error
  failure: function (res, messages, code) 
  {
    var result =
    {
      "success": false,
      "message": messages, 
    }
    return res.json(result).status(code);
  }

};

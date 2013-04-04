
// prevent script injection (e.g. XSS) by encoding (sanitizing) HTML sensitive inputs
// currently encodes &, <, >, and "
//
module.exports = 
{
  encodeHTML: function (s) 
  {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

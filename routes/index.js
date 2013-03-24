/*

  Routes used by angular

*/

// home page
exports.index = function(req, res) {
  res.render('index' );
};


// angular partials
exports.partials = function (req, res) {
  var name = req.params.name;
  console.log('called render partial with name:'+name);
  // res.render('partials/' + name );
  res.render('login');
};



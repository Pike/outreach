var util = require('util');

/*
 * GET home page.
 */

exports.index = function(req, res){
  var args = extractUser(req);
  args.title = 'Localizers and Roles';
  res.render('index', args);
};


/*
 * GET profile page.
 */

exports.profile = function(req, res){
  var args = extractUser(req);
  args.title = 'Your Profile';
  args.redirect = req.headers.referer || '/';
  res.render('profile', args);
};


/*
 * POST profile page.
 */

exports.change_profile = function(req, res){
  req.session.email = req.body.email;
  req.session.shortname = req.body.shortname;
  if (req.body.fullname) req.session.fullname = req.body.fullname;
  res.redirect(req.body.redirect);
};


function extractUser(req, args) {
  args = args || {};
  args.email = req.session.email;
  args.fullname = req.session.fullname;
  args.shortname = req.session.shortname;
  args.logged_in = args.email && args.shortname;
  return args;
}
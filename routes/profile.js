/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * GET profile page.
 */

exports.show = function(req, res) {
  var args = req.templateArgs;
  args.title = 'Your Profile';
  args.redirect = req.headers.referer || '/';
  res.render('profile', args);
};


/*
 * POST profile page.
 */

exports.change = function(req, res) {
  req.session.email = req.body.email;
  req.session.shortname = req.body.shortname;
  if (req.body.fullname) req.session.fullname = req.body.fullname;
  res.redirect(req.body.redirect);
};

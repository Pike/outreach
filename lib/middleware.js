/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.sessionTemplateArgs = function _sta(options) {
  options = options || {};
  return function sessionTemplateArgs(req, res, next) {
    if (req.templateArgs) return next();
    var args = {};
    args.email = req.session.email;
    args.fullname = req.session.fullname;
    args.shortname = req.session.shortname;
    args.logged_in = args.email && args.shortname;
    args.extra_scripts = [];
    args.extra_links = [];
    req.templateArgs = args;
    return next();
  };
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var util = require('util');

/*
 * GET outreach data form.
 */
exports.index = function(req, res) {
  var args = req.templateArgs;
  args.subject_template = args.body_template = undefined;
  if (req.session.template) {
    args.subject_template = req.session.template.subject || undefined;
    args.body_template = req.session.template.body || '';
  }
  args.extra_scripts = ['/exhibit3/exhibit-api.js?bundle=false',
                        '/ejs/ejs.js',
                        '/js/outreach.js'];
  args.extra_links.push({
    href: '/js/people-importer.js',
    type: '',
    rel: 'exhibit-extension'
  });
  args.extra_links.push({
    href: '/people.json',
    type: 'x-outreach/people',
    rel: 'exhibit-data'
  });
  args.extra_links.push({
    href: '/data/regions.json',
    type: 'application/json',
    rel: 'exhibit-data'
  });
  args.title = 'Upload outreach data';
  res.render('outreach-index', args);
};

/*
 * POST outreach data, template or json
 */
exports.upload = function(req, res) {
  req.session[req.body.variant] = req.body.data;
  res.end('"OK"');
};

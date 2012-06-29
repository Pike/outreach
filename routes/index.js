/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/* import profile routes */
exports.profile = require('./profile');


/* import people/person routes */
exports.people = require('./people');


/* import outreach routes */
exports.outreach = require('./outreach');


/* import outreach routes */
exports.mail = require('./mail');


/*
 * GET home page.
 */

exports.index = function(req, res) {
  var args = req.templateArgs;
  args.title = 'Localizers and Roles';
  args.extra_scripts = ['/exhibit3/exhibit-api.js',
                        '/js/index.js'];
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
  res.render('index', args);
};

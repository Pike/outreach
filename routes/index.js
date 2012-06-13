/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var util = require('util');
var fs = require('fs');
var path = require('path');
var url = require('url');

/*
 * GET home page.
 */

exports.index = function(req, res) {
  var args = extractUser(req);
  args.title = 'Localizers and Roles';
  args.extra_scripts = ['/exhibit3/exhibit-api.js?js=/js/people-importer.js&postLoad=yes'];
  args.extra_links.push({
    href: '/people.json',
    type: 'x-outreach/people',
    rel: 'exhibit-data'
  })
  res.render('index', args);
};


/*
 * GET person page.
 * Either with param.email or ?email=
 */
exports.person = function(req, res) {
  var email = req.params.email || url.parse(req.url, true).query.email;
  var p = path.join('people', email);
  fs.readFile(p, function(err, data) {
    var args = extractUser(req);
    redirect = req.headers.referer || '/';
    if (!err) {
      args.person = JSON.parse(data);
      args.title = args.person.fullname + " &lt;" + args.person.email + ">";
    }
    else {
      args.title = "New Person: " + email;
      args.person = {email: email};
    }
    args.extra_scripts.push('/js/person.js')
    res.render('person', args);
  });
}


/*
 * GET profile page.
 */

exports.profile = function(req, res) {
  var args = extractUser(req);
  args.title = 'Your Profile';
  args.redirect = req.headers.referer || '/';
  res.render('profile', args);
};


/*
 * POST profile page.
 */

exports.change_profile = function(req, res) {
  req.session.email = req.body.email;
  req.session.shortname = req.body.shortname;
  if (req.body.fullname) req.session.fullname = req.body.fullname;
  res.redirect(req.body.redirect);
};


/*
 * People data
 */

exports.people = (function(fs, path) {
  var dataLoaded = false, loading = false;
  var cache = '';
  var ongoing = [];
  function realPeople(req, res) {
    res.contentType('application/json');
    if (dataLoaded) {
      res.send(cache);
    }
    else {
      if (cache) res.write(cache);
      ongoing.push(res);
      if (!loading) {
        fs.readdir('people', function _listPeople(err, files) {
          var filesToLoad = files.length;
          for (var i=0, ii=files.length; i<ii; ++i) {
            var p = path.join('people', files[i]);
            fs.readFile(p, function _readPerson(err, data) {
              var chunk;
              --filesToLoad;
              if (cache) {
                chunk = ',\n' + data;
              }
              else {
                chunk = '[' + data;
              }
              if (filesToLoad <= 0) {
                chunk += ']'
              }
              cache += chunk;
              if (filesToLoad <= 0) {
                dataLoaded = true;
              }
              for (var j=ongoing.length-1; j >= 0; --j) {
                var _res = ongoing[j];
                _res.write(chunk);
                if (filesToLoad <= 0) {
                  _res.end();
                  ongoing.pop();
                }
              }
            });
          }
        });
      }
    }
  }
  return realPeople;
})(fs, path);


function extractUser(req, args) {
  args = args || {};
  args.email = req.session.email;
  args.fullname = req.session.fullname;
  args.shortname = req.session.shortname;
  args.logged_in = args.email && args.shortname;
  args.extra_scripts = [];
  args.extra_links = [];
  return args;
}
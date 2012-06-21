/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var util = require('util');
var fs = require('fs');
var path = require('path');
var url = require('url');
var serializePerson = require('../lib/util').serializePerson;

/*
 * GET home page.
 */

exports.index = function(req, res) {
  var args = extractUser(req);
  args.title = 'Localizers and Roles';
  args.extra_scripts = ['/exhibit3/exhibit-api.js?js=/js/people-importer.js&postLoad=yes',
                        '/js/index.js'];
  args.extra_links.push({
    href: '/people.json',
    type: 'x-outreach/people',
    rel: 'exhibit-data'
  })
  args.extra_links.push({
    href: '/data/regions.json',
    type: 'application/json',
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
      args.title = args.person.fullname + " &lt;" + email + ">";
      args.post_mail = email;
    }
    else {
      args.title = "New Person: " + email;
      args.person = {email: email};
      args.post_mail = email;
    }
    args.extra_scripts.push('/js/person.js')
    res.render('person', args);
  });
}

/*
 * POST person page
 * primary email via params.email
 */
exports.save_person = function(req, res) {
  var email = req.params.email;
  var p = path.join('people', email);
  // create JSON, but without JSON, to specify ordering of keys and such
  try {
    var saneObj = {
      fullname: req.body.fullname,
      name: req.body.name
    }
    if (req.body.ldap) {
      saneObj.ldap = req.body.ldap;
    }
    if (req.body.bugzilla) {
      saneObj.bugzilla = req.body.bugzilla;
    }
    if (req.body.email) {
      saneObj.email = req.body.email;
    }
    if (req.body.hg) {
      saneObj.hg = true;
    }
    if (req.body.svn) {
      saneObj.svn = true;
    }
    // roles
    var roles = [], rnum = 1;
    while (true) {
      if (!(
        ('role_' + rnum + '_role') in req.body &&
        ('role_' + rnum + '_product') in req.body &&
        ('role_' + rnum + '_locale') in req.body
            )) {
        break;
      }
      var _r = {};
      _r.role = req.body['role_' + rnum + '_role'];
      _r.product = req.body['role_' + rnum + '_product'];
      _r.locale = req.body['role_' + rnum + '_locale'];
      ++rnum;
      roles.push(_r)
    }
    if (roles.length) {
      saneObj.roles = roles;
    }
    var c = serializePerson(saneObj);
    fs.writeFile(p, c, function _wroteData(err) {
      if (err) console.log(err);
      res.redirect(req.body.redirect || '/');
    })
    exports.people.clear();
  }
  catch (e) {
    console.log(e);
  }
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
            if (files[i][0] == '.') {
              -- filesToLoad;
              continue;
            }
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
                loading = false;
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
  realPeople.clear = function _clearCache() {
    dataLoaded = false;
    cache = '';
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
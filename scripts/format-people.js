/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var sp = require('../lib/util').serializePerson;
var fs = require('fs');
var path = require('path');

function generateOnRead(p) {
  var _p = p;
  return function (err, data) {
    var obj = JSON.parse(data);
    var c = sp(obj);
    fs.writeFile(_p, c, function (err) {
      if (err) console.log(err);
    });
  };
}
fs.readdir('people', function _listPeople(err, files) {
  var filesToLoad = files.length;
  for (var i=0, ii=files.length; i<ii; ++i) {
    var p = path.join('people', files[i]);
    fs.readFile(p, generateOnRead(p));
  }
});

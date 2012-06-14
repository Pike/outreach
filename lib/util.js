/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * serializePerson
 * obj is a JS object describing the person
 * Returns a string with a fixed-order serialization.
 */
exports.serializePerson = function(obj) {
  var c = '{\n  "fullname": ' + JSON.stringify(obj.fullname) + ',\n' +
    '  "name": ' + JSON.stringify(obj.name);
  if (obj.ldap) {
    c += ',\n  "ldap": ' + JSON.stringify(obj.ldap);
  }
  if (obj.bugzilla) {
    c += ',\n  "bugzilla": ' + JSON.stringify(obj.bugzilla);
  }
  if (obj.email) {
    c += ',\n  "email": ' + JSON.stringify(obj.email);
  }
  if (obj.hg) {
    c += ',\n  "hg": true';
  }
  if (obj.svn) {
    c += ',\n  "svn": true';
  }
  // roles
  var roles = [];
  if (obj.roles instanceof Array) {
    for (var i=0, ii=obj.roles.length; i<ii; ++i) {
      var role = obj.roles[i];
      if (role.role === undefined ||
          role.product === undefined ||
          role.locale === undefined) {
        continue;
      }
      var _r = '   {\n    "role": ';
      _r += JSON.stringify(role.role);
      _r += ',\n    "product": ';
      _r += JSON.stringify(role.product);
      _r += ',\n    "locale": ';
      _r += JSON.stringify(role.locale);
      _r += '\n   }';
      roles.push(_r);
    }
  }
  if (roles.length) {
    roles.sort();
    c += ',\n  "roles": [\n' + roles.join(',\n') + '\n  ]';
  }
  c += '\n}\n';
  return c;
}
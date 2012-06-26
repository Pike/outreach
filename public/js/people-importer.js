/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

Exhibit.Importer.ExhibitPeople = {
    _importer: null
};
var pd;
Exhibit.Importer.ExhibitPeople.parse = function(url, s, callback) {
    var o = null;

    try {
        var people = JSON.parse(s);
        pd = people;
        var items = [];
        $.each(people, function _handlePerson(i, person) {
          var id = person.ldap || person.bugzilla || person.email;
          person.label = person.name;
          person.id = id;
          person.primary = person.email || person.ldap || person.bugzilla;
          person.id_mail = id;
          person.type = 'Person';
          var roles = person.roles;
          delete person.roles;
          items.push(person);
          if (roles) {
            $.each(roles, function(i, role) {
              items.push({
                id: 'role_' + id + i,
                type: 'Role',
                person: id,
                locale: role.locale,
                product: role.product,
                role: role.role,
                label: role.product + " " + role.role + " [" + role.locale + "]"
              });
            });
          }
        });
        o = {items: items};
    } catch(e) {
        Exhibit.UI.showJsonFileValidation(Exhibit._("%general.badJsonMessage", url, e.message), url);
    }

    if (typeof callback === "function") {
        callback(o);
    }
};
Exhibit.Importer.ExhibitPeople._register = function() {
    Exhibit.Importer.ExhibitPeople._importer = new Exhibit.Importer(
        "x-outreach/people",
        "get",
        Exhibit.Importer.ExhibitPeople.parse
    );
};

$(document).one("registerImporters.exhibit",
                Exhibit.Importer.ExhibitPeople._register);

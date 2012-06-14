/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

$(document).one("scriptsLoaded.exhibit", function() {
  var emails = Exhibit.ExpressionParser.parse('if( exists( .email ) , .email, if( exists(.ldap) , .ldap, .bugzilla ) )');
  var fullname = Exhibit.ExpressionParser.parse('.fullname');
  function updateEmails() {
    var rest_emails = [];
    exhibit.getDefaultCollection().getRestrictedItems().visit(function(_email){
      var _realmail, _fullname;
      _realmail = emails.evaluateOnItem(_email, exhibit.getDatabase()).values.toArray()[0];
      _fullname = fullname.evaluateOnItem(_email, exhibit.getDatabase()).values.toArray()[0];
      rest_emails.push(_fullname + " <" + _realmail + ">");
    });
    this.href = "mailto:" + rest_emails.join(",");
  }
  $("#mailto").click(updateEmails);
  $(document).bind("onItemsChanged.exhibit", function() {
    $("#mailto").attr("href", "mailto:<selection>");
  });
});
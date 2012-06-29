/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

$(function() {
  var ejs = require('ejs');
  $("#subject").val(ejs.render($("#subject-template").text(), scope));
  $("#text").val(ejs.render($("#body-template").text(), scope));
  $("#btn-skip-mail").click(function() {
    $("#send").val('no');
    this.form.submit();
  });
})
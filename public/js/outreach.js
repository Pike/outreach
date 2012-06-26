/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

$(function() {
  var _json = $("#json").change(processJSON);
  if (_json.val()) {
    processJSON();
  }
  $("#btn-save-json").click(uploadJSON);
  $("#btn-save-template").click(uploadTemplate);
});
var data, prod4loc;
function processJSON() {
  //var prod4loc, data;
  try {
    prod4loc = Exhibit.ExpressionParser.parse('!locale.product');
  } catch (e) {
    $(document).one("exhibitConfigured.exhibit", processJSON);
    return;
  }
  try {
    data = JSON.parse($("#json").val());
  } catch (e) {
    // XXX report
    console.log(e);
    return;
  }
  $("#loc_count").val(data.locales.length);
  var mp = $("#missingPeople");
  function hasProduct(prodset, bad_prods) {
    function _hasProduct(prodname) {
      if (!prodset.contains(prodname)) {
        bad_prods.push(prodname);
      }
    }
    return _hasProduct;
  }
  function validateProducts(loc, d) {
    var bad_prods = [];
    if (loc == "ja-JP-mac") {loc = "ja";}  // XXX needs better
    var prd = prod4loc.evaluateOnItem(loc, exhibit.getDatabase()).values;
    $.each(d, hasProduct(prd, bad_prods));
    if (bad_prods.length) {
      console.log(loc, bad_prods);
      mp.removeClass("hidden");
      mp.children('table').append('<tr><td>' + loc + '</td>' +
                                  '<td>' + bad_prods.join(', ') + '</td></tr>');
    }
  }
  $.each(data.data, validateProducts);
  createPreviewButtons(data.locales);
}

function createPreviewButtons(locs) {
  $("input.do-preview").remove();
  var buttons = [];
  $.each(locs, function (i, loc) {
    buttons.push('<input type="button" value="' + loc + '" class="do-preview"><br>');
  });
  $("#preview-buttons").append(buttons.join(''));
  $("input.do-preview").click(createPreview);
}

function createPreview() {
  var locale = $(this).val();
  // create scope
  var scope = {
    code: locale,
    apps: data.data[locale]
  };
  var db = exhibit.getDatabase()
    , people = {}
    , roles = {
      owner: new Exhibit.Set(),
      mentor: new Exhibit.Set(),
      peer: new Exhibit.Set()
    };
  db.getSubjects(locale, 'locale')
    .visit(function(item) {
      var p = db.getObject(item, 'person')
        , r = db.getObject(item, 'role');
      var person = {
        name: db.getObject(p, 'name'),
        fullname: db.getObject(p, 'fullname'),
        email: db.getObject(p, 'primary')
      };
      people[p] = person;
      if (r in roles) {
        roles[r].add(p);
      }
    });
  var rolenames = {
      owner: [],
      mentor: [],
      peer: []}
    , rolepeople = {
      owner: [],
      mentor: [],
      peer: []};
  function v_gather(r) {
    function real_visit(p) {
      if (!(p in people)) return; // already dealt with
      var person = people[p];
      delete people[p];
      rolepeople[r].push(person);
      rolenames[r].push(person.name);
    }
    return real_visit;
  }
  roles.owner.visit(v_gather('owner'));
  rolenames.owner.sort();
  roles.mentor.visit(v_gather('mentor'));
  rolenames.mentor.sort();
  roles.peer.visit(v_gather('peer'));
  rolenames.peer.sort();
  scope.all_names = rolenames.owner.concat(rolenames.mentor, rolenames.peer);
  var ejs = require('ejs');
  var sub = ejs.render($("#subject").val(), scope);
  var content = ejs.render($("#template").val(), scope);
  $("#subject-preview").val(sub);
  $("#preview").val(content);
}

function uploadData(variant, data) {
  $.post('/outreach/upload', {variant: variant, data: data});
}

function uploadJSON() {
  uploadData('json', JSON.parse($("#json").val()));
}

function uploadTemplate() {
  uploadData('template', {
    subject: $("#subject").val(),
    body: $("#template").val()
  });
}

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
  var contactprods, outreachprods;
  try {
    contactprods = Exhibit.ExpressionParser.parse('!locale.product');
    outreachprods = Exhibit.ExpressionParser.parse('!signoff_locale.app');
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
  var mp = $("#missingPeople");
  function hasProduct(prodset, bad_prods) {
    function _hasProduct(prodname) {
      if (!prodset.contains(prodname)) {
        bad_prods.push(prodname);
      }
    }
    return _hasProduct;
  }
  function validateProducts(loc) {
    if (loc == "ja-JP-mac") {loc = "ja";}  // XXX needs better
    var op = outreachprods.evaluateOnItem(loc, exhibit.getDatabase()).values;
    contactprods.evaluateOnItem(loc, exhibit.getDatabase()).values.visit(function(prod){
      op.remove(prod);
    });
    bad_prods = op.toArray().sort();
    if (bad_prods.length) {
      console.log(loc, bad_prods);
      mp.removeClass("hidden");
      mp.children('table').append('<tr><td>' + loc + '</td>' +
                                  '<td>' + bad_prods.join(', ') + '</td></tr>');
    }
  }
  var db = exhibit.getDatabase();
  db.loadData(data);
  var locales = new Exhibit.Set();
  db.getAllItems().visit(function(item) {
    if (db.getSubject(item, 'signoff_locale')) {
      locales.add(item);
      }
    });
  $("#loc_count").val(locales.size());
  locales.visit(validateProducts);
  createPreviewButtons(locales);
}

function createPreviewButtons(locs) {
  $("input.do-preview").remove();
  var buttons = [];
  locs.visit(function (loc) {
    buttons.push('<input type="button" value="' + loc + '" class="do-preview"><br>');
  });
  $("#preview-buttons").append(buttons.join(''));
  $("input.do-preview").click(createPreview);
}

function createPreview() {
  var db = exhibit.getDatabase()
    , locale = $(this).val();
  // create scope
  var scope = {
    code: locale,
    name: db.getObject(locale, 'name')
  };
  // copy the outreach data into scope.branch.app.data
  var outreachItems = db.getSubjects(locale, 'signoff_locale');
  outreachItems.visit(function(o_item) {
    var props = db.getForwardProperties(o_item);
    var o_data = {};
    $.each(props, function(i, prop) {
      switch (prop) {
        case "modified":
        case "origin":
        case "label":
        case "type":
        case "uri":
          // exhibit internals, skip
          break;
        default:
          o_data[prop] = db.getObject(o_item, prop);
      }
    });
    if (scope[o_data.branch] === undefined) scope[o_data.branch] = {};
    scope[o_data.branch][o_data.app] = o_data;
  });
  var people = {}
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
  var TO = [], CC = [];
  function v_gather(r, emaillist) {
    function real_visit(p) {
      if (!(p in people)) return; // already dealt with
      var person = people[p];
      delete people[p];
      rolepeople[r].push(person);
      rolenames[r].push(person.name);
      emaillist.push(person.fullname +  " <" + person.email + ">")
    }
    return real_visit;
  }
  roles.owner.visit(v_gather('owner', TO));
  rolenames.owner.sort();
  roles.mentor.visit(v_gather('mentor', TO));
  rolenames.mentor.sort();
  roles.peer.visit(v_gather('peer', CC));
  rolenames.peer.sort();
  scope.all_names = rolenames.owner.concat(rolenames.mentor, rolenames.peer);
  var ejs = require('ejs');
  var sub = ejs.render($("#subject").val(), scope);
  var content = ejs.render($("#template").val(), scope);
  $("#subject-preview").val(sub);
  $("#preview").val(content);
  $("#preview-data").text(JSON.stringify(scope, null, " "));
  $("#TO").val(TO.join(", "));
  $("#CC").val(CC.join(", "));
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

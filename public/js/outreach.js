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
  $("#btn-save-mail").click(uploadAndMail);
});
var data, locales;
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
  locales = new Exhibit.Set();
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
  var blob = gatherBlob(locale, db);
  var scope = blob.scope
    , TO = blob.TO
    , CC = blob.CC;
  $("#preview-data").text(JSON.stringify(scope, null, " "));
  var ejs = require('ejs');
  var sub = ejs.render($("#subject").val(), scope);
  var content = ejs.render($("#template").val(), scope);
  $("#subject-preview").val(sub);
  $("#preview").val(content);
  $("#TO").val(TO.join(", "));
  $("#CC").val(CC.join(", "));
}

function gatherBlob(locale, db) {
  // create scope
  var scope = {
    locale: {
      code: locale,
      name: db.getObject(locale, 'name')
    }
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
  // hack! ja-JP-mac owners are ja
  locale = locale == 'ja-JP-mac' ? 'ja' : locale;
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
  scope.author = author;
  return {
    scope: scope,
    TO: TO,
    CC: CC
  };
}

function uploadData(variant, data, callback) {
  $.post('/outreach/upload', {variant: variant, data: data}, callback);
}

function uploadJSON(callback) {
  uploadData('json', JSON.parse($("#json").val()), callback);
}

function uploadTemplate(callback) {
  uploadData('template', {
    subject: $("#subject").val(),
    body: $("#template").val()
  }, callback);
}

function uploadBlobs(callback) {
  var blobs = []
    , db = exhibit.getDatabase();
  locales.visit(function (locale) {
    blobs.push(gatherBlob(locale, db));
  })
  uploadData('blobs', blobs, callback)
}

function uploadAndMail() {
  var pending = 0;
  function cb(success) {
    console.log(success);
    --pending;
    if (pending <= 0) {
      window.location = '/mail';
    }
  }
  ++pending; uploadJSON(cb);
  ++pending; uploadTemplate(cb);
  ++pending; uploadBlobs(cb);
}

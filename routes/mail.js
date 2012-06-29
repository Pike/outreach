/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var util = require('util');
var email = require('emailjs');
var serverconfig = require('../server-settings');
var server;

/*
 * GET send mail form.
 */
exports.index = function(req, res) {
  var args = req.templateArgs, blob, proc;
  args.subject_template = args.body_template = undefined;
  args.data = args.TO = args.CC = undefined;
  if (!req.session.template) {
    res.redirect('/outreach');
    return;
  }
  if (req.session.template && req.session.blobs.length) {
    args.subject_template = req.session.template.subject || undefined;
    args.body_template = req.session.template.body || '';
    if (req.session.processing === undefined) {
      req.session.processing = req.session.blobs.map(function(blob, i) {
        return {
          class: 'pending',
          locale: blob.scope.locale.code
        };
      });
    }
    proc = req.session.processing;
    var i, ii;
    for (i=0, ii=proc.length; i<ii; ++i) {
      if (proc[i].class == 'pending') break;
    }
    blob = req.session.blobs[i];
    proc[i].class = 'processing';
    args.data = blob.scope;
    args.TO = blob.TO;
    args.CC = blob.CC;
    args.processing = proc;
  }
  args.extra_scripts = ['/ejs/ejs.js',
                        '/js/mail.js'];
  args.alerts = {
    pending: "alert-info",
    sending: "alert-info",
    skipped: "alert-info",
    sent:"alert-success",
    processing:"alert-info",
    failed:"alert-error"
    };

  if (blob) {
    args.title = 'Send outreach mail [' + blob.scope.locale.code + ']';
  }
  else {
    args.title = "Sent emails"
  }
  res.render('mail', args);
};

/*
 * POST outreach data, template or json
 */
exports.send = function(req, res) {
  var proc = req.session.processing;
  var doSend = req.body.send == "yes";
  var i, ii;
  for (i=0, ii=proc.length; i<ii; ++i) {
    if (proc[i].locale == req.body.locale) break;
  }
  proc[i].class = doSend ? 'sending' : 'skipped';
  if (doSend) {
    if (!server) {
      server = email.server.connect(serverconfig);
    }
    var doc = {
      to: req.body.TO,
      from: req.session.fullname + " <" + req.session.email + ">",
      cc: req.body.CC,
      bcc: req.body.BCC,
      subject: req.body.subject,
      text: req.body.text
    }
    server.send(doc, function(err, message) {
      proc[i].class = err ? 'failed' : 'sent';
      if (err) console.log(err, proc[i].locale);
      req.session.save();
    })
  }
  else {
    
  }
  res.redirect('/mail');
};

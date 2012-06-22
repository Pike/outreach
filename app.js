/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , sessionTemplateArgs = require('./lib/middleware').sessionTemplateArgs;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'DoNoTrack' }));
  app.use(sessionTemplateArgs());
  app.use(app.router);
  app.use('/exhibit3/', express.static(__dirname + '/vendor/exhibit3/scripted/dist/'));
  app.use('/data/', express.static(__dirname + '/data'));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/profile', routes.profile.show);
app.post('/profile', routes.profile.change);
app.get('/people.json', routes.people.all);
app.get('/person/:email?', routes.people.person);
app.post('/person/:email', routes.people.save_person);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

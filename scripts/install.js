/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var spawn = require('child_process').spawn;
var path = require('path');
var url = require('url');

//console.log(process.env);

function doStdOut(data) {
  process.stdout.write(data);
}
function doStdErr(data) {
  process.stderr.write(data);
}

// update git submodule, like exhibit3
function git_submodule(next) {
  console.log('git submodule update');
  var gitsub = spawn('git', ['submodule', 'update', '--init', '--recursive']);
  gitsub.stdout.on("data", doStdOut);
  gitsub.stderr.on("data", doStdErr);
  gitsub.on("exit", next);
}

// clean and dist exhibit3
function exhibit3(next) {
  var scripted = 'vendor/exhibit3/scripted';
  console.log('ant clean dist in ' + scripted);
  var ant = spawn('ant', ['clean', 'dist'], {cwd: scripted});
  ant.stdout.on("data", doStdOut);
  ant.stderr.on("data", doStdErr);
  ant.on("exit", next);
}

// update or build people repo
function createPeople(next) {
  console.log('building or updating people data');
  if ((process.env.npm_config_people === undefined) && (!path.existsSync('people/.git'))) {
    console.log('\n\nspecify --people path-to-bundle\n');
    next();
    return;
  }
  function gitinit(next) {
    var _gitinit = spawn('git', ['init', 'people']);
    _gitinit.stdout.on("data", doStdOut);
    _gitinit.stderr.on("data", doStdErr);
    _gitinit.on("exit", next);
  }
  function gitremote(next) {
    var bundleurl = url.resolve('file://' + process.cwd(), process.env.npm_config_people);
    var bundle = url.parse(bundleurl);
    var remote = bundle.protocol == 'file:' ? bundle.path : bundleurl;
    var _gitremote = spawn('git', ['remote', 'add', 'origin', remote], {cwd: 'people'});
    _gitremote.stdout.on("data", doStdOut);
    _gitremote.stderr.on("data", doStdErr);
    _gitremote.on("exit", next);
  }
  function gitpull(next) {
    var _gitpull = spawn('git', ['pull', 'origin', 'master'], {cwd: 'people'});
    _gitpull.stdout.on("data", doStdOut);
    _gitpull.stderr.on("data", doStdErr);
    _gitpull.on("exit", next);
  }
  // add tasks in reverse order, so they get shifted in order.
  tasks.unshift(gitpull);
  if (!path.existsSync('people/.git')) {
    tasks.unshift(gitremote);
    tasks.unshift(gitinit);
  }
  next();
}

var tasks = [git_submodule, exhibit3, createPeople];

function doTask() {
  if (tasks.length) {
    var t = tasks.shift();
    t(doTask);
  }
  else {
    console.log('\ninstallation went fine, now `npm start`');
  }
}
doTask();

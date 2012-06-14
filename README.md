Outreach
========

Outreach is a node app that helps you to touch base with localizers.
It's intended to be used by mozilla staff, and relies on a separate repo
containing the actual data.

Setup
=====

You'll first need node. This app is developed against [node 0.6.19][node].
I suggest that you install it in a virtualenv, just to be sure.

[node]: http://nodejs.org/dist/v0.6.19/node-v0.6.19.tar.gz

I'll write something up on a wikipage here later, but the overview is

* install node.js, in a virtualenv if you like
* git clone outreach
* cd outreach; npm install express ejs
* npm install --people path-to-people.bundle
* npm start

and then surf to http://localhost:3000/.
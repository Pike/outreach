/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

$(
  function() {
    $('.p-email').click(toggleEmail);
    $('.p-role').click(toggleRole);
    $('#add-role').click(addRole);
  }
);

function toggleEmail(e) {
  try {
    var self = $(this);
    var em = self.parent().children("input[type=email]")[0];
    em.disabled = !em.disabled;
    if (em.disabled) {
      $(em).removeAttr('name');
      self
        .removeClass('btn-danger')
        .children('i')
          .removeClass('icon-white icon-trash')
          .addClass('icon-plus');
    }
    else {
      $(em).attr('name', self.attr('data-option'));
      self
        .addClass('btn-danger')
        .children('i')
          .addClass('icon-white icon-trash')
          .removeClass('icon-plus');
    }
  }
  catch (e) {
    console.log(e);
  }
  return false;
}


function toggleRole(e) {
  try {
    var self = $(this);
    var elems = self
      .parent()
      .children('select,input')
        .each(function _toggleDisabled(i, e) {
          e.disabled =! e.disabled;
          });
    if (elems[0].disabled) {
      $(elems).removeAttr('name');
      self
        .removeClass('btn-danger')
        .children('i')
          .removeClass('icon-white icon-trash')
          .addClass('icon-plus');
    }
    else {
      var rnum = self.attr('data-role');
      var names = ['role_' + rnum + '_role',
                   'role_' + rnum + '_locale',
                   'role_' + rnum + '_product'];
      $(elems).each(function _addName(i, e) {
        $(e).attr('name', names.shift());
      });
      self
        .addClass('btn-danger')
        .children('i')
          .addClass('icon-white icon-trash')
          .removeClass('icon-plus');
    }
  }
  catch (e) {
    console.log(e);
  }
  return false;
}

function addRole(e) {
  try {
    var self = $(this);
    var newrow = $("#role-template")
      .clone()
      .removeClass("hidden")
      .removeAttr("id");
    var rnum = 0;
    self.parent().find("a.p-role").each(function(i, e) {
      rnum = Math.max(rnum, e.dataset.role||0);
      });
    ++rnum;
    var names = ['role_' + rnum + '_role',
                 'role_' + rnum + '_locale',
                 'role_' + rnum + '_product'];
    newrow.find("select,input").each(
      function _enableAndName(i, e) {
        e.disabled = false;
        e.name = names.shift();
      }
    );
    newrow.insertBefore(self);
    newrow.children()
      .children("a.p-role")
      .click(toggleRole)
      .attr('data-role', rnum);
  }
  catch (e) {
    console.log(e);
  }
  return false;
}
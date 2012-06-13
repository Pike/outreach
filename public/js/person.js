/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

$(
  function() {
    console.log('doc loaded');
    $('.p-email').click(toggleEmail);
  }
)

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

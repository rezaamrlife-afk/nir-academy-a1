/* NIR Academy · "Listen and check the correct photo" activities
   Works on any <fieldset data-listen-check data-correct="N"> that contains radio buttons.
   - data-correct is the value of the correct radio (for example "2").
   - While data-correct is empty the choice cannot be checked, and the page says so honestly.
   Everything runs locally in the browser; nothing is stored. */
(function () {
  'use strict';

  Array.prototype.forEach.call(document.querySelectorAll('[data-listen-check]'), function (box) {
    var radios = Array.prototype.slice.call(box.querySelectorAll('input[type="radio"]'));
    var feedback = box.querySelector('.lc-feedback');
    var correct = (box.getAttribute('data-correct') || '').trim();
    var noun = box.getAttribute('data-lc-noun') || 'photo';
    var Noun = noun.charAt(0).toUpperCase() + noun.slice(1);
    var hasKey = !!correct && radios.some(function (r) { return r.value === correct; });

    function optionOf(radio) { return radio.closest('.vp-option') || radio.parentNode; }
    function clearMarks() {
      radios.forEach(function (r) {
        var o = optionOf(r);
        o.classList.remove('is-correct', 'is-wrong');
        r.removeAttribute('aria-invalid');
      });
      if (feedback) { feedback.textContent = ''; feedback.className = 'lc-feedback'; }
    }
    function say(msg, kind) {
      if (!feedback) return;
      feedback.textContent = msg;
      feedback.className = 'lc-feedback' + (kind ? ' is-' + kind : '');
    }
    function selected() {
      for (var i = 0; i < radios.length; i++) if (radios[i].checked) return radios[i];
      return null;
    }

    function check() {
      clearMarks();
      var sel = selected();
      if (!sel) { say('Choose a ' + noun + ' first, then press Check answer.', 'info'); return; }
      if (!hasKey) {
        say(Noun + ' ' + sel.value + ' selected. The answer key for this activity has not been added yet, so it cannot be checked.', 'info');
        return;
      }
      if (sel.value === correct) {
        optionOf(sel).classList.add('is-correct');
        say('✓ Correct! ' + Noun + ' ' + sel.value + ' is right.', 'ok');
      } else {
        optionOf(sel).classList.add('is-wrong');
        sel.setAttribute('aria-invalid', 'true');
        say('✗ Not quite. Listen again and try another ' + noun + '.', 'bad');
      }
    }
    function reset() {
      radios.forEach(function (r) { r.checked = false; });
      clearMarks();
      if (radios[0]) radios[0].focus();
    }

    box.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-lc-action]') : null;
      if (!btn || !box.contains(btn)) return;
      if (btn.getAttribute('data-lc-action') === 'check') check(); else reset();
    });
    /* changing the choice removes the old result so it never looks out of date */
    box.addEventListener('change', clearMarks);
  });
})();

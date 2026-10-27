/* NIR Academy · Where is it? pairwork: check / show answers / reset for each student's "Ask your partner" list.
   Accepts "the US", "US", "USA", "United States" etc. Runs locally; nothing is stored. */
(function () {
  'use strict';
  function norm(v) {
    return String(v || '').toLowerCase().replace(/[‘’`´]/g, "'").replace(/[^a-z\s']/g, ' ').replace(/\s+/g, ' ').trim().replace(/^the /, '');
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-wi]'), function (panel) {
    var items = Array.prototype.slice.call(panel.querySelectorAll('.wi-item[data-answer]'));
    var score = panel.querySelector('.wi-score');
    function field(it) { return it.querySelector('input'); }
    function accepted(it) { return it.getAttribute('data-answer').split('|').map(norm); }
    function mark(it, state, text) {
      it.classList.remove('is-correct', 'is-wrong', 'is-shown');
      field(it).removeAttribute('aria-invalid');
      if (state) it.classList.add('is-' + state);
      if (state === 'wrong') field(it).setAttribute('aria-invalid', 'true');
      it.querySelector('.wi-fb').textContent = text || '';
    }
    function lock(on) { items.forEach(function (it) { field(it).disabled = on; }); }
    function check() {
      lock(false);
      var ok = 0, blank = 0;
      items.forEach(function (it) {
        var v = norm(field(it).value);
        if (!v) { blank++; mark(it, null, 'Not answered yet'); return; }
        if (accepted(it).indexOf(v) > -1) { ok++; mark(it, 'correct', '✓ Correct'); } else mark(it, 'wrong', '✗ Try again');
      });
      score.className = 'lc-feedback wi-score ' + (ok === items.length ? 'is-ok' : '');
      score.textContent = 'Score: ' + ok + ' / ' + items.length + (blank ? ' · ' + blank + ' not answered' : '') + (ok === items.length ? ' · Well done!' : '');
    }
    function show() {
      items.forEach(function (it) {
        field(it).value = it.getAttribute('data-answer').split('|')[0];
        mark(it, 'shown', 'Answer shown');
      });
      lock(true);
      score.className = 'lc-feedback wi-score'; score.textContent = 'Answers are shown. Press Reset to try again.';
    }
    function reset() {
      lock(false);
      items.forEach(function (it) { field(it).value = ''; mark(it, null, ''); });
      score.className = 'lc-feedback wi-score'; score.textContent = '';
      if (items[0]) field(items[0]).focus();
    }
    panel.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-wi-action]') : null;
      if (!b || !panel.contains(b)) return;
      var a = b.getAttribute('data-wi-action');
      if (a === 'check') check(); else if (a === 'show') show(); else reset();
    });
    panel.addEventListener('input', function (e) {
      var it = e.target.closest ? e.target.closest('.wi-item') : null;
      if (it && it.className.indexOf('is-') > -1) { mark(it, null, ''); score.textContent = 'Press Check answers to see your score.'; score.className = 'lc-feedback wi-score'; }
    });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.type === 'text') { e.preventDefault(); check(); }
    });
  });
})();

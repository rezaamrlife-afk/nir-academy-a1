/* NIR Academy · "Write the days of the week" (today / tomorrow / the weekend)
   Today and tomorrow are checked against the date on the device; the weekend is Saturday and Sunday (either order).
   Runs locally; nothing is stored. */
(function () {
  'use strict';
  var form = document.getElementById('days-fill');
  if (!form) return;
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var fb = document.getElementById('df-feedback');
  var inputs = Array.prototype.slice.call(form.querySelectorAll('input[data-df]'));
  var weekend = inputs.filter(function (i) { return i.getAttribute('data-df') === 'weekend'; });

  function n(v) { return String(v || '').trim().toLowerCase(); }
  function clear() {
    inputs.forEach(function (i) {
      i.removeAttribute('aria-invalid');
      i.classList.remove('is-correct', 'is-wrong');
    });
    fb.textContent = ''; fb.className = 'lc-feedback';
  }
  function mark(i, ok) { i.classList.add(ok ? 'is-correct' : 'is-wrong'); if (!ok) i.setAttribute('aria-invalid', 'true'); }

  document.getElementById('df-check').addEventListener('click', function () {
    clear();
    var d = new Date().getDay(), today = DAYS[d], tomorrow = DAYS[(d + 1) % 7];
    var ok = 0, total = 4, blank = 0;
    inputs.forEach(function (i) { if (!n(i.value)) blank++; });
    var t = form.querySelector('[data-df="today"]'), m = form.querySelector('[data-df="tomorrow"]');
    if (n(t.value)) { var a = n(t.value) === today.toLowerCase(); mark(t, a); if (a) ok++; }
    if (n(m.value)) { var b = n(m.value) === tomorrow.toLowerCase(); mark(m, b); if (b) ok++; }
    var w = weekend.map(function (i) { return n(i.value); });
    var set = ['saturday', 'sunday'];
    weekend.forEach(function (i, k) {
      var v = w[k]; if (!v) return;
      var good = set.indexOf(v) > -1 && w[0] !== w[1];
      mark(i, good); if (good) ok++;
    });
    if (blank === total) { fb.textContent = 'Write your answers first, then press Check answers.'; fb.className = 'lc-feedback is-info'; return; }
    fb.textContent = (ok === total ? '✓ Well done! ' : '') + 'Score: ' + ok + ' / ' + total + (blank ? ' · ' + blank + ' not answered' : '') +
      (ok < total ? ' · Check the capital letters and spelling.' : '');
    fb.className = 'lc-feedback ' + (ok === total ? 'is-ok' : 'is-bad');
  });
  form.addEventListener('input', clear);
  form.addEventListener('reset', clear);
})();

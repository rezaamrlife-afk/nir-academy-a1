/* NIR Academy · Lesson 1B pronunciation and he/she listening.
   - "Repeated" ticks with a progress message in every [data-rep-root] card.
   - "Listen and choose" quiz for the five he/she sentence pairs (device voice; hidden when speech is not available).
   Runs locally; nothing is stored. */
(function () {
  'use strict';

  /* repeat ticks */
  Array.prototype.forEach.call(document.querySelectorAll('[data-rep-root]'), function (root) {
    Array.prototype.forEach.call(root.querySelectorAll('.vocab-repeat'), function (sec) {
      var boxes = Array.prototype.slice.call(sec.querySelectorAll('[data-rep]'));
      var prog = sec.querySelector('[data-rep-progress]');
      /* the progress line of a section counts the ticks of the section (or of the card for the "practise" part) */
      if (!prog) return;
      var scope = boxes.length ? boxes : Array.prototype.slice.call(root.querySelectorAll('[data-rep]'));
      function update() {
        var n = scope.filter(function (b) { return b.checked; }).length;
        prog.className = 'lc-feedback phrase-progress' + (n === scope.length ? ' is-ok' : '');
        prog.textContent = n === 0 ? '' : (n === scope.length ? '✓ Well done! You repeated all ' + n + '.' : n + ' / ' + scope.length + ' repeated');
      }
      scope.forEach(function (b) {
        b.addEventListener('change', function () {
          var card = b.closest('.phrase-card, .hs-line'); if (card) card.classList.toggle('is-done', b.checked);
          update();
        });
      });
    });
  });

  /* he / she quiz */
  var quiz = document.getElementById('hs-quiz');
  if (!quiz || !('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') return;
  quiz.hidden = false;
  var pairs = Array.prototype.map.call(document.querySelectorAll('#heshe-1b [data-pair]'), function (li) {
    return { a: li.getAttribute('data-a'), b: li.getAttribute('data-b') };
  });
  var playBtn = document.getElementById('hs-play'), optsEl = document.getElementById('hs-options'),
      fb = document.getElementById('hs-feedback'), scoreEl = document.getElementById('hs-score'),
      retry = document.getElementById('hs-retry');
  var order = [], idx = -1, current = null, answered = true, right = 0, tries = 0;

  function speak(text) {
    try {
      var ss = window.speechSynthesis; ss.cancel();
      var u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB'; u.rate = 0.8;
      var v = (ss.getVoices() || []).filter(function (x) { return /^en[-_]GB/i.test(x.lang); })[0];
      if (v) u.voice = v;
      ss.speak(u);
    } catch (e) { /* ignore */ }
  }
  function shuffle(a) { return a.sort(function () { return Math.random() - 0.5; }); }
  function start() {
    order = shuffle(pairs.map(function (p, i) { return i; })); idx = -1; right = 0; tries = 0;
    optsEl.innerHTML = ''; fb.textContent = ''; fb.className = 'lc-feedback'; scoreEl.textContent = ''; retry.hidden = true;
    answered = true; current = null; playBtn.textContent = 'Play'; playBtn.hidden = false;
  }
  function next() {
    idx++;
    if (idx >= order.length) { finish(); return; }
    var p = pairs[order[idx]];
    current = { pair: p, side: Math.random() < 0.5 ? 'a' : 'b' };
    answered = false; fb.textContent = ''; fb.className = 'lc-feedback';
    optsEl.innerHTML = '';
    ['a', 'b'].forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'ws-btn phrase-opt'; b.dataset.side = k; b.textContent = k + '. ' + p[k];
      optsEl.appendChild(b);
    });
    playBtn.textContent = 'Play again';
    scoreEl.textContent = 'Question ' + (idx + 1) + ' / ' + order.length;
    speak(current.pair[current.side]);
  }
  function finish() {
    optsEl.innerHTML = ''; playBtn.hidden = true; retry.hidden = false;
    fb.textContent = (right === order.length ? '✓ Well done! ' : '') + 'Score: ' + right + ' / ' + order.length;
    fb.className = 'lc-feedback ' + (right === order.length ? 'is-ok' : 'is-bad'); scoreEl.textContent = '';
  }
  playBtn.addEventListener('click', function () {
    if (!current || (answered && idx < order.length)) { if (answered && current) { next(); } else if (!current) { next(); } }
    else speak(current.pair[current.side]);
  });
  optsEl.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.phrase-opt') : null;
    if (!b || answered) return;
    answered = true; tries++;
    var ok = b.dataset.side === current.side; if (ok) right++;
    Array.prototype.forEach.call(optsEl.children, function (o) {
      o.disabled = true; if (o.dataset.side === current.side) o.classList.add('is-correct');
    });
    if (!ok) b.classList.add('is-wrong');
    fb.textContent = ok ? '✓ Correct!' : '✗ Not quite. You heard: ' + current.side + '. ' + current.pair[current.side];
    fb.className = 'lc-feedback ' + (ok ? 'is-ok' : 'is-bad');
    scoreEl.textContent = 'Score: ' + right + ' / ' + tries;
    playBtn.textContent = idx + 1 >= order.length ? 'See my score' : 'Next question';
  });
  retry.addEventListener('click', start);
  start();
})();

/* NIR Academy · Words and Phrases to Learn: "I can say it" progress + listen-and-choose quiz.
   Quiz uses the device voice (speechSynthesis); it stays hidden when that is not available.
   Runs locally; nothing is stored. */
(function () {
  'use strict';
  var root = document.getElementById('phrases-activity');
  if (!root) return;

  var boxes = Array.prototype.slice.call(root.querySelectorAll('[data-phrase-done]'));
  var prog = document.getElementById('phrases-progress');
  function updateProgress() {
    var n = boxes.filter(function (b) { return b.checked; }).length;
    prog.textContent = n === 0 ? '' : (n === boxes.length ? '✓ Well done! You can say all ' + n + ' phrases.' : n + ' / ' + boxes.length + ' phrases practised');
    prog.className = 'lc-feedback phrase-progress' + (n === boxes.length ? ' is-ok' : '');
  }
  boxes.forEach(function (b) {
    b.addEventListener('change', function () { b.closest('.phrase-card').classList.toggle('is-done', b.checked); updateProgress(); });
  });

  var quiz = document.getElementById('phrases-quiz');
  if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined' || !quiz) return;
  quiz.hidden = false;

  var phrases = Array.prototype.map.call(root.querySelectorAll('.phrase-card'), function (c) {
    return { text: c.querySelector('.goodbye-phrase').textContent.trim(), say: c.querySelector('[data-say]').getAttribute('data-say') };
  });
  var playBtn = document.getElementById('pq-play'), optsEl = document.getElementById('pq-options'),
      fb = document.getElementById('pq-feedback'), scoreEl = document.getElementById('pq-score');
  var current = null, answered = true, right = 0, tries = 0;

  function speak(text) {
    try {
      var ss = window.speechSynthesis; ss.cancel();
      var u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB'; u.rate = 0.8;
      var v = (ss.getVoices() || []).filter(function (x) { return /^en[-_]GB/i.test(x.lang); })[0];
      if (v) u.voice = v;
      ss.speak(u);
    } catch (e) { /* ignore */ }
  }
  function pick(n, except) {
    var pool = phrases.filter(function (p) { return p !== except; }), out = [];
    while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out;
  }
  function newRound() {
    current = phrases[Math.floor(Math.random() * phrases.length)];
    answered = false; fb.textContent = ''; fb.className = 'lc-feedback';
    var list = pick(2, current); list.push(current);
    list.sort(function () { return Math.random() - 0.5; });
    optsEl.innerHTML = '';
    list.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'ws-btn phrase-opt'; b.textContent = p.text; b.dataset.text = p.text;
      optsEl.appendChild(b);
    });
    playBtn.textContent = 'Play again';
    speak(current.say);
  }
  playBtn.addEventListener('click', function () {
    if (!current || answered) newRound(); else speak(current.say);
  });
  optsEl.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.phrase-opt') : null;
    if (!b || answered) return;
    answered = true; tries++;
    var ok = b.dataset.text === current.text;
    if (ok) right++;
    Array.prototype.forEach.call(optsEl.children, function (o) {
      o.disabled = true;
      if (o.dataset.text === current.text) o.classList.add('is-correct');
    });
    if (!ok) b.classList.add('is-wrong');
    fb.textContent = ok ? '✓ Correct!' : '✗ Not quite. You heard: ' + current.text;
    fb.className = 'lc-feedback ' + (ok ? 'is-ok' : 'is-bad');
    scoreEl.textContent = 'Score: ' + right + ' / ' + tries;
    playBtn.textContent = 'Next phrase';
  });
})();

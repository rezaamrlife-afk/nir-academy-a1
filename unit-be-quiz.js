/* NIR Academy · Lesson 1B quiz: Verb be (singular) — instant feedback, score, Check Answers, Try Again.
   Multiple-choice answers are marked as soon as you choose. Fill-in answers are marked when you press Enter or leave the box.
   Runs locally; nothing is stored. */
(function () {
  'use strict';
  var root = document.getElementById('beQuiz1b');
  if (!root) return;
  var items = Array.prototype.slice.call(root.querySelectorAll('.ws-item[data-answer]'));
  var scoreEl = document.getElementById('beQuizScore');
  var result = document.getElementById('beQuizResult');

  function norm(v) {
    return String(v == null ? '' : v).toLowerCase().replace(/[‘’ʼ`´]/g, "'").replace(/[^a-z'\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function valueOf(it) {
    var t = it.querySelector('input[type="text"]');
    if (t) return t.value;
    var r = it.querySelector('input[type="radio"]:checked');
    return r ? r.value : '';
  }
  function fields(it) { return it.querySelectorAll('input'); }
  function isRight(it) {
    var v = norm(valueOf(it));
    return it.getAttribute('data-answer').split('|').some(function (a) { return norm(a) === v; });
  }
  function mark(it, state) {
    it.classList.remove('is-correct', 'is-wrong', 'is-empty');
    var fb = it.querySelector('.ws-fb');
    Array.prototype.forEach.call(fields(it), function (f) { f.removeAttribute('aria-invalid'); });
    if (!state) { it.removeAttribute('data-state'); fb.textContent = ''; return; }
    it.setAttribute('data-state', state);
    if (state === 'correct') { it.classList.add('is-correct'); fb.textContent = '✓ Correct'; }
    else if (state === 'empty') { it.classList.add('is-empty'); fb.textContent = 'Not answered yet'; }
    else {
      it.classList.add('is-wrong'); fb.textContent = '✗ Try again';
      Array.prototype.forEach.call(fields(it), function (f) { f.setAttribute('aria-invalid', 'true'); });
    }
  }
  function updateScore() {
    var ok = root.querySelectorAll('.ws-item.is-correct').length;
    scoreEl.textContent = ok + ' / ' + items.length;
    return ok;
  }
  function grade(it) {
    if (!valueOf(it).trim()) { mark(it, null); return; }
    mark(it, isRight(it) ? 'correct' : 'wrong');
    updateScore();
  }

  /* instant feedback */
  root.addEventListener('change', function (e) {
    var it = e.target.closest ? e.target.closest('.ws-item') : null;
    if (it && e.target.type === 'radio') grade(it);
    else if (it && e.target.type === 'text') grade(it);
    result.textContent = '';
  });
  root.addEventListener('input', function (e) {
    var it = e.target.closest ? e.target.closest('.ws-item') : null;
    if (it && e.target.type === 'text' && it.getAttribute('data-state')) { mark(it, null); updateScore(); }
  });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.type === 'text') { e.preventDefault(); var it = e.target.closest('.ws-item'); if (it) { grade(it); updateScore(); } }
  });

  document.getElementById('beQuizCheck').addEventListener('click', function () {
    var blank = 0;
    items.forEach(function (it) {
      if (!valueOf(it).trim()) { blank++; mark(it, 'empty'); } else mark(it, isRight(it) ? 'correct' : 'wrong');
    });
    var ok = updateScore();
    result.textContent = 'Score: ' + ok + ' / ' + items.length + (blank ? ' · ' + blank + ' not answered' : '') +
      (ok === items.length ? ' · Well done!' : ok >= 9 ? ' · Very good! Try the red ones again.' : ' · Keep practising. You can do it!');
  });
  document.getElementById('beQuizRetry').addEventListener('click', function () {
    items.forEach(function (it) {
      Array.prototype.forEach.call(fields(it), function (f) { if (f.type === 'radio') f.checked = false; else f.value = ''; });
      mark(it, null);
    });
    updateScore(); result.textContent = '';
    var f = items[0].querySelector('input'); if (f) f.focus();
  });
  updateScore();
})();

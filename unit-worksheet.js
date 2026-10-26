/* NIR Academy · Grammar worksheet (answer checking, scores, Show answers, Reset)
   Works on any page that contains <div id="grammarWorksheet">.
   Each checkable item is an <li class="ws-item" data-answer="a|b"> where "|" separates accepted answers
   (the first one is shown by "Show answers"). Everything runs locally in the browser; nothing is stored. */
(function () {
  'use strict';
  var root = document.getElementById('grammarWorksheet');
  if (!root) return;

  var totalEl = document.getElementById('wsTotal');
  var allItems = root.querySelectorAll('.ws-item[data-answer]');

  /* lower-case, straight apostrophes, no punctuation, single spaces */
  function norm(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/[‘’ʼ`´]/g, "'")
      .replace(/[^\p{L}\p{N}'\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function fieldsOf(item) { return item.querySelectorAll('select, input[type="text"], input[type="radio"]'); }
  function getVal(item) {
    var f = item.querySelector('select, input[type="text"]');
    if (f) return f.value;
    var r = item.querySelector('input[type="radio"]:checked');
    return r ? r.value : '';
  }
  function setVal(item, v) {
    var f = item.querySelector('select, input[type="text"]');
    if (f) { f.value = v; return; }
    Array.prototype.forEach.call(item.querySelectorAll('input[type="radio"]'), function (r) { r.checked = (norm(r.value) === norm(v)); });
  }
  function answersOf(item) { return item.getAttribute('data-answer').split('|'); }
  function isRight(item) {
    var v = norm(getVal(item));
    return answersOf(item).some(function (a) { return norm(a) === v; });
  }

  var LABEL = { correct: '✓ Correct', wrong: '✗ Try again', empty: 'Not answered yet', shown: 'Answer shown' };
  function mark(item, state) {
    item.classList.remove('is-correct', 'is-wrong', 'is-shown', 'is-empty');
    var fb = item.querySelector('.ws-fb');
    Array.prototype.forEach.call(fieldsOf(item), function (f) { f.removeAttribute('aria-invalid'); });
    if (!state) { item.removeAttribute('data-state'); if (fb) fb.textContent = ''; return; }
    item.setAttribute('data-state', state);
    if (state === 'correct') item.classList.add('is-correct');
    else if (state === 'shown') item.classList.add('is-shown');
    else if (!getVal(item).trim()) item.classList.add('is-empty');
    else {
      item.classList.add('is-wrong');
      Array.prototype.forEach.call(fieldsOf(item), function (f) { f.setAttribute('aria-invalid', 'true'); });
    }
    if (fb) fb.textContent = LABEL[state === 'wrong' && !getVal(item).trim() ? 'empty' : state];
  }

  function updateTotal() {
    if (!totalEl) return;
    var ok = root.querySelectorAll('.ws-item.is-correct').length;
    totalEl.textContent = ok + ' / ' + allItems.length;
  }
  function itemsIn(sec) { return sec.querySelectorAll('.ws-item[data-answer]'); }
  function scoreEl(sec) { return sec.querySelector('.ws-score'); }

  function check(sec) {
    var items = itemsIn(sec), ok = 0, blank = 0;
    Array.prototype.forEach.call(items, function (it) {
      if (it.getAttribute('data-state') === 'shown') return;
      if (!getVal(it).trim()) { blank++; mark(it, 'wrong'); return; }
      if (isRight(it)) { ok++; mark(it, 'correct'); } else mark(it, 'wrong');
    });
    var shown = sec.querySelectorAll('.ws-item[data-state="shown"]').length;
    if (shown === items.length) { scoreEl(sec).textContent = 'Answers are shown. Press Reset to try again.'; }
    else {
      scoreEl(sec).textContent = 'Score: ' + ok + ' / ' + items.length + (blank ? ' · ' + blank + ' not answered' : '') + (ok === items.length ? ' · Well done!' : '');
    }
    updateTotal();
  }
  function show(sec) {
    Array.prototype.forEach.call(itemsIn(sec), function (it) {
      setVal(it, answersOf(it)[0]);
      Array.prototype.forEach.call(fieldsOf(it), function (f) { f.disabled = true; });
      mark(it, 'shown');
    });
    scoreEl(sec).textContent = 'Answers are shown. Press Reset to try again.';
    updateTotal();
  }
  function reset(sec, focusFirst) {
    Array.prototype.forEach.call(itemsIn(sec), function (it) {
      Array.prototype.forEach.call(fieldsOf(it), function (f) {
        f.disabled = false;
        if (f.type === 'radio') f.checked = false; else f.value = '';
      });
      mark(it, null);
    });
    scoreEl(sec).textContent = '';
    updateTotal();
    if (focusFirst) { var f = sec.querySelector('select, input[type="text"], input[type="radio"]'); if (f) f.focus(); }
  }
  function clearFlexible(sec) {
    Array.prototype.forEach.call(sec.querySelectorAll('input[type="text"]'), function (f) { f.value = ''; });
    Array.prototype.forEach.call(sec.querySelectorAll('input[type="checkbox"]'), function (c) { c.checked = false; });
    var first = sec.querySelector('input'); if (first) first.focus();
  }

  root.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-ws-action]') : null;
    if (!btn || !root.contains(btn)) return;
    var sec = btn.closest('.ws-section'); if (!sec) return;
    var act = btn.getAttribute('data-ws-action');
    if (act === 'check') check(sec);
    else if (act === 'show') show(sec);
    else if (act === 'reset') reset(sec, true);
    else if (act === 'clear') clearFlexible(sec);
  });

  var resetAll = document.getElementById('wsResetAll');
  if (resetAll) resetAll.addEventListener('click', function () {
    Array.prototype.forEach.call(root.querySelectorAll('.ws-section[data-ws-section]:not(.ws-flex)'), function (s) { reset(s, false); });
  });

  /* editing an answer clears its old mark so the score is never out of date */
  function onEdit(e) {
    var it = e.target.closest ? e.target.closest('.ws-item[data-answer]') : null;
    if (!it || it.getAttribute('data-state') === 'shown') return;
    if (it.getAttribute('data-state')) {
      mark(it, null);
      var sec = it.closest('.ws-section');
      if (sec) scoreEl(sec).textContent = 'Press Check answers to see your score.';
      updateTotal();
    }
  }
  root.addEventListener('input', onEdit);
  root.addEventListener('change', onEdit);

  /* Enter in a text box checks that exercise */
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || !e.target || e.target.type !== 'text') return;
    var sec = e.target.closest('.ws-section');
    if (sec && !sec.classList.contains('ws-flex') && e.target.closest('.ws-item[data-answer]')) { e.preventDefault(); check(sec); }
  });

  updateTotal();
})();

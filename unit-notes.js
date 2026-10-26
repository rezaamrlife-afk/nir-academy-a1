/* NIR Academy · "My Notes" (shared by unit-1.html, unit-2.html, ...)
   - Adds a small "My Notes" button and a notepad dialog to any unit page.
   - Notes are stored only in this browser (localStorage), separately for each unit.
   - The unit number comes from the file name (unit-N.html) or <body data-unit="N">.
   - No libraries, no server, no database. */
(function () {
  'use strict';

  var match = /unit-(\d+)\.html/i.exec(window.location.pathname);
  var unitId = (document.body && document.body.getAttribute('data-unit')) || (match ? match[1] : null);
  if (!unitId) return;

  var KEY = 'nirAcademy.a1.notes.unit-' + unitId + '.v1';
  var MAX_LEN = 5000;
  var MAX_NOTES = 200;

  /* ---------- storage (access itself can throw in private mode or when blocked) ---------- */
  function getStore() {
    try {
      var s = window.localStorage, t = '__nir_notes_probe__';
      s.setItem(t, '1'); s.removeItem(t);
      return s;
    } catch (e) { return null; }
  }
  var store = getStore();

  function clean(raw) {
    var out = { notes: [], draft: '' };
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    if (typeof raw.draft === 'string') out.draft = raw.draft.slice(0, MAX_LEN);
    if (Array.isArray(raw.notes)) {
      raw.notes.slice(0, MAX_NOTES).forEach(function (n) {
        if (!n || typeof n !== 'object') return;
        if (typeof n.text !== 'string' || !n.text.trim()) return;
        var created = typeof n.created === 'number' && isFinite(n.created) ? n.created : Date.now();
        var updated = typeof n.updated === 'number' && isFinite(n.updated) ? n.updated : created;
        out.notes.push({
          id: typeof n.id === 'string' && n.id ? n.id.slice(0, 40) : makeId(),
          text: n.text.slice(0, MAX_LEN),
          created: created,
          updated: updated
        });
      });
    }
    return out;
  }
  function makeId() { return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function load() {
    if (!store) return clean(null);
    try { var r = store.getItem(KEY); return r === null ? clean(null) : clean(JSON.parse(r)); }
    catch (e) { return clean(null); }
  }
  function save() {
    if (!store) return false;
    try { store.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { return false; }
  }

  var state = load();
  var ui = { editing: null, confirming: null };

  /* ---------- DOM helpers ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function fmt(ts) {
    try { return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (e) { return new Date(ts).toLocaleString(); }
  }

  /* ---------- build UI ---------- */
  var titleEl = document.getElementById('unitTitle');
  var unitName = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';

  var fab = el('button', 'notes-fab');
  fab.type = 'button';
  fab.setAttribute('aria-haspopup', 'dialog');
  fab.setAttribute('aria-controls', 'unitNotesDialog');
  fab.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
  var fabLabel = el('span', 'notes-fab-label', 'My Notes');
  var fabCount = el('span', 'notes-count');
  fab.appendChild(fabLabel);
  fab.appendChild(fabCount);

  var dialog = el('dialog', 'notes-dialog');
  dialog.id = 'unitNotesDialog';
  dialog.setAttribute('aria-labelledby', 'unitNotesTitle');

  var head = el('div', 'notes-head');
  var headText = el('div');
  var kicker = el('span', 'notes-kicker', 'Unit ' + unitId + ' · personal notes');
  var title = el('h2', null, 'My Notes');
  title.id = 'unitNotesTitle';
  headText.appendChild(kicker);
  headText.appendChild(title);
  if (unitName) headText.appendChild(el('p', 'notes-unit', unitName));
  var closeBtn = el('button', 'notes-close');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close My Notes');
  closeBtn.innerHTML = '<span aria-hidden="true">×</span>';
  head.appendChild(headText);
  head.appendChild(closeBtn);

  var body = el('div', 'notes-body');

  var newLabel = el('label', 'notes-label', 'Write a new note');
  newLabel.setAttribute('for', 'unitNotesNew');
  var newArea = el('textarea', 'notes-textarea');
  newArea.id = 'unitNotesNew';
  newArea.rows = 4;
  newArea.maxLength = MAX_LEN;
  newArea.setAttribute('dir', 'auto');
  newArea.setAttribute('aria-describedby', 'unitNotesHint');
  newArea.placeholder = 'New words, rules, questions to ask your teacher…';
  var hint = el('p', 'notes-hint', 'Your draft is saved automatically as you type.');
  hint.id = 'unitNotesHint';
  var addBtn = el('button', 'notes-btn notes-btn-primary', 'Add note');
  addBtn.type = 'button';
  var addRow = el('div', 'notes-row');
  addRow.appendChild(addBtn);

  var status = el('p', 'notes-status');
  status.id = 'unitNotesStatus';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  var listHead = el('h3', 'notes-list-title', 'Saved notes');
  var list = el('ul', 'notes-list');
  list.setAttribute('aria-label', 'Saved notes for Unit ' + unitId);
  var empty = el('p', 'notes-empty', 'No notes yet. Your notes for this unit will appear here.');

  body.appendChild(newLabel);
  body.appendChild(newArea);
  body.appendChild(hint);
  body.appendChild(addRow);
  body.appendChild(status);
  body.appendChild(listHead);
  body.appendChild(empty);
  body.appendChild(list);

  var foot = el('p', 'notes-foot', store
    ? 'Notes are saved only on this device and in this browser. Each unit has its own notes.'
    : 'Saving is unavailable in this browser. Notes will be lost when you leave this page.');

  dialog.appendChild(head);
  dialog.appendChild(body);
  dialog.appendChild(foot);

  document.body.appendChild(fab);
  document.body.appendChild(dialog);
  document.body.classList.add('has-notes');

  /* ---------- behaviour ---------- */
  var statusTimer;
  function say(msg, isError) {
    status.textContent = msg;
    status.classList.toggle('is-error', !!isError);
    clearTimeout(statusTimer);
    if (msg && !isError) statusTimer = setTimeout(function () { status.textContent = ''; }, 3500);
  }
  function persist(okMsg) {
    var ok = save();
    if (!ok) say(store ? 'Could not save. Your browser storage may be full or blocked.' : 'Saving is unavailable in this browser. This note will be lost when you leave the page.', true);
    else if (okMsg) say(okMsg);
    return ok;
  }

  function updateCount() {
    var n = state.notes.length;
    fabCount.textContent = n ? String(n) : '';
    fabCount.hidden = !n;
    fab.setAttribute('aria-label', n ? 'My Notes, ' + n + (n === 1 ? ' note' : ' notes') : 'My Notes');
  }

  function render(focusSel) {
    updateCount();
    empty.hidden = state.notes.length > 0;
    list.hidden = state.notes.length === 0;
    list.textContent = '';
    state.notes.forEach(function (note, i) {
      var li = el('li', 'notes-item');
      li.setAttribute('data-id', note.id);
      var num = i + 1;

      if (ui.editing === note.id) {
        var lab = el('label', 'notes-label', 'Edit note ' + num);
        var ta = el('textarea', 'notes-textarea');
        ta.id = 'unitNotesEdit';
        lab.setAttribute('for', ta.id);
        ta.rows = 4; ta.maxLength = MAX_LEN; ta.value = note.text;
        ta.setAttribute('dir', 'auto');
        var row = el('div', 'notes-row');
        var saveB = el('button', 'notes-btn notes-btn-primary', 'Save changes'); saveB.type = 'button';
        var cancelB = el('button', 'notes-btn', 'Cancel'); cancelB.type = 'button';
        saveB.addEventListener('click', function () {
          var v = ta.value.trim();
          if (!v) { say('A note cannot be empty. Delete it instead, or write something.', true); ta.focus(); return; }
          note.text = v.slice(0, MAX_LEN); note.updated = Date.now();
          ui.editing = null;
          persist('Note updated.');
          render('[data-id="' + note.id + '"] [data-act="edit"]');
        });
        cancelB.addEventListener('click', function () {
          ui.editing = null; say('');
          render('[data-id="' + note.id + '"] [data-act="edit"]');
        });
        row.appendChild(saveB); row.appendChild(cancelB);
        li.appendChild(lab); li.appendChild(ta); li.appendChild(row);
        if (!focusSel) focusSel = '#unitNotesEdit';
      } else {
        var text = el('p', 'notes-text', note.text);
        text.setAttribute('dir', 'auto');
        var meta = el('p', 'notes-meta', (note.updated > note.created ? 'Edited ' : 'Added ') + fmt(note.updated));
        li.appendChild(text); li.appendChild(meta);
        var actions = el('div', 'notes-row');
        if (ui.confirming === note.id) {
          var q = el('span', 'notes-confirm', 'Delete note ' + num + '?');
          q.setAttribute('role', 'alert');
          var yes = el('button', 'notes-btn notes-btn-danger', 'Yes, delete'); yes.type = 'button'; yes.setAttribute('data-act', 'confirm');
          var no = el('button', 'notes-btn', 'Keep it'); no.type = 'button';
          yes.addEventListener('click', function () {
            state.notes = state.notes.filter(function (n) { return n.id !== note.id; });
            ui.confirming = null;
            persist('Note deleted.');
            render('#unitNotesNew');
          });
          no.addEventListener('click', function () {
            ui.confirming = null;
            render('[data-id="' + note.id + '"] [data-act="delete"]');
          });
          actions.appendChild(q); actions.appendChild(yes); actions.appendChild(no);
          if (!focusSel) focusSel = '[data-id="' + note.id + '"] [data-act="confirm"]';
        } else {
          var edit = el('button', 'notes-btn', 'Edit'); edit.type = 'button'; edit.setAttribute('data-act', 'edit');
          edit.setAttribute('aria-label', 'Edit note ' + num);
          var del = el('button', 'notes-btn', 'Delete'); del.type = 'button'; del.setAttribute('data-act', 'delete');
          del.setAttribute('aria-label', 'Delete note ' + num);
          edit.addEventListener('click', function () { ui.editing = note.id; ui.confirming = null; say(''); render('#unitNotesEdit'); });
          del.addEventListener('click', function () { ui.confirming = note.id; ui.editing = null; say(''); render(); });
          actions.appendChild(edit); actions.appendChild(del);
        }
        li.appendChild(actions);
      }
      list.appendChild(li);
    });
    if (focusSel) {
      var target = dialog.querySelector(focusSel);
      if (target) target.focus();
    }
  }

  /* add a note */
  function addNote() {
    var v = newArea.value.trim();
    if (!v) { say('Write something first, then press Add note.', true); newArea.focus(); return; }
    if (state.notes.length >= MAX_NOTES) { say('You have reached the limit of ' + MAX_NOTES + ' notes. Delete one to add another.', true); return; }
    var now = Date.now();
    state.notes.unshift({ id: makeId(), text: v.slice(0, MAX_LEN), created: now, updated: now });
    state.draft = '';
    newArea.value = '';
    persist('Note added.');
    render('#unitNotesNew');
  }
  addBtn.addEventListener('click', addNote);
  newArea.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); addNote(); }
  });

  /* autosave the draft */
  var draftTimer;
  function saveDraft() {
    clearTimeout(draftTimer);
    var v = newArea.value.slice(0, MAX_LEN);
    if (v === state.draft) return;
    state.draft = v;
    save();
  }
  newArea.addEventListener('input', function () {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 400);
  });
  window.addEventListener('pagehide', saveDraft);

  /* open / close */
  function openNotes() {
    ui.editing = null; ui.confirming = null; say('');
    newArea.value = state.draft;
    render();
    if (!dialog.open) dialog.showModal();
    newArea.focus();
  }
  function closeNotes() { saveDraft(); if (dialog.open) dialog.close(); }
  fab.addEventListener('click', openNotes);
  closeBtn.addEventListener('click', closeNotes);
  dialog.addEventListener('click', function (e) { if (e.target === dialog) closeNotes(); });
  dialog.addEventListener('close', function () { saveDraft(); fab.focus(); });
  dialog.addEventListener('cancel', saveDraft);

  /* keep several open tabs of the same unit in sync */
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    state = load();
    ui.editing = null; ui.confirming = null;
    if (dialog.open) { newArea.value = state.draft; }
    render();
  });

  render();
})();

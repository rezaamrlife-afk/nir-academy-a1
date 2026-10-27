/* NIR Academy · "Hear" buttons (pronunciation support)
   Uses the browser's built-in speech voice (Web Speech API) for single words.
   It is optional: if the device has no speech support, the buttons and their note stay hidden.
   Nothing is downloaded or stored. */
(function () {
  'use strict';
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-say]'));
  if (!buttons.length) return;

  var synth = window.speechSynthesis;
  var supported = !!(synth && typeof window.SpeechSynthesisUtterance === 'function');
  if (!supported) {
    buttons.forEach(function (b) { b.hidden = true; });
    return;
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-say-note]'), function (n) { n.hidden = false; });

  var voice = null;
  function pickVoice() {
    var list = [];
    try { list = synth.getVoices() || []; } catch (e) { list = []; }
    var pref = ['en-GB', 'en-US', 'en-AU', 'en-IE', 'en'];
    for (var i = 0; i < pref.length && !voice; i++) {
      for (var j = 0; j < list.length; j++) {
        var lang = (list[j].lang || '').replace('_', '-');
        if (lang === pref[i] || (pref[i] === 'en' && lang.indexOf('en') === 0)) { voice = list[j]; break; }
      }
    }
  }
  pickVoice();
  if (synth.addEventListener) synth.addEventListener('voiceschanged', pickVoice);

  var current = null;
  function clear() { if (current) { current.classList.remove('is-speaking'); current = null; } }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var word = btn.getAttribute('data-say');
      try { synth.cancel(); } catch (e) {}
      clear();
      var u = new window.SpeechSynthesisUtterance(word);
      u.lang = voice && voice.lang ? voice.lang : 'en-GB';
      if (voice) u.voice = voice;
      u.rate = 0.8;
      u.onstart = function () { clear(); current = btn; btn.classList.add('is-speaking'); };
      u.onend = u.onerror = clear;
      try { synth.speak(u); } catch (e) { clear(); }
    });
  });
  window.addEventListener('pagehide', function () { try { synth.cancel(); } catch (e) {} });
})();

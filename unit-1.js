/* NIR Academy · Unit page script (shared by unit-1.html, unit-2.html, ...)
   1. Applies the "Larger text" and "Reduce animations" preferences saved by the main app (read-only).
   2. Activates image slots (data-image-src) and audio slots (data-audio-src) when a real URL is provided.
   3. Highlights the section currently in view in the sticky navigation. */
(function () {
  'use strict';

  /* 1. Preferences (never written from here) */
  try {
    var raw = window.localStorage.getItem('nirAcademy.a1.settings.v1');
    var prefs = raw ? JSON.parse(raw) : null;
    if (prefs && typeof prefs === 'object') {
      if (prefs.largeText === true) document.documentElement.classList.add('large-text');
      if (prefs.reduceMotion === true) document.documentElement.classList.add('reduce-motion');
    }
  } catch (e) { /* storage unavailable or invalid: keep defaults */ }

  /* 2a. Image slots */
  Array.prototype.forEach.call(document.querySelectorAll('.media-slot'), function (slot) {
    var src = (slot.getAttribute('data-image-src') || '').trim();
    var ph = slot.querySelector('.ph');
    if (!src || !ph) return;
    var img = new Image();
    img.loading = 'lazy';
    img.alt = (slot.getAttribute('data-image-alt') || '').trim() || slot.getAttribute('data-label') || 'Lesson image';
    img.addEventListener('load', function () { ph.hidden = true; });
    img.addEventListener('error', function () {
      img.remove();
      ph.hidden = false;
      var small = ph.querySelector('small');
      if (small) small.textContent = 'Image could not be loaded';
    });
    img.src = src;
    slot.appendChild(img);
  });

  /* 2b. Audio slots */
  Array.prototype.forEach.call(document.querySelectorAll('.audio-slot'), function (slot) {
    var src = (slot.getAttribute('data-audio-src') || '').trim();
    var audio = slot.querySelector('audio');
    var status = slot.querySelector('.pending');
    if (!src || !audio) return;
    audio.addEventListener('error', function () {
      slot.classList.remove('ready');
      if (status) { status.hidden = false; status.textContent = 'Audio could not be loaded.'; }
    });
    audio.src = src;
    slot.classList.add('ready');
    if (status) status.hidden = true;
  });

  /* 3. Section highlight in the sticky navigation */
  var links = Array.prototype.slice.call(document.querySelectorAll('.tabs a[href^="#"]'));
  function setCurrent(id) {
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    var active = links.filter(function (a) { return a.getAttribute('aria-current') === 'true'; })[0];
    if (active && active.scrollIntoView) {
      var list = active.parentNode.parentNode;
      if (list.scrollWidth > list.clientWidth) {
        list.scrollLeft = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
      }
    }
  }
  if ('IntersectionObserver' in window) {
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }
  links.forEach(function (a) {
    a.addEventListener('click', function () { setCurrent(a.getAttribute('href').slice(1)); });
  });
})();

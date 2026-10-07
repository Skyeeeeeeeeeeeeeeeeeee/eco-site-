/* ЭКО СЕРВИС НОВОСИБИРСК, v2: «живость» сайта. Классический скрипт (defer), без модулей и сетевых запросов.
   Счётчики, появление блоков при прокрутке, виджет «успеваем сегодня» (время Новосибирска по фиксированному смещению UTC+7),
   подсветка зон на схеме доставки, таймлайн процесса, шапка при прокрутке, перетаскивание ленты фото.
   При prefers-reduced-motion анимации не запускаются: числа и блоки показываются сразу. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasIO = 'IntersectionObserver' in window;
  var S = window.SITE, COPY = S && S.copy;

  /* ---------- Счётчики ---------- */
  (function counters() {
    var els = $$('[data-count]');
    if (!els.length || reduce || !hasIO) return;
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { io.unobserve(x.target); run(x.target._cnt); } });
    }, { threshold: 0.4 });
    function fmt(n, sep) { var s = String(Math.round(n)); return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : s; }
    function run(c) {
      var t0 = null;
      function tick(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1200);
        c.v.textContent = c.pre + fmt(c.n * ease(p), c.sep) + c.suf;
        if (p < 1) requestAnimationFrame(tick); else c.v.textContent = c.final;
      }
      requestAnimationFrame(tick);
    }
    els.forEach(function (el) {
      var txt = el.textContent, m = txt.match(/^(\D*?)(\d(?:[\d\s  ]*\d)?)(.*)$/);
      if (!m) return;
      var sepM = m[2].match(/[^\d]/), sep = sepM ? sepM[0] : '';
      var c = { n: parseInt(m[2].replace(/\D/g, ''), 10), pre: m[1], suf: m[3], sep: sep, final: txt };
      el.style.display = 'inline-block'; el.style.minWidth = el.offsetWidth + 'px';
      el.textContent = '';
      var v = document.createElement('span'); v.setAttribute('aria-hidden', 'true'); v.textContent = c.pre + fmt(0, sep) + c.suf;
      var h = document.createElement('span'); h.className = 'visually-hidden'; h.textContent = txt;
      el.appendChild(v); el.appendChild(h);
      c.v = v; el._cnt = c; io.observe(el);
    });
  })();

  /* ---------- Появление при прокрутке: только заголовки секций и группы секций ---------- */
  (function reveal() {
    if (reduce || !hasIO || !document.documentElement.classList.contains('js')) return;
    var heads = '.sec-head, .what-head, .proc-head, .rev-h, .faq-g__h';
    var groups = '.bento, .tiles, .grid--cards, .grid--2, .grid--3, .grid--4, .who, .zones, .photo-row, .photo-pair, .price-g, .dl-g, .zmap-wrap';
    var targets = [];
    $$(heads + ', ' + groups).forEach(function (el) {
      if (el.closest('[data-hero], .calc, form, .reveal') || targets.some(function (t) { return t.contains(el); })) return;
      targets.push(el);
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        var r = x.boundingClientRect;
        if (!x.isIntersecting && r.top >= 0) return;   // ниже экрана: ждём; выше экрана: показываем сразу
        io.unobserve(x.target); x.target.classList.add('is-in');
        var n = x.target.children.length, done = x.target.classList.contains('reveal--stagger') ? 600 + Math.min(n, 8) * 60 : 700;
        setTimeout(function () { x.target.classList.remove('reveal', 'reveal--stagger', 'is-in'); $$(':scope > *', x.target).forEach(function (c) { c.style.removeProperty('--i'); }); }, done);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) {
      var stag = el.matches(groups);
      el.classList.add('reveal'); if (stag) { el.classList.add('reveal--stagger'); Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--i', Math.min(i, 8)); }); }
      io.observe(el);
    });
  })();

  /* ---------- Виджет «успеваем сегодня» ---------- */
  (function live() {
    var w = $('[data-live]'); if (!w || !COPY) return;
    var out = $('[data-live-text]', w), last = '';
    // Время Новосибирска (UTC+7): секунды от полуночи и день недели (0 = воскресенье). Рабочие дни и часы: SITE.copy.
    function nsk() { var d = new Date(new Date().getTime() + COPY.tzOffsetHours * 3600000); return { s: d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds(), wd: d.getUTCDay() }; }
    function left(mins) { var h = Math.floor(mins / 60), m = mins % 60; return h ? (m ? h + ' ч ' + m + ' мин' : h + ' ч') : m + ' мин'; }
    function isWork(wd) { return COPY.workDays.indexOf(wd) >= 0; }
    // когда ответим, если рабочее время кончилось: «завтра» или название ближайшего рабочего дня («в понедельник»)
    function nextDay(wd) { var d = (wd + 1) % 7; if (isWork(wd) && isWork(d)) return COPY.tomorrow; while (!isWork(d)) d = (d + 1) % 7; return COPY.dayNames[d]; }
    function tick() {
      var t = nsk(), s = t.s, state, text;
      if (!isWork(t.wd)) { state = 'off'; text = COPY.liveOff.replace('{day}', nextDay(t.wd)); }
      else if (s < COPY.open * 3600) { state = 'off'; text = COPY.liveOff.replace('{day}', COPY.today); }
      else if (s >= COPY.close * 3600) { state = 'off'; text = COPY.liveOff.replace('{day}', nextDay(t.wd)); }
      else if (s >= COPY.cutoff * 3600) { state = 'closed'; text = COPY.liveClosed.replace('{day}', nextDay(t.wd)); }
      else { state = 'open'; text = COPY.liveOpen.replace('{left}', left(Math.ceil((COPY.cutoff * 3600 - s) / 60))); }
      w.setAttribute('data-state', state);
      if (text !== last) { last = text; out.textContent = text; }   // меняется не чаще раза в минуту
    }
    tick(); setInterval(tick, 30000);
  })();

  /* ---------- Схема зон: подсветка строки цен ---------- */
  $$('[data-zmap]').forEach(function (fig) {
    var scope = fig.closest('section') || document;
    function hl(id, on) {
      $$('[data-zrow="' + id + '"]', scope).forEach(function (r) { r.classList.toggle('is-hl', on); });
      $$('[data-z="' + id + '"]', fig).forEach(function (z) { z.classList.toggle('is-hl', on); });
    }
    $$('[data-z]', fig).forEach(function (z) {
      var id = z.getAttribute('data-z');
      ['mouseenter', 'focus'].forEach(function (e) { z.addEventListener(e, function () { hl(id, true); }); });
      ['mouseleave', 'blur'].forEach(function (e) { z.addEventListener(e, function () { hl(id, false); }); });
    });
    $$('[data-zrow]', scope).forEach(function (r) {
      var id = r.getAttribute('data-zrow');
      r.addEventListener('mouseenter', function () { hl(id, true); });
      r.addEventListener('mouseleave', function () { hl(id, false); });
    });
  });

  /* ---------- Таймлайн процесса: линия заполняется при прокрутке, номера включаются ---------- */
  $$('[data-timeline]').forEach(function (ol) {
    var rows = $$('.row', ol);
    if (reduce) { rows.forEach(function (r) { r.classList.add('is-on'); }); return; }
    var raf = 0;
    function upd() {
      raf = 0;
      var trig = window.innerHeight * 0.62;
      rows.forEach(function (row) {
        var r = row.getBoundingClientRect(), n = $('.num', row).getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (trig - r.top) / r.height));
        row.style.setProperty('--p', p.toFixed(3));
        row.classList.toggle('is-on', n.top + n.height / 2 <= trig);
      });
    }
    var req = function () { if (!raf) raf = requestAnimationFrame(upd); };
    window.addEventListener('scroll', req, { passive: true }); window.addEventListener('resize', req); upd();
  });

  /* ---------- Шапка: уменьшается и получает рамку; на телефоне прячется при прокрутке вниз ---------- */
  (function header() {
    var h = $('.site-header'); if (!h) return;
    var mq = window.matchMedia ? window.matchMedia('(max-width: 767.98px)') : { matches: false };
    var last = window.scrollY, raf = 0;
    function upd() {
      raf = 0;
      var y = window.scrollY, dy = y - last;
      h.classList.toggle('is-scrolled', y > 12);
      if (mq.matches && !document.body.classList.contains('menu-open') && !h.contains(document.activeElement)) {
        if (y > 140 && dy > 6) h.classList.add('is-hidden');
        else if (dy < -4 || y <= 140) h.classList.remove('is-hidden');
      } else h.classList.remove('is-hidden');
      if (Math.abs(dy) > 6 || y <= 140) last = y;
    }
    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    h.addEventListener('focusin', function () { h.classList.remove('is-hidden'); });
    upd();
  })();

  /* ---------- Лента фото: перетаскивание мышью (на сенсорных экранах работает прокрутка пальцем) ---------- */
  $$('[data-drag]').forEach(function (track) {
    var down = false, sx = 0, sl = 0, moved = false;
    function snap() {
      var cs = getComputedStyle(track), pad = parseFloat(cs.scrollPaddingLeft) || 0, tl = track.getBoundingClientRect().left, best = 0, bd = 1e9;
      Array.prototype.forEach.call(track.children, function (c) {
        var x = c.getBoundingClientRect().left - tl + track.scrollLeft - pad, d = Math.abs(x - track.scrollLeft);
        if (d < bd) { bd = d; best = x; }
      });
      track.scrollTo({ left: best, behavior: reduce ? 'auto' : 'smooth' });
    }
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add('is-drag'); }
      if (moved) track.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (moved) { track.classList.remove('is-drag'); snap(); }
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });
})();

/* ЭКО СЕРВИС НОВОСИБИРСК — рендер контента, калькулятор, формы, интерактив.
   Все данные берутся из window.SITE (js/content.js). Ничего не отправляется на сервер. */
(function () {
  'use strict';

  var S = window.SITE;
  if (!S) { console.error('SITE data (js/content.js) not loaded'); return; }
  var C = S.calc, DL = C.delivery, M = S.messages, K = S.contacts;
  var NB = ' ';

  /* ---------- утилиты ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(n) { return Math.round(n).toLocaleString('ru-RU').replace(/\s/g, NB); }
  function rub(n) { return fmt(n) + NB + '₽'; }
  function plural(n, f) { var a = Math.abs(n) % 100, b = a % 10; if (a > 10 && a < 20) return f[2]; if (b > 1 && b < 5) return f[1]; if (b === 1) return f[0]; return f[2]; }
  function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function icon(id, size, cls) { return '<svg class="icon' + (cls ? ' ' + cls : '') + '" width="' + (size || 24) + '" height="' + (size || 24) + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  /* ---------- привязка контактов ---------- */
  function bindContacts() {
    $$('[data-bind]').forEach(function (el) { var v = K[el.dataset.bind]; if (v != null) el.textContent = v; });
    $$('[data-bind-href]').forEach(function (el) { var v = K[el.dataset.bindHref]; if (v != null) el.setAttribute('href', v); });
  }

  /* ---------- «Что нужно» в select ---------- */
  function renderNeeds() {
    $$('select[data-needs]').forEach(function (sel) {
      S.needs.forEach(function (n) { var o = document.createElement('option'); o.value = n.id; o.textContent = n.label; sel.appendChild(o); });
    });
  }

  /* ---------- факты, marquee ---------- */
  function renderFacts() {
    $('#facts').innerHTML = S.facts.map(function (f) {
      return '<li class="fact"><b class="fact__big">' + esc(f.big) + '</b><span class="fact__text">' + esc(f.text) + '</span></li>';
    }).join('');
  }

  function renderMarquee() {
    var items = S.marquee;
    function group(hidden) {
      var li = items.concat(items).map(function (t, i) {
        var dup = i >= items.length;
        return '<li' + (dup ? ' aria-hidden="true" class="is-dup"' : '') + '>' + esc(t) + '</li>';
      }).join('');
      return '<ul class="marquee__group"' + (hidden ? ' aria-hidden="true"' : '') + '>' + li + '</ul>';
    }
    $('#marquee-track').innerHTML = group(false) + group(true);
    var btn = $('#marquee-pause'), box = $('#marquee');
    btn.addEventListener('click', function () {
      var p = box.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', p ? 'true' : 'false');
      btn.setAttribute('aria-label', p ? 'Запустить бегущую строку' : 'Остановить бегущую строку');
      btn.querySelector('use').setAttribute('href', p ? '#i-play' : '#i-pause');
    });
  }

  /* ---------- каталог ---------- */
  function renderCatalog() {
    $('#cab-grid').innerHTML = S.catalog.map(function (m, i) {
      var price = m.sale
        ? '<span class="price">' + rub(m.price) + '</span><span class="small">' + esc(m.extra) + '</span>'
        : '<span class="price"><small>от</small> ' + rub(m.rentDay) + '<small>/сутки</small></span><span class="small">от ' + rub(m.rentMonth) + '/месяц</span>';
      var btn = m.calcModel
        ? '<a class="btn btn--primary btn--block btn--arrow" href="#calc" data-model="' + m.calcModel + '">' + esc(m.cta) + '</a>'
        : '<a class="btn btn--accent btn--block btn--arrow" href="#order" data-need="' + m.need + '">' + esc(m.cta) + '</a>';
      var c = m.colors;
      return '<article class="cab-card reveal' + (m.sale ? ' is-sale' : '') + '" style="--i:' + i + ';--stage:var(--c-stage-' + m.stage + ');--cab:' + c.cab + ';--cab-d:' + c.cabD + ';--cab-l:' + c.cabL + '">' +
        '<div class="cab-card__stage">' +
        (m.sticker ? '<span class="sticker' + (m.sale ? ' sticker--yellow' : '') + '">' + esc(m.sticker) + '</span>' : '') +
        '<svg class="cab-card__art" viewBox="' + m.art.vb + '" role="img" aria-label="Иллюстрация: ' + esc(m.name) + '"><use href="#' + m.art.sym + '"/></svg></div>' +
        '<div class="cab-card__body"><h3>' + esc(m.name) + '</h3><p class="small">' + esc(m.desc) + '</p>' +
        '<ul class="specs">' + m.specs.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
        '<details class="more"><summary>Подробнее</summary><ul>' + m.more.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></details>' +
        '<div class="cab-card__price">' + price + '</div>' + btn + '</div></article>';
    }).join('');
  }

  /* ---------- шаги, обслуживание, почему мы, сравнение, документы ---------- */
  function renderBlocks() {
    $('#steps').innerHTML = S.steps.map(function (s, i) {
      return '<li class="step reveal" style="--i:' + i + '"><span class="step__num" aria-hidden="true">' + (i + 1) + '</span><h3 class="step__title">' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></li>';
    }).join('');
    $('#service-list').innerHTML = S.serviceList.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    $('#service-note span').textContent = S.serviceNote;
    $('#why').innerHTML = S.why.map(function (w, i) {
      return '<article class="why__card reveal" style="--i:' + i + '"><span class="why__ico">' + icon(w.icon, 28) + '</span><h3>' + esc(w.title) + '</h3><p>' + esc(w.text) + '</p></article>';
    }).join('');
    $('#blobs').innerHTML = S.stats.map(function (s, i) {
      return '<aside class="blob blob--' + (s.tone === 'pink' ? 'pink' : 'yellow') + (i % 2 ? ' blob--b' : '') + '"><p class="blob__num price price--xl">' + esc(s.num) + '</p><p class="blob__text">' + esc(s.text) + '</p></aside>';
    }).join('');

    var vs = S.vs;
    $('#vs-h').textContent = vs.title;
    $('#vs-lead').textContent = vs.lead;
    $('#vs-note').textContent = vs.note;
    $('#vs').innerHTML = '<div class="vs__head" role="row"><span role="columnheader" class="vs__corner"><span class="visually-hidden">Критерий</span></span><span role="columnheader" class="vs__us">ЭКО СЕРВИС</span><span role="columnheader" class="vs__them">Обычный прокат</span></div>' +
      vs.rows.map(function (r) {
        return '<div class="vs__row" role="row"><span role="rowheader" class="vs__crit">' + esc(r.crit) + '</span>' +
          '<span role="cell" class="vs__us"><i class="vs__ico vs__ico--yes" aria-hidden="true">✓</i><span class="visually-hidden">Да: </span><span>' + esc(r.us) + '</span></span>' +
          '<span role="cell" class="vs__them"><i class="vs__ico vs__ico--no" aria-hidden="true">✗</i><span class="visually-hidden">Нет: </span><span>' + esc(r.them) + '</span></span></div>';
      }).join('');

    $('#docs-list').innerHTML = S.docs.map(function (d) { return '<li>' + icon('i-doc', 26) + '<span>' + esc(d) + '</span></li>'; }).join('');
  }

  /* ---------- зоны доставки ---------- */
  function renderZones() {
    $('#zone-list').innerHTML = S.zones.map(function (z, i) {
      return '<article class="zone zone--' + z.cls + ' reveal" style="--i:' + i + '" data-zone="' + z.id + '" tabindex="0" aria-label="' + esc(z.name) + '">' +
        '<span class="zone__dot" aria-hidden="true"></span><h3 class="zone__name">' + esc(z.name) + '</h3>' +
        (z.places ? '<p class="zone__terms small">' + esc(z.places) + '</p>' : '') +
        '<p class="zone__terms zone__price">' + esc(z.terms) + '</p><p class="zone__time small">' + esc(z.time) + '</p></article>';
    }).join('');
    $('.zones__note').textContent = S.zonesNote;
    var pts = [[268, 250, 20], [128, 178, -10], [270, 140, -10]];
    $('#map-labels').insertAdjacentHTML('beforeend', S.mapLabels.map(function (t, i) {
      var p = pts[i] || [200, 200];
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="#5B2EFF" stroke="#1D0F3A" stroke-width="2"/><text x="' + p[0] + '" y="' + (p[1] + p[2]) + '" text-anchor="middle" font-size="13">' + esc(t) + '</text>';
    }).join(''));
    function hl(id, on) { $$('#zone-map [data-zone]').forEach(function (c) { c.classList.toggle('is-active', on && c.dataset.zone === id); }); $$('.zone').forEach(function (z) { z.classList.toggle('is-active', on && z.dataset.zone === id); }); }
    $$('.zone').forEach(function (z) {
      z.addEventListener('mouseenter', function () { hl(z.dataset.zone, true); });
      z.addEventListener('mouseleave', function () { hl(z.dataset.zone, false); });
      z.addEventListener('focus', function () { hl(z.dataset.zone, true); });
      z.addEventListener('blur', function () { hl(z.dataset.zone, false); });
    });
  }

  /* ---------- отзывы ---------- */
  function renderReviews() {
    $('#rev-track').innerHTML = S.reviews.map(function (r, i) {
      var stars = '';
      for (var k = 1; k <= 5; k++) stars += icon('i-star', 20, 'icon--fill' + (k > r.stars ? ' off' : ''));
      return '<article class="review reveal" style="--i:' + i + '">' +
        '<span class="review__stars" role="img" aria-label="Оценка ' + r.stars + ' из 5">' + stars + '</span>' +
        '<blockquote class="review__quote">«' + esc(r.text) + '»</blockquote>' +
        '<div class="review__meta"><span class="review__who">' + esc(r.who) + (r.where ? ', ' + esc(r.where) : '') + '</span>' +
        '<span class="badge badge--' + r.kind + '">' + esc(r.kindLabel) + '</span><span class="small">' + esc(r.ctx) + '</span></div></article>';
    }).join('');
    var tr = $('#rev-track');
    function by(dir) { var c = tr.querySelector('.review'); var w = c ? c.getBoundingClientRect().width + 16 : 300; tr.scrollBy({ left: dir * w, behavior: reduced() ? 'auto' : 'smooth' }); }
    $('#rev-prev').addEventListener('click', function () { by(-1); });
    $('#rev-next').addEventListener('click', function () { by(1); });
  }

  /* ---------- FAQ ---------- */
  function renderFaq() {
    var groups = $('#faq-groups');
    groups.insertAdjacentHTML('beforeend', S.faqGroups.map(function (g, i) {
      return '<span class="chip chip--' + g.id + '"><input type="radio" name="fg" id="fg-' + g.id + '" value="' + g.id + '"' + (i === 0 ? ' checked' : '') + '><label for="fg-' + g.id + '">' + esc(g.label) + '</label></span>';
    }).join(''));
    $('#faq-list').innerHTML = S.faq.map(function (f) {
      return '<details class="faq" name="faq-' + f.g + '" data-g="' + f.g + '"><summary><h3 class="faq__q">' + esc(f.q) + '</h3><span class="faq__icon" aria-hidden="true"></span></summary><div class="faq__a"><p>' + esc(f.a) + '</p></div></details>';
    }).join('');
    function show(g) {
      var first = true;
      $$('#faq-list .faq').forEach(function (d) {
        var inG = d.dataset.g === g;
        d.hidden = !inG;
        if (inG) { d.open = first; first = false; } else d.open = false;
      });
      var l = $('#faq-list'); l.classList.remove('is-switch'); void l.offsetWidth; l.classList.add('is-switch');
    }
    groups.addEventListener('change', function (e) { if (e.target.name === 'fg') show(e.target.value); });
    show(S.faqGroups[0].id);

    // FAQPage JSON-LD собираем из тех же данных
    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: S.faq.map(function (f) { return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }; })
    });
    document.head.appendChild(ld);
  }

  /* ---------- контакты и подвал ---------- */
  function renderContacts() {
    var rows = [
      ['i-phone', 'Телефон', '<a href="' + esc(K.phoneHref) + '">' + esc(K.phone) + '</a>'],
      ['i-tg', 'Telegram / WhatsApp', '<a href="' + esc(K.telegramUrl) + '" target="_blank" rel="noopener">' + esc(K.telegram) + '</a>'],
      ['i-mail', 'Email', '<a href="' + esc(K.emailHref) + '">' + esc(K.email) + '</a>'],
      ['i-pin', 'Адрес', esc(K.address)],
      ['i-clock', 'Часы работы', esc(K.hours)],
      ['i-doc', 'Реквизиты', esc(K.requisites)]
    ];
    $('#contact-list').innerHTML = rows.map(function (r) {
      return '<li><span class="contact-list__ico">' + icon(r[0], 22) + '</span><span><span class="small contact-list__k">' + r[1] + '</span><span class="contact-list__v">' + r[2] + '</span></span></li>';
    }).join('');

    $('#footer-nav').innerHTML = S.nav.map(function (n) { return '<li><a href="#' + n.id + '">' + esc(n.label) + '</a></li>'; }).join('');
    $('#footer-contacts').innerHTML =
      '<li><a href="' + esc(K.phoneHref) + '">' + esc(K.phone) + '</a></li>' +
      '<li><a href="' + esc(K.emailHref) + '">' + esc(K.email) + '</a></li>' +
      '<li><a href="' + esc(K.telegramUrl) + '" target="_blank" rel="noopener">Telegram ' + esc(K.telegram) + '</a></li>' +
      '<li><span>' + esc(K.address) + '</span></li><li><span>' + esc(K.hours) + '</span></li>';
    $('#footer-tagline').textContent = S.footer.tagline;
    $('#footer-joke').textContent = S.footer.joke;
    $('#footer-copy').textContent = '© ' + new Date().getFullYear() + ' ' + S.company.name + ' · ' + K.requisites;
  }

  /* ---------- меню, навигация, scroll-spy ---------- */
  function initMenu() {
    var menu = $('#menu'), burger = $('#burger'), nav = $('#menu-nav');
    nav.innerHTML = S.nav.map(function (n) { return '<a href="#' + n.id + '">' + esc(n.label) + '</a>'; }).join('');
    function setOpen(open) {
      menu.hidden = !open;
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      burger.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-burger');
      document.body.classList.toggle('menu-open', open);
      if (open) { menu.classList.remove('is-in'); void menu.offsetWidth; menu.classList.add('is-in'); var f = menu.querySelector('a'); if (f) f.focus(); }
    }
    burger.addEventListener('click', function () { setOpen(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (menu.hidden) return;
      if (e.key === 'Escape') { setOpen(false); burger.focus(); return; }
      if (e.key === 'Tab') {
        var f = $$('a, button', menu).concat([burger]).filter(function (x) { return x.offsetParent !== null || x === burger; });
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); burger.focus(); }
        else if (!e.shiftKey && document.activeElement === burger) { e.preventDefault(); first.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); burger.focus(); }
      }
    });
    window.matchMedia('(min-width: 1280px)').addEventListener('change', function (m) { if (m.matches && !menu.hidden) setOpen(false); });

    // активный пункт
    if ('IntersectionObserver' in window) {
      var links = $$('#main-nav a');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) { if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      S.nav.forEach(function (n) { var s = document.getElementById(n.id); if (s) io.observe(s); });
    }
  }

  /* ---------- вкладки аудитории ---------- */
  function initTabs() {
    var root = $('#aud'), tabs = $$('[role="tab"]', root);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      root.dataset.active = tab.id === 't-o' ? 'org' : 'private';
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  }

  /* ============================================================
     КАЛЬКУЛЯТОР
     ============================================================ */
  function rateFor(days) {
    for (var i = 0; i < C.rentRates.length; i++) { var r = C.rentRates[i]; if (r.upTo === null || days <= r.upTo) return r.rate; }
    return C.rentRates[C.rentRates.length - 1].rate;
  }
  function discountFor(n) {
    for (var i = 0; i < C.discounts.length; i++) if (n >= C.discounts[i].minCabins) return C.discounts[i].pct;
    return 0;
  }
  function visitsFor(mode, D) {
    if (mode === 'weekly') return Math.max(1, Math.ceil(D / 7));
    if (mode === 'twice') return Math.max(2, Math.ceil(D / 7) * 2);
    if (mode === 'daily') return D;
    return 0;
  }
  // чистая функция расчёта (экспортируется в window.SITE_CALC для проверки)
  function compute(s) {
    var errors = {}, n = Number(s.n), term = Number(s.term), km = Number(s.km);
    if (s.n === '' || !isFinite(n) || n < 1 || Math.floor(n) !== n) errors.n = M.calcCabins;
    if (s.term === '' || !isFinite(term) || term < 1 || Math.floor(term) !== term) errors.term = M.calcTerm;
    if (s.zone === 'region' && (s.km === '' || !isFinite(km) || km < 1)) errors.km = M.calcKm;
    if (Object.keys(errors).length) return { errors: errors };
    if (n > C.maxCabins || (s.zone === 'region' && km > DL.maxKm)) return { custom: true, n: n, D: 0 };

    var D = s.unit === 'm' ? term * C.daysInMonth : term;
    var model = C.models.filter(function (m) { return m.id === s.model; })[0] || C.models[0];
    var rate = rateFor(D) * model.coef;
    var rent = n * D * rate;
    var pct = discountFor(n);
    var discount = rent * pct / 100;
    var V = visitsFor(s.service, D);
    var visit = s.service === 'daily' ? C.visitPriceDaily : C.visitPrice;
    var service = n * V * visit;
    var trips = Math.ceil(n / DL.cabinsPerTrip);
    var delivery;
    if (s.zone === 'region') delivery = trips * (km <= DL.nearKm ? DL.nearFlat : DL.nearFlat + (km - DL.nearKm) * DL.perKm);
    else delivery = trips * DL.city;
    var sub = rent - discount + service + delivery;
    var minHit = sub < C.minOrder;
    var total = Math.round(Math.max(sub, C.minOrder) / C.roundTo) * C.roundTo;
    return { n: n, D: D, rent: rent, service: service, delivery: delivery, pct: pct, discount: discount, total: total, minHit: minHit, model: model, visits: V, trips: trips };
  }
  window.SITE_CALC = { compute: compute };

  function tween(el, to, step, format) {
    format = format || fmt;
    var from = Number(el.dataset.v || 0);
    cancelAnimationFrame(el._raf);
    if (reduced() || from === to || isNaN(from)) { el.textContent = format(to); el.dataset.v = to; return; }
    var t0 = performance.now(), ms = 450;
    (function frame(t) {
      var k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = format(Math.round((from + (to - from) * e) / step) * step);
      if (k < 1) el._raf = requestAnimationFrame(frame);
      else { el.dataset.v = to; el.textContent = format(to); }
    })(t0);
  }

  var calcLast = null;

  function initCalc() {
    var form = $('#calc-form');
    var n = $('#n'), term = $('#term'), km = $('#km'), range = $('#km-range'), kmBox = $('#km-box');

    $('#model').innerHTML = C.models.map(function (m) { return '<option value="' + m.id + '">' + esc(m.label) + '</option>'; }).join('');
    $('#service-chips').innerHTML = C.serviceModes.map(function (m, i) {
      return '<span class="chip"><input type="radio" name="service" id="s-' + m.id + '" value="' + m.id + '"' + (m.id === 'weekly' ? ' checked' : '') + '><label for="s-' + m.id + '">' + esc(m.label) + (m.note ? ' <span class="chip__note">(' + esc(m.note) + ')</span>' : '') + '</label></span>';
    }).join('');

    function val(name) { var r = form.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ''; }
    function state() { return { n: n.value, term: term.value, unit: val('unit'), service: val('service'), zone: val('zone'), km: km.value, model: $('#model').value }; }

    function setErr(fld, input, msgId, msg) {
      var f = fld, m = document.getElementById(msgId);
      if (f) f.dataset.state = msg ? 'error' : 'default';
      if (m) m.textContent = msg || '';
      if (input) { if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
    }
    function setRange() { range.style.setProperty('--p', ((range.value - range.min) / (range.max - range.min) * 100) + '%'); range.setAttribute('aria-valuetext', range.value + ' ' + plural(range.value, ['километр', 'километра', 'километров'])); }

    var srTimer;
    function update() {
      var s = state();
      kmBox.hidden = s.zone !== 'region';
      var r = compute(s);
      calcLast = { s: s, r: r };
      var box = $('#calc-result');
      setErr($('[data-fld="n"]'), n, 'n-msg', r.errors && r.errors.n);
      $('#stepper-n').classList.toggle('is-error', !!(r.errors && r.errors.n));
      setErr($('[data-fld="term"]'), term, 'term-msg', r.errors && r.errors.term);
      var kmFld = km.closest('.km'); setErr(kmFld, km, 'km-msg', r.errors && r.errors.km);
      var nv = Number(n.value) || 0;
      $('[data-step="-1"]').disabled = nv <= 1;
      $('[data-step="1"]').disabled = nv >= C.maxCabins;

      var order = $('#res-order'), custom = $('#res-custom'), errs = $('#res-errors'), bd = $('#breakdown');
      box.classList.toggle('is-invalid', !!r.errors);
      box.classList.toggle('is-custom', !!r.custom);
      errs.hidden = !r.errors; custom.hidden = !r.custom;
      bd.hidden = !!(r.errors || r.custom);
      $('#res-min').hidden = !(r.minHit);
      $('#discount').hidden = !!(r.errors || r.custom);
      order.removeAttribute('aria-disabled');
      var mini = $('#mini-total'), sr = '';

      if (r.errors) {
        errs.innerHTML = Object.keys(r.errors).map(function (k) { return '<li>' + esc(r.errors[k]) + '</li>'; }).join('');
        $('#res-total').textContent = '—'; $('#res-total').dataset.v = 0; $('#res-cur').hidden = true;
        order.textContent = 'Проверьте поля слева'; order.setAttribute('aria-disabled', 'true');
        mini.textContent = '—'; sr = 'Проверьте поля: ' + Object.keys(r.errors).map(function (k) { return r.errors[k]; }).join('. ');
        $('#res-t').textContent = 'Примерно';
      } else if (r.custom) {
        custom.textContent = 'Нужен индивидуальный расчёт — оставьте заявку, посчитаем вручную.';
        $('#res-total').textContent = '—'; $('#res-total').dataset.v = 0; $('#res-cur').hidden = true;
        order.textContent = 'Оставить заявку'; mini.textContent = 'индивидуально';
        sr = custom.textContent;
      } else {
        $('#res-cur').hidden = false;
        tween($('#res-total'), r.total, C.roundTo);
        tween($('#b-rent'), r.rent, 1, rub); tween($('#b-service'), r.service, 1, rub); tween($('#b-delivery'), r.delivery, 1, rub);
        tween($('#b-total'), r.total, C.roundTo, rub);
        var dr = $('#b-disc-row'); dr.hidden = !r.pct;
        if (r.pct) { $('#b-disc-label').textContent = 'Скидка за количество −' + r.pct + '%'; $('#b-disc').textContent = '−' + rub(r.discount); }
        $('#res-min').textContent = 'Минимальный заказ — ' + rub(C.minOrder) + ', поэтому итог поднят до него.';
        order.textContent = 'Заказать за ' + rub(r.total);
        mini.textContent = '≈ ' + rub(r.total);
        sr = 'Примерно ' + fmt(r.total) + ' рублей';
        // прогресс скидки
        var disc = $('#discount'), bar = $('#disc-bar'), N = r.n, t = $('#disc-t');
        var d1 = C.discounts[C.discounts.length - 1], d2 = C.discounts[0];
        if (N < d1.minCabins) t.textContent = 'Ещё ' + (d1.minCabins - N) + ' ' + plural(d1.minCabins - N, ['кабина', 'кабины', 'кабин']) + ' — и скидка ' + d1.pct + '% на аренду';
        else if (N < d2.minCabins) t.textContent = 'Скидка ' + d1.pct + '% уже ваша. Ещё ' + (d2.minCabins - N) + ' — и будет ' + d2.pct + '%';
        else t.textContent = 'Максимальная скидка −' + d2.pct + '%. Дальше только бесплатные эмоции';
        disc.classList.toggle('is-reached', N >= d1.minCabins);
        disc.classList.toggle('is-max', N >= d2.minCabins);
        bar.style.setProperty('--p', Math.min(N, d2.minCabins) / d2.minCabins);
        bar.setAttribute('aria-valuenow', Math.min(N, d2.minCabins));
        bar.setAttribute('aria-valuetext', 'Скидка ' + r.pct + '%');
      }
      // ссылка «в Telegram»
      var txt = summaryText(s, r);
      $('#res-share').href = K.telegramUrl + (K.telegramUrl.indexOf('?') < 0 ? '?' : '&') + 'text=' + encodeURIComponent(txt);
      clearTimeout(srTimer);
      srTimer = setTimeout(function () { $('#res-sr').textContent = sr; }, 600);
    }

    function summaryText(s, r) {
      if (r.errors) return 'Расчёт стоимости аренды';
      var model = (C.models.filter(function (m) { return m.id === s.model; })[0] || C.models[0]).label;
      var sv = C.serviceModes.filter(function (m) { return m.id === s.service; })[0];
      var parts = ['Расчёт с сайта: ' + s.n + ' ' + plural(Number(s.n), ['кабина', 'кабины', 'кабин']) + ' («' + model + '»)',
        'срок ' + s.term + (s.unit === 'm' ? ' мес.' : ' дн.'),
        'обслуживание: ' + (sv ? sv.label.toLowerCase() : ''),
        'доставка: ' + (s.zone === 'region' ? 'область, ' + s.km + ' км' : 'по Новосибирску')];
      return parts.join(', ') + (r.custom ? '. Нужен индивидуальный расчёт.' : '. Ориентир: ' + rub(r.total) + '.');
    }

    form.addEventListener('input', function (e) {
      if (e.target === range) km.value = range.value;
      if (e.target === km && km.value !== '') { var kv = Math.min(Math.max(Number(km.value) || 1, 1), 300); range.value = kv; }
      setRange(); update();
    });
    form.addEventListener('change', function (e) {
      if (e.target === n && n.value !== '') { var v = Math.floor(Number(n.value)); if (v < 1) n.value = 1; }
      update();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    // степпер с автоповтором
    var timer, rep;
    function step(d) { var v = Number(n.value) || 0; n.value = Math.min(C.maxCabins, Math.max(1, v + d)); update(); }
    $$('.stepper__btn', form).forEach(function (b) {
      var d = Number(b.dataset.step);
      b.addEventListener('pointerdown', function (e) {
        if (e.button > 0) return;
        step(d); clearTimeout(timer); clearInterval(rep);
        timer = setTimeout(function () { rep = setInterval(function () { step(d); }, 80); }, 400);
        b._pd = true;
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { clearTimeout(timer); clearInterval(rep); }); });
      b.addEventListener('click', function (e) { if (e.detail === 0) step(d); });
    });

    // «Заказать за …» -> форма с параметрами
    $('#res-order').addEventListener('click', function (e) {
      var info = calcLast; if (!info || info.r.errors) { e.preventDefault(); return; }
      presetOrder({ need: info.s.service !== 'none' && info.r.n >= 5 ? 'rent-org' : 'rent-dacha', comment: summaryText(info.s, info.r) });
    });

    // выбор модели из каталога
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-model]'); if (!a) return;
      $('#model').value = a.dataset.model; update();
    });

    // мини-калькулятор
    var ev = $('#event-calc'), guests = $('#guests'), evRes = $('#event-result'), evNeed = 0;
    function evUpdate() {
      var g = Number(guests.value), fld = guests.closest('.field');
      var bad = guests.value !== '' && (!isFinite(g) || g < 1 || Math.floor(g) !== g);
      fld.dataset.state = bad ? 'error' : 'default'; $('#guests-msg').textContent = bad ? M.guests : '';
      if (bad) guests.setAttribute('aria-invalid', 'true'); else guests.removeAttribute('aria-invalid');
      if (guests.value === '' || bad) { evRes.hidden = true; return; }
      var E = S.eventCalc, d = ev.querySelector('input[name="dur"]:checked').value, alc = ev.querySelector('input[name="alc"]:checked').value === 'yes';
      var cabins = Math.ceil(g / E.limits[d]);
      if (alc) cabins = Math.ceil(cabins * E.alcoholK);
      var acc = g >= E.accessFrom;
      if (acc) cabins += 1;
      evNeed = cabins;
      $('#event-text').textContent = 'Рекомендуем ' + cabins + ' ' + plural(cabins, ['кабину', 'кабины', 'кабин']) + ', из них 1 с рукомойником' + (acc ? ' и 1 для маломобильных' : '') + '.';
      evRes.hidden = false;
    }
    ev.addEventListener('input', evUpdate); ev.addEventListener('change', evUpdate);
    $('#event-apply').addEventListener('click', function () {
      n.value = Math.min(C.maxCabins, Math.max(1, evNeed)); update();
      var f = $('#calc-form'); f.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    });

    setRange(); update();
  }

  /* ============================================================
     ФОРМЫ
     ============================================================ */
  function presetOrder(o) {
    var f = $('#order-form');
    if (o.need) { f.elements.need.value = o.need; setFieldError(f.elements.need, ''); }
    if (o.comment != null) f.elements.comment.value = o.comment;
  }

  function phoneDigits(v) { var d = String(v).replace(/\D/g, ''); if (d[0] === '7' || d[0] === '8') d = d.slice(1); return d.slice(0, 10); }
  function maskPhone(d) {
    if (!d) return '';
    var o = '+7 (' + d.slice(0, 3);
    if (d.length > 3) o += ') ' + d.slice(3, 6);
    if (d.length > 6) o += '-' + d.slice(6, 8);
    if (d.length > 8) o += '-' + d.slice(8, 10);
    return o;
  }
  function attachMask(el) {
    var prev = '';
    el.addEventListener('input', function (e) {
      var d = phoneDigits(el.value);
      if (e.inputType && e.inputType.indexOf('delete') === 0 && d === prev && d.length) d = d.slice(0, -1);
      prev = d; el.value = maskPhone(d);
    });
    el.addEventListener('focus', function () { if (!el.value) { /* подсказка не навязываем */ } });
  }

  function setFieldError(el, msg) {
    var field = el.closest('.field'); if (!field) return;
    var m = field.querySelector('.field__msg');
    field.dataset.state = msg ? 'error' : 'default';
    if (m) m.textContent = msg;
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    var chk = el.closest('.check'); if (chk) chk.classList.toggle('is-error', !!msg);
  }
  function check(el) {
    var t = el.dataset.v, v = el.value.trim();
    if (t === 'name') return v.length < 2 ? M.name : '';
    if (t === 'text') return v.length < 2 ? M.place : '';
    if (t === 'phone') {
      var d = phoneDigits(el.value);
      if (d.length < 10) return M.phoneShort;
      if ('34589'.indexOf(d[0]) < 0) return M.phoneBad;
      return '';
    }
    if (t === 'select') return el.value ? '' : M.select;
    if (t === 'consent') return el.checked ? '' : M.consent;
    return '';
  }

  function initForm(form) {
    var kind = form.dataset.form, fields = $$('[data-v]', form);
    fields.forEach(function (el) {
      if (el.dataset.v === 'phone') attachMask(el);
      el.addEventListener('blur', function () { if ((el.dataset.v === 'name' || el.dataset.v === 'text' || el.dataset.v === 'phone') && el.value.trim()) setFieldError(el, check(el)); });
      var evn = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'input';
      el.addEventListener(evn, function () { if (el.getAttribute('aria-invalid') === 'true') setFieldError(el, check(el)); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      fields.forEach(function (el) { var m = check(el); setFieldError(el, m); if (m && !first) first = el; });
      if (first) { first.focus(); return; }
      showSuccess(form, kind);
    });
  }

  function showSuccess(form, kind) {
    var nameEl = form.elements.name, name = nameEl && nameEl.value ? nameEl.value.trim() : '';
    var tpl = M.success[kind] || M.success.order;
    var text = name ? tpl.replace('{name}', name) : tpl.replace('Спасибо, {name}! ', '').replace('{name}', '');
    var box = document.createElement('div');
    box.className = 'form-success'; box.setAttribute('role', 'status'); box.tabIndex = -1;
    box.innerHTML = icon('i-check', 28) + '<p class="form-success__text"></p><button type="button" class="btn btn--ghost">Отправить ещё одну</button>';
    box.querySelector('p').textContent = text;
    form.hidden = true;
    form.parentNode.insertBefore(box, form.nextSibling);
    box.querySelector('button').addEventListener('click', function () {
      form.reset(); $$('[data-v]', form).forEach(function (el) { setFieldError(el, ''); });
      box.remove(); form.hidden = false; var f = form.querySelector('input'); if (f) f.focus();
    });
    box.focus();
  }

  /* ---------- sticky-панель, FAB, обратный звонок ---------- */
  function initFloating() {
    var cta = $('#sticky-cta'), hero = $('.hero');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var e = es[0]; cta.dataset.visible = (!e.isIntersecting && e.boundingClientRect.bottom <= 0) ? 'true' : 'false';
      }).observe(hero);
    } else cta.dataset.visible = 'true';
    document.addEventListener('focusin', function (e) { if (e.target.matches('input, select, textarea')) document.body.classList.add('keyboard-open'); });
    document.addEventListener('focusout', function () { document.body.classList.remove('keyboard-open'); });

    var fab = $('#fab'), cb = $('#callback');
    function setCb(open) { cb.hidden = !open; fab.setAttribute('aria-expanded', open ? 'true' : 'false'); if (open) { var f = cb.querySelector('input'); if (f) f.focus(); } }
    fab.addEventListener('click', function () { setCb(cb.hidden); });
    $('#callback-close').addEventListener('click', function () { setCb(false); fab.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !cb.hidden) { setCb(false); fab.focus(); } });
  }

  /* ---------- reveal, маршрут шагов ---------- */
  function initReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); }
    else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
      els.forEach(function (e) { io.observe(e); });
    }
    var wrap = $('.steps-wrap'), steps = $('#steps');
    function route() { var r = $('.route', wrap); if (r) wrap.style.setProperty('--route-w', Math.max(0, r.clientWidth - 56) + 'px'); }
    route(); window.addEventListener('resize', route);
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { wrap.classList.add('is-in'); io2.disconnect(); } }); }, { threshold: 0.3 });
      io2.observe(steps);
    } else wrap.classList.add('is-in');
  }

  /* ---------- глобальные клики по [data-need], заглушкам-ссылкам ---------- */
  function initGlobal() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-need]');
      if (a) presetOrder({ need: a.dataset.need });
      var link = e.target.closest('a[href="#"]');
      if (link) {
        e.preventDefault();
        if (link.id === 'sample-link' || link.classList.contains('js-sample')) {
          var note = $('#sample-note'); if (note) note.textContent = 'Образец договора появится здесь — пока запросите его по телефону или в заявке.';
        }
      }
    });
  }

  /* ---------- запуск ---------- */
  function init() {
    bindContacts(); renderNeeds(); renderFacts(); renderMarquee(); renderCatalog(); renderBlocks();
    renderZones(); renderReviews(); renderFaq(); renderContacts(); bindContacts();
    initMenu(); initTabs(); initCalc();
    $$('form[data-form]').forEach(initForm);
    initFloating(); initGlobal(); initReveal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

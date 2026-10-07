/* ЭКО СЕРВИС НОВОСИБИРСК, v2: подбор кабины за 3 шага, помощник «сколько кабин нужно», сравнение моделей, навигация по якорям,
   сводка на странице модели, поиск по вопросам. Классический скрипт (defer), без модулей и сети.
   На сайте нет форм и персональных данных: поля здесь только числа и выбор из вариантов, ничего не отправляется. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const S = window.SITE, CALC = window.SITE_CALC, UI = window.SITE_UI || {};
  if (!S || !CALC) return;
  const BASE = document.documentElement.dataset.base || '';
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rub = S.rub, NBSP = /[  ]/g;
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ic = (n) => '<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-' + n + '"/></svg>';
  const toInt = (v) => (/^\s*\d+\s*$/.test(String(v).replace(NBSP, ' ')) ? parseInt(String(v).replace(/\s/g, ''), 10) : NaN);
  const calcHref = (o) => BASE + '/ceny/index.html?' + Object.keys(o).filter((k) => o[k] !== '' && o[k] != null).map((k) => k + '=' + o[k]).join('&') + '#calc';
  const mergeUrl = UI.mergeUrl || function () {};

  /* ---------- Подбор кабины за 3 шага ---------- */
  $$('[data-picker]').forEach(function (root) {
    const steps = $$('[data-pk-step]', root), back = $('[data-pk-back]', root), next = $('[data-pk-next]', root), no = $('[data-pk-no]', root), bar = $('[data-pk-bar]', root);
    const err = $('[data-pk-err]', root), res = $('[data-pk-result]', root), nav = $('.pk__nav', root), stepsBox = $('.pk__steps', root), prog = $('.pk__prog', root);
    const kmBox = $('[data-pk-kmbox]', root);
    const g = (id) => $('#' + id, root);
    const radio = (name) => { const r = $$('input[name="' + name + '"]', root).filter((x) => x.checked)[0]; return r ? r.value : ''; };
    const setRadio = (name, v) => $$('input[name="' + name + '"]', root).forEach((x) => { x.checked = x.value === v; });
    const W = S.picker.workersPerCabin, D = S.rates.delivery;
    let step = 1;

    function read() {
      return { task: radio('pk-task'), days: toInt(g('pk-days').value), du: radio('pk-du') || 'day', workers: toInt(g('pk-workers').value),
        guests: toInt(g('pk-guests').value), dur: radio('pk-dur'), alc: radio('pk-alc') === 'yes', qty: toInt(g('pk-qty').value), purpose: radio('pk-for') || 'dacha',
        zone: radio('pk-zone') || 'city', km: toInt(g('pk-km').value) };
    }
    function bad(el, msg) { err.textContent = msg; if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); } return msg; }
    function clearErr() { err.textContent = ''; $$('[aria-invalid]', root).forEach((x) => x.removeAttribute('aria-invalid')); }
    function validate(n) {
      clearErr(); const st = read();
      if (n === 1) { if (!st.task) return bad($$('input[name="pk-task"]', root)[0], 'Выберите, что вам нужно'); return ''; }
      if (n === 2) {
        if (st.task === 'stroyka') {
          const d = st.days * (st.du === 'month' ? S.rates.daysInMonth : 1);
          if (!(st.days >= 1) || d > S.rates.maxDays) return bad(g('pk-days'), 'Укажите срок аренды: от 1 суток');
          if (!(st.workers >= 1) || st.workers > 100000) return bad(g('pk-workers'), 'Укажите число рабочих, например 30');
        } else if (st.task === 'event') {
          if (!(st.guests >= 1) || st.guests > S.eventRules.maxGuests) return bad(g('pk-guests'), 'Укажите число гостей от 1 до ' + S.fmt(S.eventRules.maxGuests));
          if (!st.dur) return bad(null, 'Выберите длительность');
        } else if (st.task === 'buy') {
          if (!(st.qty >= 1) || st.qty > S.rates.maxCabins) return bad(g('pk-qty'), 'Укажите количество кабин от 1 до ' + S.rates.maxCabins);
        }
        return '';
      }
      if (n === 3 && st.zone === 'region' && (!(st.km >= 1) || st.km > D.maxKm)) return bad(g('pk-km'), 'Укажите расстояние от 1 до ' + D.maxKm + ' км');
      return '';
    }

    const zoneP = (st) => (st.zone === 'city' ? { z: 'city', km: 0 } : st.zone === 'near' ? { z: 'region', km: D.nearKm } : { z: 'region', km: st.km });
    const zoneTxt = (st) => (st.zone === 'city' ? 'Новосибирск' : st.zone === 'near' ? 'до ' + D.nearKm + ' км от города' : 'область, ' + st.km + ' км');
    const durTxt = (days, du) => (du === 'month' ? days + ' ' + CALC.plural(days, 'месяц', 'месяца', 'месяцев') + ' (' + days * S.rates.daysInMonth + ' сут.)' : days + ' ' + CALC.plural(days, 'сутки', 'суток', 'суток'));
    const line = (dt, dd, cls) => '<div' + (cls ? ' class="' + cls + '"' : '') + '><dt>' + dt + '</dt><dd>' + dd + '</dd></div>';

    // Расчёт рекомендации. Цены считает calc.js: те же функции, что у калькулятора и калькулятора мероприятий.
    function compute(st) {
      const zp = zoneP(st), svc = (id) => (S.rates.serviceOptions.find((o) => o.id === id) || {}).label.toLowerCase();
      if (st.task === 'stroyka') {
        const m = S.modelById('standart'), n = Math.max(1, Math.ceil(st.workers / W.calc)), d = st.days * (st.du === 'month' ? S.rates.daysInMonth : 1);
        const u = d >= 7 ? S.picker.stroykaService : 'none';
        const r = CALC.calculate(S, { n: n, d: d, u: u, z: zp.z, km: zp.km, m: m.slug });
        const out = { kind: 'stroyka', rec: n + ' × ' + m.name, why: 'Ориентир: 1 кабина на ' + S.terms.workersPerCabin + ' рабочих, для ' + st.workers + ' ' + CALC.plural(st.workers, 'рабочего', 'рабочих', 'рабочих') + ' берём ' + n + ' (считаем по ' + W.calc + ' человек на кабину). ' + m.name + ' — кабина для длительной аренды: цена за сутки снижается с ростом срока' + (u !== 'none' ? '; обслуживание ' + svc(u) + '.' : '.'), r: r };
        if (r.ok) {
          out.lines = [line('Аренда: ' + n + ' × ' + d + ' сут. × ' + rub(r.unit) + (r.pct ? ', скидка ' + r.pct + '%' : ''), rub(r.rent - r.discount)), r.service ? line('Обслуживание: ' + r.V + ' ' + CALC.plural(r.V, 'визит', 'визита', 'визитов') + ' × ' + n + ' × ' + rub(r.visit), rub(r.service)) : '', line('Доставка и вывоз: ' + r.trips + ' ' + CALC.plural(r.trips, 'рейс', 'рейса', 'рейсов'), rub(r.delivery))].join('');
          out.total = r.total; out.prefix = '≈\u00a0';
          out.summary = 'Расчёт с сайта ЭКО СЕРВИС: ' + m.name + ', ' + n + ' шт., ' + d + ' сут., обслуживание: ' + svc(u) + ', доставка: ' + zoneTxt(st) + ', итого ≈ ' + rub(r.total);
          out.link = calcHref({ n: n, d: d, u: u, z: zp.z, km: zp.km || '', m: m.slug }); out.linkText = 'Открыть в подробном калькуляторе';
        }
        out.params = { stroyka: 1 };
        return out;
      }
      if (st.task === 'event') {
        const e = CALC.events(S, { guests: st.guests, dur: st.dur, alcohol: st.alc });
        const kom = S.modelById('komfort'), vip = S.modelById('vip'), limit = S.eventRules.guestsPerCabin[(S.eventRules.durations.find((x) => x.id === st.dur) || {}).limitKey];
        const parts = []; if (e.komfort) parts.push(e.komfort + ' × ' + kom.name); if (e.vip) parts.push(e.vip + ' × ' + vip.name);
        const out = { kind: 'event', rec: parts.join(' + '), why: 'Ориентир: 1 кабина на ' + limit + ' гостей при программе «' + (S.eventRules.durations.find((x) => x.id === st.dur) || {}).label.toLowerCase() + '»' + (st.alc ? ', с алкоголем на треть больше' : '') + '. Каждая ' + S.eventRules.vipShare + '-я кабина — МТК VIP с рукомойником и зеркалом, остальные МТК Комфорт.', e: e };
        const mix = []; if (e.komfort) mix.push({ m: 'komfort', n: e.komfort }); if (e.vip) mix.push({ m: 'vip', n: e.vip });
        const r = e.total <= S.rates.maxCabins ? CALC.calculate(S, { mix: mix, d: 1, u: 'none', z: zp.z, km: zp.km }) : { ok: false, custom: true };
        out.r = r;
        if (r.ok) {
          out.lines = [line('Аренда на 1 сутки: ' + (e.komfort ? e.komfort + ' × ' + rub(kom.rent.perDay) : '') + (e.komfort && e.vip ? ' + ' : '') + (e.vip ? e.vip + ' × ' + rub(vip.rent.perDay) : ''), rub(r.rent)), r.pct ? line('Скидка за количество −' + r.pct + '%', '−' + rub(r.discount), 'is-disc') : '', line('Доставка и вывоз: ' + r.trips + ' ' + CALC.plural(r.trips, 'рейс', 'рейса', 'рейсов'), rub(r.delivery))].join('');
          out.total = r.total; out.prefix = '≈\u00a0';
          out.summary = 'Расчёт с сайта ЭКО СЕРВИС: ' + parts.join(' + ') + ' (' + st.guests + ' гостей, ' + (S.eventRules.durations.find((x) => x.id === st.dur) || {}).label.toLowerCase() + ', алкоголь: ' + (st.alc ? 'да' : 'нет') + '), 1 сут., обслуживание: без обслуживания, доставка: ' + zoneTxt(st) + ', итого ≈ ' + rub(r.total);
          out.link = calcHref({ n: e.total, mix: 'komfort:' + e.komfort + ',vip:' + e.vip, d: 1, u: 'none', z: zp.z, km: zp.km || '' }); out.linkText = 'Открыть в подробном калькуляторе';
        }
        return out;
      }
      // покупка: цены «от» плюс доставка
      const m = S.modelById(st.purpose === 'object' ? 'standart' : 'ekonom'), alt = S.modelById(st.purpose === 'object' ? 'ekonom' : 'standart');
      const r = CALC.sale(S, { m: m.slug, n: st.qty, z: zp.z, km: zp.km }), ra = CALC.sale(S, { m: alt.slug, n: st.qty, z: zp.z, km: zp.km });
      const out = { kind: 'buy', rec: st.qty + ' × ' + m.name, why: (st.purpose === 'object' ? m.name + ' крупнее и лучше оснащена: подходит для объекта и интенсивного использования.' : m.name + ' — простая и лёгкая кабина для дачи и участка, самая низкая цена.') + ' Гарантия ' + S.terms.warrantyMonths + ' месяцев. Купить можно по телефону или через мессенджер.', r: r };
      if (r.ok) {
        out.lines = [line(m.name + ': ' + st.qty + ' × от ' + rub(m.sale.from), rub(r.price)), line('Доставка: ' + r.trips + ' ' + CALC.plural(r.trips, 'рейс', 'рейса', 'рейсов'), rub(r.delivery)), ra.ok ? line('Для сравнения: ' + st.qty + ' × ' + alt.name + ' с доставкой', 'от ' + rub(ra.total)) : ''].join('');
        out.total = r.total; out.prefix = 'от\u00a0';
        out.summary = 'Расчёт с сайта ЭКО СЕРВИС: покупка, ' + m.name + ', ' + st.qty + ' шт. (' + S.picker.purposes[st.purpose].toLowerCase() + '), доставка: ' + zoneTxt(st) + ', итого от ' + rub(r.total);
        out.link = BASE + '/prodazha/index.html'; out.linkText = 'Условия покупки';
      }
      return out;
    }

    function resultHtml(o) {
      const C = S.contacts;
      const head = '<h3 class="quote__h pk__rt" id="pk-rt" tabindex="-1">Вам подойдёт</h3><p class="pk__rec">' + esc(o.rec).replace(NBSP, ' ') + '</p><p class="pk__why">' + esc(o.why) + '</p>';
      if (!o.summary) {
        const msg = o.r && o.r.custom ? S.forms.calcMessages.custom : 'Проверьте введённые значения.';
        return head + '<p class="notice notice--info"><span class="notice__ico i i--alert" aria-hidden="true"></span><span>' + esc(msg) + '</span></p>' +
          '<div class="quote__act"><a class="btn btn--primary btn--block" href="' + C.phoneHref + '">' + ic('phone') + ' Позвонить</a><a class="btn btn--outline btn--block" href="' + C.whatsappUrl + '" target="_blank" rel="noopener">' + ic('whatsapp') + ' WhatsApp</a></div>' +
          '<p class="pk__again"><button class="btn btn--link" type="button" data-pk-edit>Изменить ответы</button></p>';
      }
      return head + '<dl class="quote__list">' + o.lines + '</dl><p class="quote__total"><span class="label">Ориентировочно</span><output class="price price--xl">' + o.prefix + rub(o.total) + '</output></p>' +
        '<p class="quote__note small">Это предварительный расчёт' + (o.kind === 'buy' ? ': цены «от», итог зависит от комплектации.' : '. Итоговую стоимость называем до оплаты.') + '</p>' +
        '<div class="quote__act" data-share><a class="btn btn--primary btn--block" href="' + C.phoneHref + '">' + ic('phone') + ' Позвонить</a>' +
        '<a class="btn btn--outline btn--block" data-share-wa href="' + C.whatsappUrl + '" target="_blank" rel="noopener">' + ic('whatsapp') + ' Отправить в WhatsApp</a>' +
        '<button class="btn btn--outline btn--block" type="button" data-share-copy>' + ic('copy') + ' Скопировать расчёт</button>' +
        '<p class="quote__copied" data-share-status role="status" aria-live="polite"></p></div>' +
        '<p class="pk__links"><a class="btn btn--link" data-pk-open href="' + esc(o.link) + '">' + esc(o.linkText) + '</a><button class="btn btn--link" type="button" data-pk-edit>Изменить ответы</button></p>';
    }

    function save(stepVal) {
      const st = read();
      mergeUrl({ pt: st.task || null, pd: st.task === 'stroyka' ? st.days : null, pu: st.task === 'stroyka' ? st.du : null, pw: st.task === 'stroyka' ? st.workers : null,
        pg: st.task === 'event' ? st.guests : null, ph: st.task === 'event' ? st.dur : null, pa: st.task === 'event' ? (st.alc ? 'yes' : 'no') : null,
        pq: st.task === 'buy' ? st.qty : null, pf: st.task === 'buy' ? st.purpose : null, pz: stepVal === 1 || stepVal === 2 ? null : st.zone, pk: st.zone === 'region' && stepVal !== 1 && stepVal !== 2 ? st.km : null, ps: stepVal });
    }

    function show(n, focus) {
      step = n; res.hidden = true; stepsBox.hidden = false; nav.hidden = false; prog.hidden = false;
      steps.forEach((s, i) => { s.hidden = i + 1 !== n; });
      no.textContent = 'Шаг ' + n + ' из 3'; bar.style.width = (n / 3 * 100) + '%';
      back.hidden = n === 1; next.textContent = n === 3 ? 'Показать подбор' : 'Далее';
      const st = read();
      if (n === 1) next.disabled = !st.task; else next.disabled = false;
      if (n === 2) {
        $$('[data-pk-sub]', root).forEach((x) => { x.hidden = x.dataset.pkSub !== st.task; });
        $('[data-pk-q2]', root).textContent = { stroyka: 'Расскажите об объекте', event: 'Расскажите о мероприятии', buy: 'Сколько кабин и для чего' }[st.task] || 'Расскажите о задаче';
      }
      if (kmBox) kmBox.hidden = radio('pk-zone') !== 'region';
      clearErr();
      if (focus) { const q = $('.pk__q', steps[n - 1]); if (q) { q.tabIndex = -1; q.focus(); } }
      save(n);
    }
    function showResult(focus) {
      const st = read(), o = compute(st);
      steps.forEach((s) => { s.hidden = true; }); nav.hidden = true; stepsBox.hidden = true; res.hidden = false; clearErr();
      no.textContent = 'Готово: подбор по 3 шагам'; bar.style.width = '100%';
      res.innerHTML = resultHtml(o);
      const box = $('[data-share]', res); if (box && UI.bindShare) UI.bindShare(box, () => o.summary);
      const edit = $$('[data-pk-edit]', res); edit.forEach((b) => b.addEventListener('click', () => { show(1, true); }));
      step = 4; save('r');
      if (focus) { const h = $('#pk-rt', res); if (h) h.focus({ preventScroll: true }); res.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); }
      root._last = o;
    }
    function advance() {
      const m = validate(step); if (m) return;
      if (step < 3) show(step + 1, true); else showResult(true);
    }
    next.addEventListener('click', advance);
    back.addEventListener('click', () => { clearErr(); if (step > 1) show(step - 1, true); });
    $$('input[name="pk-task"]', root).forEach((r) => r.addEventListener('change', () => { next.disabled = false; clearErr(); }));
    $$('input[name="pk-zone"]', root).forEach((r) => r.addEventListener('change', () => { if (kmBox) kmBox.hidden = r.value !== 'region' || !r.checked; clearErr(); }));
    $$('input[type=text]', root).forEach((i) => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); advance(); } }));

    // восстановление из адресной строки
    (function restore() {
      const p = new URLSearchParams(location.search), pt = p.get('pt'); if (['stroyka', 'event', 'buy'].indexOf(pt) < 0) return show(1, false);
      setRadio('pk-task', pt);
      const set = (id, k) => { const v = p.get(k); if (v && /^\d+$/.test(v)) g(id).value = v; };
      set('pk-days', 'pd'); set('pk-workers', 'pw'); set('pk-guests', 'pg'); set('pk-qty', 'pq'); set('pk-km', 'pk');
      if (['day', 'month'].indexOf(p.get('pu')) >= 0) setRadio('pk-du', p.get('pu'));
      if (S.eventRules.durations.some((x) => x.id === p.get('ph'))) setRadio('pk-dur', p.get('ph'));
      if (['yes', 'no'].indexOf(p.get('pa')) >= 0) setRadio('pk-alc', p.get('pa'));
      if (['dacha', 'object'].indexOf(p.get('pf')) >= 0) setRadio('pk-for', p.get('pf'));
      if (['city', 'near', 'region'].indexOf(p.get('pz')) >= 0) setRadio('pk-zone', p.get('pz'));
      const ps = p.get('ps');
      if (ps === 'r' && !validate(2) && !validate(3)) { showResult(false); if (!location.hash) res.scrollIntoView({ block: 'center' }); return; }
      const n = ps === '3' && !validate(2) ? 3 : ps === '2' || ps === '3' ? 2 : 1;
      show(n, false);
    })();
  });

  /* ---------- «Сколько кабин нужно»: гости и часы ---------- */
  $$('[data-chelp]').forEach(function (box) {
    const g = $('[data-ch=guests]', box), h = $('[data-ch=hours]', box), out = $('[data-ch-out]', box), link = $('[data-ch-link]', box);
    function run() {
      const guests = toInt(g.value), hours = toInt(h.value);
      if (!(guests >= 1) || guests > S.eventRules.maxGuests || !(hours >= 1)) { out.textContent = 'Укажите гостей и часы'; link.hidden = true; return; }
      const dur = hours <= 4 ? 'to4h' : hours <= 8 ? 'to8h' : 'over8h';
      const r = CALC.events(S, { guests: guests, dur: dur, alcohol: false });
      out.textContent = '≈ ' + r.total + ' ' + CALC.plural(r.total, 'кабина', 'кабины', 'кабин') + ' (из них VIP ' + r.vip + ')';
      link.hidden = r.total > S.rates.maxCabins;
      link.href = calcHref({ n: r.total, mix: 'komfort:' + r.komfort + ',vip:' + r.vip, d: 1 });
    }
    g.addEventListener('input', run); h.addEventListener('input', run);
  });

  /* ---------- Сравнение моделей: подсказка и тени прокрутки на телефоне ---------- */
  $$('[data-cmp]').forEach(function (box) {
    const sc = $('.cmp__scroll', box);
    function upd() {
      const max = sc.scrollWidth - sc.clientWidth;
      box.classList.toggle('cmp--l', sc.scrollLeft > 4);
      box.classList.toggle('cmp--r', sc.scrollLeft < max - 4);
      box.classList.toggle('cmp--fit', max <= 2);
      if (sc.scrollLeft > 24) box.classList.add('cmp--seen');
    }
    sc.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
  });

  /* ---------- Цены: якорная навигация с подсветкой раздела ---------- */
  $$('[data-subnav]').forEach(function (nav) {
    const links = $$('[data-subnav-link]', nav), list = $('.subnav__list', nav);
    const secs = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    function mark(id) {
      links.forEach((a) => { const on = a.getAttribute('href') === '#' + id; a.classList.toggle('is-active', on); if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); if (on && list) { const l = a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2; list.scrollLeft = Math.max(0, l); } });
    }
    if (!('IntersectionObserver' in window)) return;
    const vis = new Map();
    const io = new IntersectionObserver((en) => {
      en.forEach((x) => vis.set(x.target.id, x.isIntersecting));
      const on = secs.filter((s) => vis.get(s.id)); // раздел, пересекающий полосу под панелью
      mark(on.length ? on[on.length - 1].id : '');
    }, { rootMargin: '-140px 0px -70% 0px' });
    secs.forEach((s) => io.observe(s));
  });

  /* ---------- Страница модели: плавающая сводка, когда блок цены ушёл вверх ---------- */
  $$('[data-msum]').forEach(function (bar) {
    const price = $('[data-pricebox]'); if (!price || !('IntersectionObserver' in window)) return;
    $$('[data-wa-plain]', bar).forEach((a) => { a.href = UI.waUrl ? UI.waUrl(a.dataset.waText) : a.href; });
    new IntersectionObserver((en) => { const r = en[0]; bar.hidden = !(!r.isIntersecting && r.boundingClientRect.bottom < 0); }).observe(price);
  });

  /* ---------- Вопросы и ответы: мгновенный поиск по тексту ---------- */
  $$('[data-faqf]').forEach(function (box) {
    const input = $('#faq-q', box), st = $('[data-faqf-st]', box), empty = $('[data-faqf-empty]', box), page = $('.faq-page');
    if (!input || !page) return;
    const items = $$('details.acc', page), panels = $$('[data-tab-panel]', page), tabs = $$('[role=tab]', page), list = $('.tabs', page);
    const norm = (t) => t.toLowerCase().replace(/ё/g, 'е').replace(NBSP, ' ');
    const texts = items.map((d) => norm(d.textContent));
    function restore() { panels.forEach((p, i) => { p.hidden = tabs[i] ? tabs[i].getAttribute('aria-selected') !== 'true' : false; }); if (list) list.hidden = false; }
    function run() {
      const q = norm(input.value.trim());
      if (!q) { items.forEach((d) => { d.hidden = false; }); restore(); empty.hidden = true; st.textContent = ''; return; }
      const words = q.split(/\s+/);
      let n = 0;
      items.forEach((d, i) => { const ok = words.every((w) => texts[i].indexOf(w) >= 0); d.hidden = !ok; if (ok) n++; });
      panels.forEach((p) => { p.hidden = false; const any = $$('details.acc', p).some((d) => !d.hidden); p.hidden = !any; });
      if (list) list.hidden = true;
      empty.hidden = n > 0;
      st.textContent = 'Найдено вопросов: ' + n;
    }
    input.addEventListener('input', run);
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape' && input.value) { input.value = ''; run(); } });
  });
})();

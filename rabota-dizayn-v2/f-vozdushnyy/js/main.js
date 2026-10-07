/* ЭКО СЕРВИС НОВОСИБИРСК, темы E/F: интерактив (defer, без модулей). Без фреймворков и сетевых запросов. Данные: window.SITE, ядро расчёта: window.SITE_CALC. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const BASE = document.documentElement.dataset.base || '';
  const S = window.SITE, CALC = window.SITE_CALC;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Шапка: выпадающие списки ---------- */
  const items = $$('.nav__item');
  function closeDd(except) {
    items.forEach((it) => { const b = $('.nav__btn', it); if (b && it !== except) b.setAttribute('aria-expanded', 'false'); });
  }
  items.forEach((it) => {
    const b = $('.nav__btn', it); if (!b) return;
    let t;
    let openedAt = 0;
    const openIt = () => { closeDd(it); b.setAttribute('aria-expanded', 'true'); openedAt = Date.now(); };
    b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      if (open && Date.now() - openedAt < 400) return; // мышь только что открыла список наведением
      if (open) b.setAttribute('aria-expanded', 'false'); else openIt();
    });
    b.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); openIt(); const l = $('.nav__panel a', it); if (l) l.focus(); }
    });
    it.addEventListener('keydown', (e) => { if (e.key === 'Escape' && b.getAttribute('aria-expanded') === 'true') { b.setAttribute('aria-expanded', 'false'); b.focus(); } });
    it.addEventListener('focusout', (e) => { if (!it.contains(e.relatedTarget)) b.setAttribute('aria-expanded', 'false'); });
    if (window.matchMedia('(hover:hover)').matches) {
      it.addEventListener('mouseenter', () => { clearTimeout(t); t = setTimeout(openIt, 120); });
      it.addEventListener('mouseleave', () => { clearTimeout(t); t = setTimeout(() => b.setAttribute('aria-expanded', 'false'), 160); });
    }
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav__item')) closeDd(); });

  /* ---------- Мобильное меню: ловушка фокуса, Esc, inert ---------- */
  const burger = $('.burger'), menu = $('#m-menu');
  const inertTargets = () => $$('main, .site-footer, .sticky-cta, .skip');
  function setMenu(open, noFocus) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    inertTargets().forEach((n) => { if (open) n.setAttribute('inert', ''); else n.removeAttribute('inert'); });
    if (open) { const f = $('a, button', menu); if (f) f.focus(); } else if (!noFocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => {
      if (e.target === menu) { setMenu(false); return; }
      const l = e.target.closest('a[href]');
      if (l && (l.getAttribute('href').charAt(0) === '#' || l.pathname === location.pathname)) setMenu(false, true); // якорь на этой же странице
    });
    window.addEventListener('hashchange', () => { if (burger.getAttribute('aria-expanded') === 'true') setMenu(false, true); });
    $$('.m-group', menu).forEach((g) => g.addEventListener('click', () => {
      const open = g.getAttribute('aria-expanded') === 'true';
      g.setAttribute('aria-expanded', String(!open)); $('#' + g.getAttribute('aria-controls')).hidden = open;
    }));
    document.addEventListener('keydown', (e) => {
      if (burger.getAttribute('aria-expanded') !== 'true') return;
      if (e.key === 'Escape') { e.preventDefault(); setMenu(false); return; }
      if (e.key !== 'Tab') return;
      const list = $$('a[href], button', menu).filter((x) => x.offsetParent !== null).concat([burger]);
      const first = list[0], last = list[list.length - 1], cur = document.activeElement;
      // порядок обхода: бургер (в шапке) -> меню; ловушка замыкает цикл
      if (!e.shiftKey && cur === burger) { e.preventDefault(); first.focus(); }
      else if (!e.shiftKey && cur === list[list.length - 2]) { e.preventDefault(); burger.focus(); }
      else if (e.shiftKey && cur === first) { e.preventDefault(); burger.focus(); }
      else if (e.shiftKey && cur === burger) { e.preventDefault(); list[list.length - 2].focus(); }
      else if (!menu.contains(cur) && cur !== burger) { e.preventDefault(); first.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth >= 1180 && burger.getAttribute('aria-expanded') === 'true') setMenu(false); });
  }

  /* ---------- Нижняя панель связи на телефоне: после первого экрана, скрыта рядом с блоком связи и подвалом ---------- */
  const sticky = $('[data-sticky]');
  if (sticky && 'IntersectionObserver' in window) {
    let pastHero = false, covered = 0;
    const upd = () => sticky.classList.toggle('is-visible', pastHero && !covered);
    const hero = $('[data-hero]');
    if (hero) {
      new IntersectionObserver((en) => { const r = en[0]; pastHero = !r.isIntersecting && r.boundingClientRect.bottom < 0; upd(); }).observe(hero);
    } else { const onS = () => { pastHero = window.scrollY > window.innerHeight; upd(); }; window.addEventListener('scroll', onS, { passive: true }); onS(); }
    const vis = new Map();
    $$('.cta, .site-footer').forEach((f) => {
      new IntersectionObserver((en) => { vis.set(f, en[0].isIntersecting); covered = [...vis.values()].filter(Boolean).length; upd(); }).observe(f);
    });
  }

  /* ---------- Общие помощники: WhatsApp с готовым текстом, копирование, всплывающая подсказка ---------- */
  const CM = S.forms.calcMessages;
  const plain = (t) => String(t).replace(/[  ]/g, ' ');
  function waUrl(text) { return S.contacts.whatsappUrl + (text ? '?text=' + encodeURIComponent(plain(text)) : ''); }
  function copyText(text) {
    return new Promise((res, rej) => {
      const fallback = () => {
        try {
          const ta = document.createElement('textarea');
          ta.value = text; ta.setAttribute('readonly', ''); ta.setAttribute('aria-hidden', 'true'); ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
          document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
          const ok = document.execCommand('copy'); document.body.removeChild(ta); if (ok) res(); else rej(new Error('copy'));
        } catch (e) { rej(e); }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(res, fallback); else fallback();
    });
  }
  let toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); document.body.appendChild(toastEl); }
    toastEl.textContent = ''; clearTimeout(toastT);
    setTimeout(() => { toastEl.textContent = msg; toastEl.classList.add('is-on'); }, 20);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2200);
  }
  // Блок действий с расчётом: [data-share-wa], [data-share-copy], [data-share-status]; текст отдаёт getText()
  function bindShare(box, getText) {
    if (!box) return null;
    const wa = $('[data-share-wa]', box), cp = $('[data-share-copy]', box), st = $('[data-share-status]', box);
    const refresh = () => { const t = getText(); if (wa) wa.href = waUrl(t); if (st) st.textContent = ''; if (cp) cp.setAttribute('aria-disabled', t ? 'false' : 'true'); };
    if (cp) cp.addEventListener('click', () => {
      const t = getText(); if (!t) { if (st) st.textContent = 'Сначала заполните расчёт'; return; }
      copyText(plain(t)).then(() => { if (st) { st.textContent = ''; setTimeout(() => { st.textContent = CM.copied; }, 20); } }, () => { if (st) st.textContent = CM.copyFail; });
    });
    box._refresh = refresh; refresh();
    return refresh;
  }
  window.SITE_UI = { waUrl, copyText, toast, bindShare, plain };

  /* ---------- Телефон на компьютере: клик копирует номер (на телефонах работает tel:) ---------- */
  if (window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href^="tel:"]'); if (!a || e.defaultPrevented || e.button) return;
      e.preventDefault();
      copyText(S.contacts.phone).then(() => toast(CM.phoneCopied), () => toast(S.contacts.phone));
    });
  }

  /* ---------- Калькулятор стоимости ---------- */
  const rubF = S.rub, MAXKM = S.rates.delivery.maxKm;
  const APX = '<span class="apx" aria-hidden="true"></span><span class="visually-hidden">около </span>';
  function parseMix(v) {
    if (!v) return null; const out = []; let sum = 0;
    String(v).split(',').forEach((x) => { const p = x.split(':'), m = S.modelById(p[0]); if (m && m.rent && /^\d+$/.test(p[1] || '') && +p[1] > 0) { out.push({ m: m.slug, n: +p[1] }); sum += +p[1]; } });
    return out.length && sum <= S.rates.maxCabins ? out : null;
  }
  function paramsFromUrl() {
    const p = new URLSearchParams(location.search), o = {};
    const int = (k, lo, hi) => { const v = p.get(k); if (v && /^\d+$/.test(v) && +v >= lo && +v <= hi) o[k] = +v; };
    int('n', 1, S.rates.maxCabins); int('d', 1, S.rates.maxDays); int('km', 1, MAXKM);
    if (['none', 'weekly', 'twice', 'daily'].indexOf(p.get('u')) >= 0) o.u = p.get('u');
    if (['city', 'region'].indexOf(p.get('z')) >= 0) o.z = p.get('z');
    const m = S.modelById(p.get('m') || ''); if (m && m.rent) o.m = m.slug;
    const mix = parseMix(p.get('mix')); if (mix) { o.mix = mix; o.n = mix.reduce((s, x) => s + x.n, 0); }
    return o;
  }
  const mixLabel = (mix) => mix.map((x) => x.n + ' × ' + S.modelById(x.m).name).join(' + ');
  const urlP = paramsFromUrl();
  function mergeUrl(obj) {
    try { const p = new URLSearchParams(location.search); Object.keys(obj).forEach((k) => { if (obj[k] === null || obj[k] === '') p.delete(k); else p.set(k, obj[k]); }); const q = p.toString(); history.replaceState(null, '', (q ? '?' + q : location.pathname.split('/').pop() || '') + location.hash); } catch (x) { /* file:// */ }
  }
  window.SITE_UI.mergeUrl = mergeUrl;
  $$('.calc').forEach((root) => {
    const mode = root.dataset.calc, id = root.id, full = mode === 'full';
    const q = (s) => $(s, root);
    const nIn = q('#' + id + '-n'), dIn = q('#' + id + '-d'), kmIn = q('#' + id + '-km'), mSel = q('#' + id + '-m');
    const radio = (suffix) => $$('input[name="' + id + '-' + suffix + '"]', root);
    const checked = (suffix) => { const r = radio(suffix).find((x) => x.checked); return r ? r.value : null; };
    const body = q('.quote__body'), quote = q('.quote'), kmBox = q('.calc__km'), share = q('[data-share]');
    const touched = {};
    let mix = full && mSel && urlP.mix ? urlP.mix : null;
    // предзаполнение из URL
    if (urlP.n) nIn.value = urlP.n;
    if (urlP.d) { const mo = urlP.d >= S.rates.daysInMonth && urlP.d % S.rates.daysInMonth === 0; dIn.value = mo ? urlP.d / S.rates.daysInMonth : urlP.d; radio('du').forEach((r) => { r.checked = r.value === (mo ? 'month' : 'day'); }); }
    if (urlP.u) radio('u').forEach((r) => { r.checked = r.value === urlP.u; });
    if (urlP.z) radio('z').forEach((r) => { r.checked = r.value === urlP.z; });
    if (urlP.km) kmIn.value = urlP.km;
    if (urlP.m && mSel) mSel.value = urlP.m;
    if (mix) { const o = document.createElement('option'); o.value = 'mix'; o.textContent = 'Набор из подбора: ' + mixLabel(mix); mSel.insertBefore(o, mSel.firstChild); mSel.value = 'mix'; }
    const leaveMix = () => { if (mix) { mix = null; const o = $('option[value="mix"]', mSel); if (o) o.remove(); mSel.value = 'komfort'; } };
    const state = () => {
      const unit = checked('du'), dv = parseInt(dIn.value.replace(/\s/g, ''), 10);
      const km = kmIn.value.trim() === '' ? NaN : parseInt(kmIn.value, 10);
      const st = { n: /^\s*\d+\s*$/.test(nIn.value) ? parseInt(nIn.value, 10) : NaN, d: /^\s*\d+\s*$/.test(dIn.value) ? dv * (unit === 'month' ? S.rates.daysInMonth : 1) : NaN,
        u: checked('u'), z: checked('z'), km: checked('z') === 'region' ? km : 0, m: mSel ? mSel.value : (JSON.parse(root.dataset.defaults).m || 'standart') };
      if (mix && st.m === 'mix') { st.mix = mix; st.n = mix.reduce((s, x) => s + x.n, 0); st.m = mix[0].m; }
      return st;
    };
    function setFieldErr(el, msg, key) { if (!el) return; const f = el.closest('.field'); if (!f) return; const show = msg && touched[key]; f.dataset.state = show ? 'error' : 'default'; const m = document.getElementById(el.id + '-msg'); if (m) m.textContent = show ? msg : ''; if (show) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); }
    let timer;
    function recalc(first) {
      const st = state(), r = CALC.calculate(S, st);
      kmBox.hidden = st.z !== 'region';
      if (!first) { quote.classList.add('is-loading'); clearTimeout(timer); timer = setTimeout(() => quote.classList.remove('is-loading'), 150); }
      body.innerHTML = CALC.resultHtml(S, r, mode, APX);
      const stepper = nIn.closest('.stepper');
      setFieldErr(nIn, r.errors && r.errors.n, 'n'); if (stepper) stepper.dataset.state = r.errors && r.errors.n && touched.n ? 'error' : '';
      setFieldErr(dIn, r.errors && r.errors.d, 'd'); setFieldErr(kmIn, r.errors && r.errors.km, 'km');
      const dec = q('[data-step="-1"]'), inc = q('[data-step="1"]'); const nv = st.n;
      dec.disabled = !(nv > 1); inc.disabled = nv >= S.rates.maxCabins;
      const link = q('[data-calc-full]'), qs = new URLSearchParams({ n: isNaN(st.n) ? '' : st.n, d: isNaN(st.d) ? '' : st.d, u: st.u, z: st.z, km: st.z === 'region' && !isNaN(st.km) ? st.km : 0 });
      if (full && first !== true) mergeUrl({ n: qs.get('n'), d: qs.get('d'), u: st.u, z: st.z, km: st.z === 'region' && !isNaN(st.km) ? st.km : '', m: mix ? null : st.m, mix: mix ? mix.map((x) => x.m + ':' + x.n).join(',') : null });
      qs.set('m', st.m);
      if (link) link.href = BASE + '/ceny/index.html?' + qs.toString() + '#calc';
      const model = S.modelById(st.m);
      const modelTxt = st.mix ? mixLabel(st.mix) : model.name + ', ' + st.n + ' шт.';
      const summ = r.ok ? ('Расчёт с сайта ЭКО СЕРВИС: ' + modelTxt + ', ' + st.d + ' сут., обслуживание: ' + (S.rates.serviceOptions.find((o) => o.id === st.u) || {}).label.toLowerCase() + ', доставка: ' + (st.z === 'city' ? 'Новосибирск' : 'область ' + st.km + ' км') + ', итого ≈ ' + rubF(r.total)) : '';
      root._summary = summ;
      if (share && share._refresh) share._refresh();
    }
    const ev = (el, name, fn) => el && el.addEventListener(name, fn);
    ev(nIn, 'input', () => { leaveMix(); touched.n = true; recalc(); }); ev(dIn, 'input', () => { touched.d = true; recalc(); }); ev(kmIn, 'input', () => { touched.km = true; recalc(); });
    ev(nIn, 'blur', () => { touched.n = true; recalc(); }); ev(dIn, 'blur', () => { touched.d = true; recalc(); }); ev(kmIn, 'blur', () => { touched.km = true; recalc(); });
    ev(mSel, 'change', () => { if (mSel.value !== 'mix') { mix = null; const o = $('option[value="mix"]', mSel); if (o) o.remove(); } recalc(); });
    ['du', 'u', 'z'].forEach((s) => radio(s).forEach((r) => r.addEventListener('change', recalc)));
    // stepper: кнопки, удержание, стрелки
    $$('.stepper__btn', root).forEach((b) => {
      const step = (d) => { leaveMix(); const v = parseInt(nIn.value, 10); const base = isNaN(v) ? 1 : v; nIn.value = Math.max(1, Math.min(S.rates.maxCabins, base + d)); touched.n = true; recalc(); };
      let h, rep;
      b.addEventListener('click', (e) => { if (e.detail === 0 || !h) step(+b.dataset.step); h = false; });
      b.addEventListener('pointerdown', () => { h = false; clearTimeout(rep); rep = setTimeout(function tick() { h = true; step(+b.dataset.step); rep = setTimeout(tick, 80); }, 400); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((n) => b.addEventListener(n, () => { clearTimeout(rep); setTimeout(() => { h = false; }, 0); }));
    });
    nIn.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); leaveMix(); const v = parseInt(nIn.value, 10) || 1; nIn.value = Math.max(1, Math.min(S.rates.maxCabins, v + (e.key === 'ArrowUp' ? 1 : -1))); recalc(); } });
    bindShare(share, () => root._summary || '');
    recalc(true);
  });

  /* ---------- Расчёт количества кабин на мероприятии ---------- */
  $$('[data-evcalc]').forEach((root) => {
    const g = $('[data-ev=guests]', root), out = $('[data-ev-result]', root), link = $('[data-ev-link]', root), share = $('[data-share]', root);
    const durs = $$('input[name=evdur]', root), alcs = $$('input[name=evalc]', root);
    let summ = '';
    bindShare(share, () => summ);
    function run() {
      const dur = (durs.find((x) => x.checked) || {}).value, alc = (alcs.find((x) => x.checked) || {}).value === 'yes';
      const r = CALC.events(S, { guests: g.value.replace(/\s/g, ''), dur, alcohol: alc });
      const f = g.closest('.field'), m = document.getElementById(g.id + '-msg');
      if (!r.ok) { out.textContent = '—'; link.hidden = true; summ = ''; f.dataset.state = 'error'; m.textContent = 'Укажите количество гостей от 1 до ' + S.fmt(S.eventRules.maxGuests); g.setAttribute('aria-invalid', 'true'); share._refresh(); return; }
      f.dataset.state = 'default'; m.textContent = ''; g.removeAttribute('aria-invalid');
      const big = r.total > S.rates.maxCabins;
      out.textContent = big ? r.text + ' ' + S.forms.calcMessages.custom : r.text; link.hidden = big;
      link.href = BASE + '/ceny/index.html?n=' + r.total + '&mix=komfort:' + r.komfort + ',vip:' + r.vip + '&d=1#calc';
      const durLabel = (S.eventRules.durations.find((x) => x.id === dur) || {}).label.toLowerCase();
      summ = 'Мероприятие, расчёт с сайта ЭКО СЕРВИС: ' + r.rawGuests + ' гостей, ' + durLabel + ', алкоголь: ' + (alc ? 'да' : 'нет') + '. Кабин: ' + r.total + ' (' + (r.komfort ? r.komfort + ' × МТК Комфорт' : '') + (r.komfort && r.vip ? ' + ' : '') + (r.vip ? r.vip + ' × МТК VIP' : '') + '), срок 1 сут., доставка: Новосибирск' + (r.quote && r.quote.ok ? ', итого ≈ ' + rubF(r.quote.total) : '');
      share._refresh();
    }
    g.addEventListener('input', run); alcs.forEach((a) => a.addEventListener('change', run)); durs.forEach((d) => d.addEventListener('change', run));
    run();
  });

  /* ---------- Вкладки (ARIA tabs): группы FAQ, характеристики модели ---------- */
  function openHashTarget() {
    const id = decodeURIComponent(location.hash.slice(1)); if (!id) return;
    const el = document.getElementById(id); if (!el) return;
    const panel = el.closest('[data-tab-panel]');
    if (panel && panel._select) panel._select(false);
    const det = el.closest('details') || (el.tagName === 'DETAILS' ? el : null); if (det) det.open = true;
    if (panel || det) el.scrollIntoView({ block: 'start' });
  }
  $$('[data-tabs]').forEach((box, bi) => {
    const panels = $$(':scope > [data-tab-panel]', box); if (panels.length < 2) return;
    const list = document.createElement('div'); list.className = 'tabs'; list.setAttribute('role', 'tablist'); list.setAttribute('aria-label', box.hasAttribute('data-faq-tabs') ? 'Группы вопросов' : 'Разделы');
    const tabs = panels.map((p, i) => {
      const t = document.createElement('button'); t.type = 'button'; t.setAttribute('role', 'tab'); t.id = 'tabbtn-' + bi + '-' + i; t.textContent = p.dataset.tabTitle;
      t.setAttribute('aria-controls', p.id); p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', t.id);
      list.appendChild(t); return t;
    });
    function select(i, focus, pushHash) {
      tabs.forEach((t, j) => { const on = i === j; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; panels[j].hidden = !on; if (on) panels[j].tabIndex = 0; else panels[j].removeAttribute('tabindex'); });
      if (focus) tabs[i].focus();
      if (pushHash) { try { history.replaceState(null, '', '#' + panels[i].id); } catch (x) { /* ignore */ } }
    }
    tabs.forEach((t, i) => {
      panels[i]._select = (p) => select(i, false, p);
      t.addEventListener('click', () => select(i, false, true));
      t.addEventListener('keydown', (e) => {
        const k = e.key, n = tabs.length; let j = -1;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % n; else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + n) % n; else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1;
        if (j >= 0) { e.preventDefault(); select(j, true, true); }
      });
    });
    box.insertBefore(list, panels[0]); box.setAttribute('data-enhanced', '');
    select(0, false, false);
  });
  window.addEventListener('hashchange', openHashTarget); openHashTarget();

  /* ---------- Каталог: фильтр-чипы ---------- */
  $$('.chips').forEach((chips) => {
    const list = $('[data-filter-list]'), cards = $$('.model-card', list), empty = $('[data-filter-empty]'), status = $('[data-filter-status]');
    function apply(k) {
      let n = 0;
      cards.forEach((c) => { const show = k === 'all' || c.dataset.filters.split(' ').indexOf(k) >= 0; c.hidden = !show; if (show) n++; });
      $$('.chip', chips).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === k)));
      empty.hidden = n > 0; status.hidden = k === 'all'; status.textContent = 'Показано моделей: ' + n + ' из ' + cards.length;
    }
    chips.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) apply(b.dataset.filter); });
    const reset = $('[data-filter-reset]'); if (reset) reset.addEventListener('click', () => apply('all'));
  });

  /* ---------- Главная, вариант B: переключатель «Аренда / Купить» (без JS видны все плитки с обеими ценами) ---------- */
  $$('[data-offer-box]').forEach((box) => {
    const radios = $$('input[name="offer"]', box), st = $('[data-offer-status]', box);
    function set(mode) {
      box.setAttribute('data-mode', mode);
      const n = $$('.mtile', box).filter((t) => t.dataset.offer.split(' ').indexOf(mode) >= 0).length;
      if (st) st.textContent = (mode === 'rent' ? 'Аренда' : 'Покупка') + ': моделей ' + n;
    }
    radios.forEach((r) => r.addEventListener('change', () => { if (r.checked) set(r.value); }));
    set((radios.find((r) => r.checked) || { value: 'rent' }).value);
  });

  /* ---------- Галерея модели ---------- */
  $$('[data-gallery]').forEach((g) => {
    const slides = $$('[data-slide]', g), th = $$('[data-thumb]', g);
    th.forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.thumb; slides.forEach((s, j) => { s.hidden = i !== j; }); th.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }));
  });

  /* ---------- Карусель отзывов ---------- */
  $$('[data-carousel]').forEach((root) => {
    const track = $('[data-track]', root), prev = $('[data-prev]', root), next = $('[data-next]', root);
    if (!track || !prev || !next) return;
    const step = () => { const s = $('.slide, .photo--gal', track); return s ? s.getBoundingClientRect().width + 14 : 300; };
    const upd = () => { prev.disabled = track.scrollLeft < 4; next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4; };
    const go = (dir) => track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' });
    prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1));
    track.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd);
    track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'Home') { e.preventDefault(); track.scrollTo({ left: 0, behavior: reduce ? 'auto' : 'smooth' }); } if (e.key === 'End') { e.preventDefault(); track.scrollTo({ left: track.scrollWidth, behavior: reduce ? 'auto' : 'smooth' }); } });
    upd();
  });

  /* ---------- FAQ: открыт один вопрос в списке ---------- */
  $$('.acc-list').forEach((list) => {
    const ds = $$('details.acc', list);
    ds.forEach((d) => d.addEventListener('toggle', () => { if (d.open) ds.forEach((o) => { if (o !== d) o.open = false; }); }));
  });

})();

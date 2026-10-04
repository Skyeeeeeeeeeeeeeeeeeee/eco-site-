/* ЭКО СЕРВИС НОВОСИБИРСК v2: интерактив (defer). Без фреймворков и сторонних запросов. Данные: window.SITE, ядро расчёта: window.SITE_CALC. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const BASE = document.documentElement.dataset.base || '';
  const S = window.SITE, CALC = window.SITE_CALC;
  const NB = ' ';
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Шапка: выпадающие списки ---------- */
  const items = $$('.nav__item');
  function closeDd(except) {
    items.forEach((it) => { const b = $('.nav__btn', it); if (b && it !== except) b.setAttribute('aria-expanded', 'false'); });
  }
  items.forEach((it) => {
    const b = $('.nav__btn', it); if (!b) return;
    let t;
    b.addEventListener('click', () => { const open = b.getAttribute('aria-expanded') === 'true'; closeDd(it); b.setAttribute('aria-expanded', String(!open)); });
    b.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); closeDd(it); b.setAttribute('aria-expanded', 'true'); const l = $('.nav__panel a', it); if (l) l.focus(); }
    });
    it.addEventListener('keydown', (e) => { if (e.key === 'Escape' && b.getAttribute('aria-expanded') === 'true') { b.setAttribute('aria-expanded', 'false'); b.focus(); } });
    it.addEventListener('focusout', (e) => { if (!it.contains(e.relatedTarget)) b.setAttribute('aria-expanded', 'false'); });
    if (window.matchMedia('(hover:hover)').matches) {
      it.addEventListener('mouseenter', () => { clearTimeout(t); t = setTimeout(() => { closeDd(it); b.setAttribute('aria-expanded', 'true'); }, 120); });
      it.addEventListener('mouseleave', () => { clearTimeout(t); t = setTimeout(() => b.setAttribute('aria-expanded', 'false'), 160); });
    }
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav__item')) closeDd(); });

  /* ---------- Мобильное меню: ловушка фокуса, Esc, inert ---------- */
  const burger = $('.burger'), menu = $('#m-menu');
  const inertTargets = () => $$('main, .site-footer, .sticky-cta, .cookie, .skip');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    inertTargets().forEach((n) => { if (open) n.setAttribute('inert', ''); else n.removeAttribute('inert'); });
    if (open) { const f = $('a, button', menu); if (f) f.focus(); } else burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target === menu) setMenu(false); });
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
    window.addEventListener('resize', () => { if (window.innerWidth >= 1200 && burger.getAttribute('aria-expanded') === 'true') setMenu(false); });
  }

  /* ---------- Sticky-панель: после первого экрана, скрыта рядом с формами ---------- */
  const sticky = $('[data-sticky]');
  if (sticky && 'IntersectionObserver' in window) {
    let pastHero = false, formsVisible = 0, focusInForm = false;
    const upd = () => sticky.classList.toggle('is-visible', pastHero && !formsVisible && !focusInForm);
    const hero = $('[data-hero]');
    if (hero) {
      new IntersectionObserver((en) => { const r = en[0]; pastHero = !r.isIntersecting && r.boundingClientRect.bottom < 0; upd(); }).observe(hero);
    } else { const onS = () => { pastHero = window.scrollY > window.innerHeight; upd(); }; window.addEventListener('scroll', onS, { passive: true }); onS(); }
    const vis = new Map();
    $$('form[data-form], .calc, .evcalc').forEach((f) => {
      new IntersectionObserver((en) => { vis.set(f, en[0].isIntersecting); formsVisible = [...vis.values()].filter(Boolean).length; upd(); }).observe(f);
    });
    document.addEventListener('focusin', (e) => { focusInForm = !!e.target.closest('form'); upd(); });
    document.addEventListener('focusout', () => { focusInForm = false; upd(); });
  }

  /* ---------- Телефон: маска с каретой, 8xx, 8 в начале ---------- */
  function natDigits(raw) {
    const d = raw.replace(/\D/g, ''); let strip = 0;
    if (/^\s*\+/.test(raw)) strip = 1; else if (d.length >= 11 && /^[78]/.test(d)) strip = 1; else if (d.length === 1 && /[78]/.test(d)) strip = 1;
    return { nat: d.slice(strip, strip + 10), strip };
  }
  function fmtPhone(n) {
    if (!n.length) return '';
    let s = '+7 (' + n.slice(0, 3);
    if (n.length > 3) s += ') ' + n.slice(3, 6);
    if (n.length > 6) s += '-' + n.slice(6, 8);
    if (n.length > 8) s += '-' + n.slice(8, 10);
    return s;
  }
  function attachMask(el) {
    el._nat = '';
    el.addEventListener('input', (e) => {
      const raw = el.value, caret = el.selectionStart == null ? raw.length : el.selectionStart;
      const cntRaw = raw.slice(0, caret).replace(/\D/g, '').length;
      const r = natDigits(raw); let nat = r.nat, cnt = Math.max(0, Math.min(nat.length, cntRaw - r.strip));
      const type = e.inputType || '';
      if (type.indexOf('delete') === 0) {
        if (nat.length && nat === el._nat) { // удалили разделитель: убираем цифру рядом с кареткой
          if (type === 'deleteContentForward') nat = nat.slice(0, cnt) + nat.slice(cnt + 1);
          else if (cnt > 0) { nat = nat.slice(0, cnt - 1) + nat.slice(cnt); cnt -= 1; }
        }
      }
      el._nat = nat;
      let out = fmtPhone(nat);
      if (!nat.length) out = type.indexOf('delete') === 0 || !raw.replace(/\D/g, '').length ? '' : '+7 (';
      el.value = out;
      let pos = out.length;
      if (nat.length && cnt < nat.length) { let c = 0; pos = 4; if (cnt > 0) { for (let i = 4; i < out.length; i++) { if (/\d/.test(out[i])) { c++; if (c === cnt) { pos = i + 1; break; } } } } }
      try { el.setSelectionRange(pos, pos); } catch (x) { /* type=tel допускает */ }
    });
    el.addEventListener('focus', () => { if (!el.value) { el.value = ''; } });
  }
  window.__phoneMask = { natDigits, fmtPhone };

  /* ---------- Формы ---------- */
  const E = S.forms.errors;
  function fieldOf(el) { return el.closest('.field'); }
  function setErr(el, msg) {
    const f = fieldOf(el); if (!f) return;
    f.dataset.state = msg ? 'error' : 'default';
    const m = document.getElementById(el.id + '-msg'); if (m) m.textContent = msg || '';
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
  }
  function check(el) {
    const t = el.dataset.v;
    if (t === 'name') return el.value.trim() ? '' : E.name;
    if (t === 'place') return el.value.trim() ? '' : E.place;
    if (t === 'type') return el.value ? '' : E.type;
    if (t === 'consent') return el.checked ? '' : E.consent;
    if (t === 'phone') { const n = natDigits(el.value).nat; if (n.length < 10) return E.phone; if ('3489'.indexOf(n[0]) < 0) return E.phoneBad; return ''; }
    return '';
  }
  const utm = (() => { const p = new URLSearchParams(location.search), a = []; p.forEach((v, k) => { if (/^utm_/.test(k)) a.push(k + '=' + v); }); return a.join('&'); })();
  $$('form[data-form]').forEach((form) => {
    const fields = $$('[data-v]', form);
    const summary = $('.form__summary', form), ok = $('.form__ok', form), fail = $('.form__fail', form), fieldsBox = $('.form__fields', form), btn = $('button[type=submit]', form);
    const label = (el) => { const l = form.querySelector('label[for="' + el.id + '"]'); return l ? l.textContent.replace(/\(.*?\)/, '').trim() : 'Согласие'; };
    if (form.elements.utm) form.elements.utm.value = utm;
    fields.forEach((el) => {
      if (el.dataset.v === 'phone') attachMask(el);
      const ev = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener('blur', () => { if (el.dataset.v === 'consent') return; if (el.value.trim() || fieldOf(el).dataset.state === 'error') setErr(el, check(el)); });
      el.addEventListener(ev, () => { if (fieldOf(el).dataset.state === 'error' && !check(el)) setErr(el, ''); });
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = fields.filter((el) => { const m = check(el); setErr(el, m); return m; });
      if (summary) {
        if (bad.length && fields.length > 3 && form.dataset.form === 'full') {
          summary.hidden = false;
          summary.innerHTML = '<span class="notice__ico i i--alert" aria-hidden="true"></span><div><p class="notice__t">Исправьте ' + bad.length + ' ' + CALC.plural(bad.length, 'поле', 'поля', 'полей') + '</p><ul>' + bad.map((el) => '<li><a href="#' + el.id + '">' + label(el) + '</a></li>').join('') + '</ul></div>';
          summary.querySelectorAll('a').forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); document.getElementById(a.getAttribute('href').slice(1)).focus(); }));
        } else summary.hidden = true;
      }
      if (bad.length) { bad[0].focus(); return; }
      btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true'); btn.disabled = true;
      const t = btn.textContent; btn.textContent = 'Отправляем…';
      // Заявка никуда не отправляется: интеграция (CRM, почта) подключается позже. Здесь только состояние успеха.
      setTimeout(() => {
        btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy'); btn.disabled = false; btn.textContent = t;
        fieldsBox.hidden = true; ok.hidden = false; ok.focus();
      }, 600);
    });
    const again = $('.form__again', form);
    if (again) again.addEventListener('click', () => {
      form.reset(); fields.forEach((el) => { setErr(el, ''); if (el._nat != null) el._nat = ''; });
      ok.hidden = true; fieldsBox.hidden = false; if (summary) summary.hidden = true; const f = fields[0]; if (f) f.focus();
    });
  });

  /* ---------- Калькулятор стоимости ---------- */
  const rubF = S.rub, MAXKM = S.rates.delivery.maxKm;
  const APX = '<span class="apx" aria-hidden="true"></span><span class="visually-hidden">около </span>';
  function paramsFromUrl() {
    const p = new URLSearchParams(location.search), o = {};
    const int = (k, lo, hi) => { const v = p.get(k); if (v && /^\d+$/.test(v) && +v >= lo && +v <= hi) o[k] = +v; };
    int('n', 1, S.rates.maxCabins); int('d', 1, S.rates.maxDays); int('km', 1, MAXKM);
    if (['none', 'weekly', 'twice', 'daily'].indexOf(p.get('u')) >= 0) o.u = p.get('u');
    if (['city', 'region'].indexOf(p.get('z')) >= 0) o.z = p.get('z');
    const m = S.modelById(p.get('m') || ''); if (m && m.kind === 'rent') o.m = m.slug;
    return o;
  }
  const urlP = paramsFromUrl();
  $$('.calc').forEach((root) => {
    const mode = root.dataset.calc, id = root.id, full = mode === 'full';
    const q = (s) => $(s, root);
    const nIn = q('#' + id + '-n'), dIn = q('#' + id + '-d'), kmIn = q('#' + id + '-km'), mSel = q('#' + id + '-m');
    const radio = (suffix) => $$('input[name="' + id + '-' + suffix + '"]', root);
    const checked = (suffix) => { const r = radio(suffix).find((x) => x.checked); return r ? r.value : null; };
    const body = q('.quote__body'), quote = q('.quote'), kmBox = q('.calc__km'), form = q('.calc__form form'), sendBtn = q('[data-calc-send]');
    const touched = {};
    // предзаполнение из URL
    if (urlP.n) nIn.value = urlP.n;
    if (urlP.d) { const mo = urlP.d >= S.rates.daysInMonth && urlP.d % S.rates.daysInMonth === 0; dIn.value = mo ? urlP.d / S.rates.daysInMonth : urlP.d; radio('du').forEach((r) => { r.checked = r.value === (mo ? 'month' : 'day'); }); }
    if (urlP.u) radio('u').forEach((r) => { r.checked = r.value === urlP.u; });
    if (urlP.z) radio('z').forEach((r) => { r.checked = r.value === urlP.z; });
    if (urlP.km) kmIn.value = urlP.km;
    if (urlP.m && mSel) mSel.value = urlP.m;
    const state = () => {
      const unit = checked('du'), dv = parseInt(dIn.value.replace(/\s/g, ''), 10);
      const km = kmIn.value.trim() === '' ? NaN : parseInt(kmIn.value, 10);
      return { n: /^\s*\d+\s*$/.test(nIn.value) ? parseInt(nIn.value, 10) : NaN, d: /^\s*\d+\s*$/.test(dIn.value) ? dv * (unit === 'month' ? S.rates.daysInMonth : 1) : NaN,
        u: checked('u'), z: checked('z'), km: checked('z') === 'region' ? km : 0, m: mSel ? mSel.value : (JSON.parse(root.dataset.defaults).m || 'standart') };
    };
    function setFieldErr(el, msg, key) { if (!el) return; const f = fieldOf(el) || el.closest('.field'); if (!f) return; const show = msg && touched[key]; f.dataset.state = show ? 'error' : 'default'; const m = document.getElementById(el.id + '-msg'); if (m) m.textContent = show ? msg : ''; if (show) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); }
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
      if (full && first !== true) { qs.set('m', st.m); try { history.replaceState(null, '', '?' + qs.toString() + location.hash); } catch (x) { /* file:// */ } }
      if (link) link.href = BASE + '/ceny/?' + qs.toString() + '#calc';
      const model = S.modelById(st.m);
      const summ = r.ok ? ('Расчёт: ' + model.name + ', ' + st.n + ' шт., ' + st.d + ' сут., обслуживание: ' + (S.rates.serviceOptions.find((o) => o.id === st.u) || {}).label + ', доставка: ' + (st.z === 'city' ? 'Новосибирск' : 'область ' + st.km + ' км') + ', итого ≈ ' + r.total + ' ₽') : '';
      const tg = q('[data-calc-tg]'); if (tg) tg.href = S.contacts.telegramUrl + (summ ? '?text=' + encodeURIComponent(summ) : '');
      if (form && form.elements.calc) form.elements.calc.value = summ;
      root._summary = summ;
    }
    const ev = (el, name, fn) => el && el.addEventListener(name, fn);
    ev(nIn, 'input', () => { touched.n = true; recalc(); }); ev(dIn, 'input', () => { touched.d = true; recalc(); }); ev(kmIn, 'input', () => { touched.km = true; recalc(); });
    ev(nIn, 'blur', () => { touched.n = true; recalc(); }); ev(dIn, 'blur', () => { touched.d = true; recalc(); }); ev(kmIn, 'blur', () => { touched.km = true; recalc(); });
    ev(mSel, 'change', recalc);
    ['du', 'u', 'z'].forEach((s) => radio(s).forEach((r) => r.addEventListener('change', recalc)));
    // stepper: кнопки, удержание, стрелки
    $$('.stepper__btn', root).forEach((b) => {
      const step = (d) => { const v = parseInt(nIn.value, 10); const base = isNaN(v) ? 1 : v; nIn.value = Math.max(1, Math.min(S.rates.maxCabins, base + d)); touched.n = true; recalc(); };
      let h, rep;
      b.addEventListener('click', (e) => { if (e.detail === 0 || !h) step(+b.dataset.step); h = false; });
      b.addEventListener('pointerdown', () => { h = false; clearTimeout(rep); rep = setTimeout(function tick() { h = true; step(+b.dataset.step); rep = setTimeout(tick, 80); }, 400); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((n) => b.addEventListener(n, () => { clearTimeout(rep); setTimeout(() => { h = false; }, 0); }));
    });
    nIn.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); const v = parseInt(nIn.value, 10) || 1; nIn.value = Math.max(1, Math.min(S.rates.maxCabins, v + (e.key === 'ArrowUp' ? 1 : -1))); recalc(); } });
    if (sendBtn) sendBtn.addEventListener('click', () => {
      const f = q('.calc__form'), open = sendBtn.getAttribute('aria-expanded') === 'true';
      sendBtn.setAttribute('aria-expanded', String(!open)); f.hidden = open;
      if (!open) { recalc(); const first = $('input:not([type=hidden]):not([tabindex="-1"])', f); if (first) first.focus(); }
    });
    recalc(true);
  });

  /* ---------- Расчёт количества кабин на мероприятии ---------- */
  $$('[data-evcalc]').forEach((root) => {
    const g = $('[data-ev=guests]', root), alc = $('[data-ev=alcohol]', root), out = $('[data-ev-result]', root), link = $('[data-ev-link]', root);
    const durs = $$('input[name=evdur]', root);
    function run() {
      const dur = (durs.find((x) => x.checked) || {}).value;
      const r = CALC.events(S, { guests: g.value.replace(/\s/g, ''), dur, alcohol: alc.checked });
      const f = fieldOf(g), m = document.getElementById(g.id + '-msg');
      if (!r.ok) { out.textContent = '—'; f.dataset.state = 'error'; m.textContent = 'Укажите количество гостей от 1 до ' + S.fmt(S.eventRules.maxGuests); g.setAttribute('aria-invalid', 'true'); return; }
      f.dataset.state = 'default'; m.textContent = ''; g.removeAttribute('aria-invalid');
      out.textContent = r.text; link.href = BASE + '/ceny/?n=' + Math.min(r.total, S.rates.maxCabins) + '#calc';
    }
    g.addEventListener('input', run); alc.addEventListener('change', run); durs.forEach((d) => d.addEventListener('change', run));
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

  /* ---------- Галерея модели ---------- */
  $$('[data-gallery]').forEach((g) => {
    const slides = $$('[data-slide]', g), th = $$('[data-thumb]', g);
    th.forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.thumb; slides.forEach((s, j) => { s.hidden = i !== j; }); th.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }));
  });

  /* ---------- Cookie-уведомление (в потоке страницы, не на первом экране) ---------- */
  const ck = $('[data-cookie]');
  if (ck) {
    let acked = false; try { acked = localStorage.getItem('eco-cookie') === '1'; } catch (x) { /* ignore */ }
    if (!acked) ck.hidden = false;
    $('[data-cookie-ok]', ck).addEventListener('click', () => { try { localStorage.setItem('eco-cookie', '1'); } catch (x) { /* ignore */ } ck.hidden = true; });
  }
  const pr = $('[data-print]'); if (pr) pr.addEventListener('click', () => window.print());
  // оглавление политики: подсветка текущего раздела
  const toc = $$('.toc a');
  if (toc.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) toc.forEach((a) => { if (a.getAttribute('href') === '#' + x.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }), { rootMargin: '-20% 0px -70% 0px' });
    $$('.policy__s').forEach((s) => io.observe(s));
  }
})();

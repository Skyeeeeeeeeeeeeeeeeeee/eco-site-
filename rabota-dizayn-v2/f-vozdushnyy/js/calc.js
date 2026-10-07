/* Ядро калькулятора (чистые функции). Работает в браузере (globalThis.SITE_CALC) и в Node (build.mjs --check).
   Все ставки берутся из SITE (js/content.js). */
(function (root) {
  'use strict';
  const num = (v) => (typeof v === 'number' ? v : parseInt(String(v).replace(/\s/g, ''), 10));

  function visits(S, u, D) {
    if (u === 'weekly') return Math.max(1, Math.ceil(D / 7));
    if (u === 'twice') return Math.max(2, Math.ceil(D / 7) * 2);
    if (u === 'daily') return D;
    return 0;
  }

  // inp: n (число кабин), d (суток), u (обслуживание), z (city|region), km, m (модель: id или slug). Или mix: [{ m, n }, ...] для смеси моделей (мероприятие).
  // Цена аренды за кабину в сутки: SITE.unitRate(модель, срок): Стандарт по ступеням срока, Комфорт и VIP по фиксированной цене за сутки.
  function calculate(S, inp) {
    const R = S.rates, DL = R.delivery;
    const D = num(inp.d), km = num(inp.km || 0);
    const z = inp.z === 'region' ? 'region' : 'city';
    const u = ['none', 'weekly', 'twice', 'daily'].indexOf(inp.u) >= 0 ? inp.u : 'none';
    let model = S.modelById(inp.m || 'standart');
    if (!model || !model.rent) model = S.modelById('standart');
    const mix = Array.isArray(inp.mix) ? inp.mix.map((x) => ({ model: S.modelById(x.m), n: num(x.n) })).filter((x) => x.model && x.model.rent && x.n > 0) : null;
    const N = mix ? mix.reduce((s, x) => s + x.n, 0) : num(inp.n);
    const out = { ok: false, errors: {}, custom: false, N, D, km, z, u, model };
    if (!(N >= 1)) out.errors.n = S.forms.calcMessages.qty;
    if (!(D >= 1)) out.errors.d = S.forms.calcMessages.days;
    if (z === 'region' && !(km >= 1)) out.errors.km = S.forms.calcMessages.km;
    if (Object.keys(out.errors).length) return out;
    if (N > R.maxCabins || (z === 'region' && km > DL.maxKm) || D > R.maxDays) { out.custom = true; return out; }

    const lines = (mix || [{ model, n: N }]).map((x) => ({ model: x.model, n: x.n, unit: S.unitRate(x.model, D) }));
    const unit = lines[0].unit;                            // ₽ за кабину в сутки (для смеси: первая строка)
    const rent = lines.reduce((s, x) => s + x.n * D * x.unit, 0);
    let pct = 0;
    R.qtyDiscount.forEach((t) => { if (N >= t.from) pct = Math.max(pct, t.pct); });
    const discount = Math.round(rent * pct / 100);
    const V = visits(S, u, D);
    const visit = u === 'daily' ? R.service.visitDaily : R.service.visit;
    const service = N * V * visit;
    const trips = Math.ceil(N / DL.cabinsPerTrip);         // в одну машину помещается до DL.cabinsPerTrip кабин (20)
    const delivery = trips * (z === 'city' ? DL.cityPerTrip : (km <= DL.nearKm ? DL.nearPerTrip : DL.nearPerTrip + (km - DL.nearKm) * DL.perKmOver));
    const sum = rent - discount + service + delivery;
    const minApplied = sum < R.minOrder;
    const raw = Math.max(sum, R.minOrder);
    const total = Math.round(raw / R.roundTo) * R.roundTo;
    // подсказка о скидке
    let hint = '';
    const next = R.qtyDiscount.filter((t) => N < t.from).sort((a, b) => a.from - b.from)[0];
    if (next && N >= 3) hint = 'Скидка ' + next.pct + '% на аренду от ' + next.from + ' кабин. Добавьте ещё ' + (next.from - N) + '.';
    return Object.assign(out, { ok: true, unit, lines, rent, pct, discount, V, visit, service, trips, delivery, sum, minApplied, total, hint });
  }

  function plural(n, a, b, c) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return a;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return b;
    return c;
  }

  // Мероприятие: сколько кабин и какая доля VIP (каждая vipShare-я кабина: МТК VIP, остальные МТК Комфорт); ориентир стоимости на одни сутки с доставкой по городу
  function events(S, inp) {
    const E = S.eventRules, g = num(inp.guests);
    if (!(g >= 1) || g > E.maxGuests) return { ok: false };
    const dur = E.durations.find((x) => x.id === inp.dur) || E.durations[1];
    const limit = E.guestsPerCabin[dur.limitKey];
    let total = Math.ceil(g / limit);
    if (inp.alcohol) total = Math.ceil(Math.round(total * E.alcoholMult * 1e6) / 1e6);
    const vip = Math.ceil(total / E.vipShare), komfort = total - vip;
    const trips = Math.ceil(total / S.rates.delivery.cabinsPerTrip);
    const parts = [];
    if (komfort) parts.push(komfort + '\u00a0МТК\u00a0Комфорт');
    if (vip) parts.push(vip + '\u00a0МТК\u00a0VIP');
    let text = 'Рекомендуем ' + total + ' ' + plural(total, 'кабину', 'кабины', 'кабин') + ': ' + parts.join(' и ') + '.';
    let quote = null;
    if (total <= S.rates.maxCabins) {
      quote = calculate(S, { mix: [{ m: 'komfort', n: komfort }, { m: 'vip', n: vip }], d: 1, u: 'none', z: 'city' });
      text += ' Ориентир на одни сутки с доставкой по Новосибирску: ' + (quote.ok ? '≈\u00a0' + S.rub(quote.total) : '—') + ' (' + trips + ' ' + plural(trips, 'рейс', 'рейса', 'рейсов') + ').';
    } else text += ' ' + trips + ' ' + plural(trips, 'рейс', 'рейса', 'рейсов') + ', стоимость считаем индивидуально.';
    return { ok: true, total, komfort, vip, trips, quote, base: total, text };
  }

  function resultHtml(S, r, mode, apx) {
    const rub = S.rub, NB = '\u00a0';
    if (!r.ok) {
      const msg = r.custom ? S.forms.calcMessages.custom : Object.keys(r.errors).map((k) => r.errors[k]).join('. ');
      return '<p class="quote__total"><span class="label">Итого</span><output class="price price--xl">—</output></p><p class="notice notice--' + (r.custom ? 'info' : 'error') + '" role="alert"><span class="notice__ico i i--alert" aria-hidden="true"></span><span>' + msg + '</span></p>';
    }
    const total = '<p class="quote__total"><span class="label">Итого</span><output class="price price--xl">' + (apx || '≈ ') + rub(r.total) + '</output></p>';
    let h = total;
    if (mode === 'full') {
      h += '<dl class="quote__list">';
      if (r.lines.length > 1) r.lines.forEach((x) => { h += '<div><dt>Аренда ' + x.model.name + ': ' + x.n + NB + '× ' + r.D + NB + 'сут × ' + rub(x.unit) + '</dt><dd>' + rub(x.n * r.D * x.unit) + '</dd></div>'; });
      else h += '<div><dt>Аренда ' + r.model.name + ': ' + r.N + NB + plural(r.N, 'кабина', 'кабины', 'кабин') + ' × ' + r.D + NB + 'сут × ' + rub(r.unit) + '</dt><dd>' + rub(r.rent) + '</dd></div>';
      if (r.pct) h += '<div class="is-disc"><dt>Скидка за количество −' + r.pct + NB + '%</dt><dd>−' + rub(r.discount) + '</dd></div>';
      if (r.service) h += '<div><dt>Обслуживание: ' + r.V + NB + plural(r.V, 'визит', 'визита', 'визитов') + ' на кабину × ' + r.N + NB + '× ' + rub(r.visit) + '</dt><dd>' + rub(r.service) + '</dd></div>';
      h += '<div><dt>Доставка и вывоз: ' + r.trips + NB + plural(r.trips, 'рейс', 'рейса', 'рейсов') + '</dt><dd>' + rub(r.delivery) + '</dd></div>';
      if (r.minApplied) h += '<div><dt>Применён минимальный заказ</dt><dd>' + rub(S.rates.minOrder) + '</dd></div>';
      h += '</dl>';
    } else {
      h += '<p class="quote__line">Аренда ' + rub(r.rent - r.discount) + ' · Обслуживание ' + rub(r.service) + ' · Доставка ' + rub(r.delivery) + (r.minApplied ? ' · минимальный заказ ' + rub(S.rates.minOrder) : '') + '</p>';
    }
    if (r.hint) h += '<p class="quote__hint">' + r.hint + '</p>';
    return h;
  }

  const api = { calculate, events, plural, resultHtml };
  root.SITE_CALC = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

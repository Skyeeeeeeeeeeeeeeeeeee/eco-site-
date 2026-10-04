// Компоненты и каркас страницы. Всё возвращает строки HTML. Данные берутся из SITE (js/content.js).
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const NB = ' ';

// Контекст сборки: заполняется build.mjs
export const ctx = { S: null, CALC: null, base: '', production: false, page: null, secN: 0, formN: 0, calcN: 0 };

export const u = (path) => {
  if (/^(https?:|tel:|mailto:|#)/.test(path)) return path;
  return ctx.base + path;
};
export const rub = (n) => ctx.S.rub(n);
export const dev = (text, cls = '') => (ctx.production ? '' : `<p class="notice notice--warn dev-flag ${cls}" role="note"><span class="notice__ico i i--alert" aria-hidden="true"></span><span><b>ЗАГЛУШКА.</b> ${text}</span></p>`);
export const devTag = (text) => (ctx.production ? '' : `<span class="tag dev-flag">Заглушка</span> ${esc(text)}`);

export const ic = (name, cls = 'ic') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="${u('/img/sprite.svg')}#i-${name}"/></svg>`;
export const apx = '<span class="apx" aria-hidden="true"></span><span class="visually-hidden">около </span>';

export function illus(slug, label) {
  return `<svg class="illus" role="img" aria-label="${esc(label)}" focusable="false"><use href="${u('/img/sprite.svg')}#cab-${slug}"/></svg>`;
}
export function a(href, text, cls = '', extra = '') {
  return `<a${cls ? ` class="${cls}"` : ''} href="${esc(u(href))}"${extra ? ' ' + extra : ''}>${text}</a>`;
}
export function btn(href, text, kind = 'primary', extra = '') {
  const k = { primary: 'btn btn--primary btn--arrow', outline: 'btn btn--outline', link: 'btn btn--link', dark: 'btn btn--dark btn--arrow', plain: 'btn btn--primary' }[kind];
  return `<a class="${k}" href="${esc(u(href))}"${extra ? ' ' + extra : ''}>${text}</a>`;
}
export const tel = (cls = '') => `<a class="${cls || 'tel'}" href="${ctx.S.contacts.phoneHref}">${ctx.S.contacts.phone.replace(/ /g, NB)}</a>`;
export const checkList = (items, cls = 'checks') => `<ul class="${cls}">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

/* ---------- секция ---------- */
export function section(o, inner) {
  ctx.secN += 1;
  const n = String(ctx.secN).padStart(2, '0');
  const cls = ['section', o.paper ? 'section--paper' : '', o.sunk ? 'section--sunk' : '', o.dark ? 'section--dark on-dark' : '', o.cls || ''].filter(Boolean).join(' ');
  const hid = o.id ? o.id + '-h' : 'h' + ctx.secN;
  const head = o.title
    ? `<header class="sec-head"><div class="sec-head__idx label">${n}${o.tag ? ' / ' + esc(o.tag) : ''}</div><h2 id="${hid}">${o.title}</h2>${o.lead ? `<p class="lead">${o.lead}</p>` : ''}</header>`
    : '';
  return `<section class="${cls}"${o.id ? ` id="${o.id}"` : ''} aria-labelledby="${hid}"><div class="container">${head}${inner}</div></section>`;
}

/* ---------- таблицы ---------- */
// head: ['Модель', ...]; rows: [[th, td, ...]]; numFrom: индекс первой числовой колонки
export function table({ caption, head, rows, numFrom = 99, cls = '', hideCaption = false, stack = true }) {
  const th = head.map((h, i) => `<th scope="col" role="columnheader"${i >= numFrom ? ' class="num"' : ''}>${h}</th>`).join('');
  const body = rows.map((r) => {
    const cells = r.map((c, i) => {
      if (i === 0) return `<th scope="row" role="rowheader">${c}</th>`;
      return `<td role="cell" data-label="${esc(head[i].replace(/<[^>]+>/g, ''))}"${i >= numFrom ? ' class="num"' : ''}>${c}</td>`;
    }).join('');
    return `<tr role="row">${cells}</tr>`;
  }).join('');
  return `<table class="tbl ${stack ? 'tbl--stack' : ''} ${cls}" role="table"><caption${hideCaption ? ' class="visually-hidden"' : ''}>${caption}</caption><thead role="rowgroup"><tr role="row">${th}</tr></thead><tbody role="rowgroup">${body}</tbody></table>`;
}
export function specTable(caption, rows) {
  return `<table class="tbl tbl--spec"><caption class="visually-hidden">${esc(caption)}</caption><tbody>${rows.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td${r.mono ? ' class="mono"' : ''}>${esc(r.value).replace(/ (л|кг|см|₽)/g, NB + '$1')}</td></tr>`).join('')}</tbody></table>`;
}
export function kvTable(caption, head, rows) { // «Параметр / Условие»
  return `<table class="tbl tbl--kv"><caption class="visually-hidden">${esc(caption)}</caption><thead><tr><th scope="col">${head[0]}</th><th scope="col">${head[1]}</th></tr></thead><tbody>${rows.map((r) => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td></tr>`).join('')}</tbody></table>`;
}

/* ---------- цены ---------- */
export function priceTable(caption = 'Аренда: цена за кабину в сутки, ₽', extraRow = true) {
  const S = ctx.S, rent = S.models.filter((m) => m.kind === 'rent');
  const head = ['Срок'].concat(rent.map((m) => a('/katalog/' + m.slug + '/', esc(m.name.replace('Кабина для маломобильных посетителей', 'Для маломобильных').replace(' кабина', '')))));
  const rows = S.rates.rentPerDay.map((t, i) => [S.tierLabel(t)].concat(rent.map((m) => rub(S.modelRate(m, i)))));
  if (extraRow) {
    const d = S.rates.sampleDays;
    rows.push([d + ' суток (за весь срок)'].concat(rent.map((m) => rub(S.modelRateForDays(m, d) * d))));
  }
  return table({ caption, head, rows, numFrom: 1, cls: 'tbl--price' });
}
export const priceNote = () => `<p class="small note">Цены ориентировочные. Итоговую стоимость называем до оплаты и фиксируем в договоре или счёте.${ctx.production ? '' : ' <span class="tag dev-flag">Заглушка</span>'}</p>`;

/* ---------- карточка модели ---------- */
export function modelCard(m, { headingLevel = 3, cta = false } = {}) {
  const S = ctx.S, h = 'h' + headingLevel;
  const price = m.kind === 'rent'
    ? `<span class="price"><small>от${NB}</small>${rub(S.modelFromPrice(m))}<small>/сутки</small></span>`
    : `<span class="price">${rub(S.terms.peatPrice)}</span>`;
  const note = m.kind === 'rent' ? `<span class="small note">при аренде от ${S.rates.rentPerDay[S.rates.rentPerDay.length - 1].from}${NB}суток</span>` : '<span class="small note">в продаже</span>';
  return `<article class="model-card" data-filters="${m.filters.join(' ')}">
<figure class="ph ph--card crop">${illus(m.slug, m.name + ': схема в изометрии')}</figure>
<div class="model-card__body"><div class="model-card__top"><span class="label">${m.sku}</span><span class="tag${m.kind === 'sale' ? ' tag--lime' : ''}">${m.kind === 'sale' ? 'Продажа' : 'Аренда'}</span></div>
<${h} class="model-card__title">${a('/katalog/' + m.slug + '/', esc(m.name))}</${h}>
<p class="small">${esc(m.short)}</p>
<ul class="kv kv--list">${m.cardFacts.map((f) => `<li>${esc(f).replace(/ (л|кг|см)/g, NB + '$1')}</li>`).join('')}</ul>
<div class="model-card__foot"><div>${price}<br>${note}</div><span class="btn btn--link" aria-hidden="true">Подробнее</span></div>
${cta ? `<a class="btn btn--outline btn--sm model-card__req" href="${u('/katalog/' + m.slug + (m.kind === 'rent' ? '/#raschet' : '/#kupit'))}">Получить расчёт</a>` : ''}</div></article>`;
}

/* ---------- шаги ---------- */
export function steps(items, n = 4, linkHeading) {
  return `<ol class="steps" style="--n:${n}">${items.map((s, i) => `<li class="steps__i"><span class="steps__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3 class="steps__t">${s.t}</h3><p>${s.text}</p></li>`).join('')}</ol>`;
}
export const processSteps = () => steps(ctx.S.steps);

/* ---------- FAQ ---------- */
export function faqItem(f, idp = 'q-') {
  const link = f.link ? ` ${a(f.link.href, esc(f.link.text))}` : '';
  return `<details class="acc" id="${idp}${f.id}"><summary class="acc__q"><span>${esc(f.q)}</span><span class="acc__ico" aria-hidden="true"></span></summary><div class="acc__a"><p>${esc(f.a)}${link}</p></div></details>`;
}
export function faqBlock(ids, { more = true, title = 'Частые вопросы', id = 'faq', paper = false } = {}) {
  const S = ctx.S;
  const items = ids.map((i) => S.faqById(i)).filter(Boolean);
  ctx.faqUsed = (ctx.faqUsed || []).concat(items);
  return section({ id, title, tag: 'Вопросы', paper }, `<div class="faq-block"><div class="acc-list">${items.map((f) => faqItem(f, id + '-')).join('')}</div>${more ? `<p class="more">${btn('/voprosy/', 'Все вопросы и ответы', 'link')}</p>` : ''}</div>`);
}

/* ---------- отзывы ---------- */
export function reviewCard(r) {
  return `<figure class="review"><blockquote><p>«${esc(r.text)}»</p></blockquote><figcaption class="review__by"><span class="review__ini" aria-hidden="true">${esc(r.author[0])}</span><span><b>${esc(r.author)}</b><br><span class="small">${esc(r.place)} · ${esc(r.task)} · ${r.date}</span></span><span class="tag">${esc(r.typeLabel)}</span></figcaption></figure>`;
}
export function reviewsBlock(ids, o = {}) {
  const items = ids.map((id) => ctx.S.reviews.find((r) => r.id === id));
  return section({ id: o.id || 'otzyvy-blok', title: o.title || 'Отзывы клиентов', tag: 'Отзывы', paper: o.paper },
    `${o.devNote ? dev(o.devNote) : ''}<div class="grid grid--cards">${items.map(reviewCard).join('')}</div>${o.link ? `<p class="more">${btn('/o-kompanii/#otzyvy', 'Все отзывы', 'link')}</p>` : ''}`);
}

/* ---------- формы ---------- */
const field = (id, label, input, hint = '') => `<div class="field" data-state="default"><label class="field__label" for="${id}">${label}</label>${input}${hint ? `<p class="field__hint" id="${id}-hint">${hint}</p>` : ''}<p class="field__msg" id="${id}-msg"></p></div>`;
export function form(o = {}) {
  const S = ctx.S, E = S.forms.errors;
  const id = 'f' + (++ctx.formN);
  const mode = o.mode || 'short'; // short | full | zone | calc
  const d = (o.describe || '');
  let fields = '';
  if (mode === 'zone') {
    fields += field(id + '-place', 'Населённый пункт', `<input class="input" id="${id}-place" name="place" type="text" autocomplete="address-level2" placeholder="Например, Бердск" required aria-describedby="${id}-place-msg" data-v="place">`);
  }
  fields += field(id + '-name', 'Имя', `<input class="input" id="${id}-name" name="name" type="text" autocomplete="name" placeholder="Как к вам обращаться" required aria-describedby="${id}-name-msg" data-v="name">`);
  fields += field(id + '-phone', 'Телефон', `<input class="input" id="${id}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required aria-describedby="${id}-phone-msg" data-v="phone">`);
  if (mode === 'full') {
    const opts = S.forms.requestTypes.map((t, i) => `<option value="${esc(t)}"${o.type === i ? ' selected' : ''}>${esc(t)}</option>`).join('');
    fields += field(id + '-type', 'Что нужно', `<div class="select-wrap"><select class="select" id="${id}-type" name="type" required aria-describedby="${id}-type-msg" data-v="type"><option value=""${o.type == null ? ' selected' : ''} disabled>Выберите</option>${opts}</select></div>`);
    fields += field(id + '-comment', 'Комментарий <span class="small">(необязательно)</span>', `<textarea class="textarea" id="${id}-comment" name="comment" rows="4" placeholder="Адрес, даты, количество кабин или гостей: всё, что известно"></textarea>`);
  }
  const btnText = o.button || (mode === 'full' ? 'Отправить заявку' : mode === 'zone' ? 'Узнать стоимость' : 'Получить расчёт');
  const success = mode === 'zone' ? S.forms.zoneSuccess : S.forms.success;
  const heading = o.heading ? `<h3 class="form__h">${o.heading}</h3>` : '';
  return `${heading}<form class="form form--${mode}${o.cls ? ' ' + o.cls : ''}" data-form="${mode}" method="post" action="#" novalidate aria-label="${esc(o.label || o.heading || 'Заявка')}">
<div class="form__summary notice notice--error" role="alert" tabindex="-1" hidden></div>
<div class="form__fields">${fields}
<div class="hp" aria-hidden="true"><label>Не заполняйте <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
<input type="hidden" name="source" value="${esc(ctx.page.path)}"><input type="hidden" name="calc" value=""><input type="hidden" name="utm" value="">
<div class="field field--consent" data-state="default"><label class="check"><input type="checkbox" name="consent" id="${id}-consent" required aria-describedby="${id}-consent-msg" data-v="consent"><span class="check__box" aria-hidden="true"></span><span class="check__t">Согласен(на) на обработку персональных данных. ${a('/politika-konfidencialnosti/', 'Политика обработки данных', '', 'target="_blank" rel="noopener"')}</span></label><p class="field__msg" id="${id}-consent-msg"></p></div>
<div class="form__act"><button class="btn btn--primary btn--lg" type="submit" data-label="${btnText}">${btnText}</button><p class="small note">${esc(S.forms.micro)}${ctx.production ? '' : ' <span class="tag dev-flag">Заглушка</span>'}</p></div></div>
<div class="notice notice--ok form__ok" role="status" tabindex="-1" hidden><span class="notice__ico i i--check" aria-hidden="true"></span><div><p class="notice__t">${mode === 'zone' ? 'Запрос принят' : 'Заявка принята'}</p><p>${esc(success.replace(/^(Заявка|Запрос) принят[а]?\.\s*/, ''))}</p><p><button class="btn btn--link form__again" type="button">Отправить ещё одну</button></p></div></div>
<div class="notice notice--error form__fail" role="alert" hidden><span class="notice__ico i i--alert" aria-hidden="true"></span><p>${esc(S.forms.failure)}</p></div>
</form>
<noscript><div class="notice notice--info"><span class="notice__ico i i--alert" aria-hidden="true"></span><p>Форма работает при включённом JavaScript. Позвоните: ${tel()} или напишите: ${a(S.contacts.telegramUrl, 'Telegram')}.</p></div></noscript>`;
}

export function ctaBlock() {
  const S = ctx.S;
  return `<section class="section section--lime cta" id="zayavka" aria-labelledby="cta-h"><div class="container"><div class="grid cta__grid">
<div class="cta__text lg-5"><h2 id="cta-h">Нужен расчёт под вашу задачу</h2><p class="lead">Оставьте заявку или позвоните. Уточним адрес, срок и количество кабин, назовём стоимость и сроки доставки.</p>
<div class="cta__contacts"><p class="cta__phone">${tel('tel tel--xl')}</p><p><a class="btn btn--outline btn--sm" href="${S.contacts.telegramUrl}" rel="noopener">${ic('telegram')} Telegram</a></p><p class="small">${esc(S.contacts.hours.charAt(0).toUpperCase() + S.contacts.hours.slice(1))}</p></div></div>
<div class="cta__form lg-7">${form({ mode: 'short', heading: 'Получить расчёт' })}<p class="more">${btn('/ceny/', 'Или посчитайте самостоятельно', 'link')}</p></div></div></div></section>`;
}

/* ---------- калькулятор ---------- */
export function stepper(id, label, value, min, max) {
  return `<div class="field" data-state="default"><span class="field__label" id="${id}-l">${label}</span><div class="stepper" role="group" aria-labelledby="${id}-l"><button class="stepper__btn" type="button" aria-label="Уменьшить" data-step="-1"><span class="i i--minus" aria-hidden="true"></span></button><input class="stepper__val" id="${id}" type="text" inputmode="numeric" pattern="[0-9]*" value="${value}" aria-label="${label}" data-min="${min}" data-max="${max}" aria-describedby="${id}-msg"><button class="stepper__btn" type="button" aria-label="Увеличить" data-step="1"><span class="i i--plus" aria-hidden="true"></span></button></div><p class="field__msg" id="${id}-msg"></p></div>`;
}
function radios(name, legend, opts, checked, cls = '') {
  return `<fieldset class="seg ${cls}"><legend class="field__label">${legend}</legend><div class="seg__row">${opts.map((o, i) => `<input type="radio" name="${name}" id="${name}-${i}" value="${o.id}"${o.id === checked ? ' checked' : ''}><label for="${name}-${i}">${o.label}</label>`).join('')}</div></fieldset>`;
}
export function calc(mode = 'compact', defaults = { n: 1, d: 3, u: 'none', z: 'city', km: 0 }) {
  const S = ctx.S, R = S.rates, full = mode === 'full';
  const id = 'c' + (++ctx.calcN);
  const def = Object.assign({ m: 'standart' }, defaults);
  const isMonth = def.d >= 30 && def.d % 30 === 0;
  const dval = isMonth ? def.d / 30 : def.d;
  const res = ctx.CALC.calculate(S, def);
  const modelSel = full ? `<div class="field"><label class="field__label" for="${id}-m">Модель</label><div class="select-wrap"><select class="select" id="${id}-m" data-f="m">${S.models.filter((m) => m.kind === 'rent').map((m) => `<option value="${m.slug}"${m.slug === def.m ? ' selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div></div>` : '';
  const dur = `<div class="field calc__dur" data-state="default"><label class="field__label" for="${id}-d">Срок аренды</label><div class="calc__durrow"><input class="input" id="${id}-d" type="text" inputmode="numeric" value="${dval}" data-f="d" aria-describedby="${id}-d-hint ${id}-d-msg"><fieldset class="seg"><legend class="visually-hidden">Единица срока</legend><div class="seg__row"><input type="radio" name="${id}-du" id="${id}-du0" value="day"${isMonth ? '' : ' checked'}><label for="${id}-du0">Сутки</label><input type="radio" name="${id}-du" id="${id}-du1" value="month"${isMonth ? ' checked' : ''}><label for="${id}-du1">Месяцы</label></div></fieldset></div><p class="field__hint" id="${id}-d-hint">Минимум 1 сутки. 1 месяц = ${R.daysInMonth} суток.</p><p class="field__msg" id="${id}-d-msg"></p></div>`;
  const kmField = `<div class="field calc__km" data-state="default"${def.z === 'region' ? '' : ' hidden'}><label class="field__label" for="${id}-km">Расстояние от границы Новосибирска, км</label><input class="input" id="${id}-km" type="text" inputmode="numeric" value="${def.km || ''}" data-f="km" aria-describedby="${id}-km-hint ${id}-km-msg"><p class="field__hint" id="${id}-km-hint">От 1 до ${R.delivery.maxKm} км до места установки.</p><p class="field__msg" id="${id}-km-msg"></p></div>`;
  return `<div class="calc calc--${mode} js-only" data-calc="${mode}" data-defaults="${esc(JSON.stringify(def))}" id="${id}">
<div class="calc__grid"><div class="calc__fields">${modelSel}
${stepper(id + '-n', 'Количество кабин', def.n, 1, R.maxCabins)}
<p class="field__hint calc__hint">Не знаете, сколько нужно? ${a('/meropriyatiya/#raschet', 'Расчёт для мероприятий')}</p>
${dur}
${radios(id + '-u', 'Обслуживание', R.serviceOptions, def.u, 'seg--grid')}
<p class="field__hint calc__hint">Для стройки обычно 1–2 раза в неделю. Для мероприятия на один день обслуживание не нужно.</p>
${radios(id + '-z', 'Доставка', [{ id: 'city', label: 'Новосибирск' }, { id: 'region', label: 'Область' }], def.z)}
${kmField}</div>
<aside class="quote on-dark" aria-label="Результат расчёта"><div class="quote__head"><h3>${full ? 'Смета' : 'Предварительный расчёт'}</h3></div><div class="quote__body" aria-live="polite">${ctx.CALC.resultHtml(S, res, mode, apx)}</div>
<p class="small quote__note">${esc(S.forms.calcMessages.note)}</p>
<div class="quote__act"><button class="btn btn--primary btn--block" type="button" data-calc-send aria-expanded="false" aria-controls="${id}-form">Отправить расчёт в заявке</button>
<a class="btn btn--link" data-calc-tg href="${S.contacts.telegramUrl}" rel="noopener">Отправить расчёт в мессенджер</a>
${full ? '' : `<a class="btn btn--link" data-calc-full href="${u('/ceny/')}">Подробный расчёт с выбором модели</a>`}</div></aside></div>
<div class="calc__form" id="${id}-form" hidden>${form({ mode: 'calc', heading: 'Заявка с расчётом', button: 'Получить расчёт', label: 'Заявка с расчётом' })}</div></div>
<noscript><div class="notice notice--info"><span class="notice__ico i i--alert" aria-hidden="true"></span><p>Калькулятор работает при включённом JavaScript. Ставки указаны в таблицах на странице ${a('/ceny/#stavki', 'цен')}, для расчёта позвоните: ${tel()}.</p></div></noscript>`;
}

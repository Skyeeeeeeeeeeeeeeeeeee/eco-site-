// Компоненты и каркас страницы. Всё возвращает строки HTML. Данные берутся из SITE (js/content.js).
// Темы E и F отличаются только CSS-токенами (css/themes.css): разметка у обеих одна.
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const NB = ' ';

// Контекст сборки: заполняется build.mjs. prefix: относительный путь до корня сайта ('./', '../', '../../').
export const ctx = { S: null, CALC: null, prefix: './', production: false, page: null, secN: 0, formN: 0, calcN: 0, faqUsed: [], photosUsed: new Set(), theme: 'e' };

// Ссылки page-relative и с явным index.html, чтобы сайт открывался двойным кликом (file://) без сервера.
export const u = (path) => {
  if (/^(https?:|tel:|mailto:)/.test(path) || path.charAt(0) === '#') return path;
  const m = path.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  let p = m[1].replace(/^\//, '');
  if (p === '' || p.endsWith('/')) p += 'index.html';
  return ctx.prefix + p + (m[2] || '') + (m[3] || '');
};
export const rub = (n) => ctx.S.rub(n);
export const dev = (text, cls = '') => (ctx.production ? '' : `<p class="notice notice--warn dev-flag ${cls}" role="note"><span class="notice__ico i i--alert" aria-hidden="true"></span><span><b>ЗАГЛУШКА.</b> ${text}</span></p>`);
export const devTag = (text) => (ctx.production ? '' : `<span class="tag dev-flag">Заглушка</span> ${esc(text)}`);

export const ic = (name, cls = 'ic') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
export const apx = '<span class="apx" aria-hidden="true"></span><span class="visually-hidden">около </span>';

// Плоская иллюстрация кабины из спрайта (m1..m5 из макетов E/F)
const MODEL_SYM = { standart: 'm1', 's-rukomojnikom': 'm2', 'dlya-malomobilnyh': 'm3', uteplennaya: 'm4', torfyanoj: 'm5' };
export function illus(slug, label, cls = 'illus') {
  return `<svg class="${cls}" viewBox="0 0 280 260" role="img" aria-label="${esc(label)}" focusable="false"><use href="#${MODEL_SYM[slug] || 'm1'}"/></svg>`;
}
// Иллюстрации для строк процесса (цвета берутся из токенов темы)
export function illScene(kind) {
  const bg = '<rect width="200" height="200" fill="var(--ph-bg)"/><polygon points="0,150 200,150 200,200 0,200" fill="var(--ph-floor)"/>';
  const body = {
    form: '<rect x="40" y="52" width="120" height="76" rx="6" fill="#fff"/><rect x="52" y="66" width="60" height="6" fill="var(--ph-ink)"/><rect x="52" y="80" width="92" height="4" fill="var(--ph-soft)"/><rect x="52" y="90" width="76" height="4" fill="var(--ph-soft)"/><rect x="52" y="104" width="34" height="12" rx="6" fill="var(--ph-btn)"/>',
    doc: '<rect x="56" y="36" width="88" height="112" rx="6" fill="#fff"/><rect x="68" y="52" width="50" height="6" fill="var(--ph-ink)"/><rect x="68" y="66" width="64" height="4" fill="var(--ph-soft)"/><rect x="68" y="76" width="56" height="4" fill="var(--ph-soft)"/><rect x="68" y="86" width="64" height="4" fill="var(--ph-soft)"/><circle cx="118" cy="122" r="10" fill="var(--ph-btn)"/><path d="m113 122 4 4 7-8" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    cab: '<g transform="translate(58 38) scale(.5)"><use href="#cabg"/></g><polygon points="120,0 150,0 80,150 50,150" fill="var(--ph-lt)"/>',
    service: '<g transform="translate(20 46) scale(.46)"><use href="#cabg"/></g><rect x="118" y="88" width="56" height="62" rx="4" fill="var(--ph-tank)"/><rect x="128" y="70" width="36" height="20" fill="var(--ph-cap)"/><rect x="170" y="100" width="22" height="4" fill="var(--ph-ink)"/>',
    load: '<rect x="20" y="124" width="160" height="10" fill="var(--ph-bar)"/><g transform="translate(34 36) scale(.4)"><use href="#cabg"/></g><g transform="translate(94 36) scale(.4)"><use href="#cabg"/></g>'
  }[kind];
  return `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${bg}${body}</svg>`;
}

/* ---------- фото: srcset 640/1280, lazy, width/height, подпись с автором и лицензией ---------- */
export function photo(id, o = {}) {
  const p = ctx.S.photos[id];
  if (!p || !p.author) throw new Error('нет данных о фото ' + id);
  ctx.photosUsed.add(id);
  const small = u('/photos/' + id + '-640.jpg'), big = u('/photos/' + id + '.jpg');
  const cap = `<figcaption class="photo__cap">Фото: ${esc(p.author)}, <a href="${esc(p.source)}" target="_blank" rel="noopener">${esc(p.license)}<span class="visually-hidden"> (источник, откроется в новой вкладке)</span></a></figcaption>`;
  const ar = o.ar ? ` style="--ar:${o.ar}"` : '';
  return `<figure class="photo${o.cls ? ' ' + o.cls : ''}"><div class="photo__frame"${ar}><img src="${small}" srcset="${small} 640w, ${big} 1280w" sizes="${o.sizes || '(min-width:900px) 40vw, 100vw'}" width="${p.w}" height="${p.h}" alt="${esc(o.alt || p.alt)}" loading="${o.eager ? 'eager' : 'lazy'}" decoding="async"></div>${cap}</figure>`;
}

export function a(href, text, cls = '', extra = '') {
  return `<a${cls ? ` class="${cls}"` : ''} href="${esc(u(href))}"${extra ? ' ' + extra : ''}>${text}</a>`;
}
export function btn(href, text, kind = 'primary', extra = '') {
  const k = { primary: 'btn btn--primary', outline: 'btn btn--outline', link: 'btn btn--link', dark: 'btn btn--primary', plain: 'btn btn--primary' }[kind];
  return `<a class="${k}" href="${esc(u(href))}"${extra ? ' ' + extra : ''}>${text}</a>`;
}
export const tel = (cls = '') => `<a class="${cls || 'tel'}" href="${ctx.S.contacts.phoneHref}">${ctx.S.contacts.phone.replace(/ /g, NB)}</a>`;
export const checkList = (items, cls = 'checks') => `<ul class="${cls}">${items.map((i) => `<li><span>${i}</span></li>`).join('')}</ul>`;

/* Заголовок-«хвост»: первое предложение тёмным, остаток серо-голубым (как в макетах E/F) */
export function tailText(text, tail) {
  if (tail && text.includes(tail)) return text.replace(tail, `<span class="g">${tail}</span>`);
  return text;
}
export function lead(text) {
  const m = text.match(/^(.+?[.!?])\s+(\S[\s\S]*)$/);
  if (m) return `${m[1]} <span class="g">${m[2]}</span>`;
  const c = text.indexOf(', ');
  if (c > 24 && c < text.length - 12) return `${text.slice(0, c + 1)} <span class="g">${text.slice(c + 2)}</span>`;
  return text;
}

/* ---------- секция ---------- */
// o: id, title, tag (метка над заголовком), lead, paper (светлый фон), cls, bleed (контент на всю ширину после заголовка), center
export function section(o, inner) {
  ctx.secN += 1;
  const cls = ['section', o.paper ? 'section--paper' : '', o.cls || ''].filter(Boolean).join(' ');
  const hid = o.id ? o.id + '-h' : 'h' + ctx.secN;
  const head = o.title
    ? `<header class="sec-head${o.center ? ' sec-head--c' : ''}">${o.tag ? `<p class="label">${esc(o.tag)}</p>` : ''}<h2 id="${hid}">${o.title}</h2>${o.lead ? `<p class="lead">${lead(o.lead)}</p>` : ''}</header>`
    : '';
  if (o.bleed) return `<section class="${cls}"${o.id ? ` id="${o.id}"` : ''} aria-labelledby="${hid}"><div class="container">${head}</div>${inner}</section>`;
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

/* ---------- карточка модели (светлая плитка) ---------- */
export function modelCard(m, { headingLevel = 3, cta = false } = {}) {
  const S = ctx.S, h = 'h' + headingLevel;
  const price = m.kind === 'rent'
    ? `<span class="price"><small>от${NB}</small>${rub(S.modelFromPrice(m))}<small>/сутки</small></span>`
    : `<span class="price">${rub(S.terms.peatPrice)}</span>`;
  const note = m.kind === 'rent' ? `<span class="small note">при аренде от ${S.rates.rentPerDay[S.rates.rentPerDay.length - 1].from}${NB}суток</span>` : '<span class="small note">в продаже</span>';
  return `<article class="model-card" data-filters="${m.filters.join(' ')}">
<div class="sq">${illus(m.slug, m.name + ': плоская иллюстрация')}</div>
<div class="model-card__body"><div class="model-card__top"><span class="label">${m.sku}</span><span class="tag${m.kind === 'sale' ? ' tag--sale' : ''}">${m.kind === 'sale' ? 'Продажа' : 'Аренда'}</span></div>
<${h} class="model-card__title">${a('/katalog/' + m.slug + '/', esc(m.name), 'stretched')}</${h}>
<p class="small">${esc(m.short)}</p>
<ul class="kv kv--list">${m.cardFacts.map((f) => `<li>${esc(f).replace(/ (л|кг|см)/g, NB + '$1')}</li>`).join('')}</ul>
<div class="model-card__foot"><div>${price}<br>${note}</div></div>
${cta ? `<a class="btn btn--outline btn--sm model-card__req" href="${u('/katalog/' + m.slug + (m.kind === 'rent' ? '/#raschet' : '/#kupit'))}">Получить расчёт</a>` : ''}</div></article>`;
}

/* ---------- процесс: строки с кружком-номером и медиа (фото или плоская иллюстрация) ---------- */
// media[i]: 'ill:form|doc|cab|service|load' или id фото
const DEF_MEDIA = ['ill:form', 'ill:doc', 'ill:cab', 'ill:load'];
export function steps(items, o = {}) {
  const media = o.media || DEF_MEDIA;
  const m = (x) => {
    if (!x) return '';
    if (x.startsWith('ill:')) return `<div class="ph">${illScene(x.slice(4))}</div>`;
    return photo(x, { cls: 'photo--sq', ar: '1/1', sizes: '(min-width:900px) 190px, 160px' });
  };
  return `<ol class="rows">${items.map((s, i) => `<li class="row"><div class="container row__in"><div class="row__l"><span class="num" aria-hidden="true">${i + 1}</span><h3>${s.t}</h3></div><div class="row__m">${m(media[i])}</div><p class="row__p">${s.text}</p></div></li>`).join('')}</ol>`;
}
export const processSteps = () => steps(ctx.S.steps, { media: ['ill:form', 'ill:doc', 'stroyka-sinyaya', 'meropriyatie-pole'] });

/* ---------- FAQ ---------- */
export function faqItem(f, idp = 'q-') {
  const link = f.link ? ` ${a(f.link.href, esc(f.link.text))}` : '';
  return `<details class="acc" id="${idp}${f.id}"><summary class="acc__q"><span>${esc(f.q)}</span><span class="acc__ico" aria-hidden="true"></span></summary><div class="acc__a"><p>${esc(f.a)}${link}</p></div></details>`;
}
export function faqBlock(ids, { more = true, title = 'Частые вопросы', id = 'faq', paper = false } = {}) {
  const S = ctx.S;
  const items = ids.map((i) => S.faqById(i)).filter(Boolean);
  ctx.faqUsed = (ctx.faqUsed || []).concat(items);
  ctx.secN += 1;
  return `<section class="section faq${paper ? ' section--paper' : ''}" id="${id}" aria-labelledby="${id}-h"><div class="container faq-g"><div class="faq-g__h"><p class="label">Вопросы</p><h2 id="${id}-h">${title}</h2>${more ? `<p class="more">${btn('/voprosy/', 'Все вопросы и ответы', 'link')}</p>` : ''}</div><div class="acc-list">${items.map((f) => faqItem(f, id + '-')).join('')}</div></div></section>`;
}

/* ---------- отзывы: карусель со scroll-snap ---------- */
const chev = (d) => `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export function reviewCard(r) {
  const media = r.photo ? photo(r.photo, { cls: 'photo--slide', ar: '4/3', sizes: '(min-width:900px) 45vw, 90vw' }) : `<div class="ph ph--slide"><svg viewBox="0 0 280 260" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false"><use href="#m5"/></svg></div>`;
  return `<article class="slide"><div class="tx"><div><h3>${esc(r.author)}</h3><p class="who-s">${esc(r.place)} · ${esc(r.task)} · ${r.date}</p><p class="who-t"><span class="tag">${esc(r.typeLabel)}</span></p></div><blockquote><p>«${esc(r.text)}»</p></blockquote></div>${media}</article>`;
}
export function reviewsBlock(ids, o = {}) {
  const items = ids.map((id) => ctx.S.reviews.find((r) => r.id === id));
  const id = o.id || 'otzyvy-blok';
  ctx.secN += 1;
  return `<section class="rev" id="${id}" aria-labelledby="${id}-h" data-carousel><div class="container rev-h"><div><p class="label">Отзывы</p><h2 id="${id}-h">${o.title || 'Что говорят те, кто уже ставил наши кабины'}</h2></div>
<div class="arrows js-only"><button class="arr" type="button" data-prev aria-label="Предыдущий отзыв">${chev('M10 3 5 8l5 5')}</button><button class="arr" type="button" data-next aria-label="Следующий отзыв">${chev('m6 3 5 5-5 5')}</button></div></div>
<div class="track" data-track tabindex="0" role="group" aria-label="Отзывы клиентов, листайте вбок">${items.map(reviewCard).join('')}</div>
<div class="container rev-f">${o.devNote ? dev(o.devNote) : ''}${o.link ? `<p class="more">${btn('/o-kompanii/#otzyvy', 'Все отзывы', 'link')}</p>` : ''}</div></section>`;
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
  return `<div class="formbox">${heading}<form class="form form--${mode}${o.cls ? ' ' + o.cls : ''}" data-form="${mode}" method="post" action="#" novalidate aria-label="${esc(o.label || o.heading || 'Заявка')}">
<div class="form__summary notice notice--error" role="alert" tabindex="-1" hidden></div>
<div class="form__fields">${fields}
<div class="hp" aria-hidden="true"><label>Не заполняйте <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
<input type="hidden" name="source" value="${esc(ctx.page.path)}"><input type="hidden" name="calc" value=""><input type="hidden" name="utm" value="">
<div class="field field--consent" data-state="default"><label class="check"><input type="checkbox" name="consent" id="${id}-consent" required aria-describedby="${id}-consent-msg" data-v="consent"><span class="check__box" aria-hidden="true"></span><span class="check__t">Согласен(на) на обработку персональных данных. ${a('/politika-konfidencialnosti/', 'Политика обработки данных', '', 'target="_blank" rel="noopener"')}</span></label><p class="field__msg" id="${id}-consent-msg"></p></div>
<div class="form__act"><button class="btn btn--primary btn--lg" type="submit" data-label="${btnText}">${btnText}</button><p class="small note">${esc(S.forms.micro)}${ctx.production ? '' : ' <span class="tag dev-flag">Заглушка</span>'}</p></div></div>
<div class="notice notice--ok form__ok" role="status" tabindex="-1" hidden><span class="notice__ico i i--check" aria-hidden="true"></span><div><p class="notice__t">${mode === 'zone' ? 'Запрос принят' : 'Заявка принята'}</p><p>${esc(success.replace(/^(Заявка|Запрос) принят[а]?\.\s*/, ''))}</p><p><button class="btn btn--link form__again" type="button">Отправить ещё одну</button></p></div></div>
<div class="notice notice--error form__fail" role="alert" hidden><span class="notice__ico i i--alert" aria-hidden="true"></span><p>${esc(S.forms.failure)}</p></div>
</form>
<noscript><div class="notice notice--info"><span class="notice__ico i i--alert" aria-hidden="true"></span><p>Форма работает при включённом JavaScript. Позвоните: ${tel()} или напишите: ${a(S.contacts.telegramUrl, 'Telegram')}.</p></div></noscript></div>`;
}

export function ctaBlock() {
  const S = ctx.S;
  return `<section class="section cta" id="zayavka" aria-labelledby="cta-h"><div class="container cta-g">
<div class="cta__text"><p class="label">Связаться</p><h2 id="cta-h">Назовите адрес и даты. <span class="g">Рассчитаем стоимость под вашу задачу.</span></h2>
<div class="cont"><p>${tel('big')}</p><p class="cont__row"><a class="btn btn--outline btn--sm" href="${S.contacts.telegramUrl}" rel="noopener">${ic('telegram')} Telegram</a><a class="btn btn--outline btn--sm" href="${S.contacts.whatsappUrl}" rel="noopener">${ic('whatsapp')} WhatsApp</a></p><p class="small">${esc(S.contacts.hours.charAt(0).toUpperCase() + S.contacts.hours.slice(1))} · ${esc(S.contacts.address)}</p></div></div>
<div class="cta__form">${form({ mode: 'short', heading: 'Получить расчёт' })}<p class="more">${btn('/ceny/', 'Или посчитайте самостоятельно', 'link')}</p></div></div></section>`;
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
<aside class="quote" aria-label="Результат расчёта"><div class="quote__head"><h3>${full ? 'Смета' : 'Предварительный расчёт'}</h3></div><div class="quote__body" aria-live="polite">${ctx.CALC.resultHtml(S, res, mode, apx)}</div>
<p class="small quote__note">${esc(S.forms.calcMessages.note)}</p>
<div class="quote__act"><button class="btn btn--primary btn--block" type="button" data-calc-send aria-expanded="false" aria-controls="${id}-form">Отправить расчёт в заявке</button>
<a class="btn btn--link" data-calc-tg href="${S.contacts.telegramUrl}" rel="noopener">Отправить расчёт в мессенджер</a>
${full ? '' : `<a class="btn btn--link" data-calc-full href="${u('/ceny/')}">Подробный расчёт с выбором модели</a>`}</div></aside></div>
<div class="calc__form" id="${id}-form" hidden>${form({ mode: 'calc', heading: 'Заявка с расчётом', button: 'Получить расчёт', label: 'Заявка с расчётом' })}</div></div>
<noscript><div class="notice notice--info"><span class="notice__ico i i--alert" aria-hidden="true"></span><p>Калькулятор работает при включённом JavaScript. Ставки указаны в таблицах на странице ${a('/ceny/#stavki', 'цен')}, для расчёта позвоните: ${tel()}.</p></div></noscript>`;
}

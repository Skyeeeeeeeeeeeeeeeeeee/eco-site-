import NSK from './nsk-map-data.mjs';
// Компоненты и каркас страницы. Всё возвращает строки HTML. Данные берутся из SITE (js/content.js).
// Темы E и F отличаются только CSS-токенами (css/themes.css): разметка у обеих одна.
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const NB = ' ';

// Контекст сборки: заполняется build.mjs. prefix: относительный путь до корня сайта ('./', '../', '../../').
export const ctx = { S: null, CALC: null, prefix: './', production: false, page: null, secN: 0, formN: 0, calcN: 0, uidN: 0, faqUsed: [], photosUsed: new Set(), theme: 'e' };

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

// Плоские иллюстрации моделей из спрайта (src/img/cabins.svg.frag): без 3D и растровых рендеров
const MODEL_SYM = { standart: 'mS', ekonom: 'mE', komfort: 'mK', vip: 'mV', 'vip-in': 'mVin' };
const symOf = (id) => { const m = ctx.S && ctx.S.modelById(id); return MODEL_SYM[m ? m.id : id] || 'mS'; };
export function illus(id, label, cls = 'illus') {
  return `<svg class="${cls}" viewBox="0 0 280 260" role="img" aria-label="${esc(label)}" focusable="false"><use href="#${symOf(id)}"/></svg>`;
}
// маленькая декоративная иллюстрация для таблиц (название модели рядом)
export const thumb = (id) => `<svg class="thumb" viewBox="0 0 280 260" aria-hidden="true" focusable="false"><use href="#${symOf(id)}"/></svg>`;
// Иллюстрации для строк процесса (цвета берутся из токенов темы)
export function illScene(kind) {
  const bg = '<rect width="200" height="200" fill="var(--ph-bg)"/><polygon points="0,150 200,150 200,200 0,200" fill="var(--ph-floor)"/>';
  const body = {
    chat: '<rect x="34" y="46" width="104" height="58" rx="14" fill="#fff"/><polygon points="58,104 58,124 80,104" fill="#fff"/><rect x="50" y="62" width="64" height="6" fill="var(--ph-ink)"/><rect x="50" y="76" width="72" height="4" fill="var(--ph-soft)"/><rect x="50" y="86" width="48" height="4" fill="var(--ph-soft)"/><rect x="108" y="102" width="62" height="38" rx="12" fill="var(--ph-btn)"/><rect x="120" y="114" width="38" height="4" fill="#fff"/><rect x="120" y="123" width="26" height="4" fill="#fff"/>',
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

/* ---------- v2: счётчик: число в тексте анимируется скриптом, без JS остаётся итоговое значение ---------- */
export function countVal(v) {
  const t = String(v), m = t.match(/^\D*(\d[\d\s  ]*)\D*$/);
  if (!m) return esc(t);
  const digits = m[1].replace(/\D/g, '');
  if (digits.length === 4 && +digits >= 1900 && +digits <= 2100) return esc(t); // год не считаем
  return `<span class="cnt" data-count>${esc(t)}</span>`;
}

/* ---------- v2: виджет «успеваем сегодня». Текст подставляет life.js из SITE.copy; без JS статичная строка ---------- */
export function liveWidget(cls = '') {
  const C = ctx.S.copy;
  return `<div class="live${cls ? ' ' + cls : ''}" data-live><span class="live__dot" aria-hidden="true"></span><p class="live__t" data-live-text aria-live="polite">${esc(C.liveStatic)}</p>${ctx.production ? '' : ' <span class="tag dev-flag">Заглушка</span>'}</div>`;
}

/* ---------- v2: схема зон доставки — стилизованный Новосибирск по данным OpenStreetMap (не навигационная карта) ---------- */
const ROUTE = 'M250 250 C 296 282, 306 352, 312.6 418.2'; // склад → Бердск (ЗАГЛУШКА: пример рейса)
export function deliveryMap() {
  const S = ctx.S, Z = S.zones, L = S.copy.mapZoneLabels, D = S.rates.delivery, M = NSK;
  const price = [S.rub(D.cityPerTrip), S.rub(D.nearPerTrip), S.rub(D.nearPerTrip) + ' и далее по километражу'];
  const chip = (i, x, y) => `<circle class="zmap__chip" cx="${x}" cy="${y}" r="13"/><text class="zmap__ch" x="${x}" y="${y + 5}" text-anchor="middle">${Z[i].chip}</text>`;
  const z = (i, shape, labels) => `<g class="zmap__z" data-z="${Z[i].id}" tabindex="0" role="img" aria-label="Зона ${Z[i].chip}: ${esc(Z[i].name)}, ${esc(price[i])} за рейс">${shape}${labels}</g>`;
  const town = (name, dx = 7, dy = -6, anchor = 'start') => { const [x, y] = M.towns[name]; return `<circle class="zmap__town" cx="${x}" cy="${y}" r="3.5"/><text class="zmap__tt" x="${x + dx}" y="${y + dy}" text-anchor="${anchor}">${name}</text>`; };
  const cityPaths = M.city.map((d) => `<path class="zmap__c zmap__c--a" d="${d}"/>`).join('');
  return `<figure class="zmap" data-zmap><svg class="zmap__svg" viewBox="0 0 500 500" role="group" aria-label="Схема зон доставки: Новосибирск, Обь и Обское море, пригороды. Не навигационная карта." focusable="false">
${z(2, '<rect class="zmap__c zmap__c--c" x="0" y="0" width="500" height="500"/>', chip(2, 28, 30) + `<text class="zmap__t" x="48" y="36">${esc(L[Z[2].id])}</text><text class="zmap__ts" x="48" y="56">по области</text>`)}
${z(1, `<circle class="zmap__c zmap__c--b" cx="250" cy="250" r="${M.r30}"/>`, chip(1, 250, 250 - M.r30) + `<text class="zmap__t" x="270" y="${250 - M.r30 + 6}">${esc(L[Z[1].id])}</text>`)}
${z(0, cityPaths, chip(0, 214, 168) + `<text class="zmap__t zmap__t--city" x="234" y="174">${esc(L[Z[0].id])}</text>`)}
<g class="zmap__water" aria-hidden="true">${M.river.map((d) => `<path class="zmap__ob" d="${d}"/>`).join('')}${M.reservoir.map((d) => `<path class="zmap__sea" d="${d}"/>`).join('')}</g>
<text class="zmap__river" x="196" y="78" transform="rotate(-70 196 78)">р. Обь</text><text class="zmap__river" x="182" y="470" transform="rotate(-38 182 470)">Обское море</text>
<g class="zmap__towns" aria-hidden="true">${town('Колывань')}${town('Обь', -8, 18, 'end')}${town('Толмачёво', -8, -6, 'end')}${town('Краснообск', -8, 16, 'end')}${town('Кольцово')}${town('Академгородок')}${town('Бердск', 8, 14)}</g>
<path class="zmap__route" d="${ROUTE}"/><circle class="zmap__dest" cx="312.6" cy="418.2" r="6"/>
<rect class="zmap__base" x="243" y="243" width="14" height="14" rx="3"/><text class="zmap__bt" x="262" y="262">${esc(S.copy.mapBase)}</text>
<g class="zmap__truck" style="offset-path:path('${ROUTE}')" aria-hidden="true"><g transform="scale(1.3)"><rect x="-16" y="-9" width="20" height="13" rx="2"/><path d="M4 -5h6l4 5v4H4z"/><circle cx="-8" cy="5" r="3.4"/><circle cx="8.5" cy="5" r="3.4"/></g></g>
</svg><figcaption class="zmap__cap">${esc(S.copy.mapCaption)} Основа схемы: © участники <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a>.${ctx.production ? '' : ' <span class="tag dev-flag">Заглушка</span>'}</figcaption></figure>`;
}

/* ---------- v2: галерея «Кабины в работе»: все фото, scroll-snap, стрелки, drag ---------- */
export function workGallery({ id = 'rabota', title = 'Кабины в работе', tag = 'Фотографии' } = {}) {
  const ids = Object.keys(ctx.S.photos);
  ctx.secN += 1;
  return `<section class="section section--paper gal" id="${id}" aria-labelledby="${id}-h" data-carousel><div class="container gal__h"><header class="sec-head"><p class="label">${tag}</p><h2 id="${id}-h">${title}</h2></header>
<div class="arrows js-only"><button class="arr" type="button" data-prev aria-label="Предыдущее фото">${chev('M10 3 5 8l5 5')}</button><button class="arr" type="button" data-next aria-label="Следующее фото">${chev('m6 3 5 5-5 5')}</button></div></div>
<div class="track track--gal" data-track data-drag tabindex="0" role="group" aria-label="Фотографии кабин, листайте вбок или стрелками клавиатуры">${ids.map((p) => photo(p, { cls: 'photo--gal', ar: '4/3', sizes: '(min-width:900px) 520px, 70vw' })).join('')}</div>
<div class="container gal__f">${ctx.production ? '' : dev('Фотографии иллюстративные, стоковые. Заменить снимками компании.')}</div></section>`;
}
export function photoPair(a1, a2, alts = []) {
  return `<div class="container photo-pair">${[a1, a2].map((id, i) => photo(id, { cls: 'photo--card3', ar: '3/2', sizes: '(min-width:900px) 45vw, 100vw', alt: alts[i] })).join('')}</div>`;
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
export function table({ caption, head, rows, numFrom = 99, cls = '', hideCaption = false, stack = true, rowAttrs = [] }) {
  const th = head.map((h, i) => `<th scope="col" role="columnheader"${i >= numFrom ? ' class="num"' : ''}>${h}</th>`).join('');
  const body = rows.map((r, ri) => {
    const cells = r.map((c, i) => {
      if (i === 0) return `<th scope="row" role="rowheader">${c}</th>`;
      return `<td role="cell" data-label="${esc(head[i].replace(/<[^>]+>/g, ''))}"${i >= numFrom ? ' class="num"' : ''}>${c}</td>`;
    }).join('');
    return `<tr role="row"${rowAttrs[ri] ? ' ' + rowAttrs[ri] : ''}>${cells}</tr>`;
  }).join('');
  return `<div class="tbl-wrap"><table class="tbl ${stack ? 'tbl--stack' : ''} ${cls}" role="table"><caption${hideCaption ? ' class="visually-hidden"' : ''}>${caption}</caption><thead role="rowgroup"><tr role="row">${th}</tr></thead><tbody role="rowgroup">${body}</tbody></table></div>`;
}
export function specTable(caption, rows) {
  return `<table class="tbl tbl--spec"><caption class="visually-hidden">${esc(caption)}</caption><tbody>${rows.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td${r.mono ? ' class="mono"' : ''}>${esc(r.value).replace(/ (л|кг|мм|₽)/g, NB + '$1')}</td></tr>`).join('')}</tbody></table>`;
}
export function kvTable(caption, head, rows) { // «Параметр / Условие»
  return `<table class="tbl tbl--kv"><caption class="visually-hidden">${esc(caption)}</caption><thead><tr><th scope="col">${head[0]}</th><th scope="col">${head[1]}</th></tr></thead><tbody>${rows.map((r) => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td></tr>`).join('')}</tbody></table>`;
}

/* ---------- цены ---------- */
// Стандарт: ступени срока (длительная аренда)
export function priceTable(caption = 'МТК Стандарт в аренду: цена за кабину в сутки, ₽', extraRow = true) {
  const S = ctx.S, m = S.modelById('standart');
  const head = ['Срок', a('/katalog/' + m.slug + '/', esc(m.name))];
  const rows = S.rates.rentPerDay.map((t, i) => [S.tierLabel(t), rub(S.modelRate(m, i))]);
  if (extraRow) { const d = S.rates.sampleDays; rows.push([d + ' суток (за весь срок)', rub(S.unitRate(m, d) * d)]); }
  return table({ caption, head, rows, numFrom: 1, cls: 'tbl--price' });
}
// Комфорт и VIP: цена за кабину за сутки (мероприятие), без ступеней срока
export function eventPriceTable(caption = 'Аренда на мероприятие: цена за кабину за сутки, ₽') {
  const S = ctx.S, ev = S.rentable().filter((m) => m.rent.type === 'event');
  return table({ caption, head: ['Модель', 'За кабину за сутки (до 24 часов)', 'Что внутри'], numFrom: 1, cls: 'tbl--price tbl--thumbs tbl--kit',
    rows: ev.map((m) => [thumb(m.id) + a('/katalog/' + m.slug + '/', esc(m.name)), rub(m.rent.perDay), esc(m.cmp.kit)]) });
}
// Продажа: Стандарт и Эконом
export function salePriceTable(caption = 'Продажа: цена кабины, ₽') {
  const S = ctx.S;
  return table({ caption, head: ['Модель', 'Цена', 'Комплектация'], numFrom: 1, cls: 'tbl--price tbl--thumbs tbl--kit',
    rows: S.saleable().map((m) => [thumb(m.id) + a('/katalog/' + m.slug + '/', esc(m.name)), 'от' + NB + rub(S.saleFrom(m)), esc(m.cmp.kit)]) });
}
// Сводка по всем моделям: аренда и продажа
export function priceSummary(caption = 'Все модели: цены на аренду и продажу') {
  const S = ctx.S;
  const rentCell = (m) => (!m.rent ? '<span aria-label="не сдаётся">—</span>' : m.rent.type === 'event' ? rub(m.rent.perDay) + '/сутки' : 'от' + NB + rub(S.modelFromPrice(m)) + '/сутки');
  const saleCell = (m) => (!m.sale ? '<span aria-label="не продаётся">—</span>' : 'от' + NB + rub(m.sale.from));
  return table({ caption, head: ['Модель', 'Аренда', 'Продажа'], numFrom: 1, cls: 'tbl--price tbl--thumbs',
    rows: S.models.map((m) => [thumb(m.id) + a('/katalog/' + m.slug + '/', esc(m.name)), rentCell(m), saleCell(m)]) });
}
export const priceNote = () => `<p class="small note">Цены ориентировочные. Итоговую стоимость называем до оплаты и фиксируем в договоре или счёте.${ctx.production ? '' : ' <span class="tag dev-flag">Заглушка</span>'}</p>`;

/* ---------- карточка модели (светлая плитка) ---------- */
// Что делаем с моделью: аренда (на длительный срок или на мероприятие), продажа или и то и другое
export function offerTags(m) {
  const t = [];
  if (m.rent) t.push(m.rent.type === 'event' ? 'Аренда на мероприятие' : 'Аренда на длительный срок');
  if (m.sale) t.push('Продажа');
  return t;
}
export function priceLines(m) {
  const S = ctx.S, out = [];
  if (m.rent) out.push(m.rent.type === 'event' ? `<span class="price"><small>от${NB}</small>${rub(m.rent.perDay)}<small>/сутки</small></span>` : `<span class="price"><small>от${NB}</small>${rub(S.modelFromPrice(m))}<small>/сутки</small></span>`);
  if (m.sale) out.push(`<span class="price"><small>купить от${NB}</small>${rub(m.sale.from)}</span>`);
  return out;
}
export function modelCard(m, { headingLevel = 3, cta = false } = {}) {
  const S = ctx.S, h = 'h' + headingLevel;
  const note = m.rent ? (m.rent.type === 'event' ? 'аренда: цена за кабину за сутки' : `аренда от ${S.rates.rentPerDay[S.rates.rentPerDay.length - 1].from}${NB}суток`) : 'продажа';
  return `<article class="model-card" data-filters="${m.filters.join(' ')}">
<div class="sq">${illus(m.id, m.name + ': плоская иллюстрация')}</div>
<div class="model-card__body"><div class="model-card__top">${offerTags(m).map((t, i) => `<span class="tag${t === 'Продажа' ? ' tag--sale' : ''}">${t}</span>`).join('')}</div>
<${h} class="model-card__title">${a('/katalog/' + m.slug + '/', esc(m.name), 'stretched')}</${h}>
<p class="small">${esc(m.short)}</p>
<ul class="kv kv--list">${m.cardFacts.map((f) => `<li>${esc(f).replace(/ (л|кг|мм)/g, NB + '$1')}</li>`).join('')}</ul>
<div class="model-card__foot"><div>${priceLines(m).join('<br>')}<br><span class="small note">${note}</span></div></div>
${cabinHelper(m)}${cta ? `<a class="btn btn--outline btn--sm model-card__req" href="${u('/katalog/' + m.slug + (m.rent ? '/#raschet' : '/#kupit'))}">${m.rent ? 'Рассчитать стоимость' : 'Как купить'}</a>` : ''}</div></article>`;
}

/* ---------- процесс: строки с кружком-номером и медиа (фото или плоская иллюстрация) ---------- */
// media[i]: 'ill:chat|doc|cab|service|load' или id фото
const DEF_MEDIA = ['ill:chat', 'ill:doc', 'ill:cab', 'ill:load'];
export function steps(items, o = {}) {
  const media = o.media || DEF_MEDIA;
  const m = (x) => {
    if (!x) return '';
    if (x.startsWith('ill:')) return `<div class="ph">${illScene(x.slice(4))}</div>`;
    return photo(x, { cls: 'photo--sq', ar: '1/1', sizes: '(min-width:900px) 190px, 160px' });
  };
  return `<ol class="rows" data-timeline>${items.map((s, i) => `<li class="row"><div class="container row__in"><div class="row__l"><span class="num" aria-hidden="true">${i + 1}</span><h3>${s.t}</h3></div><div class="row__m">${m(media[i])}</div><p class="row__p">${s.text}</p></div></li>`).join('')}</ol>`;
}
export const processSteps = () => steps(ctx.S.steps, { media: ['ill:chat', 'ill:doc', 'stroyka-sinyaya', 'meropriyatie-pole'] });

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
  const media = r.photo ? photo(r.photo, { cls: 'photo--slide', ar: '4/3', sizes: '(min-width:900px) 45vw, 90vw' }) : `<div class="ph ph--slide"><svg viewBox="0 0 280 260" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false"><use href="#mE"/></svg></div>`;
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

/* ---------- контакты: форм на сайте нет, связь только по телефону и в мессенджерах ---------- */
const capFirst = (x) => x.charAt(0).toUpperCase() + x.slice(1);
export const contactBtns = (o = {}) => {
  const C = ctx.S.contacts, sm = o.sm ? ' btn--sm' : '';
  return `<a class="btn btn--primary${sm}" href="${C.phoneHref}">${ic('phone')} Позвонить</a><a class="btn btn--outline${sm}" href="${C.telegramUrl}" target="_blank" rel="noopener">${ic('telegram')} Telegram</a><a class="btn btn--outline${sm}" href="${C.whatsappUrl}" target="_blank" rel="noopener">${ic('whatsapp')} WhatsApp</a>`;
};
// Блок связи: большой телефон, три кнопки, часы работы и короткая строка
export function contactPanel({ title = '', line, cls = '' } = {}) {
  const C = ctx.S.contacts;
  return `<div class="cpanel${cls ? ' ' + cls : ''}">${title ? `<p class="cpanel__t">${title}</p>` : ''}<p class="cpanel__line">${line || esc(C.contactLine)}</p><a class="cpanel__tel" href="${C.phoneHref}">${esc(C.phone).replace(/ /g, NB)}</a><div class="cpanel__btns">${contactBtns()}</div><p class="cpanel__hours">${ic('clock')} <span>${esc(C.hoursShort)}</span></p></div>`;
}
export function ctaBlock() {
  const S = ctx.S, C = S.contacts;
  return `<section class="section cta" id="kontakt" aria-labelledby="cta-h"><div class="container cta-g">
<div class="cta__text"><p class="label">Связаться</p><h2 id="cta-h">Позвоните или напишите. <span class="g">Назовём цену и сроки под вашу задачу.</span></h2>
<p class="cta__sub">Мы не просим оставлять данные на сайте: вы сами звоните или пишете, когда вам удобно.</p><p class="cta__sub small">${esc(C.address)}</p>
<p class="more">${btn('/#podbor', 'Подобрать кабину за 3 шага', 'link')}${btn('/ceny/', 'Или посчитайте самостоятельно', 'link')}</p></div>
<div class="cta__form">${contactPanel({ cls: 'cpanel--big' })}</div></div></section>`;
}

/* ---------- v2u: сравнение моделей (Эконом / Стандарт / Комфорт / VIP) ---------- */
const yn = (on, text) => `<span class="yn ${on ? 'yn--y' : 'yn--n'}">${ic(on ? 'yes' : 'no', 'ic yn__i')}<span>${on ? '<span class="visually-hidden">да: </span>' : '<span class="visually-hidden">нет: </span>'}${text}</span></span>`;
export function compareTable({ compact = false, id = 'cmp' } = {}) {
  const S = ctx.S, cols = ['ekonom', 'standart', 'komfort', 'vip'].map((i) => S.modelById(i));
  const last = S.rates.rentPerDay[S.rates.rentPerDay.length - 1].from;
  const head = `<th scope="col" class="cmp__corner"><span class="visually-hidden">Параметр</span></th>${cols.map((m) => `<th scope="col"><a class="cmp__h" href="${esc(u('/katalog/' + m.slug + '/'))}">${thumb(m.id)}<span>${esc(m.name)}</span></a></th>`).join('')}`;
  const price = (m) => [m.rent ? `Аренда от${NB}${rub(S.modelFromPrice(m))}/сутки` : '', m.sale ? `Продажа от${NB}${rub(S.saleFrom(m))}` : ''].filter(Boolean).map((t) => `<span class="cmp__p">${t}</span>`).join('');
  const rows = [
    ['Для чего', (m) => esc(m.cmp.use)],
    ['Аренда / Продажа', (m) => yn(!!m.rent, m.rent ? (m.rent.type === 'event' ? 'Аренда, мероприятия' : `Аренда от${NB}${last}${NB}суток`) : 'Аренда') + yn(!!m.sale, 'Продажа')],
    ['Цена', price],
    ['Бак', (m) => esc(m.cmp.tank)],
    ['Размеры', (m) => esc(m.cmp.size).replace(/ мм/, NB + 'мм')],
    ['Вес', (m) => esc(m.cmp.weight)],
    ['Внутри', (m) => esc(m.cmp.kit)],
    ['Обслуживание', (m) => esc(m.cmp.service)]
  ].filter((r) => !compact || ['Для чего', 'Аренда / Продажа', 'Цена', 'Бак', 'Размеры'].includes(r[0]));
  return `<div class="cmp${compact ? ' cmp--compact' : ''}" data-cmp id="${id}"><p class="cmp__hint" aria-hidden="true">листайте <span>→</span></p><div class="cmp__scroll" tabindex="0" role="region" aria-label="Сравнение моделей, таблица прокручивается вбок"><table class="cmp__t"><caption class="visually-hidden">Сравнение моделей МТК: Эконом, Стандарт, Комфорт, VIP</caption><thead><tr>${head}</tr></thead><tbody>${rows.map(([l, f]) => `<tr><th scope="row">${l}</th>${cols.map((m) => `<td>${f(m)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
}

/* ---------- v2u: «Сколько кабин нужно» для Комфорт и VIP: гости и часы ---------- */
export function cabinHelper(m, page = false) {
  if (!(m.rent && m.rent.type === 'event')) return '';
  const S = ctx.S, id = 'ch' + (++ctx.uidN), r = ctx.CALC.events(S, { guests: 100, dur: 'to8h', alcohol: false });
  const link = u(`/ceny/?n=${r.total}&mix=komfort:${r.komfort},vip:${r.vip}&d=1#calc`);
  return `<div class="chelp js-only${page ? ' chelp--page' : ''}" data-chelp role="group" aria-labelledby="${id}-t"><p class="chelp__t" id="${id}-t">Сколько кабин нужно</p><div class="chelp__row"><label class="chelp__f" for="${id}-g"><span>Гостей</span><input class="input" id="${id}-g" type="text" inputmode="numeric" value="100" data-ch="guests" autocomplete="off"></label><label class="chelp__f" for="${id}-h"><span>Часов</span><input class="input" id="${id}-h" type="text" inputmode="numeric" value="6" data-ch="hours" autocomplete="off"></label></div><p class="chelp__r" data-ch-out aria-live="polite">${chelpText(r)}</p><a class="chelp__a" data-ch-link href="${esc(link)}">Рассчитать стоимость</a></div>`;
}
export const chelpText = (r) => `≈ ${r.total} ${ctx.CALC.plural(r.total, 'кабина', 'кабины', 'кабин')} (из них VIP ${r.vip})`;

/* ---------- v2u: подбор кабины за 3 шага ---------- */
function pkRadios(name, legend, opts, checked, cls = '') {
  return `<fieldset class="seg ${cls}"><legend class="field__label">${legend}</legend><div class="seg__row">${opts.map((o, i) => `<input type="radio" name="${name}" id="${name}-${i}" value="${o.id}"${o.id === checked ? ' checked' : ''}><label for="${name}-${i}">${o.label}</label>`).join('')}</div></fieldset>`;
}
const pkNum = (id, label, val, hint = '') => `<div class="field" data-state="default"><label class="field__label" for="${id}">${label}</label><input class="input" id="${id}" type="text" inputmode="numeric" value="${val}" autocomplete="off"${hint ? ` aria-describedby="${id}-hint"` : ''}>${hint ? `<p class="field__hint" id="${id}-hint">${hint}</p>` : ''}</div>`;
export function picker({ id = 'podbor', heading = 'Подобрать кабину за 3 шага', lead: ld = 'Ответьте на три вопроса: подскажем модель и количество кабин и прикинем цену. Ничего вводить о себе не нужно.', tag = 'Подбор', h = 2 } = {}) {
  const S = ctx.S, E = S.eventRules, W = S.picker.workersPerCabin, C = S.contacts;
  const std = S.modelById('standart'), eco = S.modelById('ekonom'), kom = S.modelById('komfort'), vip = S.modelById('vip');
  const task = [['stroyka', 'Стройка / объект', 'Длительная аренда МТК Стандарт'], ['event', 'Мероприятие', 'МТК Комфорт и МТК VIP на сутки'], ['buy', 'Купить кабину', 'МТК Стандарт или МТК Эконом']];
  const tasks = task.map(([v, t, d], i) => `<input type="radio" name="pk-task" id="pk-task-${i}" value="${v}"><label for="pk-task-${i}"><b>${t}</b><span>${d}</span></label>`).join('');
  const dur = E.durations.map((d) => ({ id: d.id, label: d.label }));
  const sub = {
    stroyka: `<div class="pk__sub" data-pk-sub="stroyka" hidden><div class="pk__two">${pkNum('pk-days', 'Срок аренды', 60, 'Минимум 1 сутки')}${pkRadios('pk-du', 'Единица срока', [{ id: 'day', label: 'Сутки' }, { id: 'month', label: 'Месяцы' }], 'month')}</div>${pkNum('pk-workers', 'Сколько рабочих на объекте', 30, `Ориентир: 1 кабина на ${S.terms.workersPerCabin} рабочих.${ctx.production ? '' : ' ЗАГЛУШКА'}`)}</div>`,
    event: `<div class="pk__sub" data-pk-sub="event" hidden>${pkNum('pk-guests', 'Сколько гостей', 100)}${pkRadios('pk-dur', 'Длительность', dur, 'to8h')}${pkRadios('pk-alc', 'Подаётся алкоголь', [{ id: 'no', label: 'Нет' }, { id: 'yes', label: 'Да' }], 'no')}</div>`,
    buy: `<div class="pk__sub" data-pk-sub="buy" hidden>${pkNum('pk-qty', 'Сколько кабин купить', 1)}${pkRadios('pk-for', 'Для чего', [{ id: 'dacha', label: 'Дача, участок' }, { id: 'object', label: 'Объект, стройка' }], 'dacha')}</div>`
  };
  const zone = `<div class="pk__sub">${pkRadios('pk-zone', 'Куда везти', [{ id: 'city', label: 'Новосибирск' }, { id: 'near', label: `До ${S.rates.delivery.nearKm} км от города` }, { id: 'region', label: 'Область' }], 'city', 'seg--grid')}<div class="field" data-state="default" data-pk-kmbox hidden><label class="field__label" for="pk-km">Расстояние от границы Новосибирска, км</label><input class="input" id="pk-km" type="text" inputmode="numeric" value="" autocomplete="off" aria-describedby="pk-km-hint"><p class="field__hint" id="pk-km-hint">От ${S.rates.delivery.nearKm + 1} до ${S.rates.delivery.maxKm} км до места установки.</p></div></div>`;
  const Hn = 'h' + h;
  const stat = `<noscript><div class="pk-static"><h3 class="h4">Как выбрать кабину без калькулятора</h3><ul class="checks"><li><span><b>Стройка или объект:</b> ${a('/katalog/' + std.slug + '/', 'МТК Стандарт')}, 1 кабина на ${S.terms.workersPerCabin} рабочих, обслуживание раз в неделю. Цены по срокам: ${a('/ceny/#stavki', 'таблица ставок')}.</span></li><li><span><b>Мероприятие:</b> ${a('/katalog/' + kom.slug + '/', 'МТК Комфорт')} и ${a('/katalog/' + vip.slug + '/', 'МТК VIP')}: 1 кабина на ${E.guestsPerCabin.to4h} гостей при программе до 4 часов, на ${E.guestsPerCabin.to8h} при 4–8 часах, на ${E.guestsPerCabin.over8h} при более длительной; с алкоголем на треть больше, каждая ${E.vipShare}-я кабина VIP. Подробнее: ${a('/meropriyatiya/#normy', 'нормы и цены')}.</span></li><li><span><b>Купить:</b> ${a('/katalog/' + eco.slug + '/', 'МТК Эконом')} для дачи, ${a('/katalog/' + std.slug + '/', 'МТК Стандарт')} для объекта. ${a('/prodazha/', 'Условия покупки')}.</span></li></ul><p>Позвоните: ${tel()} или напишите в ${a(C.telegramUrl, 'Telegram')} или ${a(C.whatsappUrl, 'WhatsApp')}.</p></div></noscript>`;
  return `<section class="section picker-sec" id="${id}" aria-labelledby="${id}-h"><div class="container"><header class="sec-head"><p class="label">${tag}</p><${Hn} id="${id}-h">${heading}</${Hn}><p class="lead">${lead(ld)}</p></header>
<div class="pk js-only" data-picker>
<div class="pk__prog"><p class="pk__no" data-pk-no aria-live="polite">Шаг 1 из 3</p><span class="pk__bar" aria-hidden="true"><i data-pk-bar></i></span></div>
<div class="pk__steps">
<div class="pk__step" data-pk-step="1"><fieldset class="pk__fs"><legend class="pk__q">Что вам нужно?</legend><div class="pk__opts">${tasks}</div></fieldset></div>
<div class="pk__step" data-pk-step="2" hidden><p class="pk__q" data-pk-q2>Расскажите о задаче</p>${sub.stroyka}${sub.event}${sub.buy}</div>
<div class="pk__step" data-pk-step="3" hidden><p class="pk__q">Куда везти кабины?</p>${zone}</div>
</div>
<p class="pk__err" data-pk-err role="alert"></p>
<div class="pk__nav"><button class="btn btn--outline" type="button" data-pk-back hidden>Назад</button><button class="btn btn--primary" type="button" data-pk-next disabled>Далее</button></div>
<div class="pk__res quote" data-pk-result tabindex="-1" aria-live="polite" hidden></div>
</div>${stat}</div></section>`;
}

/* ---------- v2u: компактный процесс, 4 шага в одну строку ---------- */
export function stepsRow(items) {
  return `<ol class="sr">${items.map((s, i) => `<li class="sr__i"><span class="sr__n" aria-hidden="true">${i + 1}</span><h3>${s.t}</h3><p>${s.text}</p></li>`).join('')}</ol>`;
}

/* ---------- v2u: страницы моделей: предыдущая и следующая, плавающая сводка ---------- */
export function modelPager(m) {
  const S = ctx.S, list = S.models, i = list.findIndex((x) => x.id === m.id);
  const prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
  return `<nav class="mpager" aria-label="Другие модели"><a class="mpager__a" rel="prev" href="${esc(u('/katalog/' + prev.slug + '/'))}"><span class="small">← Предыдущая модель</span><b>${esc(prev.name)}</b></a><a class="btn btn--outline mpager__all" href="${esc(u('/katalog/'))}">Все модели</a><a class="mpager__a mpager__a--next" rel="next" href="${esc(u('/katalog/' + next.slug + '/'))}"><span class="small">Следующая модель →</span><b>${esc(next.name)}</b></a></nav>`;
}
export function modelSummary(m) {
  const S = ctx.S, C = S.contacts, pl = priceLines(m).join(' · ').replace(/<[^>]+>/g, '');
  return `<div class="msum js-only" data-msum role="region" aria-label="Кратко о модели" hidden><div class="container msum__in"><b class="msum__n">${esc(m.name)}</b><span class="msum__p">${pl}</span><span class="msum__b"><a class="btn btn--primary btn--sm" href="${C.phoneHref}">${ic('phone')} Позвонить</a><a class="btn btn--outline btn--sm" href="${C.whatsappUrl}" target="_blank" rel="noopener" data-wa-plain data-wa-text="${esc('Здравствуйте! Интересует ' + m.name)}">${ic('whatsapp')} WhatsApp</a></span></div></div>`;
}


/* ---------- калькулятор ---------- */
export function stepper(id, label, value, min, max) {
  return `<div class="field" data-state="default"><span class="field__label" id="${id}-l">${label}</span><div class="stepper" role="group" aria-labelledby="${id}-l"><button class="stepper__btn" type="button" aria-label="Уменьшить" data-step="-1"><span class="i i--minus" aria-hidden="true"></span></button><input class="stepper__val" id="${id}" type="text" inputmode="numeric" pattern="[0-9]*" value="${value}" aria-label="${label}" data-min="${min}" data-max="${max}" aria-describedby="${id}-msg"><button class="stepper__btn" type="button" aria-label="Увеличить" data-step="1"><span class="i i--plus" aria-hidden="true"></span></button></div><p class="field__msg" id="${id}-msg"></p></div>`;
}
function radios(name, legend, opts, checked, cls = '') {
  return `<fieldset class="seg ${cls}"><legend class="field__label">${legend}</legend><div class="seg__row">${opts.map((o, i) => `<input type="radio" name="${name}" id="${name}-${i}" value="${o.id}"${o.id === checked ? ' checked' : ''}><label for="${name}-${i}">${o.label}</label>`).join('')}</div></fieldset>`;
}
// Действия с расчётом: WhatsApp с готовым текстом (посетитель отправляет сам), копирование, звонок. Тексты подставляет main.js
export function shareActions({ calc: isCalc = false, attr = 'data-share' } = {}) {
  const C = ctx.S.contacts;
  return `<div class="quote__act" ${attr}><a class="btn btn--primary btn--block" data-share-wa href="${C.whatsappUrl}" target="_blank" rel="noopener">${ic('whatsapp')} Отправить расчёт в WhatsApp</a>
<button class="btn btn--outline btn--block" type="button" data-share-copy>${ic('copy')} Скопировать расчёт</button>
<a class="btn btn--outline btn--block" href="${C.phoneHref}">${ic('phone')} Позвонить</a>
<p class="quote__copied" data-share-status role="status" aria-live="polite"></p></div>`;
}
export function calc(mode = 'compact', defaults = { n: 1, d: 3, u: 'none', z: 'city', km: 0 }) {
  const S = ctx.S, R = S.rates, full = mode === 'full';
  const id = 'c' + (++ctx.calcN);
  const def = Object.assign({ m: 'standart' }, defaults);
  const isMonth = def.d >= 30 && def.d % 30 === 0;
  const dval = isMonth ? def.d / 30 : def.d;
  const res = ctx.CALC.calculate(S, def);
  const modelSel = full ? `<div class="field"><label class="field__label" for="${id}-m">Модель</label><div class="select-wrap"><select class="select" id="${id}-m" data-f="m">${S.rentable().map((m) => `<option value="${m.slug}"${m.slug === def.m ? ' selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div><p class="field__hint">МТК Стандарт: цена по ступеням срока. МТК Комфорт и МТК VIP: фиксированная цена за кабину за сутки (мероприятия).</p></div>` : '';
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
<p class="field__hint calc__hint">В одну машину помещается до ${R.delivery.cabinsPerTrip} кабин: один рейс, одна цена доставки.</p>
${kmField}</div>
<aside class="quote" aria-label="Результат расчёта"><div class="quote__head"><h3>${full ? 'Смета' : 'Предварительный расчёт'}</h3></div><div class="quote__body" aria-live="polite">${ctx.CALC.resultHtml(S, res, mode, apx)}</div>
<p class="small quote__note">${esc(S.forms.calcMessages.note)}</p>
${shareActions({ calc: true })}
${full ? '' : `<a class="btn btn--link quote__full" data-calc-full href="${u('/ceny/')}">Подробный расчёт с выбором модели</a>`}</aside></div></div>
<noscript><div class="notice notice--info"><span class="notice__ico i i--alert" aria-hidden="true"></span><p>Калькулятор работает при включённом JavaScript. Ставки указаны в таблицах на странице ${a('/ceny/#stavki', 'цен')}, для расчёта позвоните: ${tel()}.</p></div></noscript>`;
}

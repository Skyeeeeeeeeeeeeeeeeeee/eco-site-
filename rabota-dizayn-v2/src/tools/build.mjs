#!/usr/bin/env node
// Генератор двух сайтов «ЭКО СЕРВИС НОВОСИБИРСК» из одного исходника (темы E и F). Только Node 18+, без зависимостей.
//
//   node rabota-dizayn-v2/src/tools/build.mjs                 собрать оба сайта и страницу выбора (rabota-dizayn-v2/index.html)
//   node rabota-dizayn-v2/src/tools/build.mjs --theme=e       только одну тему (e | f)
//   node rabota-dizayn-v2/src/tools/build.mjs --production    падает, пока в content.js остались «ЗАГЛУШКА»; метки не выводятся
// Фото лежат в ../rabota-dizayn/shared/photos (только чтение, v1 не трогаем) и копируются в каждый сайт при сборке (только используемые).
// 3D и растровых рендеров нет: изображения моделей плоские SVG из src/img/cabins.svg.frag.
// Главная собирается в трёх вариантах первого экрана: index-a.html, index-b.html, index-c.html; index.html = копия варианта A.
//
// Каждый сайт самодостаточен и открывается двойным кликом (file://): ссылки page-relative и с явным index.html,
// SVG-спрайт встроен в страницу, нет preload шрифтов с crossorigin, нет ES-модулей, нет fetch/XHR.
// После сборки запускаются проверки (title ≤60, description ≤160, один H1, ссылки и якоря, JSON-LD, примеры калькулятора,
// размеры и подписи фото, отсутствие снятых моделей и 3D). При ошибках код выхода 1.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(SRC, '..');           // rabota-dizayn-v2/
const SHARED = process.env.ECO_SHARED ? path.resolve(process.env.ECO_SHARED) : path.resolve(ROOT, '../rabota-dizayn/shared'); // общие ресурсы v1, только чтение
const OUTROOT = process.env.ECO_OUT ? path.resolve(process.env.ECO_OUT) : ROOT;
const args = process.argv.slice(2);
const PROD = args.includes('--production') || process.env.NODE_ENV === 'production';
const only = (args.find((x) => x.startsWith('--theme=')) || '').slice(8);

const THEMES = [
  { id: 'e', dir: 'e-svetlo-goluboy', name: 'Е «Светло-голубой»', note: 'Голубая шапка и герой, тёмно-синие блоки: карточки, расчёт, отзывы, подвал.' },
  { id: 'f', dir: 'f-vozdushnyy', name: 'F «Воздушный»', note: 'Всё светлое: белый и бледно-голубой, без тёмных блоков.' }
].filter((t) => !only || t.id === only);

const lib = await import('../templates/lib.mjs');
const { templates } = await import('../templates/pages.mjs');
const { layout } = await import('../templates/layout.mjs');

/* ---------- данные ---------- */
const credits = JSON.parse(fs.readFileSync(path.join(SHARED, 'photos/credits.json'), 'utf8'));
function loadData() {
  const sandbox = vm.createContext({ __PHOTO_CREDITS__: credits });
  const contentSrc = fs.readFileSync(path.join(SRC, 'js/content.js'), 'utf8');
  vm.runInContext(contentSrc, sandbox, { filename: 'content.js' });
  vm.runInContext(fs.readFileSync(path.join(SRC, 'js/calc.js'), 'utf8'), sandbox, { filename: 'calc.js' });
  return { SITE: sandbox.SITE, CALC: sandbox.SITE_CALC, contentSrc };
}

/* ---------- JPEG: размеры из заголовка ---------- */
function jpegSize(file) {
  const b = fs.readFileSync(file);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

/* ---------- спрайт: иконки и плоские кабины, встраивается в каждую страницу ---------- */
function makeSprite() {
  const cab = fs.readFileSync(path.join(SRC, 'img/cabins.svg.frag'), 'utf8');
  const icons = fs.readFileSync(path.join(SRC, 'img/icons.svg.frag'), 'utf8');
  return `<svg class="defs" aria-hidden="true" focusable="false" width="0" height="0"><defs>${cab}\n${icons}</defs></svg>`;
}

const rmrf = (p) => fs.rmSync(p, { recursive: true, force: true });
const cp = (a, b) => { fs.mkdirSync(path.dirname(b), { recursive: true }); fs.copyFileSync(a, b); };

// Эталонные примеры калькулятора (документируются здесь и в README):
//  1) 2 кабины МТК Стандарт, 10 суток, обслуживание раз в неделю, Новосибирск: 2×10×550 = 11 000 + 2 визита×2 кабины×400 = 1 600 + рейс 800 = 13 400 ₽
//  2) мероприятие на 300 гостей, 4–8 часов, с алкоголем, одни сутки, Новосибирск: 11 кабин = 8 МТК Комфорт + 3 МТК VIP;
//     8×2 500 + 3×3 900 = 31 700, скидка 10% (от 10 кабин) −3 170, доставка 1 рейс (в машину до 20 кабин) 800 = 29 330, округление до 50: 29 350 ₽
const EXAMPLES = { std: 13400, evTotal: 11, evKomfort: 8, evVip: 3, evRent: 31700, evDiscount: 3170, evTrips: 1, evSum: 29350 };

function buildTheme(theme, data) {
  const { SITE, CALC, contentSrc } = data;
  const OUT = path.join(OUTROOT, theme.dir);
  const errors = [], warns = [];
  const err = (m) => errors.push(`[${theme.id}] ${m}`);
  Object.assign(lib.ctx, { S: SITE, CALC, production: PROD, theme: theme.id });
  const sprite = makeSprite();

  // 1. рендер: каждая страница; главная ещё в трёх вариантах первого экрана (index-a/b/c.html), index.html = вариант A
  const pages = [...Object.values(SITE.pages), SITE.notFound];
  const out = new Map();
  const meta = [];
  const jobs = [];
  for (const page of pages) {
    const file = page.path === '/' ? 'index.html' : page.path === '/404.html' ? '404.html' : page.path.slice(1) + 'index.html';
    jobs.push({ page, file, variant: page.template === 'home' ? 'a' : null });
    if (page.template === 'home') for (const v of SITE.heroVariants) jobs.push({ page: Object.assign({}, page, { index: false }), file: v.file, variant: v.id, isVariant: true });
  }
  for (const { page, file, variant, isVariant } of jobs) {
    const depth = file.split('/').length - 1;
    Object.assign(lib.ctx, { page, secN: 0, uidN: 0, calcN: 0, faqUsed: [], photosUsed: new Set(), prefix: depth ? '../'.repeat(depth) : './' });
    const main = templates[page.template](page, variant);
    const html = layout(page, main, sprite);
    out.set(file, html);
    meta.push({ page, file, html, variant, isVariant: !!isVariant, photos: new Set(lib.ctx.photosUsed) });
  }
  const urls = pages.filter((p) => p.index !== false).map((p) => p.path);
  out.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((p) => `  <url><loc>${SITE.site.domain}${p}</loc><lastmod>${SITE.site.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  out.set('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.site.domain}/sitemap.xml\n`);
  out.set('README.md', `# ЭКО СЕРВИС НОВОСИБИРСК, версия 2: тема ${theme.name}\n\nГотовый сайт, открывайте \`index.html\` двойным кликом, сервер не нужен. Варианты первого экрана главной: \`index-a.html\`, \`index-b.html\`, \`index-c.html\` (\`index.html\` = вариант A). Не правьте файлы здесь: они создаются командой \`node rabota-dizayn-v2/src/tools/build.mjs\` из \`rabota-dizayn-v2/src/\` и фото \`rabota-dizayn/shared/photos/\`.\n\nФотографии иллюстративные (стоковые, Wikimedia Commons), их нужно заменить снимками компании. Авторы и условия использования: страница «О компании», раздел «Источники фото».\n`);

  // 2. запись
  rmrf(OUT);
  for (const [f, c] of out) { const p = path.join(OUT, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, c); }
  const css = fs.readFileSync(path.join(SRC, 'css/main.css'), 'utf8') + '\n' + fs.readFileSync(path.join(SRC, 'css/themes.css'), 'utf8');
  fs.mkdirSync(path.join(OUT, 'css'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'css/main.css'), css);
  for (const f of ['content.js', 'calc.js', 'main.js', 'life.js', 'extras.js']) cp(path.join(SRC, 'js', f), path.join(OUT, 'js', f));
  for (const f of fs.readdirSync(path.join(SRC, 'fonts'))) cp(path.join(SRC, 'fonts', f), path.join(OUT, 'fonts', f));
  for (const f of ['favicon.svg', 'og.svg']) cp(path.join(SRC, 'img', f), path.join(OUT, 'img', f));
  for (const id of Object.keys(SITE.photos)) for (const f of [id + '.jpg', id + '-640.jpg']) cp(path.join(SHARED, 'photos', f), path.join(OUT, 'photos', f)); // только используемые фото

  // 3. проверки
  const textOf = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const idsOf = new Map(meta.map((m) => [m.file, new Set([...m.html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]))]));
  for (const { page, file, html, photos } of meta) {
    const t = page.title, d = page.description;
    if (t.length > 60) err(`${page.path}: title ${t.length} > 60`);
    if (d.length > 160) err(`${page.path}: description ${d.length} > 160`);
    if ((html.match(/<h1[\s>]/g) || []).length !== 1) err(`${file}: H1 != 1`);
    if (textOf((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '') !== page.h1) err(`${file}: текст H1 не совпадает с данными`);
    const dir = path.posix.dirname(file);
    for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      const h = m[1].replace(/&amp;/g, '&');
      if (/^(tel:|mailto:|https?:)/.test(h)) continue;
      if (h.startsWith('#')) { if (h.length > 1 && !idsOf.get(file).has(h.slice(1))) err(`${file}: нет якоря ${h}`); continue; }
      if (h.startsWith('/')) { err(`${file}: абсолютная ссылка ${h} (нужна page-relative)`); continue; }
      const [pp, hash] = h.split('#'); const clean = pp.split('?')[0];
      const target = path.posix.normalize(path.posix.join(dir, clean));
      const known = out.has(target), onDisk = fs.existsSync(path.join(OUT, target));
      if (!known && !onDisk) { err(`${file}: битая ссылка ${h}`); continue; }
      if (/\/$/.test(clean)) err(`${file}: ссылка без index.html ${h}`);
      if (hash && known && !idsOf.get(target).has(hash)) err(`${file}: нет якоря #${hash} на ${clean}`);
    }
    for (const m of html.matchAll(/<(?:link|script|img)\b[^>]*>/g)) { if (/rel="canonical"/.test(m[0])) continue; const x = /(?:href|src)="(https?:[^"]+)"/.exec(m[0]); if (x) err(`${file}: внешний ресурс ${x[1]}`); }
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { err(`${file}: битый JSON-LD`); } }
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    if (dup.length) err(`${file}: повторяющиеся id ${[...new Set(dup)].join(', ')}`);
    if (/<link rel="preload"|crossorigin|type="module"|fetch\(|XMLHttpRequest/.test(html)) err(`${file}: preload/crossorigin/module (ломает file://)`);
    // Решение клиента: сайт не собирает персональные данные. Ни одной формы и поля с ПД ни на одной странице (в т.ч. вариантах главной и 404).
    for (const bad of [/<form\b/i, /type="tel"/i, /type="email"/i, /autocomplete="tel"/i, /name="phone"/i, /name="name"/i, /name="consent"/i, /type="checkbox"/i, /<textarea\b/i, /type="password"/i, /autocomplete="(name|email|street-address|address-level\d)"/i]) if (bad.test(html)) err(`${file}: персональные данные: найдено ${bad}`);
    // явный белый список полей: только числа калькулятора/подбора, радио, один поиск по FAQ (name="q"); остальное запрещено
    for (const m of html.matchAll(/<input\b[^>]*>/g)) {
      const t = m[0], okRadio = /type="radio"/.test(t), okNum = /type="text"/.test(t) && /inputmode="numeric"/.test(t), okSearch = /type="search"/.test(t) && /name="q"/.test(t) && /id="faq-q"/.test(t);
      if (!(okRadio || okNum || okSearch)) err(`${file}: поле вне белого списка: ${t.slice(0, 90)}`);
    }
    for (const m of html.matchAll(/<select\b[^>]*>/g)) if (!/data-f="m"/.test(m[0])) err(`${file}: select вне белого списка (только выбор модели калькулятора)`);
    if (/<input\b[^>]*type="search"/.test(html) && /<form\b/.test(html)) err(`${file}: поиск не должен лежать в form`);
    // 3D снят полностью
    if (/three\.min\.js|cabin3d|cabin-init|data-cabin3d|stage-3d/.test(html)) err(`${file}: остатки 3D`);
    // каждое фото: figure с подписью автор + лицензия + ссылка на источник
    const figs = [...html.matchAll(/<figure class="photo[^"]*">[\s\S]*?<\/figure>/g)].map((x) => x[0]);
    for (const f of figs) if (!/<figcaption class="photo__cap">Фото: [^<]+, <a href="https:\/\/commons\.wikimedia\.org[^"]+"/.test(f) || !/loading="(lazy|eager)"/.test(f) || !/width="\d+" height="\d+"/.test(f) || !/srcset="[^"]+640w, [^"]+1280w"/.test(f)) err(`${file}: фото без подписи/srcset/размеров`);
    const imgCount = (html.match(/<img\b[^>]*src="[^"]*photos\//g) || []).length;
    const thumbCount = (html.match(/class="credits__th"/g) || []).length;
    if (imgCount - thumbCount !== figs.length) err(`${file}: <img> с фото (${imgCount - thumbCount}) не равно числу подписанных figure (${figs.length})`);
  }
  // «живые» блоки и варианты главной
  const nPhotos = Object.keys(SITE.photos).length;
  for (const { page, file, html, variant, isVariant } of meta) {
    const p = page.path;
    if (['/', '/dostavka/'].includes(p)) {
      if (!/data-live[\s>]/.test(html) || !/aria-live="polite"/.test(html)) err(`${file}: нет виджета «успеваем сегодня» с aria-live`);
      if (!/data-zmap/.test(html) || (html.match(/data-zrow="/g) || []).length < 3) err(`${file}: нет схемы зон или строк data-zrow`);
    } else if (/data-live[\s>]/.test(html)) err(`${file}: виджет не должен быть на этой странице`);
    if (['/', '/o-kompanii/'].includes(p) && (html.match(/class="photo photo--gal"/g) || []).length !== nPhotos) err(`${file}: в галерее не все ${nPhotos} фото`);
    if (['/', '/o-kompanii/'].includes(p) && !/data-count/.test(html)) err(`${file}: нет счётчиков`);
    if (!/<html[^>]*>[\s\S]*?<script>document\.documentElement\.className\+=" js"<\/script>/.test(html)) err(`${file}: нет класса .js в head`);
    if (/data-timeline/.test(html) && (html.match(/<li class="row">/g) || []).length < 3) err(`${file}: таймлайн без шагов`);
    if (page.template === 'home') {
      const blocks = (html.match(/<header class="hero\b|<section\b/g) || []).length;
      if (blocks > 8) err(`${file}: на главной ${blocks} блоков, нужно не больше 8`);
      if (/class="slide"|class="rev"|data-carousel[^>]*>.*Отзывы/.test(html)) err(`${file}: на главной не должно быть отзывов`);
      if (!/data-picker/.test(html) || !/id="podbor"/.test(html)) err(`${file}: нет подбора кабины`);
      if (!/data-cmp/.test(html)) err(`${file}: нет таблицы сравнения`);
      if (variant === 'a' && !/class="hero-a"/.test(html)) err(`${file}: нет героя A`);
      if (variant === 'a' && !/class="photo photo--heroa"[\s\S]*?Фото: /.test(html)) err(`${file}: в герое A нет подписи автора фото`);
      if (variant === 'b') {
        const tiles = (html.match(/class="mtile"/g) || []).length;
        if (tiles !== 4 || !/data-offer-box/.test(html) || !/id="offer-rent"/.test(html) || !/id="offer-sale"/.test(html)) err(`${file}: в герое B должно быть 4 плитки и переключатель Аренда/Купить`);
        if ((html.match(/data-p="rent"/g) || []).length !== 3 || (html.match(/data-p="sale"/g) || []).length !== 2) err(`${file}: в герое B цены аренды (3) и продажи (2)`);
      }
      if (variant === 'c' && (html.match(/class="task-card"/g) || []).length !== 3) err(`${file}: в герое C должно быть 3 карточки`);
      if (/three|cabin3d/.test(html)) err(`${file}: 3D на главной`);
      if (isVariant && !/name="robots" content="noindex/.test(html)) err(`${file}: вариант главной должен быть noindex`);
    }
    if (p === '/ceny/' && (!/data-picker/.test(html) || !/data-subnav/.test(html))) err(`${file}: на /ceny/ нужны подбор и якорная навигация`);
    if (p === '/katalog/' && !/data-cmp/.test(html)) err(`${file}: нет таблицы сравнения`);
    if (p === '/voprosy/' && !/id="faq-q"[^>]*name="q"|name="q"[^>]*id="faq-q"/.test(html)) err(`${file}: нет поиска по вопросам`);
    if (p.startsWith('/katalog/') && page.template === 'model') {
      if (!/data-msum/.test(html) || !/class="mpager"/.test(html)) err(`${file}: нет сводки или навигации по моделям`);
      const m = SITE.modelById(page.model);
      if (m.id === 'vip' && !/#mVin/.test(html)) err(`${file}: на странице VIP нет иллюстрации «внутри»`);
      if (!new RegExp(`<use href="#${{ standart: 'mS', ekonom: 'mE', komfort: 'mK', vip: 'mV' }[m.id]}"`).test(html)) err(`${file}: нет SVG модели`);
    }
  }
  // старые страницы моделей не должны существовать
  for (const old of ['standart', 's-rukomojnikom', 'dlya-malomobilnyh', 'uteplennaya', 'torfyanoj']) if (fs.existsSync(path.join(OUT, 'katalog', old))) err(`остался старый каталог /katalog/${old}/`);
  // размеры фото соответствуют файлам
  for (const [id, p] of Object.entries(SITE.photos)) {
    const sz = jpegSize(path.join(SHARED, 'photos', id + '.jpg'));
    if (!sz || sz.w !== p.w || sz.h !== p.h) err(`фото ${id}: в content.js ${p.w}x${p.h}, файл ${sz ? sz.w + 'x' + sz.h : '?'}`);
    if (!p.author || !p.license || !p.source) err(`фото ${id}: нет автора/лицензии/источника в credits.json`);
  }
  for (const c of credits) if (!SITE.photos[c.file.replace(/\.jpg$/, '')]) warns.push(`фото ${c.file} из credits.json не используется (не копируется)`);
  // калькулятор: два эталонных примера (см. EXAMPLES выше)
  const c1 = CALC.calculate(SITE, { n: 2, d: 10, u: 'weekly', z: 'city', m: 'standart' }).total;
  const ev = CALC.events(SITE, { guests: 300, dur: 'to8h', alcohol: true }), q = ev.quote || {};
  if (c1 !== EXAMPLES.std) err(`калькулятор: пример 1 = ${c1}, ожидалось ${EXAMPLES.std}`);
  if (ev.total !== EXAMPLES.evTotal || ev.komfort !== EXAMPLES.evKomfort || ev.vip !== EXAMPLES.evVip) err(`мероприятие: ${ev.komfort} Комфорт + ${ev.vip} VIP = ${ev.total}, ожидалось ${EXAMPLES.evKomfort}+${EXAMPLES.evVip}=${EXAMPLES.evTotal}`);
  if (q.rent !== EXAMPLES.evRent || q.discount !== EXAMPLES.evDiscount || q.trips !== EXAMPLES.evTrips || q.total !== EXAMPLES.evSum) err(`мероприятие: аренда ${q.rent}, скидка ${q.discount}, рейсов ${q.trips}, итого ${q.total}; ожидалось ${EXAMPLES.evRent}, ${EXAMPLES.evDiscount}, ${EXAMPLES.evTrips}, ${EXAMPLES.evSum}`);
  const g800 = CALC.events(SITE, { guests: 800, dur: 'to4h', alcohol: false });
  if (g800.total > SITE.rates.delivery.cabinsPerTrip || g800.trips !== 1) err(`800 гостей до 4 часов: ${g800.total} кабин, ${g800.trips} рейс(а), ожидался один рейс`);
  if (SITE.rates.delivery.cabinsPerTrip !== 20) err('в одну машину помещается 20 кабин (факт клиента)');
  // в скриптах не осталось форм, маски телефона и согласия
  for (const f of ['content.js', 'calc.js', 'main.js', 'life.js', 'extras.js']) {
    const src = fs.readFileSync(path.join(SRC, 'js', f), 'utf8');
    if (/form\[data-form\]|attachMask|natDigits|\.form__|consent|createElement\('form'\)|FormData|\.submit\(/.test(src)) err(`js/${f}: остатки форм, маски телефона или согласия`);
  }
  // запрещённые формулировки и снятые модели (в видимом тексте страниц)
  const banned = /лиценз|НДС|рейтинг|возврат денег|вернём деньги|в течение 2 часов|скидк[аи] за опоздан/i;
  const removed = /торф|маломобил|утепл|ЭС-0|(?<![а-яё])зим|−35|ежедневно|8:00|21:00|круглосуточно|без выходных|4 каб|четыр[её]х? каб/i;
  for (const { page, file, html } of meta) {
    const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
    const m = text.match(banned);
    if (m) err(`${file}: запрещённая формулировка «${m[0]}»`);
    const r = text.match(removed);
    if (r) err(`${file}: снятая модель или устаревший текст «${r[0]}»`);
  }
  // заглушки
  const phLines = contentSrc.split('\n').filter((l) => /ЗАГЛУШКА/.test(l)).length;
  if (PROD) {
    if (phLines) err(`production: в content.js осталось ${phLines} строк с «ЗАГЛУШКА»`);
    for (const { page, html } of meta) if (/заглушк/i.test(html)) err(`production: «заглушка» в HTML ${page.path}`);
  } else warns.push(`заглушек в content.js: ${phLines} (в dev-режиме разрешены)`);

  warns.forEach((w) => console.log(`[${theme.id}] внимание: ${w}`));
  console.log(`[${theme.id}] ${theme.dir}: файлов ${out.size + 1}, страниц ${pages.length} + 3 варианта главной, калькулятор ${c1}, мероприятие ${ev.komfort}+${ev.vip} кабин = ${q.total}`);
  return errors;
}

/* ---------- страница выбора: варианты главной для обеих тем ---------- */
function chooser(data) {
  const S = data.SITE;
  const T = [{ id: 'e', dir: 'e-svetlo-goluboy', name: 'Е «Светло-голубой»', note: 'Голубая шапка и герой, тёмно-синие блоки: карточки, расчёт, отзывы, подвал.', sw: ['#CFE4F8', '#B9D7F4', '#13263A', '#0C1B2A', '#9CC9F5'] },
    { id: 'f', dir: 'f-vozdushnyy', name: 'F «Воздушный»', note: 'Всё светлое: белый и бледно-голубой, без тёмных блоков.', sw: ['#FFFFFF', '#F4F9FE', '#DDEDFB', '#9CC9F5', '#2F6FAE'] }];
  const vcard = (t, v) => `<a class="card card--${t.id}" href="${t.dir}/${v.file}"><span class="card__img"><img src="previews/${t.id}-${v.id}.jpg" width="800" height="520" alt="Превью главной, тема ${t.name}, вариант ${v.name}" loading="lazy"></span><span class="card__t">${v.name}</span><span class="card__d">${v.note}</span><span class="card__go">Открыть вариант</span></a>`;
  const sect = (t) => `<section class="theme" aria-labelledby="h-${t.id}"><div class="theme__h"><span class="card__sw" aria-hidden="true">${t.sw.map((c) => `<i style="background:${c}"></i>`).join('')}</span><div><h2 id="h-${t.id}">${t.name}</h2><p class="card__d">${t.note}</p></div><a class="all" href="${t.dir}/index.html">Весь сайт (главная = вариант A)</a></div><div class="grid">${S.heroVariants.map((v) => vcard(t, v)).join('')}</div></section>`;
  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${S.company.name}: две темы и три варианта главной</title>
<meta name="robots" content="noindex">
<style>
@font-face{font-family:Onest;font-weight:400 600;font-display:swap;src:url(e-svetlo-goluboy/fonts/onest-cyrillic.woff2) format("woff2");unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:Onest;font-weight:400 600;font-display:swap;src:url(e-svetlo-goluboy/fonts/onest-latin.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:"Onest Fallback";src:local("Arial"),local("Liberation Sans"),local("Helvetica");size-adjust:109.8%;ascent-override:88.3%;descent-override:27.8%;line-gap-override:0%}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Onest,"Onest Fallback",Arial,sans-serif;background:#F4F9FE;color:#0C1B2A;line-height:1.5;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.w{width:min(1180px,100% - 32px);margin-inline:auto;padding:48px 0 64px}
h1{font-size:clamp(30px,5vw,56px);font-weight:500;letter-spacing:-.035em;line-height:1.08}
h1 span{color:#4E6278}
h2{font-size:clamp(22px,3vw,32px);font-weight:500;letter-spacing:-.03em;line-height:1.15}
.lead{margin-top:18px;max-width:40em;color:#4E6278;font-size:17px}
.theme{margin-top:48px}
.theme__h{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px}
.theme__h > div{flex:1;min-width:220px}
.all{min-height:44px;display:inline-flex;align-items:center;padding:0 18px;border-radius:999px;border:1px solid #0C1B2A;color:#0C1B2A;text-decoration:none;font-size:14px;font-weight:500}
.all:hover{background:#0C1B2A;color:#fff}
.grid{margin-top:20px;display:grid;gap:16px;grid-template-columns:1fr}
@media(min-width:760px){.grid{grid-template-columns:repeat(3,1fr)}}
.card{display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:20px;background:#fff;border:1px solid #D3E4F4;color:inherit;text-decoration:none}
.card:hover{border-color:#0C1B2A}
.card:focus-visible,.all:focus-visible{outline:2px solid #0C1B2A;outline-offset:3px}
.card__img{display:block;border-radius:12px;overflow:hidden;background:#DDEDFB;aspect-ratio:800/520}
.card__img img{width:100%;height:100%;object-fit:cover;display:block}
.card__sw{display:flex;gap:6px}.card__sw i{width:24px;height:24px;border-radius:8px;border:1px solid #D3E4F4}
.card__t{font-size:20px;font-weight:500;letter-spacing:-.03em}
.card__d{color:#4E6278;font-size:14px}
.card__go{align-self:flex-start;min-height:44px;display:inline-flex;align-items:center;padding:0 20px;border-radius:999px;background:#0C1B2A;color:#fff;font-weight:500;font-size:14px;margin-top:auto}
.card--f .card__go{background:#9CC9F5;color:#0C1B2A;border:1px solid #6FA6DB}
.note{margin-top:32px;font-size:14px;color:#4E6278;max-width:46em}
</style></head><body><main class="w">
<p style="font-size:13px;color:#4E6278">Версия 2, вторая итерация: без 3D, новый ассортимент МТК. Выбор оформления и первого экрана</p>
<h1>${S.company.name}: <span>две темы, три варианта первого экрана</span></h1>
<p class="lead">Структура, тексты и калькулятор одинаковые, форм и сбора персональных данных нет. Различаются палитра (тема Е тёмно-синие панели, тема F всё светлое) и первый экран главной: A «Фото», B «Линейка моделей», C «Какая задача?». Всё, что ниже первого экрана, у вариантов общее. Сайты открываются двойным кликом, без сервера.</p>
${T.map(sect).join('\n')}
<p class="note">Данные на обоих сайтах помечены «Заглушка». Фотографии иллюстративные (стоковые, Wikimedia Commons), их нужно заменить снимками компании. Авторы и условия использования указаны под каждым фото и на странице «О компании».</p>
</main></body></html>
`;
}

/* ---------- запуск ---------- */
const data = loadData();
const allErrors = [];
for (const t of THEMES) allErrors.push(...buildTheme(t, data));
if (!only) { fs.writeFileSync(path.join(OUTROOT, 'index.html'), chooser(data)); console.log('Страница выбора: rabota-dizayn-v2/index.html'); }
if (allErrors.length) { allErrors.forEach((e) => console.error('ОШИБКА: ' + e)); console.error(`\nСборка завершена с ошибками: ${allErrors.length}`); process.exit(1); }
console.log('OK: проверки пройдены.');

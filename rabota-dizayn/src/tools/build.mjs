#!/usr/bin/env node
// Генератор двух сайтов «ЭКО СЕРВИС НОВОСИБИРСК» из одного исходника (темы E и F). Только Node 18+, без зависимостей.
//
//   node rabota-dizayn/src/tools/build.mjs                 собрать оба сайта и страницу выбора (rabota-dizayn/index.html)
//   node rabota-dizayn/src/tools/build.mjs --theme=e       только одну тему (e | f)
//   node rabota-dizayn/src/tools/build.mjs --production    падает, пока в content.js остались «ЗАГЛУШКА»; метки не выводятся
//
// Каждый сайт самодостаточен и открывается двойным кликом (file://): ссылки page-relative и с явным index.html,
// SVG-спрайт встроен в страницу, нет preload шрифтов с crossorigin, нет ES-модулей, нет fetch/XHR.
// После сборки запускаются проверки (title ≤60, description ≤160, один H1, ссылки и якоря, JSON-LD, примеры калькулятора,
// размеры и подписи фото). При ошибках код выхода 1.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(SRC, '..');           // rabota-dizayn/
const SHARED = path.join(ROOT, 'shared');
const args = process.argv.slice(2);
const PROD = args.includes('--production') || process.env.NODE_ENV === 'production';
const only = (args.find((x) => x.startsWith('--theme=')) || '').slice(8);

const THEMES = [
  { id: 'e', dir: 'e-svetlo-goluboy', name: 'Е «Светло-голубой»', note: 'Голубая шапка и герой, тёмно-синие блоки: карточки, расчёт, отзывы, подвал.' },
  { id: 'f', dir: 'f-vozdushnyy', name: 'F «Воздушный»', note: 'Всё светлое: белый и бледно-голубой, без тёмных блоков.' }
].filter((t) => !only || t.id === only);

const lib = await import('../templates/lib.mjs');
const { templates, crumbItems } = await import('../templates/pages.mjs');
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

function buildTheme(theme, data) {
  const { SITE, CALC, contentSrc } = data;
  const OUT = path.join(ROOT, theme.dir);
  const errors = [], warns = [];
  const err = (m) => errors.push(`[${theme.id}] ${m}`);
  Object.assign(lib.ctx, { S: SITE, CALC, production: PROD, theme: theme.id });
  const sprite = makeSprite();

  // 1. рендер
  const pages = [...Object.values(SITE.pages), SITE.notFound];
  const out = new Map();
  const meta = [];
  for (const page of pages) {
    const file = page.path === '/' ? 'index.html' : page.path === '/404.html' ? '404.html' : page.path.slice(1) + 'index.html';
    const depth = file.split('/').length - 1;
    Object.assign(lib.ctx, { page, secN: 0, formN: 0, calcN: 0, faqUsed: [], photosUsed: new Set(), prefix: depth ? '../'.repeat(depth) : './' });
    const main = templates[page.template](page);
    const html = layout(page, main, sprite);
    out.set(file, html);
    meta.push({ page, file, html, photos: new Set(lib.ctx.photosUsed) });
  }
  const urls = pages.filter((p) => p.index !== false).map((p) => p.path);
  out.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((p) => `  <url><loc>${SITE.site.domain}${p}</loc><lastmod>${SITE.site.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  out.set('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.site.domain}/sitemap.xml\n`);
  out.set('README.md', `# ЭКО СЕРВИС НОВОСИБИРСК: тема ${theme.name}\n\nГотовый сайт, открывайте \`index.html\` двойным кликом, сервер не нужен. Не правьте файлы здесь: они создаются командой \`node rabota-dizayn/src/tools/build.mjs\` из \`rabota-dizayn/src/\`.\n\nФотографии иллюстративные (стоковые, Wikimedia Commons), их нужно заменить снимками компании. Авторы и условия использования: страница «О компании», раздел «Источники фото».\n`);

  // 2. запись
  rmrf(OUT);
  for (const [f, c] of out) { const p = path.join(OUT, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, c); }
  const css = fs.readFileSync(path.join(SRC, 'css/main.css'), 'utf8') + '\n' + fs.readFileSync(path.join(SRC, 'css/themes.css'), 'utf8');
  fs.mkdirSync(path.join(OUT, 'css'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'css/main.css'), css);
  for (const f of ['content.js', 'calc.js', 'main.js', 'cabin-init.js']) cp(path.join(SRC, 'js', f), path.join(OUT, 'js', f));
  for (const f of fs.readdirSync(path.join(SRC, 'fonts'))) cp(path.join(SRC, 'fonts', f), path.join(OUT, 'fonts', f));
  for (const f of ['favicon.svg', 'og.svg']) cp(path.join(SRC, 'img', f), path.join(OUT, 'img', f));
  for (const f of fs.readdirSync(path.join(SHARED, 'photos'))) cp(path.join(SHARED, 'photos', f), path.join(OUT, 'photos', f));
  for (const f of ['cabin3d.js', 'cabin3d.css']) cp(path.join(SHARED, 'cabin3d', f), path.join(OUT, 'cabin3d', f));
  cp(path.join(SHARED, 'cabin3d/vendor/three.min.js'), path.join(OUT, 'cabin3d/vendor/three.min.js'));
  cp(path.join(SHARED, 'cabin3d/vendor/LICENSE'), path.join(OUT, 'cabin3d/vendor/LICENSE'));

  // 3. проверки
  const textOf = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const idsOf = new Map(meta.map((m) => [m.file, new Set([...m.html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]))]));
  for (const { page, file, html, photos } of meta) {
    const t = page.title, d = page.description;
    if (t.length > 60) err(`${page.path}: title ${t.length} > 60`);
    if (d.length > 160) err(`${page.path}: description ${d.length} > 160`);
    if ((html.match(/<h1[\s>]/g) || []).length !== 1) err(`${page.path}: H1 != 1`);
    if (textOf((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '') !== page.h1) err(`${page.path}: текст H1 не совпадает с данными`);
    const dir = path.posix.dirname(file);
    for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      const h = m[1].replace(/&amp;/g, '&');
      if (/^(tel:|mailto:|https?:)/.test(h)) continue;
      if (h.startsWith('#')) { if (h.length > 1 && !idsOf.get(file).has(h.slice(1))) err(`${page.path}: нет якоря ${h}`); continue; }
      if (h.startsWith('/')) { err(`${page.path}: абсолютная ссылка ${h} (нужна page-relative)`); continue; }
      const [pp, hash] = h.split('#'); const clean = pp.split('?')[0];
      const target = path.posix.normalize(path.posix.join(dir, clean));
      const known = out.has(target), onDisk = fs.existsSync(path.join(OUT, target));
      if (!known && !onDisk) { err(`${page.path}: битая ссылка ${h}`); continue; }
      if (/\/$/.test(clean)) err(`${page.path}: ссылка без index.html ${h}`);
      if (hash && known && !idsOf.get(target).has(hash)) err(`${page.path}: нет якоря #${hash} на ${clean}`);
    }
    for (const m of html.matchAll(/<(?:link|script|img)\b[^>]*>/g)) { if (/rel="canonical"/.test(m[0])) continue; const x = /(?:href|src)="(https?:[^"]+)"/.exec(m[0]); if (x) err(`${page.path}: внешний ресурс ${x[1]}`); }
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { err(`${page.path}: битый JSON-LD`); } }
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    if (dup.length) err(`${page.path}: повторяющиеся id ${[...new Set(dup)].join(', ')}`);
    if (/<link rel="preload"|crossorigin|type="module"|fetch\(|XMLHttpRequest/.test(html)) err(`${page.path}: preload/crossorigin/module (ломает file://)`);
    // три.js только там, где есть 3D
    const has3d = html.includes('three.min.js'), wants = html.includes('data-cabin3d');
    if (has3d !== wants) err(`${page.path}: three.min.js (${has3d}) и data-cabin3d (${wants}) не согласованы`);
    // каждое фото: figure с подписью автор + лицензия + ссылка на источник
    const figs = [...html.matchAll(/<figure class="photo[^"]*">[\s\S]*?<\/figure>/g)].map((x) => x[0]);
    for (const f of figs) if (!/<figcaption class="photo__cap">Фото: [^<]+, <a href="https:\/\/commons\.wikimedia\.org[^"]+"/.test(f) || !/loading="(lazy|eager)"/.test(f) || !/width="\d+" height="\d+"/.test(f) || !/srcset="[^"]+640w, [^"]+1280w"/.test(f)) err(`${page.path}: фото без подписи/srcset/размеров`);
    const imgCount = (html.match(/<img\b[^>]*src="[^"]*photos\//g) || []).length;
    const thumbCount = (html.match(/class="credits__th"/g) || []).length;
    if (imgCount - thumbCount !== figs.length) err(`${page.path}: <img> с фото (${imgCount - thumbCount}) не равно числу подписанных figure (${figs.length})`);
  }
  // размеры фото соответствуют файлам
  for (const [id, p] of Object.entries(SITE.photos)) {
    const sz = jpegSize(path.join(SHARED, 'photos', id + '.jpg'));
    if (!sz || sz.w !== p.w || sz.h !== p.h) err(`фото ${id}: в content.js ${p.w}x${p.h}, файл ${sz ? sz.w + 'x' + sz.h : '?'}`);
    if (!p.author || !p.license || !p.source) err(`фото ${id}: нет автора/лицензии/источника в credits.json`);
  }
  for (const c of credits) if (!SITE.photos[c.file.replace(/\.jpg$/, '')]) warns.push(`фото ${c.file} из credits.json не используется в content.js`);
  // калькулятор: оба примера из structure.md и пример мероприятия
  const c1 = CALC.calculate(SITE, { n: 2, d: 10, u: 'weekly', z: 'city', m: 'standart' }).total;
  const c2 = CALC.calculate(SITE, { n: 6, d: 30, u: 'twice', z: 'region', km: 40, m: 'standart' }).total;
  const e1 = CALC.events(SITE, { guests: 300, dur: 'to8h', alcohol: true }).total;
  if (c1 !== 13400) err(`калькулятор: пример 1 = ${c1}, ожидалось 13400`);
  if (c2 !== 104850) err(`калькулятор: пример 2 = ${c2}, ожидалось 104850`);
  if (e1 !== 12) err(`мероприятие: пример = ${e1}, ожидалось 12`);
  // запрещённые формулировки
  const banned = /лиценз|НДС|рейтинг|возврат денег|вернём деньги|в течение 2 часов|скидк[аи] за опоздан/i;
  for (const { page, html } of meta) {
    const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
    const m = text.match(banned);
    if (m) err(`${page.path}: запрещённая формулировка «${m[0]}»`);
  }
  // заглушки
  const phLines = contentSrc.split('\n').filter((l) => /ЗАГЛУШКА/.test(l)).length;
  if (PROD) {
    if (phLines) err(`production: в content.js осталось ${phLines} строк с «ЗАГЛУШКА»`);
    for (const { page, html } of meta) if (/заглушк/i.test(html)) err(`production: «заглушка» в HTML ${page.path}`);
  } else warns.push(`заглушек в content.js: ${phLines} (в dev-режиме разрешены)`);

  warns.forEach((w) => console.log(`[${theme.id}] внимание: ${w}`));
  console.log(`[${theme.id}] ${theme.dir}: страниц ${pages.length}, файлов ${out.size + 1}, калькулятор ${c1} / ${c2}, мероприятие ${e1}`);
  return errors;
}

/* ---------- страница выбора ---------- */
function chooser(data) {
  const S = data.SITE;
  const card = (t, p) => `<a class="card card--${t.id}" href="${t.dir}/index.html"><span class="card__img"><img src="previews/${t.id}-home.jpg" width="800" height="520" alt="Превью главной страницы, тема ${t.name}" loading="lazy"></span><span class="card__sw" aria-hidden="true">${p.map((c) => `<i style="background:${c}"></i>`).join('')}</span><span class="card__t">${t.name}</span><span class="card__d">${t.note}</span><span class="card__go">Открыть сайт</span></a>`;
  const T = [{ id: 'e', dir: 'e-svetlo-goluboy', name: 'Е «Светло-голубой»', note: 'Голубая шапка и герой, тёмно-синие блоки: карточки, расчёт, отзывы, подвал.' }, { id: 'f', dir: 'f-vozdushnyy', name: 'F «Воздушный»', note: 'Всё светлое: белый и бледно-голубой, без тёмных блоков.' }];
  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${S.company.name}: две темы одного сайта</title>
<meta name="robots" content="noindex">
<style>
@font-face{font-family:Onest;font-weight:400 600;font-display:swap;src:url(e-svetlo-goluboy/fonts/onest-cyrillic.woff2) format("woff2");unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:Onest;font-weight:400 600;font-display:swap;src:url(e-svetlo-goluboy/fonts/onest-latin.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:"Onest Fallback";src:local("Arial"),local("Liberation Sans"),local("Helvetica");size-adjust:109.8%;ascent-override:88.3%;descent-override:27.8%;line-gap-override:0%}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Onest,"Onest Fallback",Arial,sans-serif;background:#F4F9FE;color:#0C1B2A;line-height:1.5;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.w{width:min(1120px,100% - 32px);margin-inline:auto;padding:48px 0 64px}
h1{font-size:clamp(30px,5vw,56px);font-weight:500;letter-spacing:-.035em;line-height:1.08}
h1 span{color:#4E6278}
.lead{margin-top:18px;max-width:38em;color:#4E6278;font-size:17px}
.grid{margin-top:40px;display:grid;gap:20px;grid-template-columns:1fr}
@media(min-width:800px){.grid{grid-template-columns:1fr 1fr}}
.card{display:flex;flex-direction:column;gap:12px;padding:16px;border-radius:20px;background:#fff;border:1px solid #D3E4F4;color:inherit;text-decoration:none}
.card:hover{border-color:#0C1B2A}
.card:focus-visible,.go:focus-visible{outline:2px solid #0C1B2A;outline-offset:3px}
.card__img{display:block;border-radius:14px;overflow:hidden;background:#DDEDFB;aspect-ratio:800/520}
.card__img img{width:100%;height:100%;object-fit:cover;display:block}
.card__sw{display:flex;gap:6px}.card__sw i{width:28px;height:28px;border-radius:8px;border:1px solid #D3E4F4}
.card__t{font-size:24px;font-weight:500;letter-spacing:-.03em}
.card__d{color:#4E6278;font-size:15px}
.card__go{align-self:flex-start;min-height:44px;display:inline-flex;align-items:center;padding:0 22px;border-radius:999px;background:#0C1B2A;color:#fff;font-weight:500;font-size:14px}
.card--f .card__go{background:#9CC9F5;color:#0C1B2A;border:1px solid #6FA6DB}
.note{margin-top:32px;font-size:14px;color:#4E6278;max-width:46em}
</style></head><body><main class="w">
<p style="font-size:13px;color:#4E6278">Выбор оформления</p>
<h1>${S.company.name}: <span>две цветовые темы одного дизайна</span></h1>
<p class="lead">Структура, тексты, калькулятор и формы одинаковые. Различаются только палитра и несколько блоков: в теме Е тёмно-синие панели, в теме F всё светлое. Оба сайта открываются двойным кликом, без сервера.</p>
<div class="grid">${card(T[0], ['#CFE4F8', '#B9D7F4', '#13263A', '#0C1B2A', '#9CC9F5'])}${card(T[1], ['#FFFFFF', '#F4F9FE', '#DDEDFB', '#9CC9F5', '#2F6FAE'])}</div>
<p class="note">Данные на обоих сайтах помечены «Заглушка». Фотографии иллюстративные (стоковые, Wikimedia Commons), их нужно заменить снимками компании. Авторы и условия использования указаны под каждым фото и на странице «О компании».</p>
</main></body></html>
`;
}

/* ---------- запуск ---------- */
const data = loadData();
const allErrors = [];
for (const t of THEMES) allErrors.push(...buildTheme(t, data));
if (!only) { fs.writeFileSync(path.join(ROOT, 'index.html'), chooser(data)); console.log('Страница выбора: rabota-dizayn/index.html'); }
if (allErrors.length) { allErrors.forEach((e) => console.error('ОШИБКА: ' + e)); console.error(`\nСборка завершена с ошибками: ${allErrors.length}`); process.exit(1); }
console.log('OK: проверки пройдены.');

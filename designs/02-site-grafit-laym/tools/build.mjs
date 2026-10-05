#!/usr/bin/env node
// Генератор статических страниц v2. Только Node, без зависимостей.
//   node tools/build.mjs                  собрать все страницы в v2/ (dev-режим: метки «Заглушка» видны)
//   node tools/build.mjs --check          собрать в памяти и проверить (title, description, H1, ссылки, примеры калькулятора,
//                                         актуальность файлов на диске). Заглушки разрешены
//   node tools/build.mjs --production     то же, но падает, пока в content.js остались «ЗАГЛУШКА»; метки не выводятся
//   --base=/v2                            префикс для ссылок, если сайт лежит не в корне домена
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const PROD = args.includes('--production') || process.env.NODE_ENV === 'production';
const base = ((args.find((x) => x.startsWith('--base=')) || '').slice(7)).replace(/\/$/, '');

// 1. данные и ядро калькулятора (в том же виде, как их получает браузер)
const contentSrc = fs.readFileSync(path.join(ROOT, 'js/content.js'), 'utf8');
const sandbox = vm.createContext({});
vm.runInContext(contentSrc, sandbox, { filename: 'content.js' });
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/calc.js'), 'utf8'), sandbox, { filename: 'calc.js' });
const SITE = sandbox.SITE, CALC = sandbox.SITE_CALC;

const lib = await import('../src/lib.mjs');
const { templates } = await import('../src/pages.mjs');
const { layout } = await import('../src/layout.mjs');
Object.assign(lib.ctx, { S: SITE, CALC, base, production: PROD });

// 2. рендер
const pages = [...Object.values(SITE.pages), SITE.notFound];
const out = new Map(); // файл -> содержимое
const meta = [];
for (const page of pages) {
  Object.assign(lib.ctx, { page, secN: 0, formN: 0, calcN: 0, faqUsed: [] });
  const main = templates[page.template](page);
  const html = layout(page, main);
  const file = page.path === '/' ? 'index.html' : page.path === '/404.html' ? '404.html' : page.path.slice(1) + 'index.html';
  out.set(file, html);
  meta.push({ page, file, html });
}
const urls = pages.filter((p) => p.index !== false).map((p) => p.path);
out.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((p) => `  <url><loc>${SITE.site.domain}${p}</loc><lastmod>${SITE.site.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`);
out.set('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.site.domain}/sitemap.xml\n`);

// 3. проверки
const errors = [], warns = [];
const err = (m) => errors.push(m);
const fileOfUrl = (p) => (p === '/' ? 'index.html' : p.endsWith('/') ? p.slice(1) + 'index.html' : p.slice(1));
const textOf = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const idsOf = new Map(meta.map((m) => [m.file, new Set([...m.html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]))]));
for (const { page, file, html } of meta) {
  const t = page.title, d = page.description;
  if (t.length > 60) err(`${page.path}: title ${t.length} > 60`);
  if (d.length > 160) err(`${page.path}: description ${d.length} > 160`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(`${page.path}: H1 = ${h1}`);
  if (textOf((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '') !== page.h1) err(`${page.path}: текст H1 не совпадает с данными`);
  // ссылки и ресурсы
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    let h = m[1].replace(/&amp;/g, '&');
    if (/^(tel:|mailto:|javascript:)/.test(h)) continue;
    if (/^https?:/.test(h)) continue;
    if (h.startsWith('#')) { if (h.length > 1 && !idsOf.get(file).has(h.slice(1))) err(`${page.path}: нет якоря ${h}`); continue; }
    if (base && h.startsWith(base + '/')) h = h.slice(base.length);
    const [pathPart, hash] = h.split('#'); const clean = pathPart.split('?')[0];
    if (!clean.startsWith('/')) { err(`${page.path}: относительная ссылка ${h}`); continue; }
    if (clean === '/img/sprite.svg') { if (hash && !fs.readFileSync(path.join(ROOT, 'img/sprite.svg'), 'utf8').includes(`id="${hash}"`)) err(`${page.path}: нет символа ${hash} в спрайте`); continue; }
    const f = fileOfUrl(clean);
    const known = out.has(f), onDisk = fs.existsSync(path.join(ROOT, f));
    if (!known && !onDisk) err(`${page.path}: битая ссылка ${h}`);
    else if (hash && known && !idsOf.get(f).has(hash)) err(`${page.path}: нет якоря #${hash} на ${clean}`);
  }
  for (const m of html.matchAll(/<(?:link|script|img)\b[^>]*>/g)) { if (/rel="canonical"/.test(m[0])) continue; const x = /(?:href|src)="(https?:[^"]+)"/.exec(m[0]); if (x) err(`${page.path}: внешний ресурс ${x[1]}`); }
  // JSON-LD валиден
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { err(`${page.path}: битый JSON-LD`); } }
  // id уникальны
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) err(`${page.path}: повторяющиеся id ${[...new Set(dup)].join(', ')}`);
}
// калькулятор: оба проверочных примера из structure.md и пример мероприятия
const c1 = CALC.calculate(SITE, { n: 2, d: 10, u: 'weekly', z: 'city', m: 'standart' }).total;
const c2 = CALC.calculate(SITE, { n: 6, d: 30, u: 'twice', z: 'region', km: 40, m: 'standart' }).total;
const e1 = CALC.events(SITE, { guests: 300, dur: 'to8h', alcohol: true }).total;
if (c1 !== 13400) err(`калькулятор: пример 1 = ${c1}, ожидалось 13400`);
if (c2 !== 104850) err(`калькулятор: пример 2 = ${c2}, ожидалось 104850`);
if (e1 !== 12) err(`мероприятие: пример = ${e1}, ожидалось 12`);
// заглушки
const phLines = contentSrc.split('\n').filter((l) => /ЗАГЛУШКА/.test(l)).length;
if (PROD) {
  if (phLines) err(`production: в content.js осталось ${phLines} строк с «ЗАГЛУШКА»`);
  if (/placeholder:\s*true/.test(contentSrc)) err('production: в content.js есть placeholder: true');
  for (const { page, html } of meta) if (/заглушк/i.test(html)) err(`production: «заглушка» в HTML ${page.path}`);
} else warns.push(`заглушек в content.js: ${phLines} (в dev-режиме разрешены)`);
// файлы на диске актуальны
if (CHECK || PROD) for (const [f, c] of out) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== c) warns.push(`устарел файл ${f}: запустите node tools/build.mjs`);
}

if (CHECK || PROD) {
  warns.forEach((w) => console.log('внимание: ' + w));
  if (errors.length) { errors.forEach((e) => console.error('ОШИБКА: ' + e)); console.error(`\nПроверка не пройдена: ${errors.length} ошибок`); process.exit(1); }
  console.log(`OK: ${pages.length} страниц, title ≤60, description ≤160, один H1, ссылки целы; калькулятор ${c1} / ${c2}, мероприятие ${e1}`);
  process.exit(0);
}
for (const [f, c] of out) { const p = path.join(ROOT, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, c); }
console.log(`Записано файлов: ${out.size} (страниц ${pages.length}).`);
if (errors.length) { errors.forEach((e) => console.error('ОШИБКА: ' + e)); process.exit(1); }

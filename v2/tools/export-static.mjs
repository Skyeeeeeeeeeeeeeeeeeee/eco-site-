#!/usr/bin/env node
// Экспорт собранного сайта в папку, которая открывается двойным кликом (file://), без сервера.
//
//   node tools/export-static.mjs <папка-назначения>
//
// Что делает: копирует сайт (без src/, tools/, review.md), пересобирает его без --base и
// переписывает пути:
//   • /css/main.css → ../css/main.css (относительно глубины страницы);
//   • ссылки на разделы /ceny/ → ../ceny/index.html (file:// не открывает index.html сам);
//   • <use href="/img/sprite.svg#id"> → #id, а спрайт встраивается в страницу
//     (Chrome не грузит внешний SVG-спрайт с file://);
//   • data-base="" → относительный префикс для ссылок, которые строит main.js.
// Исходный v2/ не меняется.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] || '');
if (!process.argv[2] || OUT === SRC) { console.error('Укажите папку назначения, отличную от v2/'); process.exit(1); }

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SRC, OUT, { recursive: true, filter: (p) => !/[\\/]node_modules([\\/]|$)/.test(p) });
execFileSync(process.execPath, ['tools/build.mjs'], { cwd: OUT, stdio: 'inherit' });

const sprite = fs.readFileSync(path.join(OUT, 'img/sprite.svg'), 'utf8')
  .replace(/<\?xml[^>]*>\s*/, '')
  .replace('<svg ', '<svg aria-hidden="true" width="0" height="0" ');

function rel(prefix, url) {
  const m = url.match(/^([^?#]*)(.*)$/);
  let p = m[1].slice(1);
  if (p === '' || p.endsWith('/')) p += 'index.html';
  return prefix + p + m[2];
}

let pages = 0;
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const r = path.relative(OUT, full);
    if (fs.statSync(full).isDirectory()) { if (!/^(src|tools|node_modules)$/.test(r)) walk(full); continue; }
    if (!name.endsWith('.html')) continue;
    const depth = r.split(path.sep).length - 1;
    const prefix = depth ? '../'.repeat(depth) : './';
    let html = fs.readFileSync(full, 'utf8');
    html = html.replace(/(<use\b[^>]*\bhref=")\/img\/sprite\.svg(#[^"]+")/g, '$1$2');
    html = html.replace(/\b(href|src|action|poster)="(\/(?!\/)[^"]*)"/g, (_, a, u) => `${a}="${rel(prefix, u)}"`);
    // file:// не пропускает preload с crossorigin (ошибка в консоли); шрифты и так грузятся из CSS
    html = html.replace(/<link rel="preload"[^>]*as="font"[^>]*>\s*/g, '');
    html = html.replace(/data-base="[^"]*"/, `data-base="${prefix.replace(/\/$/, '')}"`);
    if (html.includes('<use')) html = html.replace(/(<body\b[^>]*>)/, `$1\n${sprite}`);
    fs.writeFileSync(full, html);
    pages++;
  }
})(OUT);

const mainJs = path.join(OUT, 'js/main.js');
fs.writeFileSync(mainJs, fs.readFileSync(mainJs, 'utf8').replaceAll("'/ceny/?", "'/ceny/index.html?"));

for (const d of ['src', 'tools']) fs.rmSync(path.join(OUT, d), { recursive: true, force: true });
fs.rmSync(path.join(OUT, 'review.md'), { force: true });
fs.writeFileSync(path.join(OUT, 'README.md'), '# Сайт 2 «Графит и сигнальный лайм» — копия для просмотра\n\nОткрывайте `index.html` двойным кликом, сервер не нужен.\nЭто экспорт для просмотра: правки делайте в `v2/` и обновляйте копию командой\n`cd v2 && node tools/export-static.mjs ../designs/02-site-grafit-laym`.\n');
console.log(`Экспорт готов: ${OUT} (страниц: ${pages}). Открывайте index.html двойным кликом.`);

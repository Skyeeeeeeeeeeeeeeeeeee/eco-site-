// Dev-инструмент (не нужен для работы сайта и не входит в runtime): прогоняет страницу в Chromium и записывает
// готовый HTML блоков, которые рисует js/main.js из js/content.js, обратно в index.html.
// Зачем: контент (каталог, FAQ, отзывы, контакты, JSON-LD) попадает в исходный HTML для поисковиков и режима без JS.
// Единственный источник данных остаётся js/content.js. После правок content.js запустите:
//   python3 -m http.server 8765 &   и   node tools/prerender.mjs          (записать)
//                                         node tools/prerender.mjs --check  (только проверить: код 1, если index.html расходится с рендером JS;
//                                                                            запускать перед коммитом/в CI)
// Нужен пакет playwright (только для разработки). Также проверяется, что статические запасные значения
// у [data-bind], [data-bind-href], [data-copy], [data-calc] совпадают с тем, что подставляет JS.
import { chromium } from 'playwright';
import fs from 'node:fs';
const URL_ = process.env.SITE_URL || 'http://localhost:8765/index.html';
const FILE = new URL('../index.html', import.meta.url).pathname;
const IDS = ['facts', 'marquee-track', 'menu-nav', 'cab-grid', 'steps', 'service-list', 'service-note', 'why', 'blobs', 'vs-h', 'vs-lead', 'vs', 'vs-note',
  'docs-list', 'zone-list', 'rev-track', 'faq-groups', 'faq-list', 'contact-list', 'footer-nav', 'footer-contacts', 'footer-tagline', 'footer-copy', 'footer-joke'];
const LD = ['ld-business', 'ld-faq', 'ld-products'];
const CHECK = process.argv.includes('--check');
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.goto(URL_, { waitUntil: 'load' });
await p.waitForTimeout(500);
const data = await p.evaluate(([ids, ld]) => ({
  html: Object.fromEntries(ids.map(i => [i, document.getElementById(i).innerHTML.replace(/ is-in\b/g, '').replace(/ hidden=""/g, '').replace(/ open=""/g, '')])),
  ld: Object.fromEntries(ld.map(i => [i, document.getElementById(i).textContent]))
}), [IDS, LD]);
// статические значения привязок (без JS) против подставленных JS
const bindSel = '[data-bind],[data-bind-href],[data-copy],[data-calc]';
const grabBind = () => [...document.querySelectorAll('[data-bind],[data-bind-href],[data-copy],[data-calc]')].map(e => (e.dataset.bind || e.dataset.copy || e.dataset.calc || '') + '|' + (e.dataset.bindHref ? e.getAttribute('href') : e.textContent.trim()));
const runtimeBind = await p.evaluate(grabBind);
const ctx2 = await b.newContext({ javaScriptEnabled: false });
const p2 = await ctx2.newPage();
await p2.goto(URL_, { waitUntil: 'load' });
const staticBind = await p2.evaluate(grabBind);
await b.close();
const bindDiff = runtimeBind.map((v, i) => [v, staticBind[i]]).filter(([a, c]) => a !== c);
for (const [a, c] of bindDiff) console.warn('ВНИМАНИЕ: статический запасной текст не совпадает с content.js:\n  JS:     ' + a + '\n  в HTML: ' + c);
let src = fs.readFileSync(FILE, 'utf8');
function inner(id, html) {
  const m = new RegExp(`<([a-z0-9]+)\\b[^>]*\\bid="${id}"[^>]*>`).exec(src);
  if (!m) throw new Error('no #' + id);
  const tag = m[1], start = m.index + m[0].length;
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g'); re.lastIndex = start;
  let depth = 1, e;
  while ((e = re.exec(src))) { depth += e[1] ? -1 : 1; if (!depth) break; }
  src = src.slice(0, start) + html + src.slice(e.index);
}
for (const id of IDS) inner(id, data.html[id]);
for (const id of LD) inner(id, data.ld[id]);
const norm = t => t.replace(/©\s*20\d\d/g, '© YEAR');   // год в подвале меняется сам
const old = fs.readFileSync(FILE, 'utf8');
if (CHECK) {
  if (norm(old) !== norm(src) || bindDiff.length) {
    console.error('ПРЕРЕНДЕР УСТАРЕЛ: index.html расходится с тем, что строит js/main.js из js/content.js. Запустите: node tools/prerender.mjs');
    process.exit(1);
  }
  console.log('prerender OK: index.html совпадает с рендером JS'); process.exit(0);
}
fs.writeFileSync(FILE, src);
console.log('prerendered', IDS.length, 'blocks +', LD.length, 'JSON-LD' + (bindDiff.length ? ' (есть расхождения привязок, см. выше)' : ''));
if (bindDiff.length) process.exitCode = 2;

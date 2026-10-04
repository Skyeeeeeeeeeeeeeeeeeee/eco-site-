// Dev-инструмент (не нужен для работы сайта и не входит в runtime): прогоняет страницу в Chromium и записывает
// готовый HTML блоков, которые рисует js/main.js из js/content.js, обратно в index.html.
// Зачем: контент (каталог, FAQ, отзывы, контакты, JSON-LD) попадает в исходный HTML для поисковиков и режима без JS.
// Единственный источник данных остаётся js/content.js. После правок content.js запустите:
//   python3 -m http.server 8765 &   и   node tools/prerender.mjs   (нужен пакет playwright)
import { chromium } from 'playwright';
import fs from 'node:fs';
const URL_ = process.env.SITE_URL || 'http://localhost:8765/index.html';
const FILE = new URL('../index.html', import.meta.url).pathname;
const IDS = ['facts', 'marquee-track', 'menu-nav', 'cab-grid', 'steps', 'service-list', 'service-note', 'why', 'blobs', 'vs-h', 'vs-lead', 'vs', 'vs-note',
  'docs-list', 'zone-list', 'rev-track', 'faq-groups', 'faq-list', 'contact-list', 'footer-nav', 'footer-contacts', 'footer-tagline', 'footer-copy', 'footer-joke'];
const LD = ['ld-business', 'ld-faq', 'ld-products'];
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.goto(URL_, { waitUntil: 'load' });
await p.waitForTimeout(500);
const data = await p.evaluate(([ids, ld]) => ({
  html: Object.fromEntries(ids.map(i => [i, document.getElementById(i).innerHTML.replace(/ is-in\b/g, '')])),
  ld: Object.fromEntries(ld.map(i => [i, document.getElementById(i).textContent]))
}), [IDS, LD]);
await b.close();
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
fs.writeFileSync(FILE, src);
console.log('prerendered', IDS.length, 'blocks +', LD.length, 'JSON-LD');

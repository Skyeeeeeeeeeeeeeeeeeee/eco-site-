// Статические рендеры для каталога: node tools/render.mjs [--only=model] [--palette=e|f]
// Playwright берётся из node_modules, а при отсутствии — из CABIN_PW (путь к playwright/index.mjs) либо из рабочей папки агента.
// Схема: страница 1200x1200 с deviceScaleFactor=2 (холст 2400x2400, studio-сцена, прозрачный фон) ->
// page.screenshot({omitBackground:true}) (без preserveDrawingBuffer) -> Pillow: 900 и 450 px + сжатие.
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync, statSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const FALLBACK_PW = '/tmp/claude-0/-home-user-eco-site-/955d2a7c-dcaa-5847-a8e5-e1814a596746/scratchpad/pw/node_modules/playwright/index.mjs';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = await import(pathToFileURL(process.env.CABIN_PW || FALLBACK_PW).href)); }

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', '..', 'renders');
const MODELS = ['standart', 'rukomojnik', 'malomobilnye', 'uteplennaya', 'torfyanoj'];
const PALETTES = ['E', 'F'];
const arg = (n) => (process.argv.find((a) => a.startsWith('--' + n + '=')) || '').split('=')[1];
const onlyModel = arg('only'), onlyPal = (arg('palette') || '').toUpperCase();
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
});
const ctx = await browser.newContext({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

for (const model of MODELS) for (const pal of PALETTES) {
  if (onlyModel && onlyModel !== model) continue;
  if (onlyPal && onlyPal !== pal) continue;
  const url = pathToFileURL(join(here, 'render.html')).href + `?model=${model}&palette=${pal}`;
  await page.goto(url);
  await page.waitForFunction('window.READY === true', null, { timeout: 120000 });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForTimeout(400);
  const raw = join(OUT, `.raw-${model}-${pal.toLowerCase()}.png`);
  await page.screenshot({ path: raw, omitBackground: true });
  const base = join(OUT, `${model}-${pal.toLowerCase()}`);
  const r = spawnSync('python3', [join(here, 'post.py'), raw, base + '.png', base + '-450.png'], { stdio: 'inherit' });
  rmSync(raw, { force: true });
  if (r.status !== 0) throw new Error('post.py failed for ' + model + '-' + pal);
  console.log(`${model}-${pal.toLowerCase()}.png ${(statSync(base + '.png').size / 1024).toFixed(0)} KB, -450 ${(statSync(base + '-450.png').size / 1024).toFixed(0)} KB`);
}
await browser.close();
if (errors.length) { console.error('Ошибки страницы:\n' + errors.join('\n')); process.exit(1); }

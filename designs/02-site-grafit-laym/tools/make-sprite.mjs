// Генератор v2/img/sprite.svg (иконки и изометрические схемы кабин). Запуск: node tools/make-sprite.mjs
import fs from 'node:fs';
const S = 0.42, C30 = 0.866;
const P = (x, y, z) => [(x - y) * C30 * S, (x + y) * 0.5 * S - z * S];
const f = (n) => Math.round(n * 10) / 10;
function poly(pts, fill) {
  return `<path vector-effect="non-scaling-stroke"${fill ? ` fill="${fill}"` : ''} d="M${pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L')}Z"/>`;
}
function line(pts, extra = '') { return `<path vector-effect="non-scaling-stroke" ${extra} d="M${pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L')}"/>`; }
// коробка w (x), d (y), h (z) в позиции x0,y0,z0: видны верх, грань y=d (лево), грань x=w (право)
function box(x0, y0, z0, w, d, h, fills = {}) {
  const [a, b, c] = [x0, x0 + w], [e, g] = [y0, y0 + d];
  const z1 = z0 + h;
  return poly([P(a, e, z1), P(b, e, z1), P(b, g, z1), P(a, g, z1)], fills.top) +
    poly([P(a, g, z0), P(b, g, z0), P(b, g, z1), P(a, g, z1)], fills.left) +
    poly([P(b, e, z0), P(b, g, z0), P(b, g, z1), P(b, e, z1)], fills.right);
}
function build(kind) {
  let body = '', W = 110, D = 110, H = 230;
  const L = '#D2F03C';
  if (kind === 'standart' || kind === 'uteplennaya' || kind === 'handwash') {
    if (kind === 'handwash') { W = 120; D = 120; }
    if (kind === 'uteplennaya') { W = 115; D = 115; }
    body += box(0, 0, 0, W, D, H);
    if (kind === 'uteplennaya') { // двойной контур: утеплитель
      body += line([P(8, D, 8), P(W, D, 8)], 'stroke-dasharray="2 3"') + line([P(8, D, H - 8), P(W, D, H - 8)], 'stroke-dasharray="2 3"');
      body += `<g fill="currentColor" stroke="none">${[[20, 150], [40, 120], [30, 90], [55, 170]].map(([y, z]) => { const p = P(0.5 * W, D, z); return `<circle cx="${f(p[0] - y * 0.5)}" cy="${f(p[1])}" r="1.4"/>`; }).join('')}</g>`;
    }
    const dy0 = D * 0.2, dy1 = D * 0.8;
    body += poly([P(W, dy0, 8), P(W, dy1, 8), P(W, dy1, H * 0.86), P(W, dy0, H * 0.86)], kind === 'handwash' ? '' : L);
    body += line([P(W, dy1 - 10, 100), P(W, dy1 - 10, 120)]);
    body += line([P(18, D, H - 28), P(55, D, H - 28)]) + line([P(18, D, H - 40), P(55, D, H - 40)]);
    if (kind === 'handwash') { // рукомойник сбоку: блок + кран
      body += box(W, 0, 0, 36, 40, 85, { top: L });
      body += line([P(W + 18, 20, 85), P(W + 18, 20, 120), P(W + 28, 20, 120)]);
    }
  } else if (kind === 'dostupnaya') {
    W = 220; D = 165;
    body += box(0, 0, 0, W, D, H);
    body += poly([P(W, 30, 6), P(W, 30 + 100, 6), P(W, 130, H * 0.86), P(W, 30, H * 0.86)], L);
    // пандус
    body += poly([P(W, 20, 0), P(W + 110, 20, 0), P(W + 110, 140, 0), P(W, 140, 0)], 'none');
    body += line([P(W, 20, 0), P(W, 20, 18), P(W + 110, 20, 0)]) + line([P(W, 140, 0), P(W, 140, 18), P(W + 110, 140, 0)]);
    body += line([P(W + 15, 28, 70), P(W + 15, 132, 70)]) + line([P(W + 15, 28, 0), P(W + 15, 28, 70)]) + line([P(W + 15, 132, 0), P(W + 15, 132, 70)]);
  } else if (kind === 'torfyanoj') {
    W = 45; D = 45; H = 50;
    body += box(0, 0, 0, W, D, H * 0.8);
    body += poly([P(0, 0, 40), P(W, 0, 40), P(W, D, 40), P(0, D, 40)], '');
    body += box(2, 2, 40, W - 4, D - 4, 10, { top: L });
    body += line([P(W / 2 - 8, D / 2, 50), P(W / 2 + 8, D / 2, 50)]);
  }
  return body;
}
function symbol(id, kind) {
  const inner = build(kind);
  // вычислим bbox
  const nums = [...inner.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);
  const xs = nums.map((n) => n[0]), ys = nums.map((n) => n[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pad = 14, w = 240, h = 180;
  const sc = Math.min((w - 2 * pad) / (x1 - x0), (h - 2 * pad) / (y1 - y0));
  const tx = (w - (x1 - x0) * sc) / 2 - x0 * sc, ty = (h - (y1 - y0) * sc) / 2 - y0 * sc;
  return `<symbol id="${id}" viewBox="0 0 ${w} ${h}"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="miter" stroke-linecap="square" transform="translate(${f(tx)} ${f(ty)}) scale(${f(sc * 100) / 100})">${inner}</g></symbol>`;
}
const I = (id, d) => `<symbol id="${id}" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter">${d}</g></symbol>`;
const icons = [
  I('i-phone', '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>'),
  I('i-telegram', '<path d="M21 4 3 11l6 2.5L11 20l3-4 5 4z"/><path d="M9 13.5 21 4"/>'),
  I('i-whatsapp', '<path d="M4 20l1.3-4.2A8.5 8.5 0 1 1 8.2 18.8z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5"/>'),
  I('i-mail', '<path d="M3 5h18v14H3z"/><path d="M3 6l9 7 9-7"/>'),
  I('i-pin', '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.800 12 21 12 21z"/><path d="M12 7.500v4M12 7.500h.01"/>'),
  I('i-clock', '<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"/><path d="M12 7v5l3 2"/>'),
  I('i-doc', '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>'),
  I('i-truck', '<path d="M2 6h12v10H2zM14 9h4l4 4v3h-8z"/><path d="M6 19a1.500 1.500 0 1 0 0-.1zM17 19a1.500 1.500 0 1 0 0-.1z"/>'),
  I('i-calendar', '<path d="M4 5h16v15H4zM4 10h16M8 3v4M16 3v4"/>'),
  I('i-drop', '<path d="M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z"/>'),
  I('i-snow', '<path d="M12 2v20M3.300 7l17.400 10M3.300 17 20.700 7"/>'),
  I('i-tools', '<path d="M14 6a4 4 0 0 0 5 5l-9 9a2.100 2.100 0 0 1-3-3l9-9a4 4 0 0 1-2-2z"/>'),
  I('i-users', '<path d="M9 11a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7zM2 20c0-4 3-6 7-6s7 2 7 6M16 4.500a3.500 3.500 0 0 1 0 6.500M18 14c2.500.7 4 2.500 4 6"/>'),
  I('i-list', '<path d="M9 6h12M9 12h12M9 18h12M3 6h2M3 12h2M3 18h2"/>'),
  I('i-shield', '<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/><path d="M8.500 12l2.500 2.500 4.500-5"/>'),
  I('i-arrow', '<path d="M3 12h16M13 6l6 6-6 6"/>')
].join('\n');
const out = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${icons}\n${symbol('cab-standart', 'standart')}\n${symbol('cab-s-rukomojnikom', 'handwash')}\n${symbol('cab-dlya-malomobilnyh', 'dostupnaya')}\n${symbol('cab-uteplennaya', 'uteplennaya')}\n${symbol('cab-torfyanoj', 'torfyanoj')}\n</svg>\n`;
fs.writeFileSync(new URL('../img/sprite.svg', import.meta.url), out);
fs.writeFileSync(new URL('../img/og.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#12171A"/><rect x="60" y="60" width="64" height="64" fill="#D2F03C"/><text x="150" y="108" font-family="Arial,sans-serif" font-weight="700" font-size="40" fill="#F4F3EE">ЭКО СЕРВИС НОВОСИБИРСК</text><text x="60" y="360" font-family="Arial,sans-serif" font-weight="600" font-size="64" fill="#F4F3EE">Аренда туалетных кабин</text><text x="60" y="440" font-family="Arial,sans-serif" font-weight="600" font-size="64" fill="#D2F03C">в Новосибирске и области</text></svg>\n`);
console.log('sprite', out.length);

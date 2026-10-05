/* Cabin3D: реалистичная процедурная 3D-модель ротоформованной туалетной кабины.
   Классический скрипт (без модулей/CDN/внешних файлов), требует window.THREE r158 (vendor/three.min.js).
   Все текстуры (normal/roughness, наклейки, окружение) генерируются в рантайме. */
(function (global) {
  'use strict';
  var PRESETS = {
    PRESET_E: { body: '#6FA6DB', side: '#68A0D6', roof: '#F1F4F7', door: '#5B93CB', accents: '#2F5F8F', base: '#2B3A4A', indicator: '#2FAE66' },
    PRESET_F: { body: '#8DBCEB', side: '#86B5E5', roof: '#F3F6F9', door: '#74A5D9', accents: '#3C6C9C', base: '#2B3A4A', indicator: '#2FAE66' },
    PRESET_CLASSIC: { body: '#1F5FAF', side: '#1D5AA5', roof: '#EEF1F3', door: '#184F96', accents: '#C9D1D8', base: '#2B3A4A', indicator: '#2FAE66' }
  };
  var LABEL = '3D-модель туалетной кабины. Перетащите, чтобы повернуть';
  var DEG = Math.PI / 180, PI = Math.PI;
  var GROUND_Y = -1.15; // пол модели в координатах сцены

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(global.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  /* ---------- процедурные текстуры ---------- */
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function rrPath(x, a, b, w, h, r) {
    x.beginPath(); x.moveTo(a + r, b); x.lineTo(a + w - r, b); x.quadraticCurveTo(a + w, b, a + w, b + r);
    x.lineTo(a + w, b + h - r); x.quadraticCurveTo(a + w, b + h, a + w - r, b + h); x.lineTo(a + r, b + h);
    x.quadraticCurveTo(a, b + h, a, b + h - r); x.lineTo(a, b + r); x.quadraticCurveTo(a, b, a + r, b); x.closePath();
  }

  // бесшовный value-noise: высотная карта пластика (апельсиновая корка + зерно)
  function plasticMaps(T, size) {
    var n = size, seed = 1337;
    function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    var h = new Float32Array(n * n), i, x, y, o, g, grid, cell;
    var octs = [[6, 1.0], [14, 0.55], [32, 0.3], [64, 0.16]];
    for (o = 0; o < octs.length; o++) {
      g = octs[o][0]; grid = new Float32Array(g * g);
      for (i = 0; i < g * g; i++) grid[i] = rnd();
      for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
        var fx = x / n * g, fy = y / n * g, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
        tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
        var x1 = (x0 + 1) % g, y1 = (y0 + 1) % g; x0 %= g; y0 %= g;
        var a = grid[y0 * g + x0], b = grid[y0 * g + x1], c = grid[y1 * g + x0], d = grid[y1 * g + x1];
        h[y * n + x] += (a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty) * octs[o][1];
      }
    }
    for (i = 0; i < n * n; i++) h[i] += (rnd() - 0.5) * 0.18; // мелкое зерно
    var nc = canvas(n, n), nx = nc.getContext('2d'), nd = nx.createImageData(n, n);
    var rc = canvas(n, n), rx = rc.getContext('2d'), rd = rx.createImageData(n, n);
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
      var l = h[y * n + (x + n - 1) % n], r = h[y * n + (x + 1) % n], u = h[((y + n - 1) % n) * n + x], d2 = h[((y + 1) % n) * n + x];
      var dx = (r - l) * 2.2, dy = (d2 - u) * 2.2, ln = Math.sqrt(dx * dx + dy * dy + 1), p = (y * n + x) * 4;
      nd.data[p] = (-dx / ln * 0.5 + 0.5) * 255; nd.data[p + 1] = (dy / ln * 0.5 + 0.5) * 255; nd.data[p + 2] = (1 / ln * 0.5 + 0.5) * 255; nd.data[p + 3] = 255;
      var rv = 215 + (h[y * n + x] - 1.0) * 60 + (rnd() - 0.5) * 14; rv = Math.max(150, Math.min(255, rv));
      rd.data[p] = rd.data[p + 1] = rd.data[p + 2] = rv; rd.data[p + 3] = 255;
    }
    nx.putImageData(nd, 0, 0); rx.putImageData(rd, 0, 0);
    function tex(c) { var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2, 2); t.anisotropy = 4; return t; }
    return { normal: tex(nc), rough: tex(rc) };
  }

  function indicatorTex(T, busy, hex) {
    var c = canvas(256, 96), x = c.getContext('2d');
    var col = busy ? '#D23B35' : hex;
    x.fillStyle = col; x.fillRect(0, 0, 256, 96);
    var gr = x.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, 'rgba(255,255,255,.28)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.18)');
    x.fillStyle = gr; x.fillRect(0, 0, 256, 96);
    x.fillStyle = '#fff'; x.font = '700 40px "Segoe UI",Arial,Helvetica,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(busy ? 'ЗАНЯТО' : 'СВОБОДНО', 128, 52);
    var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function pictoTex(T) {
    var c = canvas(256, 192), x = c.getContext('2d');
    x.fillStyle = '#F4F6F8'; x.fillRect(0, 0, 256, 192);
    x.fillStyle = '#1F3550';
    // мужская фигура
    x.beginPath(); x.arc(70, 52, 16, 0, 7); x.fill();
    rrPath(x, 46, 74, 48, 56, 10); x.fill(); rrPath(x, 52, 124, 17, 46, 6); x.fill(); rrPath(x, 71, 124, 17, 46, 6); x.fill();
    // женская фигура
    x.beginPath(); x.arc(186, 52, 16, 0, 7); x.fill();
    x.beginPath(); x.moveTo(186, 72); x.lineTo(214, 138); x.lineTo(158, 138); x.closePath(); x.fill();
    rrPath(x, 168, 134, 13, 36, 5); x.fill(); rrPath(x, 191, 134, 13, 36, 5); x.fill();
    x.fillRect(126, 36, 4, 134);
    var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function stickerTex(T) {
    var c = canvas(256, 160), x = c.getContext('2d');
    x.fillStyle = '#F6F8FA'; rrPath(x, 0, 0, 256, 160, 14); x.fill();
    x.strokeStyle = '#2B4A6E'; x.lineWidth = 5; rrPath(x, 8, 8, 240, 144, 10); x.stroke();
    x.fillStyle = '#1F3550'; x.font = '800 78px "Segoe UI",Arial,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('WC', 128, 66);
    x.fillStyle = '#9AA8B6'; x.fillRect(40, 116, 176, 7); x.fillRect(70, 132, 116, 6);
    var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function blobTexture() {
    var c = canvas(256, 256), x = c.getContext('2d');
    x.filter = 'blur(14px)'; x.fillStyle = 'rgba(12,24,40,0.85)'; rrPath(x, 62, 56, 132, 144, 20); x.fill();
    return c;
  }

  /* ---------- студийное окружение (PMREM) ---------- */
  function makeEnv(T, renderer) {
    var sc = new T.Scene();
    function f(col) { return new T.MeshBasicMaterial({ color: col, side: T.BackSide }); }
    sc.add(new T.Mesh(new T.BoxGeometry(18, 11, 18), [f(0x8ea3b9), f(0x8ea3b9), f(0xb2c2d3), f(0xa7a193), f(0x94a7bb), f(0x94a7bb)]));
    function panel(w, h, k, x, y, z, col) {
      var c = new T.Color(col); c.multiplyScalar(k);
      var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: c, side: T.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); sc.add(m);
    }
    panel(9, 9, 4.5, 0, 5.2, 0, 0xffffff);          // верхний софтбокс
    panel(4, 7, 5.5, -8.8, 2.2, 4.5, 0xfff3e2);     // ключевой слева-спереди
    panel(3, 6, 2.5, 8.8, 1.8, -2, 0xe8f0ff);       // контровой справа
    panel(9, 2.6, 2.8, 0, 2.0, -8.8, 0xffffff);     // задняя полоса
    panel(8, 3, 1.6, 0, 1.2, 8.8, 0xf4f8ff);        // мягкий фронтальный
    var pm = new T.PMREMGenerator(renderer), rt = pm.fromScene(sc, 0.025, 0.1, 100);
    pm.dispose();
    sc.traverse(function (o) { if (o.isMesh) { o.geometry.dispose(); [].concat(o.material).forEach(function (m) { m.dispose(); }); } });
    return rt;
  }

  /* ---------- геометрия ---------- */
  // скруглённый параллелепипед: все рёбра и углы скруглены радиусом r, неравномерная сетка по осям
  function axisList(half, r, k, mid) {
    var inner = half - r, a = [], i;
    for (i = k; i >= 1; i--) a.push(-(inner + r * Math.tan(i * PI / 4 / k)));
    for (i = 0; i <= mid; i++) a.push(-inner + 2 * inner * i / mid);
    for (i = 1; i <= k; i++) a.push(inner + r * Math.tan(i * PI / 4 / k));
    return a;
  }
  function roundedBox(T, w, h, d, r, k, mx, my, mz) {
    var half = [w / 2, h / 2, d / 2], inn = [half[0] - r, half[1] - r, half[2] - r];
    var lists = [axisList(half[0], r, k, mx), axisList(half[1], r, k, my), axisList(half[2], r, k, mz)];
    var pos = [], nor = [], uv = [], idx = [], base = 0;
    for (var a = 0; a < 3; a++) for (var s = -1; s <= 1; s += 2) {
      var ua = (a + 1) % 3, va = (a + 2) % 3, lu = lists[ua], lv = lists[va];
      for (var j = 0; j < lv.length; j++) for (var i = 0; i < lu.length; i++) {
        var p = [0, 0, 0]; p[a] = s * half[a]; p[ua] = lu[i]; p[va] = lv[j];
        var q = [Math.max(-inn[0], Math.min(inn[0], p[0])), Math.max(-inn[1], Math.min(inn[1], p[1])), Math.max(-inn[2], Math.min(inn[2], p[2]))];
        var dx = p[0] - q[0], dy = p[1] - q[1], dz = p[2] - q[2], ln = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        var nx = dx / ln, ny = dy / ln, nz = dz / ln;
        var X = q[0] + nx * r, Y = q[1] + ny * r, Z = q[2] + nz * r;
        pos.push(X, Y, Z); nor.push(nx, ny, nz);
        var ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
        if (ay >= ax && ay >= az) uv.push(X, Z); else if (ax >= az) uv.push(Z, Y); else uv.push(X, Y);
      }
      for (j = 0; j < lv.length - 1; j++) for (i = 0; i < lu.length - 1; i++) {
        var A = base + j * lu.length + i, B = A + 1, C = A + lu.length + 1, D = A + lu.length;
        if (s > 0) idx.push(A, B, C, A, C, D); else idx.push(A, C, B, A, D, C);
      }
      base += lu.length * lv.length;
    }
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  }
  function rrShape(T, w, h, r) {
    var s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  function chShape(T, w, h, c) { // прямоугольник со срезанными углами
    var s = new T.Shape(), x = w / 2, y = h / 2;
    s.moveTo(-x + c, -y); s.lineTo(x - c, -y); s.lineTo(x, -y + c); s.lineTo(x, y - c); s.lineTo(x - c, y);
    s.lineTo(-x + c, y); s.lineTo(-x, y - c); s.lineTo(-x, -y + c); s.closePath();
    return s;
  }
  // рельефная панель с плавными скруглёнными переходами (выдавленная форма + bevel). Выступ ~ relief
  function extr(T, shape, bs, seg, depth) {
    return new T.ExtrudeGeometry(shape, { depth: depth == null ? 0.004 : depth, bevelEnabled: true, bevelThickness: bs, bevelSize: bs, bevelSegments: seg, curveSegments: 4 });
  }
  function panelGeo(T, w, h, ch, round, bs, seg) {
    var sw = w - 2 * bs, sh = h - 2 * bs;
    return extr(T, round ? rrShape(T, sw, sh, ch) : chShape(T, sw, sh, ch), bs, seg);
  }
  function frameGeo(T, ow, oh, iw, ih, ro, ri, bs, seg) {
    var s = rrShape(T, ow - 2 * bs, oh - 2 * bs, ro), hole = rrShape(T, iw + 2 * bs, ih + 2 * bs, ri);
    s.holes.push(hole);
    return extr(T, s, bs, seg);
  }
  // купол: поверхность над скруглённым прямоугольником с тремя рёбрами жёсткости
  function domeGeo(T, wid, dep, rr, rise, rings, np, amp, ridges) {
    var pts = rrShape(T, wid, dep, rr).getSpacedPoints(np); pts.pop();
    var pos = [], uv = [], idx = [], i, j, ridgeC = ridges || [-0.3, 0, 0.3];
    function ridge(x) { var v = 0; for (var c = 0; c < ridgeC.length; c++) { var t = (x - ridgeC[c]) / 0.105; v += Math.exp(-t * t * t * t); } return v; }
    function sm(a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
    for (i = 0; i <= rings + 1; i++) {
      var s = Math.min(1, i / rings), skirt = i > rings;
      for (j = 0; j < pts.length; j++) {
        var x = pts[j].x * s, z = pts[j].y * s;
        var hh = rise * Math.pow(1 - Math.pow(s, 2.2), 0.6) + amp * ridge(x) * sm(0.05, 0.3, s) * (1 - sm(0.78, 0.98, s)) * 1.0;
        if (skirt) hh = -0.02;
        pos.push(x, hh, z); uv.push(x, z);
      }
    }
    var n = pts.length;
    for (i = 0; i <= rings; i++) for (j = 0; j < n; j++) {
      var a = i * n + j, b = i * n + (j + 1) % n, c = (i + 1) * n + j, d = (i + 1) * n + (j + 1) % n;
      idx.push(a, c, b, b, c, d);
    }
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    g.computeVertexNormals();
    if (g.attributes.normal.getY(n * 3) < 0) { // поправить обход, если нормали смотрят вниз
      var ia = g.index.array; for (i = 0; i < ia.length; i += 3) { var t = ia[i + 1]; ia[i + 1] = ia[i + 2]; ia[i + 2] = t; }
      g.computeVertexNormals();
    }
    return g;
  }

  /* ---------- модель ---------- */
  function buildModel(T, M, Q) {
    var g = new T.Group(), k = Q.k, mid = Q.mid, bs = 0.012, bseg = Q.bseg;
    function add(geo, mat, x, y, z, parent, shadow) {
      var m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow !== false; m.receiveShadow = true; (parent || g).add(m); return m;
    }
    function rb(w, h, d, r, mat, x, y, z, parent, mx, my, mz) { return add(roundedBox(T, w, h, d, r, k, mx || 2, my || 2, mz || 2), mat, x, y, z, parent); }
    function face(rotY, off) { var f = new T.Group(); f.rotation.y = rotY; var o = new T.Group(); o.position.z = off; f.add(o); g.add(f); return o; }
    function panel(par, w, h, ch, round, mat, x, y, z) { return add(panelGeo(T, w, h, ch, round, bs, bseg), mat, x, y, z || 0, par); }
    function slots(par, y, zOff, xs) {
      xs.forEach(function (x) { rb(0.15, 0.034, 0.012, 0.012, M.slot, x, y, zOff, par, 2, 1, 1).castShadow = false; });
    }

    var Y0 = 0.12, WH = 2.0, WY = Y0 + WH / 2;           // стены от 0.12 до 2.12
    var CW = 1.10, CD = 1.15;                              // ядро кабины
    // основание (салазки)
    rb(1.14, 0.12, 1.19, 0.032, M.base, 0, 0.06, 0, null, 6, 2, 6);
    rb(1.07, 0.04, 1.12, 0.018, M.base, 0, 0.125, 0, null, 2, 1, 2);
    // карманы под вилочный погрузчик (боковые стороны)
    [-1, 1].forEach(function (sx) {
      [-0.3, 0.3].forEach(function (z) {
        var lip = add(extr(T, rrShape(T, 0.30 - 0.012, 0.074 - 0.012, 0.02), 0.006, 2, 0.002), M.baseLight, sx * 0.571, 0.06, z); lip.rotation.y = sx * PI / 2;
        var hole = add(new T.ShapeGeometry(rrShape(T, 0.25, 0.046, 0.012), 3), M.pocket, sx * 0.5805, 0.06, z, null, false); hole.rotation.y = sx * PI / 2;
      });
    });
    // ядро и угловые стойки
    rb(CW, WH, CD, 0.034, M.body, 0, WY, 0, null, 3, Q.ny, 3);
    [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) {
      rb(0.105, WH, 0.105, 0.04, M.post, sx * (0.56 - 0.0525), WY, sz * (0.585 - 0.0525), null, 1, Q.ny >> 1, 1);
    }); });

    var F = face(0, 0.575), B = face(PI, 0.575), R = face(PI / 2, 0.55), L = face(-PI / 2, 0.55);

    // --- боковые стороны
    [R, L].forEach(function (S, si) {
      panel(S, 0.80, 0.19, 0.03, false, M.body, 0, 1.985, 0);
      slots(S, 1.985, 0.0125, [-0.27, -0.09, 0.09, 0.27]);
      panel(S, 0.86, 1.50, 0.12, false, M.side, 0, 1.03, 0);
      panel(S, 0.58, 0.78, 0.09, false, M.side, 0, 0.78, 0.0105);
      if (si === 0) {
        var st = add(new T.PlaneGeometry(0.3, 0.19), M.sticker, 0, 1.52, 0.0132, S, false);
      }
    });
    // --- задняя стенка: три вертикальных ребра-канала
    panel(B, 0.80, 0.19, 0.03, false, M.body, 0, 1.985, 0);
    slots(B, 1.985, 0.0125, [-0.27, -0.09, 0.09, 0.27]);
    [-0.29, 0, 0.29].forEach(function (x) { panel(B, 0.24, 1.50, 0.09, true, M.side, x, 1.03, 0); });
    // --- лицевая сторона: рамка двери, зазор, полотно
    var DW = 0.74, DH = 1.70, DY = 1.06;
    panel(F, 0.80, 0.115, 0.03, false, M.body, 0, 2.045, 0);
    slots(F, 2.045, 0.0125, [-0.27, -0.09, 0.09, 0.27]);
    add(new T.ShapeGeometry(rrShape(T, DW + 0.026, DH + 0.026, 0.026), 3), M.gap, 0, DY, 0.0015, F, false);
    add(frameGeo(T, DW + 0.11, DH + 0.11, DW + 0.026, DH + 0.026, 0.045, 0.026, bs, bseg), M.door, 0, DY, 0, F);
    var leaf = new T.Group(); leaf.position.set(0, DY, 0.004); F.add(leaf);
    rb(DW, DH, 0.04, 0.022, M.door, 0, 0, -0.02, leaf, 4, 12, 2);
    // жалюзи (вентиляционная решётка с наклонными пластинами)
    add(new T.ShapeGeometry(rrShape(T, 0.52, 0.15, 0.014), 3), M.gap, 0, 0.705, 0.0015, leaf, false);
    add(frameGeo(T, 0.58, 0.20, 0.52, 0.15, 0.04, 0.014, 0.006, 2), M.door, 0, 0.705, 0, leaf);
    for (var s = 0; s < 5; s++) {
      var sl = rb(0.50, 0.016, 0.022, 0.006, M.louvre, 0, 0.705 + 0.056 - s * 0.028, 0.004, leaf, 1, 1, 1); sl.rotation.x = -0.55;
    }
    // рельефные панели двери
    panel(leaf, 0.58, 0.43, 0.07, false, M.door, 0, 0.335, 0);
    panel(leaf, 0.58, 0.40, 0.07, false, M.door, 0, -0.60, 0);
    // табличка-пиктограмма
    add(rb2(T, 0.2, 0.15, 0.006, 0.012, k), M.plate, -0.0, 0.345, 0.014, leaf);
    add(new T.PlaneGeometry(0.19, 0.14), M.picto, 0, 0.345, 0.0175, leaf, false);
    // тиснёная пустая табличка-логотип
    add(extr(T, rrShape(T, 0.30 - 0.008, 0.09 - 0.008, 0.016), 0.004, 2, 0.002), M.door, 0, -0.60, 0.0105, leaf);
    // индикатор «свободно/занято»
    add(frameGeo(T, 0.19, 0.10, 0.15, 0.062, 0.02, 0.012, 0.005, 2), M.door, 0.22, 0.04, 0, leaf);
    add(new T.PlaneGeometry(0.15, 0.062), M.indicator, 0.22, 0.04, 0.0035, leaf, false);
    // утопленная ручка-защёлка
    add(frameGeo(T, 0.16, 0.30, 0.12, 0.25, 0.04, 0.03, 0.006, 2), M.door, 0.22, -0.17, 0, leaf);
    add(new T.ShapeGeometry(rrShape(T, 0.125, 0.255, 0.03), 3), M.pocket, 0.22, -0.17, 0.0015, leaf, false);
    var pull = add(new T.CapsuleGeometry(0.011, 0.12, 4, 10), M.metal, 0.22, -0.17, 0.034, leaf);
    [-0.055, 0.055].forEach(function (dy) { var c = add(new T.CylinderGeometry(0.008, 0.008, 0.03, 10), M.metal, 0.22, -0.17 + dy, 0.02, leaf); c.rotation.x = PI / 2; });
    var lk = add(new T.CylinderGeometry(0.017, 0.017, 0.008, 16), M.metal, 0.22, -0.265, 0.004, leaf); lk.rotation.x = PI / 2;
    // петли (металл)
    [0.55, -0.55].forEach(function (dy) {
      add(roundedBox(T, 0.065, 0.15, 0.008, 0.003, 2, 1, 2, 1), M.metal, -0.375, DY + dy, 0.0165, F);
      add(new T.CylinderGeometry(0.0125, 0.0125, 0.15, 14), M.metal, -0.405, DY + dy, 0.019, F);
    });
    // пружинный доводчик-рычаг сверху двери
    var arm = add(roundedBox(T, 0.30, 0.012, 0.012, 0.005, 2, 2, 1, 1), M.metal, 0.20, DY + 0.80, 0.022, F); arm.rotation.z = 0.0;

    // --- крыша: обод, купол, вентиляция
    rb(1.18, 0.075, 1.23, 0.032, M.rimRoof, 0, 2.157, 0, null, 6, 1, 6);
    var dome = add(domeGeo(T, 1.10, 1.15, 0.12, 0.16, Q.rings, Q.np, 0.04), M.roof, 0, 2.19, 0);
    dome.receiveShadow = true;
    var vx = 0.40, vz = -0.43;
    add(new T.CylinderGeometry(0.058, 0.066, 0.035, Q.cyl), M.pipe, vx, 2.22, vz);
    add(new T.CylinderGeometry(0.036, 0.036, 0.25, Q.cyl), M.pipe, vx, 2.31, vz);
    add(new T.CylinderGeometry(0.052, 0.052, 0.024, Q.cyl), M.pipe, vx, 2.425, vz);
    add(new T.CylinderGeometry(0.012, 0.056, 0.04, Q.cyl), M.pipe, vx, 2.457, vz);
    return g;
  }
  function rb2(T, w, h, d, r, k) { return roundedBox(T, w, h, d, r, Math.max(2, k - 1), 1, 1, 1); }


  /* ================= ДОБАВЛЕНО: варианты моделей, сцена outdoor ================= */
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function sm01(a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
  function srgbTex(T, c) { var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t; }

  // международный символ доступности (ISA): синий квадрат, белая фигура в кресле
  function isaTex(T) {
    var c = canvas(256, 256), x = c.getContext('2d');
    x.fillStyle = '#F4F6F8'; x.fillRect(0, 0, 256, 256);
    x.fillStyle = '#0A56A8'; rrPath(x, 8, 8, 240, 240, 26); x.fill();
    x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); x.arc(108, 54, 19, 0, 7); x.fill();
    x.lineWidth = 19;
    x.beginPath(); x.moveTo(108, 90); x.lineTo(108, 152); x.lineTo(168, 152); x.lineTo(194, 206); x.lineTo(218, 206); x.stroke();
    x.beginPath(); x.moveTo(108, 114); x.lineTo(158, 114); x.stroke();
    x.lineWidth = 17; x.beginPath(); x.arc(108, 160, 60, 0.14 * PI, 1.22 * PI, false); x.stroke();
    return srgbTex(T, c);
  }
  function labelTex(T, text, w, h, fg, bg, font) {
    var c = canvas(w, h), x = c.getContext('2d');
    x.fillStyle = bg; rrPath(x, 0, 0, w, h, h * 0.2); x.fill();
    x.fillStyle = fg; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 2);
    return srgbTex(T, c);
  }
  // противоскользящее рифлёное покрытие (цвет + карта высот из одного холста)
  function nonslipCanvas() {
    var c = canvas(128, 128), x = c.getContext('2d'), i, j;
    x.fillStyle = '#2d3136'; x.fillRect(0, 0, 128, 128);
    for (j = 0; j < 8; j++) for (i = 0; i < 4; i++) {
      var ox = ((j % 2) * 16 + i * 32 + 3) % 128, oy = j * 16 + 3;
      [ox, ox - 128].forEach(function (px) {
        x.fillStyle = '#7c848c'; rrPath(x, px, oy, 26, 10, 4); x.fill();
        x.fillStyle = '#a9b1b8'; rrPath(x, px + 2, oy + 1, 22, 4, 2); x.fill();
      });
    }
    return c;
  }
  function peatCanvas() {
    var c = canvas(128, 128), x = c.getContext('2d'), r = rng(901), i;
    x.fillStyle = '#4a3624'; x.fillRect(0, 0, 128, 128);
    for (i = 0; i < 900; i++) {
      var l = 18 + r() * 34; x.fillStyle = 'hsl(' + (22 + r() * 10) + ',' + (30 + r() * 20) + '%,' + l + '%)';
      x.beginPath(); x.arc(r() * 128, r() * 128, 0.8 + r() * 2.2, 0, 7); x.fill();
    }
    x.lineWidth = 1;
    for (i = 0; i < 160; i++) { x.strokeStyle = 'rgba(120,90,58,' + (0.3 + r() * 0.4) + ')'; var px = r() * 128, py = r() * 128, a = r() * 6.3; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * 6, py + Math.sin(a) * 6); x.stroke(); }
    return c;
  }
  // белая изморозь: точки гуще у кромки
  function frostTex(T, w, h, mode) {
    var c = canvas(w, h), x = c.getContext('2d'), r = rng(4242), n = w * h / 5, i;
    for (i = 0; i < n; i++) {
      var px = r() * w, py = r() * h, d;
      if (mode === 'top') d = 1 - py / h; else d = 1 - Math.min(Math.min(px, w - px) / (w / 2), Math.min(py, h - py) / (h / 2));
      if (r() > Math.pow(Math.max(0, d), 1.5)) continue;
      x.fillStyle = 'rgba(255,255,255,' + (0.45 + r() * 0.5) + ')'; x.beginPath(); x.arc(px, py, 0.6 + r() * 1.5, 0, 7); x.fill();
    }
    var gr = mode === 'top' ? x.createLinearGradient(0, 0, 0, h * 0.35) : null;
    if (gr) { gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h * 0.35); }
    return srgbTex(T, c);
  }

  // земля outdoor: мелкий гравий, переходящий к краям в короткую траву; normal-карта и альфа-затухание
  function groundMaps(T, S) {
    var c = canvas(S, S), x = c.getContext('2d'), r = rng(2025), i, k = S / 1024, half = S / 2;
    x.fillStyle = '#5f7340'; x.fillRect(0, 0, S, S);
    for (i = 0; i < 160; i++) { // крупные пятна тона
      var bx = r() * S, by = r() * S, br = (60 + r() * 160) * k, gg = x.createRadialGradient(bx, by, 0, bx, by, br);
      var dark = r() < 0.5; gg.addColorStop(0, dark ? 'rgba(48,66,30,0.22)' : 'rgba(128,140,70,0.18)'); gg.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = gg; x.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    function gw(px, py) { // доля гравия 0..1
      var dx = px - half, dy = py - half, rr = Math.sqrt(dx * dx + dy * dy) / half, th = Math.atan2(dy, dx);
      rr += 0.05 * Math.sin(th * 5 + 1.3) + 0.035 * Math.sin(th * 11 + 0.4) + 0.02 * Math.sin(th * 23);
      return 1 - sm01(0.36, 0.7, rr);
    }
    var nb = Math.round(S * S / 38), px, py, g;
    x.lineCap = 'round';
    for (i = 0; i < nb; i++) { // травинки
      px = r() * S; py = r() * S; g = gw(px, py); if (r() < g * 0.96) continue;
      var a = -1.57 + (r() - 0.5) * 1.5, len = (3 + r() * 6) * k;
      x.strokeStyle = 'hsl(' + (72 + r() * 40) + ',' + (32 + r() * 24) + '%,' + (18 + r() * 26) + '%)'; x.lineWidth = (0.9 + r() * 0.8) * k;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len); x.stroke();
    }
    var np = Math.round(S * S / 11);
    for (i = 0; i < np * 0.5; i++) { // подложка между камнями
      px = r() * S; py = r() * S; g = gw(px, py); if (r() > g * g) continue;
      x.fillStyle = 'hsl(30,8%,' + (20 + r() * 10) + '%)'; x.beginPath(); x.arc(px, py, (1.6 + r() * 1.4) * k, 0, 7); x.fill();
    }
    for (i = 0; i < np; i++) { // галька
      px = r() * S; py = r() * S; g = gw(px, py); if (r() > g) continue;
      var rad = (0.7 + r() * r() * 2.6) * k, l = 46 + r() * 30, hue = 28 + r() * 16, sat = 5 + r() * 15;
      x.fillStyle = 'hsl(' + hue + ',' + sat + '%,' + (l * 0.55) + '%)'; x.beginPath(); x.ellipse(px + 0.4 * k, py + 0.5 * k, rad * 1.08, rad * 0.85, r() * 3, 0, 7); x.fill();
      x.fillStyle = 'hsl(' + hue + ',' + sat + '%,' + l + '%)'; x.beginPath(); x.ellipse(px, py, rad, rad * 0.8, r() * 3, 0, 7); x.fill();
    }
    // землистая пыль у границы гравия
    for (i = 0; i < 70; i++) {
      var ang = r() * 6.28, rd = (0.3 + r() * 0.45) * half, ex = half + Math.cos(ang) * rd, ey = half + Math.sin(ang) * rd, er = (30 + r() * 70) * k;
      var g2 = x.createRadialGradient(ex, ey, 0, ex, ey, er); g2.addColorStop(0, 'rgba(110,98,76,0.16)'); g2.addColorStop(1, 'rgba(110,98,76,0)'); x.fillStyle = g2; x.fillRect(ex - er, ey - er, er * 2, er * 2);
    }
    // normal из яркости
    var src = x.getImageData(0, 0, S, S).data, hgt = new Float32Array(S * S), n;
    for (i = 0; i < S * S; i++) hgt[i] = (src[i * 4] * 0.3 + src[i * 4 + 1] * 0.59 + src[i * 4 + 2] * 0.11) / 255;
    var nc = canvas(S, S), nx = nc.getContext('2d'), nd = nx.createImageData(S, S), xx, yy;
    for (yy = 0; yy < S; yy++) for (xx = 0; xx < S; xx++) {
      var l1 = hgt[yy * S + Math.max(0, xx - 1)], r1 = hgt[yy * S + Math.min(S - 1, xx + 1)], u1 = hgt[Math.max(0, yy - 1) * S + xx], d1 = hgt[Math.min(S - 1, yy + 1) * S + xx];
      var ddx = (r1 - l1) * 2.6, ddy = (d1 - u1) * 2.6, ln = Math.sqrt(ddx * ddx + ddy * ddy + 1); n = (yy * S + xx) * 4;
      nd.data[n] = (-ddx / ln * 0.5 + 0.5) * 255; nd.data[n + 1] = (ddy / ln * 0.5 + 0.5) * 255; nd.data[n + 2] = (1 / ln * 0.5 + 0.5) * 255; nd.data[n + 3] = 255;
    }
    nx.putImageData(nd, 0, 0);
    var ac = canvas(256, 256), ax = ac.getContext('2d'), ag = ax.createRadialGradient(128, 128, 0, 128, 128, 128);
    ag.addColorStop(0, '#fff'); ag.addColorStop(0.5, '#fff'); ag.addColorStop(0.68, '#d8d8d8'); ag.addColorStop(0.84, '#6a6a6a'); ag.addColorStop(0.95, '#161616'); ag.addColorStop(1, '#000');
    ax.fillStyle = ag; ax.fillRect(0, 0, 256, 256);
    var map = srgbTex(T, c); map.anisotropy = 8;
    var normal = new T.CanvasTexture(nc); normal.anisotropy = 8;
    var alpha = new T.CanvasTexture(ac);
    return { map: map, normal: normal, alpha: alpha };
  }

  // окружение «дневное небо»: градиент неба, горизонт, земля и солнечный диск (для PMREM)
  function makeSkyEnv(T, renderer, sunDir) {
    var sc = new T.Scene(), geo = new T.SphereGeometry(30, 40, 24), pos = geo.attributes.position, col = [], i;
    var zen = new T.Color(0.10, 0.26, 0.62), mid = new T.Color(0.34, 0.55, 0.88), hor = new T.Color(0.95, 0.96, 0.94), gnd = new T.Color(0.20, 0.19, 0.15), gnd2 = new T.Color(0.09, 0.09, 0.07), c = new T.Color();
    for (i = 0; i < pos.count; i++) {
      var y = pos.getY(i) / 30;
      if (y >= 0) { var t = Math.pow(y, 0.55); if (t < 0.35) c.copy(hor).lerp(mid, t / 0.35); else c.copy(mid).lerp(zen, (t - 0.35) / 0.65); }
      else { c.copy(hor).lerp(gnd, Math.min(1, -y * 14)).lerp(gnd2, Math.min(1, -y * 2.2)); }
      col.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    sc.add(new T.Mesh(geo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
    var sun = new T.Mesh(new T.SphereGeometry(2.6, 16, 8), new T.MeshBasicMaterial({ color: new T.Color(1, 0.9, 0.72).multiplyScalar(14) }));
    sun.position.copy(sunDir).multiplyScalar(26); sc.add(sun);
    var cl = new T.Mesh(new T.PlaneGeometry(16, 5), new T.MeshBasicMaterial({ color: new T.Color(1, 1, 1).multiplyScalar(1.4), side: T.DoubleSide }));
    cl.position.set(8, 13, -16); cl.lookAt(0, 0, 0); sc.add(cl);
    var pm = new T.PMREMGenerator(renderer), rt = pm.fromScene(sc, 0.02, 0.1, 100);
    pm.dispose();
    sc.traverse(function (o) { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
    return rt;
  }

  /* ---------- сборка вариантов ---------- */
  function kit(T, M, Q, g) {
    var K = { bs: 0.012, bseg: Q.bseg, g: g };
    K.add = function (geo, mat, x, y, z, parent, shadow) { var m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow !== false; m.receiveShadow = true; (parent || g).add(m); return m; };
    K.rb = function (w, h, d, r, mat, x, y, z, parent, mx, my, mz) { return K.add(roundedBox(T, w, h, d, r, Q.k, mx || 2, my || 2, mz || 2), mat, x, y, z, parent); };
    K.face = function (rotY, off) { var f = new T.Group(); f.rotation.y = rotY; var o = new T.Group(); o.position.z = off; f.add(o); g.add(f); return o; };
    K.panel = function (par, w, h, ch, round, mat, x, y, z) { return K.add(panelGeo(T, w, h, ch, round, K.bs, K.bseg), mat, x, y, z || 0, par); };
    K.slots = function (par, y, zOff, xs) { xs.forEach(function (x) { K.rb(0.15, 0.034, 0.012, 0.012, M.slot, x, y, zOff, par, 2, 1, 1).castShadow = false; }); };
    K.cyl = function (r1, r2, h, mat, x, y, z, parent, seg) { return K.add(new T.CylinderGeometry(r1, r2, h, seg || Math.max(8, Q.cyl)), mat, x, y, z, parent); };
    K.bar = function (mat, a, b, r, parent) {
      var d = new T.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), len = d.length();
      var m = K.add(new T.CylinderGeometry(r, r, len, 10), mat, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, parent);
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); return m;
    };
    return K;
  }
  function roofVent(K, M, vx, vz, y0) {
    K.cyl(0.058, 0.066, 0.035, M.pipe, vx, y0, vz); K.cyl(0.036, 0.036, 0.25, M.pipe, vx, y0 + 0.09, vz);
    K.cyl(0.052, 0.052, 0.024, M.pipe, vx, y0 + 0.205, vz); K.cyl(0.012, 0.056, 0.04, M.pipe, vx, y0 + 0.237, vz);
  }

  // дверь: рамка, полотно на петле (может быть приоткрыто), пиктограмма/ISA, индикатор, ручка
  function buildDoor(T, M, Q, K, F, c) {
    var DW = c.DW, DH = c.DH, DY = c.DY, s = c.s, add = K.add, rb = K.rb, bs = K.bs, bseg = K.bseg, k = Q.k;
    var fg = new T.Group(); fg.position.x = c.x || 0; F.add(fg);
    if (c.gap) add(new T.ShapeGeometry(rrShape(T, DW + 0.026, DH + 0.026, 0.026), 3), M.gap, 0, DY, 0.0015, fg, false);
    add(frameGeo(T, DW + 0.11, DH + 0.11, DW + 0.026, DH + 0.026, 0.045, 0.026, bs, bseg), c.frameMat || M.door, 0, DY, 0, fg);
    var hinge = new T.Group(); hinge.position.set(s * DW / 2, DY, 0.004); hinge.rotation.y = s * (c.ang || 0); fg.add(hinge);
    var lf = new T.Group(); lf.position.x = -s * DW / 2; hinge.add(lf);
    rb(DW, DH, 0.04, 0.022, M.door, 0, 0, -0.02, lf, 4, 12, 2);
    var fx = -s * (DW / 2 - 0.13); // сторона ручки (свободный край)
    if (c.louvre) {
      var lw = DW * 0.68, ly = DH * 0.4;
      add(new T.ShapeGeometry(rrShape(T, lw, 0.15, 0.014), 3), M.gap, 0, ly, 0.0015, lf, false);
      add(frameGeo(T, lw + 0.06, 0.20, lw, 0.15, 0.04, 0.014, 0.006, 2), M.door, 0, ly, 0, lf);
      for (var q = 0; q < 5; q++) { var sl = rb(lw - 0.02, 0.016, 0.022, 0.006, M.louvre, 0, ly + 0.056 - q * 0.028, 0.004, lf, 1, 1, 1); sl.rotation.x = -0.55; }
    }
    var pw = DW * 0.8;
    K.panel(lf, pw, c.upperH, 0.07, false, M.door, 0, c.upperY, 0);
    K.panel(lf, pw, 0.42, 0.07, false, M.door, 0, -DH * 0.34, 0);
    if (c.isa) {
      add(rb2(T, 0.34, 0.34, 0.006, 0.014, k), M.plate, 0, c.upperY, 0.014, lf);
      add(new T.PlaneGeometry(0.32, 0.32), M.isa, 0, c.upperY, 0.0175, lf, false);
    } else {
      add(rb2(T, 0.2, 0.15, 0.006, 0.012, k), M.plate, 0, c.upperY, 0.014, lf);
      add(new T.PlaneGeometry(0.19, 0.14), M.picto, 0, c.upperY, 0.0175, lf, false);
    }
    add(frameGeo(T, 0.19, 0.10, 0.15, 0.062, 0.02, 0.012, 0.005, 2), M.door, fx, 0.04, 0, lf);
    add(new T.PlaneGeometry(0.15, 0.062), M.indicator, fx, 0.04, 0.0035, lf, false);
    var hy = -0.2, hl = c.accessible ? 0.5 : 0.12;
    add(frameGeo(T, 0.16, hl + 0.18, 0.12, hl + 0.13, 0.04, 0.03, 0.006, 2), M.door, fx, hy, 0, lf);
    add(new T.ShapeGeometry(rrShape(T, 0.125, hl + 0.135, 0.03), 3), M.pocket, fx, hy, 0.0015, lf, false);
    add(new T.CapsuleGeometry(0.012, hl, 4, 10), M.metal, fx, hy, 0.034, lf);
    [-hl / 2 + 0.01, hl / 2 - 0.01].forEach(function (dy) { var cc = add(new T.CylinderGeometry(0.008, 0.008, 0.03, 10), M.metal, fx, hy + dy, 0.02, lf); cc.rotation.x = PI / 2; });
    // петли: шарниры на оси, пластины на полотне
    [DH * 0.32, -DH * 0.32].forEach(function (dy) {
      add(roundedBox(T, 0.065, 0.15, 0.008, 0.003, 2, 1, 2, 1), M.metal, s * (DW / 2 - 0.03), dy, 0.0125, lf);
      add(new T.CylinderGeometry(0.0125, 0.0125, 0.15, 14), M.metal, 0, dy, 0.015, hinge);
    });
    return { lf: lf, hinge: hinge };
  }

  // рукомойник на левой стене + дозатор мыла
  function addWashbasin(T, M, Q, g) {
    var K = kit(T, M, Q, g), add = K.add, rb = K.rb, S = K.face(-PI / 2, 0.56), z0 = 0.012, sg = Q.cyl + 6;
    rb(0.54, 0.36, 0.03, 0.014, M.sinkW, 0, 1.03, z0 + 0.015, S, 3, 3, 1);                       // спинка
    rb(0.40, 0.72, 0.32, 0.05, M.sinkW, 0, 0.50, z0 + 0.16, S, 3, 6, 3);                         // тумба с баком
    add(new T.PlaneGeometry(0.30, 0.30), M.cabLabel, 0, 0.36, z0 + 0.3205, S, false);              // «нажми педаль»
    var deck = add(extr(T, (function () { var sh = rrShape(T, 0.56, 0.42, 0.09); sh.holes.push(rrShape(T, 0.37, 0.26, 0.075)); return sh; })(), 0.008, 3, 0.018), M.sinkW, 0, 0.935, z0 + 0.215, S);
    deck.rotation.x = -PI / 2;                                                                    // ободок раковины
    var bowl = add(new T.SphereGeometry(1, sg, Math.round(sg / 2), 0, 2 * PI, PI / 2, PI / 2), M.sinkIn, 0, 0.955, z0 + 0.215, S);
    bowl.scale.set(0.185, 0.13, 0.13);
    var drain = add(new T.CircleGeometry(0.022, 14), M.pocket, 0, 0.826, z0 + 0.215, S, false); drain.rotation.x = -PI / 2;
    // кран
    K.cyl(0.02, 0.024, 0.03, M.metal, 0, 0.985, z0 + 0.075, S);
    K.cyl(0.013, 0.013, 0.10, M.metal, 0, 1.05, z0 + 0.075, S);
    var sp = K.cyl(0.011, 0.011, 0.14, M.metal, 0, 1.10, z0 + 0.14, S); sp.rotation.x = PI / 2;
    K.cyl(0.015, 0.011, 0.03, M.metal, 0, 1.085, z0 + 0.205, S);
    // педаль и тяга
    var pd = rb(0.17, 0.035, 0.13, 0.014, M.pedal, 0, 0.16, z0 + 0.40, S, 2, 1, 2); pd.rotation.x = 0.28;
    rb(0.05, 0.03, 0.10, 0.01, M.pedal, 0, 0.17, z0 + 0.34, S, 1, 1, 1);
    // дозатор мыла
    rb(0.095, 0.17, 0.08, 0.022, M.soapBody, 0, 1.33, z0 + 0.04, S, 2, 3, 2);
    add(new T.PlaneGeometry(0.06, 0.09), M.soapWin, 0, 1.325, z0 + 0.0815, S, false);
    rb(0.055, 0.022, 0.05, 0.008, M.soapBody, 0, 1.425, z0 + 0.052, S, 1, 1, 1);
    K.cyl(0.011, 0.011, 0.03, M.metal, 0, 1.445, z0 + 0.052, S);
    var nz = K.cyl(0.008, 0.008, 0.055, M.metal, 0, 1.225, z0 + 0.085, S); nz.rotation.x = PI / 2;
    return g;
  }

  // кабина для маломобильных (доступная): широкая, пандус, дверь приоткрыта
  function buildAccessible(T, M, Q, o) {
    var g = new T.Group(), K = kit(T, M, Q, g), add = K.add, rb = K.rb;
    var W = 2.2, D = 1.65, t = 0.08, Y0 = 0.12, WH = 2.0, WY = Y0 + WH / 2, FL = 0.17;
    var DW = 0.9, DH = 1.8, DY = FL + DH / 2, OW = DW + 0.03, OT = FL + DH + 0.025, ny = Q.ny;
    rb(W + 0.04, 0.12, D + 0.05, 0.032, M.base, 0, 0.06, 0, null, 8, 2, 6);
    rb(W - 0.06, 0.05, D - 0.08, 0.015, M.floor, 0, 0.145, 0, null, 2, 1, 2);
    // стены-оболочка
    rb(W, WH, t, 0.03, M.body, 0, WY, -D / 2 + t / 2, null, 6, ny, 1);
    [-1, 1].forEach(function (sx) { rb(t, WH, D, 0.03, M.body, sx * (W / 2 - t / 2), WY, 0, null, 1, ny, 5); });
    var pw = W / 2 - OW / 2, pc = OW / 2 + pw / 2;
    [-1, 1].forEach(function (sx) { rb(pw, WH, t, 0.03, M.body, sx * pc, WY, D / 2 - t / 2, null, 3, ny, 1); });
    rb(OW + 0.02, 2.12 - OT, t, 0.025, M.body, 0, (OT + 2.12) / 2, D / 2 - t / 2, null, 3, 2, 1);
    // угловые стойки
    [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) {
      rb(0.105, WH, 0.105, 0.04, M.post, sx * (W / 2 - 0.0525), WY, sz * (D / 2 - 0.0525), null, 1, ny >> 1, 1);
    }); });
    // внутренняя отделка
    var iw = W - 2 * t, ih = 2.115 - FL;
    add(new T.PlaneGeometry(iw, ih), M.interior, 0, FL + ih / 2, -D / 2 + t + 0.001, null, false);
    var l1 = add(new T.PlaneGeometry(D - 2 * t, ih), M.interior, -(W / 2 - t) + 0.001, FL + ih / 2, 0, null, false); l1.rotation.y = PI / 2;
    var r1 = add(new T.PlaneGeometry(D - 2 * t, ih), M.interior, (W / 2 - t) - 0.001, FL + ih / 2, 0, null, false); r1.rotation.y = -PI / 2;
    var cl = add(new T.PlaneGeometry(iw, D - 2 * t), M.interior, 0, 2.114, 0, null, false); cl.rotation.x = PI / 2;
    // поручни и унитаз внутри
    var bx = 0.52, bz = -D / 2 + t, rz = bz + 0.07;
    K.bar(M.metal, [bx - 0.5, 0.88, rz], [bx + 0.5, 0.88, rz], 0.017);
    [bx - 0.5, bx + 0.5].forEach(function (px) { K.bar(M.metal, [px, 0.88, bz], [px, 0.88, rz], 0.014); });
    var sxw = W / 2 - t, sx2 = sxw - 0.07;
    K.bar(M.metal, [sx2, 0.88, bz + 0.12], [sx2, 0.88, bz + 0.85], 0.017);
    K.bar(M.metal, [sx2, 0.88, bz + 0.85], [sx2, 1.45, bz + 0.85], 0.017);
    [bz + 0.12, bz + 0.85].forEach(function (pz) { K.bar(M.metal, [sxw, 0.88, pz], [sx2, 0.88, pz], 0.014); });
    K.bar(M.metal, [-0.38, 0.9, D / 2 - t - 0.05], [-0.38, 1.6, D / 2 - t - 0.05], 0.017); // вертикальный поручень у проёма
    var tz = bz + 0.34;
    rb(0.40, 0.30, 0.52, 0.07, M.porc, bx - 0.02, 0.34, tz, null, 2, 3, 2);
    var seat = add(extr(T, (function () { var sh = rrShape(T, 0.38, 0.44, 0.17); sh.holes.push(rrShape(T, 0.22, 0.27, 0.1)); return sh; })(), 0.006, 2, 0.02), M.seatD, bx - 0.02, 0.49, tz + 0.03); seat.rotation.x = -PI / 2;
    rb(0.40, 0.42, 0.16, 0.04, M.porc, bx - 0.02, 0.69, bz + 0.1, null, 2, 3, 2);
    // экстерьер: рельефные панели
    var F = K.face(0, D / 2), B = K.face(PI, D / 2), R = K.face(PI / 2, W / 2), L = K.face(-PI / 2, W / 2);
    [R, L].forEach(function (S) {
      K.panel(S, 1.2, 0.19, 0.03, false, M.body, 0, 1.985, 0); K.slots(S, 1.985, 0.0125, [-0.36, -0.12, 0.12, 0.36]);
      K.panel(S, 1.3, 1.5, 0.12, false, M.side, 0, 1.03, 0); K.panel(S, 0.9, 0.78, 0.09, false, M.side, 0, 0.78, 0.0105);
    });
    K.panel(B, 1.5, 0.19, 0.03, false, M.body, 0, 1.985, 0); K.slots(B, 1.985, 0.0125, [-0.5, -0.17, 0.17, 0.5]);
    [-0.78, -0.26, 0.26, 0.78].forEach(function (x) { K.panel(B, 0.4, 1.5, 0.09, true, M.side, x, 1.03, 0); });
    K.slots(F, 2.055, 0.0125, [-0.2, 0, 0.2]);
    [-1, 1].forEach(function (sx) { K.panel(F, 0.52, 1.4, 0.1, false, M.side, sx * 0.80, 1.08, 0.0); });
    // дверь (приоткрыта, шарнир справа)
    buildDoor(T, M, Q, K, F, { DW: DW, DH: DH, DY: DY, s: 1, ang: 22 * DEG, accessible: true, isa: true, louvre: true, upperY: 0.34, upperH: 0.5 });
    // крыша
    rb(W + 0.08, 0.075, D + 0.08, 0.032, M.rimRoof, 0, 2.157, 0, null, 8, 1, 6);
    add(domeGeo(T, W, D, 0.14, 0.2, Q.rings, Q.np, 0.04, [-0.66, -0.22, 0.22, 0.66]), M.roof, 0, 2.19, 0);
    roofVent(K, M, 0.85, -0.5, 2.22); roofVent(K, M, -0.85, -0.5, 2.22);
    // пандус
    var RW = 1.3, RL = 1.35, RH = FL - 0.003, RT = 0.03, z0 = D / 2 + 0.03, ang = Math.atan((RH - RT) / RL), sl = Math.sqrt(RL * RL + (RH - RT) * (RH - RT));
    var prof = new T.Shape(); prof.moveTo(0, 0); prof.lineTo(RL, 0); prof.lineTo(RL, RT); prof.lineTo(0, RH); prof.closePath();
    var rg = new T.ExtrudeGeometry(prof, { depth: RW, bevelEnabled: false });
    var ramp = add(rg, M.base, RW / 2, 0, z0); ramp.rotation.y = -PI / 2;
    var top = new T.PlaneGeometry(RW - 0.04, sl), uv = top.attributes.uv;
    for (var i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (RW - 0.04), uv.getY(i) * sl);
    var tp = add(top, M.ramp, 0, (RH + RT) / 2 + 0.002, z0 + RL / 2, null, false); tp.rotation.x = -(PI / 2 - ang);
    var ns = add(new T.PlaneGeometry(RW - 0.04, 0.07), M.yellow, 0, RT + 0.005, z0 + RL - 0.04, null, false); ns.rotation.x = -(PI / 2 - ang);
    ns.position.y += 0.0015;
    function rampY(zz) { return RH - (RH - RT) * zz / RL; }
    [-1, 1].forEach(function (sx) {
      var x = sx * (RW / 2 - 0.045), pz = [0.12, RL * 0.5, RL - 0.1];
      pz.forEach(function (zz) { K.bar(M.metal, [x, rampY(zz), z0 + zz], [x, rampY(zz) + 0.85, z0 + zz], 0.02); });
      K.bar(M.metal, [x, rampY(0.02) + 0.85, z0 + 0.02], [x, rampY(RL - 0.05) + 0.85, z0 + RL - 0.05], 0.026);
      K.bar(M.metal, [x, rampY(0.02) + 0.45, z0 + 0.02], [x, rampY(RL - 0.05) + 0.45, z0 + RL - 0.05], 0.018);
    });
    g.userData.ramp = true;
    return g;
  }

  // утеплённая зимняя кабина: плоская крыша, сэндвич-панели, решётка обогрева
  function buildInsulated(T, M, Q, o) {
    var g = new T.Group(), K = kit(T, M, Q, g), add = K.add, rb = K.rb, ny = Q.ny;
    var W = 1.24, D = 1.30, Y0 = 0.12, WH = 2.0, WY = Y0 + WH / 2;
    rb(W + 0.05, 0.12, D + 0.06, 0.032, M.base, 0, 0.06, 0, null, 6, 2, 6);
    rb(W - 0.04, 0.04, D - 0.04, 0.018, M.base, 0, 0.125, 0, null, 2, 1, 2);
    [-1, 1].forEach(function (sx) { [-0.3, 0.3].forEach(function (z) {
      var lip = add(extr(T, rrShape(T, 0.30 - 0.012, 0.074 - 0.012, 0.02), 0.006, 2, 0.002), M.baseLight, sx * (W / 2 + 0.0265), 0.06, z); lip.rotation.y = sx * PI / 2;
      var hole = add(new T.ShapeGeometry(rrShape(T, 0.25, 0.046, 0.012), 3), M.pocket, sx * (W / 2 + 0.0355), 0.06, z, null, false); hole.rotation.y = sx * PI / 2;
    }); });
    rb(W, WH, D, 0.016, M.body, 0, WY, 0, null, 4, ny, 4);
    // угловые профили, пояса
    [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) {
      rb(0.095, WH + 0.01, 0.095, 0.024, M.trim, sx * (W / 2 - 0.0415), WY, sz * (D / 2 - 0.0415), null, 1, ny >> 1, 1);
    }); });
    rb(W + 0.03, 0.07, D + 0.03, 0.02, M.trim, 0, 2.095, 0, null, 3, 1, 3);
    rb(W + 0.03, 0.06, D + 0.03, 0.02, M.trim, 0, 0.15, 0, null, 3, 1, 3);
    var F = K.face(0, D / 2 + 0.0015), B = K.face(PI, D / 2), R = K.face(PI / 2, W / 2), L = K.face(-PI / 2, W / 2);
    // швы сэндвич-панелей
    function seams(S, w) {
      var n = Math.round(w / 0.4), i;
      for (i = 1; i < n; i++) { var x = -w / 2 + i * w / n;
        add(new T.BoxGeometry(0.012, 1.80, 0.004), M.seam, x, 1.10, 0.0005, S, false);
        add(new T.BoxGeometry(0.003, 1.80, 0.003), M.seamHi, x + 0.0085, 1.10, 0.001, S, false);
      }
    }
    seams(R, D - 0.17); seams(L, D - 0.17); seams(B, W - 0.17);
    // нижний «цоколь»-плинт
    // дверь
    var DW = 0.76, DH = 1.72, DY = 1.07;
    buildDoor(T, M, Q, K, F, { DW: DW, DH: DH, DY: DY, s: -1, ang: 0, gap: true, frameMat: M.trim, louvre: false, upperY: 0.30, upperH: 0.46 });
    seams(F, 0.0);
    // решётка обогрева на левой стене
    var gx = 0.10, gy = 0.60;
    add(new T.ShapeGeometry(rrShape(T, 0.30, 0.20, 0.016), 3), M.gap, gx, gy, 0.0015, L, false);
    add(frameGeo(T, 0.36, 0.26, 0.30, 0.20, 0.04, 0.016, 0.006, 2), M.trim, gx, gy, 0, L);
    for (var s2 = 0; s2 < 6; s2++) { var sl = rb(0.28, 0.014, 0.02, 0.005, M.grille, gx, gy + 0.075 - s2 * 0.03, 0.004, L, 1, 1, 1); sl.rotation.x = -0.5; }
    // плоская утеплённая крыша
    rb(W + 0.10, 0.10, D + 0.10, 0.03, M.roof, 0, 2.17, 0, null, 6, 1, 6);
    rb(W + 0.11, 0.035, D + 0.11, 0.014, M.rimRoof, 0, 2.133, 0, null, 6, 1, 6);
    if (o.frost !== false) {
      var tp = add(new T.PlaneGeometry(W + 0.08, D + 0.08), M.frostTop, 0, 2.2205, 0, null, false); tp.rotation.x = -PI / 2;
      var sides = [[0, (D + 0.10) / 2, W + 0.10], [PI, (D + 0.10) / 2, W + 0.10], [PI / 2, (W + 0.10) / 2, D + 0.10], [-PI / 2, (W + 0.10) / 2, D + 0.10]];
      sides.forEach(function (sd) { var fgp = new T.Group(); fgp.rotation.y = sd[0]; g.add(fgp); add(new T.PlaneGeometry(sd[2] - 0.06, 0.11), M.frostSide, 0, 2.165, sd[1] + 0.0008, fgp, false); });
    }
    roofVent(K, M, 0.36, -0.40, 2.235);
    return g;
  }

  // торфяной дачный туалет (изделие, не кабина), метры; размеры ≈0.45 × 0.6 × 0.75
  function buildPeat(T, M, Q, o) {
    var g = new T.Group(), K = kit(T, M, Q, g), add = K.add, rb = K.rb, sg = Q.cyl + 8;
    rb(0.41, 0.05, 0.56, 0.02, M.base, 0, 0.025, 0, null, 2, 1, 2);
    rb(0.45, 0.37, 0.60, 0.05, M.body, 0, 0.235, 0, null, 3, 6, 3);                   // тумба
    var Fp = K.face(0, 0.30);
    K.panel(Fp, 0.34, 0.17, 0.04, false, M.side, 0, 0.17, 0);
    add(new T.PlaneGeometry(0.22, 0.07), M.label, 0, 0.335, 0.0012, Fp, false);
    // бак для торфа сзади + крышка
    rb(0.43, 0.30, 0.20, 0.045, M.body, 0, 0.56, -0.20, null, 3, 5, 2);
    rb(0.45, 0.045, 0.22, 0.02, M.seatW, 0, 0.735, -0.20, null, 2, 1, 2);
    var bl = rb(0.20, 0.014, 0.03, 0.006, M.seatW, 0, 0.7625, -0.10, null, 1, 1, 1); bl.position.y = 0.742;
    // рычаг подачи торфа (слева)
    var ax = K.cyl(0.022, 0.022, 0.05, M.metal, -0.235, 0.60, -0.20); ax.rotation.z = PI / 2;
    var lev = rb(0.022, 0.022, 0.13, 0.008, M.metal, -0.255, 0.575, -0.13, null, 1, 1, 2); lev.rotation.x = 0.5;
    add(new T.SphereGeometry(0.02, 12, 8), M.seatW, -0.255, 0.53, -0.075);
    // сиденье с вырезом
    var ring = (function () { var sh = rrShape(T, 0.39, 0.37, 0.16); sh.holes.push(rrShape(T, 0.23, 0.25, 0.11)); return sh; })();
    var seat = add(extr(T, ring, 0.008, 3, 0.016), M.seatW, 0, 0.42, 0.07); seat.rotation.x = -PI / 2;
    var hole = add(new T.ShapeGeometry(rrShape(T, 0.235, 0.255, 0.11), 3), M.pocket, 0, 0.4205, 0.07, null, false); hole.rotation.x = -PI / 2;
    var tube = add(new T.CylinderGeometry(0.115, 0.095, 0.05, sg, 1, true), M.seatIn, 0, 0.402, 0.07, null, false); tube.scale.z = 1.08;
    // крышка на петле, приоткрыта
    var hg = new T.Group(); hg.position.set(0, 0.442, -0.115); hg.rotation.x = -62 * DEG; g.add(hg);
    var lid = add(extr(T, rrShape(T, 0.39, 0.37, 0.16), 0.008, 3, 0.012), M.seatW, 0, 0.0, 0.185, hg); lid.rotation.x = -PI / 2;
    add(new T.CapsuleGeometry(0.012, 0.09, 3, 8), M.seatW, 0, 0.018, 0.345, hg).rotation.z = PI / 2;
    [-0.12, 0.12].forEach(function (x) { var hn = K.cyl(0.013, 0.013, 0.06, M.metal, x, 0.438, -0.12); hn.rotation.z = PI / 2; });
    // ведро с торфом
    var bx = 0.42, bz = 0.12;
    var pts = [[0.001, 0], [0.098, 0], [0.103, 0.012], [0.132, 0.30], [0.138, 0.31], [0.128, 0.31], [0.124, 0.29], [0.096, 0.025], [0.001, 0.022]].map(function (p) { return new T.Vector2(p[0], p[1]); });
    var bk = add(new T.LatheGeometry(pts, sg + 4), M.bucket, bx, 0, bz); bk.material.side = T.DoubleSide;
    var bead = add(new T.TorusGeometry(0.134, 0.007, 8, sg + 6), M.bucket, bx, 0.305, bz); bead.rotation.x = PI / 2;
    var mound = add(new T.SphereGeometry(1, sg, 8, 0, 2 * PI, 0, PI / 2), M.peat, bx, 0.262, bz); mound.scale.set(0.126, 0.062, 0.126);
    var bail = add(new T.TorusGeometry(0.137, 0.006, 6, sg + 4, PI), M.metal, bx, 0.30, bz); bail.rotation.y = 0.0; bail.rotation.x = 0; bail.rotation.z = 0;
    var bg2 = new T.Group(); bg2.position.set(bx, 0.30, bz); bg2.rotation.x = -0.55; g.add(bg2); bg2.add(bail); bail.position.set(0, 0, 0);
    [-1, 1].forEach(function (sx) { add(new T.SphereGeometry(0.011, 8, 6), M.metal, bx + sx * 0.136, 0.30, bz); });
    // совок, воткнутый в торф
    var sc = new T.Group(); sc.position.set(bx + 0.02, 0.28, bz - 0.01); sc.rotation.set(0.25, 0, -0.35); g.add(sc);
    K.cyl(0.012, 0.012, 0.36, M.scoop, 0, 0.14, 0, sc, 8);
    add(new T.TorusGeometry(0.03, 0.009, 6, 12), M.scoop, 0, 0.33, 0, sc);
    var cup = add(new T.SphereGeometry(1, 12, 6, 0, PI, PI / 2, PI / 2), M.scoop, 0, -0.045, 0.01, sc); cup.scale.set(0.07, 0.05, 0.09); cup.material.side = T.DoubleSide;
    // россыпь торфа на земле
    var pile = add(new T.SphereGeometry(1, 14, 6, 0, 2 * PI, 0, PI / 2), M.peat, bx - 0.19, 0.004, bz + 0.2); pile.scale.set(0.07, 0.03, 0.055);
    var pile2 = add(new T.SphereGeometry(1, 10, 5, 0, 2 * PI, 0, PI / 2), M.peat, bx + 0.02, 0.004, bz + 0.25); pile2.scale.set(0.04, 0.017, 0.035);
    return g;
  }

  var PROFILES = {
    standart:    { dist: 1,    look: -0.08, blob: [2.3, 2.3, 0, 0], shadow: 2.2, span: 1,    scale: 1,   off: [0, 0] },
    rukomojnik:  { dist: 1.12, look: -0.08, blob: [2.5, 2.4, 0.2, 0], shadow: 2.4, span: 1.15, scale: 1,   off: [0.2, 0] },
    malomobilnye:{ dist: 1.34, look: -0.15, blob: [4.4, 3.0, 0, -0.55], shadow: 3.4, span: 2.0, scale: 1,  off: [0, -0.55] },
    uteplennaya: { dist: 1.05, look: -0.08, blob: [2.4, 2.4, 0, 0], shadow: 2.3, span: 1.05, scale: 1,  off: [0, 0] },
    torfyanoj:   { dist: 1,    look: -0.28, blob: [3.6, 2.4, 0.2, 0], shadow: 2.2, span: 1.25, scale: 2.5, off: [-0.38, -0.05] }
  };

  /* ---------- mount ---------- */
  function mount(el, options) {
    options = options || {};
    var T = global.THREE;
    var model = PROFILES[options.model] ? options.model : 'standart', prof = PROFILES[model];
    var outdoor = options.scene === 'outdoor', soft = options.shadow === 'soft' && !outdoor;
    var count = outdoor ? Math.max(1, Math.min(3, Math.round(options.count) || 1)) : 1;
    var colors = Object.assign({}, PRESETS.PRESET_E, options.colors || {});
    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var autoRotate = options.autoRotate !== false && !reduce;
    var drift = !!options.drift && !reduce;
    var scrollOn = !!options.scrollRotate && !reduce;
    var angle = (options.initialAngle != null ? options.initialAngle : (reduce ? 35 : 30)) * DEG;
    if (reduce && options.initialAngle == null) angle = 35 * DEG;

    el.classList.add('cabin3d');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', LABEL);
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

    var fb = document.createElement('div'); fb.className = 'cabin3d__fallback';
    while (el.firstChild) fb.appendChild(el.firstChild);
    el.appendChild(fb);

    var api = { destroy: function () {}, getAngle: function () { return angle / DEG; }, setAngle: function (a) { angle = a * DEG; }, ready: false, webgl: false, model: model, scene: outdoor ? 'outdoor' : 'studio' };
    if (!T || !hasWebGL()) return api;

    var quality = options.quality || ((global.innerWidth < 600 || (global.devicePixelRatio || 1) > 2) ? 'low' : 'high');
    var hi = quality !== 'low';
    api.quality = hi ? 'high' : 'low';

    var renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: hi ? 'default' : 'low-power' });
    } catch (e) { return api; }
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = outdoor ? 0.86 : 0.82;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.domElement.className = 'cabin3d__canvas';
    el.insertBefore(renderer.domElement, fb);
    api.webgl = true;

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(28, 1, 0.1, outdoor ? 80 : 50);
    var SUN_DIR = new T.Vector3(-4.0, 6.2, 3.6).normalize();
    var envRT = null;
    try { envRT = outdoor ? makeSkyEnv(T, renderer, SUN_DIR) : makeEnv(T, renderer); scene.environment = envRT.texture; } catch (e) { envRT = null; }

    var Q = hi ? { k: 4, mid: 3, ny: 28, bseg: 3, rings: 30, np: 132, cyl: 20, tex: 256, shadow: 2048, pr: 2 }
               : { k: 2, mid: 2, ny: 12, bseg: 2, rings: 16, np: 72, cyl: 12, tex: 128, shadow: 1024, pr: 1.25 };
    var QFAR = { k: 2, mid: 1, ny: 8, bseg: 1, rings: 10, np: 44, cyl: 8, tex: Q.tex, shadow: Q.shadow, pr: Q.pr };
    var maps = plasticMaps(T, Q.tex);
    var textures = [maps.normal, maps.rough];
    function aoHook(shader) {
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying float vWY;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWY = (modelMatrix * vec4(transformed, 1.0)).y - ' + GROUND_Y.toFixed(2) + ';');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vWY;')
        .replace('#include <color_fragment>', '#include <color_fragment>\n' +
          'float aoB = 1.0 - 0.22 * (1.0 - smoothstep(0.0, 0.5, vWY)); float aoT = 1.0 - 0.16 * smoothstep(1.9, 2.1, vWY) * (1.0 - smoothstep(2.11, 2.14, vWY));\n' +
          'diffuseColor.rgb *= aoB * aoT;');
    }
    function plastic(hex, o) {
      var m = new T.MeshPhysicalMaterial(Object.assign({ color: hex, roughness: 0.58, metalness: 0, clearcoat: 0.16, clearcoatRoughness: 0.4,
        normalMap: maps.normal, normalScale: new T.Vector2(0.14, 0.14), roughnessMap: maps.rough, envMapIntensity: 0.8 }, o || {}));
      m.onBeforeCompile = aoHook; m.customProgramCacheKey = function () { return 'cabinAO'; };
      return m;
    }
    function flat(hex, r, o) { return new T.MeshStandardMaterial(Object.assign({ color: hex, roughness: r == null ? 0.6 : r, metalness: 0 }, o || {})); }
    var pTex = pictoTex(T), sTex = stickerTex(T);
    textures.push(pTex, sTex);
    var X = {}; // текстуры вариантов (создаются лениво)
    function xt(name, make) { if (!X[name]) { X[name] = make(); textures.push(X[name]); } return X[name]; }

    function colorsFor(i) {
      var c = Object.assign({}, colors);
      if (options.colorsList && options.colorsList[i]) c = Object.assign({}, PRESETS.PRESET_E, options.colorsList[i]);
      return c;
    }
    function makeMats(colors, occupied) {
      var cBody = new T.Color(colors.body), cSide = new T.Color(colors.side || colors.body), cDoor = new T.Color(colors.door);
      var roofMode = options.roof, white = new T.Color('#F2F5F8'), cRoof = new T.Color(colors.roof);
      if (roofMode === 'white') cRoof = white; else if (roofMode === 'tinted') cRoof = white.clone().lerp(cBody, 0.38);
      var indTex = indicatorTex(T, !!occupied, colors.indicator);
      textures.push(indTex);
      var M = {
        body: plastic(cBody), side: plastic(cSide), post: plastic(cBody.clone().multiplyScalar(0.97)), door: plastic(cDoor),
        base: plastic(colors.base || '#2B3A4A', { roughness: 0.82, clearcoat: 0.0, normalScale: new T.Vector2(0.6, 0.6) }),
        baseLight: plastic(new T.Color(colors.base || '#2B3A4A').multiplyScalar(1.5), { roughness: 0.8, clearcoat: 0 }),
        roof: new T.MeshPhysicalMaterial({ color: cRoof, roughness: 0.42, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.3, sheen: 0.4, sheenColor: new T.Color('#ffffff'), sheenRoughness: 0.5,
          emissive: cRoof.clone().multiplyScalar(0.55), emissiveIntensity: 0.32, normalMap: maps.normal, normalScale: new T.Vector2(0.18, 0.18), roughnessMap: maps.rough, envMapIntensity: 0.9 }),
        rimRoof: plastic(cRoof.clone().multiplyScalar(0.97), { roughness: 0.5 }),
        slot: flat(0x1c2a3a, 0.5), gap: flat(0x06090d, 0.8), pocket: flat(0x05080b, 0.85),
        plate: flat(0xf1f4f7, 0.4), louvre: plastic(colors.accents ? new T.Color(colors.accents).lerp(cDoor, 0.5) : cDoor, { roughness: 0.5 }),
        metal: new T.MeshStandardMaterial({ color: 0xcdd2d8, metalness: 0.9, roughness: 0.35, envMapIntensity: 1.2 }),
        pipe: flat(0xdfe4e8, 0.45, { envMapIntensity: 1 }),
        picto: flat(0xffffff, 0.45, { map: pTex }),
        sticker: flat(0xffffff, 0.4, { map: sTex, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
        indicator: flat(0xffffff, 0.3, { map: indTex, emissive: new T.Color(0xffffff), emissiveMap: indTex, emissiveIntensity: 0.55 })
      };
      if (model === 'standart') return M;
      var cAcc = new T.Color(colors.accents || '#2F5F8F'), pm = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 };
      var porc = '#F0F3F5';
      if (model === 'rukomojnik') {
        M.sinkW = plastic(porc, { roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.2, normalScale: new T.Vector2(0.05, 0.05) });
        M.sinkIn = plastic('#E3E8EC', { roughness: 0.25, clearcoat: 0.6, side: T.DoubleSide, normalScale: new T.Vector2(0.03, 0.03) });
        M.pedal = plastic(cAcc.clone().multiplyScalar(0.8), { roughness: 0.6 });
        M.soapBody = plastic(cAcc.clone().lerp(new T.Color('#ffffff'), 0.25), { roughness: 0.4 });
        M.soapWin = flat('#9BD1F2', 0.15, { emissive: new T.Color('#5aa6d6'), emissiveIntensity: 0.25 });
        M.cabLabel = flat(0xffffff, 0.45, Object.assign({ transparent: true, map: xt('pedal', function () { return labelTex(T, '↓ НАЖМИ', 256, 256, '#1F3550', '#EEF2F5', '800 50px "Segoe UI",Arial,sans-serif'); }) }, pm));
      } else if (model === 'malomobilnye') {
        var ns = xt('nsMap', function () { var t = new T.CanvasTexture(nonslipCanvas()); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(7.8, 7.8); t.anisotropy = 4; return t; });
        var nb = xt('nsBump', function () { var t = new T.CanvasTexture(nonslipCanvas()); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(7.8, 7.8); t.anisotropy = 4; return t; });
        M.ramp = flat(0xffffff, 0.85, { map: ns, bumpMap: nb, bumpScale: 2.2 });
        M.floor = flat(0xffffff, 0.85, { map: ns, bumpMap: nb, bumpScale: 1.5 });
        M.yellow = flat('#E8B923', 0.6, pm);
        M.isa = flat(0xffffff, 0.4, { map: xt('isa', function () { return isaTex(T); }) });
        M.interior = flat('#D9DFE3', 0.6, { emissive: new T.Color('#9aa5ad'), emissiveIntensity: 0.4 });
        
        M.porc = plastic(porc, { roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.2, emissive: new T.Color('#8a949c'), emissiveIntensity: 0.3 });
        M.seatD = plastic('#DDE3E8', { roughness: 0.4, emissive: new T.Color('#8a949c'), emissiveIntensity: 0.3 });
      } else if (model === 'uteplennaya') {
        M.body = plastic(cBody, { normalScale: new T.Vector2(0.05, 0.05), clearcoat: 0.3, clearcoatRoughness: 0.25, roughness: 0.5 });
        M.trim = plastic(cAcc.clone().lerp(new T.Color('#1b2430'), 0.3), { roughness: 0.5, clearcoat: 0.25, normalScale: new T.Vector2(0.05, 0.05) });
        M.seam = flat(0x0d141b, 0.7); M.seamHi = flat(0xffffff, 0.5, { transparent: true, opacity: 0.35 });
        M.grille = plastic('#8a95a0', { roughness: 0.45, metalness: 0.4, clearcoat: 0 });
        M.frostTop = flat(0xffffff, 0.95, { map: xt('frostTop', function () { return frostTex(T, 256, 256, 'rim'); }), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
        M.frostSide = flat(0xffffff, 0.95, { map: xt('frostSide', function () { return frostTex(T, 512, 64, 'top'); }), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
      } else if (model === 'torfyanoj') {
        var pc = xt('peat', function () { var t = new T.CanvasTexture(peatCanvas()); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2, 2); return t; });
        var pb = xt('peatB', function () { var t = new T.CanvasTexture(peatCanvas()); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2, 2); return t; });
        M.peat = flat(0x8d8279, 1, { map: pc, bumpMap: pb, bumpScale: 3 });
        M.seatW = plastic('#F2F4F6', { roughness: 0.34, clearcoat: 0.45, clearcoatRoughness: 0.22, normalScale: new T.Vector2(0.06, 0.06) });
        M.seatIn = flat('#C9D0D6', 0.6, { side: T.BackSide });
        M.bucket = plastic(cDoor.clone().lerp(cAcc, 0.4), { roughness: 0.5 });
        M.scoop = plastic('#E7EBEE', { roughness: 0.45 });
        M.label = flat(0xffffff, 0.45, Object.assign({ transparent: true, map: xt('peatLbl', function () { return labelTex(T, 'ТОРФЯНОЙ', 384, 120, '#1F3550', '#F2F5F8', '800 62px "Segoe UI",Arial,sans-serif'); }) }, pm));
        M.body = plastic(cBody, { roughness: 0.5, clearcoat: 0.25, normalScale: new T.Vector2(0.1, 0.1) });
      }
      return M;
    }
    var BUILD = { standart: buildModel, rukomojnik: function (T, M, Q) { var g = buildModel(T, M, Q); addWashbasin(T, M, Q, g); return g; },
      malomobilnye: buildAccessible, uteplennaya: buildInsulated, torfyanoj: buildPeat };

    var pivot = new T.Group(), Ms = [], cabins = [], tris = 0;
    var LAYOUT = [[0, 1.1, 0], [-2.3, -0.9, 5 * DEG], [2.4, -1.8, -4 * DEG]];
    function build(i, qq) {
      var M = makeMats(colorsFor(i), i === 0 ? !!options.occupied : (count === 3 && i === 2));
      var cg = new T.Group(), mdl = BUILD[model](T, M, qq, { frost: options.frost });
      mdl.position.set(prof.off[0], GROUND_Y, prof.off[1]);
      if (prof.scale !== 1) mdl.scale.setScalar(prof.scale);
      cg.add(mdl);
      var lay = LAYOUT[i]; cg.position.set(lay[0] * prof.span, 0, count > 1 ? lay[1] * Math.max(1, prof.span * 0.9) - 0.2 : 0); cg.rotation.y = count > 1 ? lay[2] : 0;
      return { M: M, group: cg, model: mdl };
    }
    function countTris(grp) { var n = 0; grp.traverse(function (o) { if (o.isMesh) { var gm = o.geometry; n += (gm.index ? gm.index.count : gm.attributes.position.count) / 3; } }); return n; }
    function disposeCab(c) {
      c.group.traverse(function (o) { if (o.isMesh) o.geometry.dispose(); });
      Object.keys(c.M).forEach(function (n) { c.M[n].dispose(); });
    }
    var i;
    for (i = count - 1; i >= 0; i--) {
      cabins[i] = build(i, i === 0 ? Q : (hi ? QFAR : Q));
    }
    var BUDGET = 86000;
    function total() { var n = 0; cabins.forEach(function (c) { n += countTris(c.group); }); return n; }
    if (hi && count > 1 && total() > BUDGET) { // авто-снижение детализации главной кабины, чтобы уложиться в бюджет
      disposeCab(cabins[0]); cabins[0] = build(0, { k: 3, mid: 2, ny: 16, bseg: 2, rings: 20, np: 90, cyl: 14, tex: Q.tex, shadow: Q.shadow, pr: Q.pr });
      if (total() > BUDGET) { disposeCab(cabins[0]); cabins[0] = build(0, QFAR); }
    }
    cabins.forEach(function (c) { Ms.push(c.M); pivot.add(c.group); });
    tris = total();
    api.info = { triangles: Math.round(tris), quality: api.quality };

    var blobTex = new T.CanvasTexture(blobTexture());
    function makeBlob(w, d, op) {
      var b = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: op, toneMapped: false }));
      b.rotation.x = -PI / 2; b.renderOrder = 1; return b;
    }
    var extraDispose = [], groundMesh = null;
    if (!outdoor) {
      // земля: прозрачная, принимает мягкую тень + контактная тень
      var ground = new T.Mesh(new T.PlaneGeometry(16, 16), new T.ShadowMaterial({ opacity: soft ? 0.09 : 0.22 }));
      ground.rotation.x = -PI / 2; ground.position.y = GROUND_Y; ground.receiveShadow = true; if (!soft) scene.add(ground); // soft: только контактная тень
      var blob;
      if (model === 'standart') { blob = makeBlob(soft ? 2.9 : 2.3, soft ? 2.9 : 2.3, soft ? 0.8 : 0.55); blob.position.y = GROUND_Y + 0.002; scene.add(blob); }
      else cabins.forEach(function (c) { var b = makeBlob(prof.blob[0] * (soft ? 1.25 : 1), prof.blob[1] * (soft ? 1.25 : 1), soft ? 0.8 : 0.55); b.position.set(prof.blob[2], GROUND_Y + 0.002, prof.blob[3]); c.group.add(b); });
      extraDispose.push(ground);
    } else {
      var gm = groundMaps(T, hi ? 2048 : 1024); textures.push(gm.map, gm.normal, gm.alpha);
      groundMesh = new T.Mesh(new T.CircleGeometry(9.5, 72), new T.MeshStandardMaterial({ map: gm.map, normalMap: gm.normal, normalScale: new T.Vector2(0.9, 0.9), alphaMap: gm.alpha, transparent: true, depthWrite: false, roughness: 0.96, metalness: 0, envMapIntensity: 0.5 }));
      groundMesh.rotation.x = -PI / 2; groundMesh.position.y = GROUND_Y - 0.001; groundMesh.receiveShadow = true; scene.add(groundMesh);
      cabins.forEach(function (c) { var b = makeBlob(prof.blob[0], prof.blob[1], 0.5); b.position.set(prof.blob[2], GROUND_Y + 0.004, prof.blob[3]); c.group.add(b); });
      extraDispose.push(groundMesh);
      api.info.sceneTriangles = Math.round(tris + 72);
    }
    scene.add(pivot);

    var sun = new T.DirectionalLight(outdoor ? 0xffefd8 : 0xfff3e4, outdoor ? 2.9 : 2.2);
    var sc = sun.shadow.camera;
    if (outdoor) {
      var half = prof.shadow * (count > 1 ? 1.9 : 1.0) + (count > 1 ? 0.6 : 0);
      sun.position.copy(SUN_DIR).multiplyScalar(11).add(new T.Vector3(0, GROUND_Y, 0)); sun.target.position.set(0, GROUND_Y + 0.3, 0);
      sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half; sc.near = 1; sc.far = 26;
      sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.mapSize.set(hi ? 4096 : 2048, hi ? 4096 : 2048);
    } else {
      var hf = prof.shadow;
      sun.position.set(-3.4, GROUND_Y + 4.6, 3.0); sun.target.position.set(0, GROUND_Y + 1.0, 0);
      sun.shadow.mapSize.set(Q.shadow, Q.shadow);
      sc.left = -hf; sc.right = hf; sc.top = hf + 0.4; sc.bottom = -hf; sc.near = 1; sc.far = 14;
      sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.025;
    }
    sun.castShadow = true; sun.shadow.radius = hi ? 7 : 4;
    scene.add(sun); scene.add(sun.target);
    if (outdoor) {
      scene.add(new T.HemisphereLight(0xb8d6ff, 0x9a9275, 0.85));
      var fill = new T.DirectionalLight(0xcfe0ff, 0.35); fill.position.set(5, 2.5, 4); scene.add(fill);
    } else {
      scene.add(new T.HemisphereLight(0xdbe8ff, 0xb9b2a4, 0.18));
      var fill2 = new T.DirectionalLight(0xdfeaff, 0.45); fill2.position.set(4, 2, 3); scene.add(fill2);
    }

    var tilt = 0, tiltV = 0, angV = 0, driftAz = 0, driftEl = 0, scrollAng = 0, scrollTarget = 0, scrollDirty = true, scrollInit = true;
    var BASE_ELEV = (options.elevation != null ? options.elevation : (outdoor ? 11 : 9)) * DEG, MAXTILT = 15 * DEG;
    var CFX = Math.min(1.5, Math.max(1, prof.span * 0.95)), CFH = count === 1 ? 1 : [1, 1.3, 1.55][count - 1] * CFX, CFW = count === 1 ? 1 : [1, 1.8, 2.3][count - 1] * CFX;
    var dragging = false, lastX = 0, lastY = 0, lastT = 0, idleAt = 0, interacted = false;
    var visible = true, running = false, raf = 0, first = true, w = 0, h = 0, destroyed = false;
    var AUTO = (Math.PI * 2) / 20, RESUME = 2500;

    var hint = document.createElement('div'); hint.className = 'cabin3d__hint'; hint.setAttribute('aria-hidden', 'true');
    hint.textContent = '↻ Покрутите'; el.appendChild(hint);

    function setCamera() {
      var el_ = BASE_ELEV + tilt + driftEl, base = 6.4 * prof.dist;
      var dist = CFW === 1 ? Math.max(base, base * (1.0 / Math.min(1, camera.aspect * 1.05)))
                           : Math.max(base * CFH, base * CFW * (1.0 / (camera.aspect * 1.05)));
      var hd = Math.cos(el_) * dist;
      camera.position.set(Math.sin(driftAz) * hd, Math.sin(el_) * dist, Math.cos(driftAz) * hd);
      camera.lookAt(0, prof.look, 0);
    }
    function resize() {
      var r = el.getBoundingClientRect(); var nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
      if (nw === w && nh === h) return; w = nw; h = nh;
      renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, Q.pr));
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    function noteInteract() {
      if (!interacted) { interacted = true; hint.classList.remove('is-shown'); }
    }
    function onScroll() { scrollDirty = true; }
    function readScroll() {
      var r = el.getBoundingClientRect(), vh = global.innerHeight || 1;
      var p = ((vh / 2) - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
      p = Math.max(-1, Math.min(1, p));
      scrollTarget = Math.sin(p * PI / 2) * 25 * DEG; // плавная S-кривая, до ±25°
    }
    var last = 0;
    function frame(t) {
      raf = 0; if (!running || destroyed) return;
      var dt = last ? Math.min((t - last) / 1000, 0.1) : 0.016; last = t;
      if (!dragging) {
        angle += angV * dt;
        angV *= Math.pow(0.04, dt);
        if (Math.abs(angV) < 0.02) angV = 0;
        tilt += tiltV * dt; tiltV *= Math.pow(0.04, dt);
        if (Math.abs(tiltV) < 0.01) tiltV = 0;
        if (autoRotate && performance.now() - idleAt > RESUME) {
          angle += AUTO * dt * Math.min(1, (performance.now() - idleAt - RESUME) / 1000);
        }
        if (performance.now() - idleAt > RESUME) tilt *= Math.pow(0.5, dt);
      }
      tilt = Math.max(-MAXTILT, Math.min(MAXTILT, tilt));
      if (drift) { var ts = t / 1000; driftAz = Math.sin(ts * 0.17) * 5 * DEG + Math.sin(ts * 0.053 + 1.0) * 2 * DEG; driftEl = Math.sin(ts * 0.11 + 0.7) * 1.2 * DEG; }
      if (scrollOn) {
        if (scrollDirty) { scrollDirty = false; readScroll(); if (scrollInit) { scrollInit = false; scrollAng = scrollTarget; } }
        scrollAng += (scrollTarget - scrollAng) * (1 - Math.exp(-dt * 5));
      }
      pivot.rotation.y = angle + scrollAng; setCamera();
      renderer.render(scene, camera);
      if (first) {
        first = false; api.ready = true; el.classList.add('is-ready');
        if (typeof options.onReady === 'function') { try { options.onReady(api); } catch (e) {} }
        setTimeout(function () { if (!interacted && !destroyed) hint.classList.add('is-shown'); }, 400);
      }
      if (!options.static) schedule();
    }
    function schedule() { if (!raf && running) raf = requestAnimationFrame(frame); }
    function update() {
      var should = visible && !document.hidden && !destroyed;
      if (should && !running) { running = true; last = 0; idleAt = performance.now() - RESUME; scrollDirty = true; schedule(); }
      else if (!should && running) { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    }

    var pid = null;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; pid = e.pointerId; lastX = e.clientX; lastY = e.clientY; lastT = performance.now(); angV = 0; tiltV = 0;
      try { el.setPointerCapture(pid); } catch (er) {}
      el.classList.add('is-dragging'); noteInteract();
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pid) return;
      var now = performance.now(), dt = Math.max(1, now - lastT) / 1000;
      var dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; lastT = now;
      var k = (Math.PI * 1.6) / Math.max(200, w);
      var da = dx * k, dtilt = dy * k * 0.5;
      angle += da; tilt = Math.max(-MAXTILT, Math.min(MAXTILT, tilt + dtilt));
      angV = angV * 0.5 + (da / dt) * 0.5; tiltV = tiltV * 0.5 + (dtilt / dt) * 0.5;
      angV = Math.max(-9, Math.min(9, angV));
      idleAt = performance.now();
    });
    function end(e) {
      if (!dragging || (e && e.pointerId !== pid)) return;
      dragging = false; el.classList.remove('is-dragging'); idleAt = performance.now();
      if (performance.now() - lastT > 80) { angV = 0; tiltV = 0; }
      try { el.releasePointerCapture(pid); } catch (er) {}
    }
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    el.addEventListener('lostpointercapture', end);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        angV += (e.key === 'ArrowLeft' ? -1 : 1) * 2.2; idleAt = performance.now(); noteInteract(); e.preventDefault();
      }
    });

    var ro = global.ResizeObserver ? new ResizeObserver(function () { resize(); if (!running || options.static) { setCamera(); renderer.render(scene, camera); } }) : null;
    if (ro) ro.observe(el);
    var io = global.IntersectionObserver ? new IntersectionObserver(function (en) { visible = en[en.length - 1].isIntersecting; update(); }) : null;
    if (io) io.observe(el);
    function vis() { update(); }
    document.addEventListener('visibilitychange', vis);
    if (scrollOn) global.addEventListener('scroll', onScroll, { passive: true, capture: true });
    resize(); update();

    api.destroy = function () {
      destroyed = true; update(); if (ro) ro.disconnect(); if (io) io.disconnect();
      document.removeEventListener('visibilitychange', vis);
      if (scrollOn) global.removeEventListener('scroll', onScroll, { passive: true, capture: true });
      scene.traverse(function (o) { if (o.isMesh && o.geometry) o.geometry.dispose(); });
      Ms.forEach(function (M) { Object.keys(M).forEach(function (n) { M[n].dispose(); }); });
      extraDispose.forEach(function (o) { if (o.material) o.material.dispose(); });
      textures.concat([blobTex]).forEach(function (t) { t.dispose(); });
      if (envRT) envRT.dispose();
      renderer.dispose(); if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      if (hint.parentNode) hint.parentNode.removeChild(hint);
      el.classList.remove('is-ready');
    };
    api.getTilt = function () { return tilt / DEG; };
    return api;
  }

  global.Cabin3D = { mount: mount, PRESETS: PRESETS, PRESET_E: PRESETS.PRESET_E, PRESET_F: PRESETS.PRESET_F, PRESET_CLASSIC: PRESETS.PRESET_CLASSIC, MODELS: Object.keys(PROFILES) };
})(window);

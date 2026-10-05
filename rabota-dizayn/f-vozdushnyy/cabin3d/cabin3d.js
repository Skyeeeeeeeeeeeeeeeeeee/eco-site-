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
  function domeGeo(T, wid, dep, rr, rise, rings, np, amp) {
    var pts = rrShape(T, wid, dep, rr).getSpacedPoints(np); pts.pop();
    var pos = [], uv = [], idx = [], i, j, ridgeC = [-0.3, 0, 0.3];
    function ridge(x) { var v = 0; for (var c = 0; c < 3; c++) { var t = (x - ridgeC[c]) / 0.105; v += Math.exp(-t * t * t * t); } return v; }
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

  /* ---------- mount ---------- */
  function mount(el, options) {
    options = options || {};
    var T = global.THREE;
    var colors = Object.assign({}, PRESETS.PRESET_E, options.colors || {});
    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var autoRotate = options.autoRotate !== false && !reduce;
    var angle = (options.initialAngle != null ? options.initialAngle : (reduce ? 35 : 30)) * DEG;
    if (reduce && options.initialAngle == null) angle = 35 * DEG;

    el.classList.add('cabin3d');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', LABEL);
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

    var fb = document.createElement('div'); fb.className = 'cabin3d__fallback';
    while (el.firstChild) fb.appendChild(el.firstChild);
    el.appendChild(fb);

    var api = { destroy: function () {}, getAngle: function () { return angle / DEG; }, setAngle: function (a) { angle = a * DEG; }, ready: false, webgl: false };
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
    renderer.toneMappingExposure = 0.82;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.domElement.className = 'cabin3d__canvas';
    el.insertBefore(renderer.domElement, fb);
    api.webgl = true;

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(28, 1, 0.1, 50);
    var envRT = null; try { envRT = makeEnv(T, renderer); scene.environment = envRT.texture; } catch (e) { envRT = null; }

    var Q = hi ? { k: 4, mid: 3, ny: 28, bseg: 3, rings: 30, np: 132, cyl: 20, tex: 256, shadow: 2048, pr: 2 }
               : { k: 2, mid: 2, ny: 12, bseg: 2, rings: 16, np: 72, cyl: 12, tex: 128, shadow: 1024, pr: 1.25 };
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
    var cBody = new T.Color(colors.body), cSide = new T.Color(colors.side || colors.body), cDoor = new T.Color(colors.door);
    var roofMode = options.roof, white = new T.Color('#F2F5F8'), cRoof = new T.Color(colors.roof);
    if (roofMode === 'white') cRoof = white; else if (roofMode === 'tinted') cRoof = white.clone().lerp(cBody, 0.38);
    var indTex = indicatorTex(T, !!options.occupied, colors.indicator), pTex = pictoTex(T), sTex = stickerTex(T);
    textures.push(indTex, pTex, sTex);
    function flat(hex, r, o) { return new T.MeshStandardMaterial(Object.assign({ color: hex, roughness: r == null ? 0.6 : r, metalness: 0 }, o || {})); }
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
    var pivot = new T.Group();
    var model = buildModel(T, M, Q);
    model.position.y = GROUND_Y;
    pivot.add(model);
    var tris = 0, geos = [];
    model.traverse(function (o) { if (o.isMesh) { var gm = o.geometry; tris += (gm.index ? gm.index.count : gm.attributes.position.count) / 3; geos.push(gm); } });
    api.info = { triangles: Math.round(tris), quality: api.quality };

    // земля: прозрачная, принимает мягкую тень + контактная тень
    var ground = new T.Mesh(new T.PlaneGeometry(16, 16), new T.ShadowMaterial({ opacity: 0.22 }));
    ground.rotation.x = -PI / 2; ground.position.y = GROUND_Y; ground.receiveShadow = true; scene.add(ground);
    var blobTex = new T.CanvasTexture(blobTexture());
    var blob = new T.Mesh(new T.PlaneGeometry(2.3, 2.3), new T.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.55, toneMapped: false }));
    blob.rotation.x = -PI / 2; blob.position.y = GROUND_Y + 0.002; blob.renderOrder = 1; scene.add(blob);
    scene.add(pivot);

    var sun = new T.DirectionalLight(0xfff3e4, 2.2);
    sun.position.set(-3.4, GROUND_Y + 4.6, 3.0); sun.target.position.set(0, GROUND_Y + 1.0, 0);
    sun.castShadow = true; sun.shadow.mapSize.set(Q.shadow, Q.shadow);
    var sc = sun.shadow.camera; sc.left = -2.2; sc.right = 2.2; sc.top = 2.6; sc.bottom = -2.2; sc.near = 1; sc.far = 14;
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.025; sun.shadow.radius = hi ? 7 : 4;
    scene.add(sun); scene.add(sun.target);
    scene.add(new T.HemisphereLight(0xdbe8ff, 0xb9b2a4, 0.18));
    var fill = new T.DirectionalLight(0xdfeaff, 0.45); fill.position.set(4, 2, 3); scene.add(fill);

    var tilt = 0, tiltV = 0, angV = 0;
    var BASE_ELEV = 9 * DEG, MAXTILT = 15 * DEG;
    var dragging = false, lastX = 0, lastY = 0, lastT = 0, idleAt = 0, interacted = false;
    var visible = true, running = false, raf = 0, first = true, w = 0, h = 0, destroyed = false;
    var AUTO = (Math.PI * 2) / 20, RESUME = 2500;

    var hint = document.createElement('div'); hint.className = 'cabin3d__hint'; hint.setAttribute('aria-hidden', 'true');
    hint.textContent = '↻ Покрутите'; el.appendChild(hint);

    function setCamera() {
      var el_ = BASE_ELEV + tilt, dist = Math.max(6.4, 6.4 * (1.0 / Math.min(1, camera.aspect * 1.05)));
      camera.position.set(0, Math.sin(el_) * dist, Math.cos(el_) * dist);
      camera.lookAt(0, -0.08, 0);
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
      pivot.rotation.y = angle; setCamera();
      renderer.render(scene, camera);
      if (first) {
        first = false; api.ready = true; el.classList.add('is-ready');
        if (typeof options.onReady === 'function') { try { options.onReady(api); } catch (e) {} }
        setTimeout(function () { if (!interacted && !destroyed) hint.classList.add('is-shown'); }, 400);
      }
      schedule();
    }
    function schedule() { if (!raf && running) raf = requestAnimationFrame(frame); }
    function update() {
      var should = visible && !document.hidden && !destroyed;
      if (should && !running) { running = true; last = 0; idleAt = performance.now() - RESUME; schedule(); }
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

    var ro = global.ResizeObserver ? new ResizeObserver(function () { resize(); if (!running) { setCamera(); renderer.render(scene, camera); } }) : null;
    if (ro) ro.observe(el);
    var io = global.IntersectionObserver ? new IntersectionObserver(function (en) { visible = en[en.length - 1].isIntersecting; update(); }) : null;
    if (io) io.observe(el);
    function vis() { update(); }
    document.addEventListener('visibilitychange', vis);
    resize(); update();

    api.destroy = function () {
      destroyed = true; update(); if (ro) ro.disconnect(); if (io) io.disconnect();
      document.removeEventListener('visibilitychange', vis);
      geos.forEach(function (gm) { gm.dispose(); });
      Object.keys(M).forEach(function (n) { M[n].dispose(); });
      textures.concat([blobTex]).forEach(function (t) { t.dispose(); });
      if (envRT) envRT.dispose();
      renderer.dispose(); if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      if (hint.parentNode) hint.parentNode.removeChild(hint);
      el.classList.remove('is-ready');
    };
    api.getTilt = function () { return tilt / DEG; };
    return api;
  }

  global.Cabin3D = { mount: mount, PRESETS: PRESETS, PRESET_E: PRESETS.PRESET_E, PRESET_F: PRESETS.PRESET_F, PRESET_CLASSIC: PRESETS.PRESET_CLASSIC };
})(window);

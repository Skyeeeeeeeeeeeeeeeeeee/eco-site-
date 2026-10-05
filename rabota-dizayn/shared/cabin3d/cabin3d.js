/* Cabin3D: процедурная 3D-модель биотуалета. Классический скрипт, требует window.THREE (vendor/three.min.js). */
(function (global) {
  'use strict';
  var PRESETS = {
    PRESET_E: { body: '#7FB2E5', side: '#5E95CC', roof: '#A9CFF3', door: '#4A7FB6', accents: '#2F5F8F', indicator: '#3BB273' },
    PRESET_F: { body: '#8DBCEB', side: '#6AA2DA', roof: '#B8D8F5', door: '#5A90C8', accents: '#2F5F8F', indicator: '#3BB273' }
  };
  var LABEL = '3D-модель туалетной кабины. Перетащите, чтобы повернуть';
  var DEG = Math.PI / 180;

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(global.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  function buildModel(T, mats) {
    var g = new T.Group();
    function box(w, h, d, x, y, z, m, parent) {
      var mesh = new T.Mesh(new T.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z);
      (parent || g).add(mesh);
      return mesh;
    }
    var W = 1.1, D = 1.1, H = 2.3, SK = 0.1, TOP = H;
    var wallH = TOP - SK - 0.12; // до кровельной рамы
    var wy = SK + wallH / 2;

    // основание / салазки
    box(W + 0.06, SK, D + 0.06, 0, SK / 2, 0, mats.accents);
    box(W - 0.02, 0.03, D - 0.02, 0, SK + 0.015, 0, mats.side);

    // стены
    box(W - 0.12, wallH, 0.06, 0, wy, -D / 2 + 0.05, mats.body);            // задняя
    [-1, 1].forEach(function (s) {
      var x = s * (W / 2 - 0.05);
      box(0.06, wallH, D - 0.12, x, wy, 0, mats.side);                       // боковая
      // вертикальные рёбра
      for (var i = 0; i < 7; i++) {
        var z = -0.40 + i * 0.1333;
        box(0.03, wallH - 0.36, 0.055, s * (W / 2 - 0.015), wy - 0.04, z, mats.side);
      }
      // вентиляционные прорези у верха
      for (var j = 0; j < 4; j++) box(0.02, 0.03, 0.28, s * (W / 2 + 0.002), TOP - 0.34 - j * 0.055, 0.0, mats.dark);
    });
    // задние рёбра
    for (var k = 0; k < 6; k++) box(0.4 / 3, wallH - 0.4, 0.03, -0.37 + k * 0.148, wy - 0.05, -D / 2 + 0.005, mats.body);

    // угловые стойки
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) {
      box(0.12, wallH + 0.06, 0.12, c[0] * (W / 2 - 0.06), wy + 0.01, c[1] * (D / 2 - 0.06), mats.post);
    });

    // лицевая рама
    var fz = D / 2 - 0.06;
    var doorW = 0.78, doorH = 1.84, doorY = SK + 0.03 + doorH / 2 + 0.04;
    box(W - 0.12, 0.2, 0.08, 0, SK + 0.1, fz, mats.body);                    // нижняя планка
    box(W - 0.12, TOP - 0.12 - (doorY + doorH / 2) - 0.0, 0.08, 0, (TOP - 0.12 + doorY + doorH / 2) / 2, fz, mats.body); // верхняя
    [-1, 1].forEach(function (s) {
      box((W - 0.12 - doorW) / 2, wallH, 0.08, s * (doorW / 2 + (W - 0.12 - doorW) / 4), wy, fz, mats.body);
    });
    // рамка двери (накладная)
    box(doorW + 0.07, 0.035, 0.03, 0, doorY + doorH / 2 + 0.02, fz + 0.04, mats.accents);
    [-1, 1].forEach(function (s) { box(0.035, doorH + 0.07, 0.03, s * (doorW / 2 + 0.02), doorY, fz + 0.04, mats.accents); });
    // дверь (утоплена)
    box(doorW, doorH, 0.04, 0, doorY, fz - 0.015, mats.door);
    // горизонтальные углубления на двери
    box(doorW - 0.14, 0.5, 0.012, 0, doorY - 0.55, fz + 0.012, mats.doorDark);
    box(doorW - 0.14, 0.42, 0.012, 0, doorY + 0.62, fz + 0.012, mats.doorDark);
    // жалюзи вверху двери
    for (var l = 0; l < 4; l++) box(doorW - 0.3, 0.018, 0.02, 0, doorY + doorH / 2 - 0.12 - l * 0.045, fz + 0.016, mats.accents);
    // петли
    [0.45, -0.45, -0.75].forEach(function (dy) { box(0.03, 0.14, 0.04, -doorW / 2 - 0.005, doorY + dy, fz + 0.03, mats.accents); });
    // ручка
    var hy = SK + 0.03 + 1.0;
    var plate = box(0.1, 0.26, 0.015, doorW / 2 - 0.1, hy, fz + 0.016, mats.accents);
    box(0.035, 0.16, 0.05, doorW / 2 - 0.1, hy - 0.02, fz + 0.04, mats.handle);
    // индикатор «свободно»
    box(0.14, 0.075, 0.012, doorW / 2 - 0.1, hy + 0.27, fz + 0.019, mats.accents);
    box(0.115, 0.048, 0.014, doorW / 2 - 0.1, hy + 0.27, fz + 0.022, mats.indicator);

    // крыша
    var ry = TOP - 0.06;
    box(W + 0.08, 0.05, D + 0.08, 0, ry + 0.0, 0, mats.accents);              // рама-обод
    box(W - 0.06, 0.06, D - 0.06, 0, TOP - 0.1, 0, mats.body);
    box(W - 0.14, 0.06, D - 0.14, 0, TOP + 0.015, 0, mats.roof);                // светлая панель
    box(W - 0.4, 0.04, D - 0.4, 0, TOP + 0.065, 0, mats.roof);                // лёгкий купол
    // вентиляционная труба в заднем углу
    var pipe = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.34, 20), mats.pipe);
    pipe.position.set(W / 2 - 0.16, TOP + 0.17, -D / 2 + 0.16); g.add(pipe);
    var cap = new T.Mesh(new T.CylinderGeometry(0.075, 0.075, 0.05, 20), mats.accents);
    cap.position.set(W / 2 - 0.16, TOP + 0.35, -D / 2 + 0.16); g.add(cap);
    var coll = new T.Mesh(new T.CylinderGeometry(0.065, 0.065, 0.04, 20), mats.accents);
    coll.position.set(W / 2 - 0.16, TOP + 0.04, -D / 2 + 0.16); g.add(coll);

    g.traverse(function (o) { if (o.isMesh) { o.castShadow = false; } });
    return g;
  }

  function shadowTexture() {
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var x = c.getContext('2d');
    var gr = x.createRadialGradient(64, 64, 6, 64, 64, 62);
    gr.addColorStop(0, 'rgba(20,40,70,0.55)');
    gr.addColorStop(0.55, 'rgba(20,40,70,0.25)');
    gr.addColorStop(1, 'rgba(20,40,70,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    return c;
  }

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

    // запасной контент: оборачиваем существующие дочерние узлы
    var fb = document.createElement('div'); fb.className = 'cabin3d__fallback';
    while (el.firstChild) fb.appendChild(el.firstChild);
    el.appendChild(fb);

    var api = { destroy: function () {}, getAngle: function () { return angle / DEG; }, setAngle: function (a) { angle = a * DEG; }, ready: false, webgl: false };
    if (!T || !hasWebGL()) return api;

    var renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) { return api; }
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'cabin3d__canvas';
    el.insertBefore(renderer.domElement, fb);
    api.webgl = true;

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(28, 1, 0.1, 50);
    function std(hex, extra) {
      return new T.MeshStandardMaterial(Object.assign({ color: hex, roughness: 0.55, metalness: 0 }, extra || {}));
    }
    var mats = {
      body: std(colors.body), side: std(colors.side), door: std(colors.door), accents: std(colors.accents),
      roof: std(colors.roof, { transparent: true, opacity: 0.78, roughness: 0.35 }),
      indicator: std(colors.indicator, { emissive: new T.Color(colors.indicator), emissiveIntensity: 0.35 }),
      post: std(new T.Color(colors.body).lerp(new T.Color(colors.accents), 0.25)), dark: std(0x1d3550), handle: std(0xe9eef4, { roughness: 0.4 }), pipe: std(0xdfe8f2),
      doorDark: std(new T.Color(colors.door).multiplyScalar(0.92))
    };
    var pivot = new T.Group();
    var model = buildModel(T, mats);
    model.position.y = -1.15; // центр по высоте
    pivot.add(model);
    // контактная тень
    var sh = new T.Mesh(new T.PlaneGeometry(2.6, 2.6), new T.MeshBasicMaterial({ map: new T.CanvasTexture(shadowTexture()), transparent: true, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = -1.148;
    scene.add(sh);
    scene.add(pivot);

    scene.add(new T.HemisphereLight(0xffffff, 0xb8cce3, 2.3));
    var key = new T.DirectionalLight(0xffffff, 2.0); key.position.set(3, 5, 4); scene.add(key);
    var fill = new T.DirectionalLight(0xdfeaff, 0.8); fill.position.set(-4, 2, -2); scene.add(fill);

    var tilt = 0, tiltV = 0, angV = 0; // рад, рад/с
    var BASE_ELEV = 9 * DEG, MAXTILT = 15 * DEG;
    var dragging = false, lastX = 0, lastY = 0, lastT = 0, idleAt = 0, interacted = false;
    var visible = true, running = false, raf = 0, first = true, w = 0, h = 0, destroyed = false;
    var AUTO = (Math.PI * 2) / 20, RESUME = 2500;

    var hint = document.createElement('div'); hint.className = 'cabin3d__hint'; hint.setAttribute('aria-hidden', 'true');
    hint.textContent = '↻ Покрутите'; el.appendChild(hint);

    function setCamera() {
      var el_ = BASE_ELEV + tilt, dist = Math.max(6.9, 6.9 * (1.0 / Math.min(1, camera.aspect * 1.05)));
      camera.position.set(0, Math.sin(el_) * dist, Math.cos(el_) * dist);
      camera.lookAt(0, 0.0, 0);
    }
    function resize() {
      var r = el.getBoundingClientRect(); var nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
      if (nw === w && nh === h) return; w = nw; h = nh;
      renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
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
        angV *= Math.pow(0.04, dt); // затухание инерции
        if (Math.abs(angV) < 0.02) angV = 0;
        tilt += tiltV * dt; tiltV *= Math.pow(0.04, dt);
        if (Math.abs(tiltV) < 0.01) tiltV = 0;
        if (autoRotate && performance.now() - idleAt > RESUME) {
          angle += AUTO * dt * Math.min(1, (performance.now() - idleAt - RESUME) / 1000); // плавный разгон
        }
        // тилт мягко возвращается к 0 после паузы
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

    // управление
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
      var k = (Math.PI * 1.6) / Math.max(200, w); // ширина контейнера ≈ 290°
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
    // колесо/pinch не перехватываем — ничего не слушаем

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
      renderer.dispose(); if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      if (hint.parentNode) hint.parentNode.removeChild(hint);
      el.classList.remove('is-ready');
    };
    api.getTilt = function () { return tilt / DEG; };
    return api;
  }

  global.Cabin3D = { mount: mount, PRESETS: PRESETS, PRESET_E: PRESETS.PRESET_E, PRESET_F: PRESETS.PRESET_F };
})(window);

/* Первый экран, вариант D: 3D-модель кабины МТК Стандарт.
   Сначала видна картинка-постер (img), после загрузки страницы в фоне подгружаются three.js и модель,
   и поверх постера плавно появляется живая сцена. Нет WebGL, режим экономии трафика или ошибка — остаётся постер.
   Модель: файл клиента (3ds Max), сконвертирован в glTF, см. src/models/README.md. */
(function () {
  'use strict';
  var el = document.querySelector('[data-cab3d]');
  if (!el) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var save = navigator.connection && navigator.connection.saveData;
  if (save || !hasGL()) return;

  function hasGL() {
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
  }
  function load(src) {
    return new Promise(function (ok, fail) { var s = document.createElement('script'); s.src = src; s.async = true; s.onload = ok; s.onerror = fail; document.head.appendChild(s); });
  }
  function start() {
    load(el.getAttribute('data-lib')).then(function () { return load(el.getAttribute('data-model')); }).then(init).catch(function () { /* остаётся постер */ });
  }
  function later() { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(start, { timeout: 2000 }); }
  if (document.readyState === 'complete') later(); else window.addEventListener('load', later);

  function init() {
    var T = window.THREE3, b64 = window.CABIN_GLB;
    if (!T || !b64) return;
    var bin = atob(b64), buf = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);

    var canvas = document.createElement('canvas');
    canvas.className = 'hero-d__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    var r = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    r.outputColorSpace = T.SRGBColorSpace;
    r.toneMapping = T.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;

    var scene = new T.Scene();
    var pm = new T.PMREMGenerator(r);
    scene.environment = pm.fromScene(new T.RoomEnvironment(), 0.04).texture;
    scene.add(new T.HemisphereLight(0xffffff, 0xb9cbe0, 0.6));
    var sun = new T.DirectionalLight(0xffffff, 1.6); sun.position.set(2, 4, 3); scene.add(sun);

    var cs = getComputedStyle(el);
    var blue = new T.MeshStandardMaterial({ color: new T.Color((cs.getPropertyValue('--cab-body') || '#2F86D6').trim()), roughness: 0.42, metalness: 0 });
    var white = new T.MeshStandardMaterial({ color: new T.Color((cs.getPropertyValue('--cab-roof') || '#F3F6F9').trim()), roughness: 0.5, metalness: 0, side: T.DoubleSide });
    var grey = new T.MeshStandardMaterial({ color: 0x9aa7b4, roughness: 0.35, metalness: 0.4 });

    new T.GLTFLoader().parse(buf.buffer, '', function (g) {
      var model = g.scene;
      model.traverse(function (o) {
        if (!o.isMesh) return;
        var n = (o.material && o.material.name) || '';
        o.material = /Matesdf/.test(n) ? (/Plane005/.test(o.name) ? grey : white) : blue;
      });
      // центр и масштаб: высота кабины = 1 единица, низ на нуле
      var box = new T.Box3().setFromObject(model), size = box.getSize(new T.Vector3()), c = box.getCenter(new T.Vector3());
      var k = 1 / size.y;
      model.scale.setScalar(k);
      model.position.set(-c.x * k, -box.min.y * k, -c.z * k);
      var pivot = new T.Group(); pivot.add(model); scene.add(pivot);

      // мягкая тень на «полу»
      var sc = document.createElement('canvas'); sc.width = sc.height = 128;
      var x = sc.getContext('2d'), gr = x.createRadialGradient(64, 64, 4, 64, 64, 64);
      gr.addColorStop(0, 'rgba(12,27,42,.34)'); gr.addColorStop(1, 'rgba(12,27,42,0)');
      x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
      var shadow = new T.Mesh(new T.PlaneGeometry(1.05, 1.05), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sc), transparent: true, depthWrite: false }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; scene.add(shadow);

      var cam = new T.PerspectiveCamera(26, 1, 0.05, 20);
      function frame() {
        var w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
        r.setSize(w, h, false); cam.aspect = w / h;
        // вписываем кабину по высоте и по ширине кадра
        var fit = Math.max(1.32, 0.78 / cam.aspect + 0.3);
        var d = fit / (2 * Math.tan(cam.fov * Math.PI / 360));
        cam.position.set(0, 0.62 + d * 0.16, d); cam.lookAt(0, 0.5, 0); cam.updateProjectionMatrix();
      }
      frame();

      // вращение: медленно само, пальцем или мышью по горизонтали; с инерцией
      var yaw = -0.55, vel = 0, auto = reduce ? 0 : 0.0035, drag = false, lx = 0, idleT = 0;
      el.addEventListener('pointerdown', function (e) { drag = true; lx = e.clientX; vel = 0; el.classList.add('is-drag'); try { el.setPointerCapture(e.pointerId); } catch (_) {} });
      el.addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; vel = dx * 0.008; yaw += vel; kick(); });
      function up() { if (!drag) return; drag = false; idleT = performance.now(); el.classList.remove('is-drag'); el.classList.add('is-touched'); }
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      // клавиатура
      el.tabIndex = 0;
      el.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { yaw += e.key === 'ArrowLeft' ? -0.25 : 0.25; idleT = performance.now(); kick(); e.preventDefault(); } });

      var on = true, raf = 0;
      function tick(t) {
        raf = 0;
        if (!drag) {
          vel *= 0.94; yaw += vel;
          if (Math.abs(vel) < 0.0005 && t - idleT > 1800) yaw += auto;
        }
        pivot.rotation.y = yaw;
        r.render(scene, cam);
        var moving = drag || Math.abs(vel) > 0.0005 || auto;
        if (on && moving) raf = requestAnimationFrame(tick);
      }
      function kick() { if (on && !raf) raf = requestAnimationFrame(tick); }

      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { on = en[0].isIntersecting && !document.hidden; kick(); }).observe(el);
      document.addEventListener('visibilitychange', function () { on = !document.hidden; kick(); });
      var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { frame(); kick(); }, 120); });

      el.appendChild(canvas);
      r.render(scene, cam);
      requestAnimationFrame(function () { el.classList.add('is-3d'); kick(); });
    }, function () { /* ошибка разбора: остаётся постер */ });
  }
})();

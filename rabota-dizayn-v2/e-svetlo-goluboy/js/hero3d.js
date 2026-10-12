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

    r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;

    // Сцена в метрах и в перспективе фотографии фона (img.hero-d__bg): камера на высоте глаз 1,6 м,
    // горизонт фото совмещён с горизонтом камеры (HZ от верха сцены), кабина 2,3 м стоит на площади в ~8 м от камеры.
    var C = {}; try { C = JSON.parse(el.getAttribute('data-cfg') || '{}'); } catch (e) {}
    var HZ = C.hz || 0.62, EYE = 1.6, DIST = C.dist || 8.2, X = C.x || 0, SUN = C.sun || [-9, 6.5, 1.5]; // параметры из SITE.hero3d
    var scene = new T.Scene();
    var pm = new T.PMREMGenerator(r);
    scene.environment = pm.fromScene(new T.RoomEnvironment(), 0.04).texture;
    scene.add(new T.HemisphereLight(0xcfe3ff, 0x8a8170, 0.3));          // небо сверху, тёплый отсвет плитки снизу
    var sun = new T.DirectionalLight(new T.Color(C.sunColor || '#fff1dc'), 2.6);                    // солнце как на фото: слева-спереди, высоко
    sun.position.set(X + SUN[0], SUN[1], -DIST + SUN[2]); sun.target.position.set(X, 0, -DIST);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.radius = 4; sun.shadow.bias = -0.0005;
    var sc0 = sun.shadow.camera; sc0.left = -4; sc0.right = 4; sc0.top = 4; sc0.bottom = -4; sc0.near = 1; sc0.far = 30;
    scene.add(sun, sun.target);

    var cs = getComputedStyle(el);
    var blue = new T.MeshStandardMaterial({ color: new T.Color((cs.getPropertyValue('--cab-body') || '#2F86D6').trim()), roughness: 0.45, metalness: 0, envMapIntensity: 0.32 });
    var white = new T.MeshStandardMaterial({ color: new T.Color((cs.getPropertyValue('--cab-roof') || '#F3F6F9').trim()), roughness: 0.5, metalness: 0, side: T.DoubleSide, envMapIntensity: 0.38 });
    var grey = new T.MeshStandardMaterial({ color: 0x9aa7b4, roughness: 0.35, metalness: 0.4 });

    new T.GLTFLoader().parse(buf.buffer, '', function (g) {
      var model = g.scene;
      model.traverse(function (o) {
        if (!o.isMesh) return;
        var n = (o.material && o.material.name) || '';
        o.material = /Matesdf/.test(n) ? (/Plane005/.test(o.name) ? grey : white) : blue;
        o.castShadow = true;
      });
      // масштаб в метрах: высота кабины 2,3 м, низ на земле, центр на оси вращения
      var box = new T.Box3().setFromObject(model), size = box.getSize(new T.Vector3()), c = box.getCenter(new T.Vector3());
      var k = 2.3 / size.y;
      model.scale.setScalar(k);
      model.position.set(-c.x * k, -box.min.y * k, -c.z * k);
      var pivot = new T.Group(); pivot.add(model); pivot.position.set(X, 0, -DIST); scene.add(pivot);

      // земля: принимает только тень (прозрачная), плюс тёмное пятно контакта под кабиной
      var ground = new T.Mesh(new T.PlaneGeometry(30, 30), new T.ShadowMaterial({ opacity: 0.6 }));
      ground.rotation.x = -Math.PI / 2; ground.position.set(X, 0, -DIST); ground.receiveShadow = true; scene.add(ground);
      var sc = document.createElement('canvas'); sc.width = sc.height = 128;
      var x = sc.getContext('2d'), gr = x.createRadialGradient(64, 64, 10, 64, 64, 64);
      gr.addColorStop(0, 'rgba(20,18,14,.55)'); gr.addColorStop(1, 'rgba(20,18,14,0)');
      x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
      var ao = new T.Mesh(new T.PlaneGeometry(1.9, 1.9), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sc), transparent: true, depthWrite: false }));
      ao.rotation.x = -Math.PI / 2; ao.position.set(X, 0.003, -DIST); scene.add(ao);

      var cam = new T.PerspectiveCamera(40, 1, 0.1, 100);
      cam.position.set(0, EYE, 0); cam.lookAt(0, EYE, -1);               // взгляд строго горизонтально
      function frame() {
        var w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
        r.setSize(w, h, false);
        // кадр — окно в «полном» кадре высотой F, где горизонт посередине: так горизонт оказывается на HZ высоты сцены
        var F = 2 * HZ * h, f = h / (2 * Math.tan(17 * Math.PI / 180)); // ~34° по вертикали в видимом окне
        cam.fov = 2 * Math.atan((F / 2) / f) * 180 / Math.PI;
        cam.aspect = w / F;
        cam.setViewOffset(w, F, 0, 0, w, h);
        cam.updateProjectionMatrix();
      }
      frame();

      // вращение: медленно само, пальцем или мышью по горизонтали; с инерцией
      // авто: ~0.1 рад/с, один оборот примерно за минуту; при reduced motion не крутится сама
      var yaw = -0.55, vel = 0, auto = reduce ? 0 : 0.1, drag = false, lx = 0, idleT = 0, last = 0;
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
        var dt = last ? Math.min((t - last) / 1000, 0.05) : 0; last = t;
        if (!drag) {
          vel *= 0.94; yaw += vel;
          if (Math.abs(vel) < 0.0005 && t - idleT > 1800) yaw += auto * dt;
        }
        pivot.rotation.y = yaw;
        r.render(scene, cam);
        var moving = drag || Math.abs(vel) > 0.0005 || auto;
        if (on && moving) raf = requestAnimationFrame(tick); else last = 0;
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

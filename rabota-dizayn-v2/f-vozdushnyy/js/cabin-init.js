/* Монтирует интерактивную 3D-кабину в элементы [data-cabin3d]. Загружается только на страницах с 3D, после three.min.js и cabin3d.js.
   Тема берётся из <html data-theme="e|f">. Запасной контент (SVG или img) лежит внутри контейнера и скрывается после первого кадра.
   v2: параметры сцены читаются из data-атрибутов (data-model, data-scene, data-count, data-drift, data-scroll-rotate, data-autorotate).
   Старые версии cabin3d.js незнакомые опции игнорируют. */
(function () {
  'use strict';
  if (!window.Cabin3D) return;
  var f = document.documentElement.getAttribute('data-theme') === 'f';
  Array.prototype.forEach.call(document.querySelectorAll('[data-cabin3d]'), function (el) {
    var d = el.dataset;
    var opts = { colors: f ? window.Cabin3D.PRESET_F : window.Cabin3D.PRESET_E, autoRotate: d.autorotate !== '0' };
    if (f) opts.initialAngle = 40;
    if (d.model) opts.model = d.model;
    if (d.scene) opts.scene = d.scene;
    if (d.count) opts.count = parseInt(d.count, 10) || 1;
    if (d.drift === '1') opts.drift = true;
    if (d.scrollRotate === '1') opts.scrollRotate = true;
    el._cabin = window.Cabin3D.mount(el, opts);
  });
})();

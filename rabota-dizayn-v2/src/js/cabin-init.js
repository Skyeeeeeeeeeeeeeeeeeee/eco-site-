/* Монтирует интерактивную 3D-кабину в элементы [data-cabin3d]. Загружается только на страницах с 3D, после three.min.js и cabin3d.js.
   Тема берётся из <html data-theme="e|f">. Запасной контент (SVG или img) лежит внутри контейнера и скрывается после первого кадра. */
(function () {
  'use strict';
  if (!window.Cabin3D) return;
  var f = document.documentElement.getAttribute('data-theme') === 'f';
  Array.prototype.forEach.call(document.querySelectorAll('[data-cabin3d]'), function (el) {
    var opts = { colors: f ? window.Cabin3D.PRESET_F : window.Cabin3D.PRESET_E, autoRotate: true };
    if (f) opts.initialAngle = 40;
    el._cabin = window.Cabin3D.mount(el, opts);
  });
})();

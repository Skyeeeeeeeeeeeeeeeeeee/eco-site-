# Cabin3D — реалистичная 3D-модель туалетной кабины

Процедурная модель ротоформованной кабины (≈1.12 × 1.17 × 2.30 м): скруглённые рёбра, рельефные панели, купольная белая крыша, дверь с жалюзи, ручкой, индикатором «свободно/занято», петлями, пиктограммой, вентиляционной трубой, базой-салазками с карманами под погрузчик. Все текстуры (normal/roughness, наклейки, окружение) генерируются на canvas в рантайме — внешние файлы не нужны, работает через `file://`.

## Подключение

```html
<link rel="stylesheet" href="shared/cabin3d/cabin3d.css">
<div id="cabin" style="height:460px">
  <img src="fallback.png" alt="Туалетная кабина">  <!-- запасной контент, если нет WebGL -->
</div>
<script src="shared/cabin3d/vendor/three.min.js"></script>
<script src="shared/cabin3d/cabin3d.js"></script>
<script>
  var cabin = Cabin3D.mount(document.getElementById('cabin'), {
    colors: Cabin3D.PRESET_E,
    autoRotate: true,
    initialAngle: 30,
    quality: 'high',      // 'high' | 'low' (по умолчанию авто)
    roof: 'white',        // 'white' | 'tinted' (по умолчанию — colors.roof)
    occupied: false,      // true — окно «ЗАНЯТО» (красное)
    onReady: function (api) {}
  });
</script>
```

## Опции

| Опция | Описание |
|---|---|
| `colors` | `{body, side, roof, door, accents, base, indicator}` — HEX-цвета; недостающие берутся из PRESET_E |
| `autoRotate` | автовращение (отключается при `prefers-reduced-motion`) |
| `initialAngle` | начальный угол, градусы |
| `quality` | `'high'` / `'low'`; авто: `low`, если `innerWidth < 600` или `devicePixelRatio > 2` |
| `roof` | `'white'` — всегда белая; `'tinted'` — белая с оттенком цвета корпуса; не задано — `colors.roof` |
| `occupied` | индикатор на двери «ЗАНЯТО» вместо «СВОБОДНО» |
| `onReady(api)` | вызывается после первого кадра |

Возвращает `{destroy, getAngle, setAngle, getTilt, ready, webgl}` (+ `quality`, `info.triangles`).

## Пресеты

`Cabin3D.PRESET_E` (голубой #6FA6DB), `Cabin3D.PRESET_F` (светлый #8DBCEB), `Cabin3D.PRESET_CLASSIC` (насыщенный синий #1F5FAF); общий список — `Cabin3D.PRESETS`. У всех белая полупрозрачная крыша, тёмная база #2B3A4A, дверь на тон темнее.

## Режимы качества

- `high`: тени 2048, плотные сетки, pixelRatio до 2, ≈56 тыс. треугольников.
- `low`: тени 1024, упрощённые сетки и текстуры 128 px, pixelRatio до 1.25, ≈20 тыс. треугольников.

Управление: перетаскивание, стрелки ← → при фокусе. Рендер ставится на паузу, когда блок вне экрана или вкладка скрыта. Если WebGL недоступен — остаётся запасной контент внутри контейнера.

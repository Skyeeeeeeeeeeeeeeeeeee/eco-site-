# Дизайн-система «ЭКО СЕРВИС НОВОСИБИРСК»

Одностраничный сайт аренды и продажи биотуалетов. Документ для вёрстки на чистом HTML/CSS/JS: токены, правила, компоненты, состояния. Контекст: `research.md` (приёмы и «что не брать»), `structure.md` (блоки и тексты).

Все контрасты в документе посчитаны по формуле WCAG 2.x (относительная яркость sRGB). Шрифты проверены по ответу Google Fonts CSS API: у обоих есть подмножество `cyrillic`.

---

## 0. Концепция

**Название стиля: «Сирень и мандарин».**

Конкуренты в нише красят всё в «эко-зелёный» и «водяной синий» и ставят стоковые фото кабин на поле. Мы берём противоположное: плотный электрический фиолетовый, сливочный фон, мандариновый горячий акцент и два «сладких» цвета для аудиторий (розовый и солнечный жёлтый). Выглядит как упаковка DTC-бренда, а не как сайт коммунальной службы. Туалет здесь — не повод стыдиться, а повод улыбнуться.

### Почему фиолетовый `#5B2EFF`
1. **Свободная территория.** В категории биотуалетов зелёный и синий занимают почти все; фиолетового нет, нас запомнят за секунду (приём «свой цвет», FreshCap и Magic Spoon из research.md).
2. **Не «грязный».** Холодный насыщенный цвет читается как чистота и «дезинфекция» без больничного голубого. Тёплые цвета рядом (сливочный, мандарин) снимают холод.
3. **Функционально.** Белый текст на нём даёт 6.40:1 (AA для обычного текста). Он же хорошо работает как фон героя, где живёт форма и крупный заголовок.
4. **Хорошо сочетается с двумя аудиториями.** Розовый и жёлтый рядом с фиолетовым дают яркую триаду без пестроты.

Магическая ложка использует фиолет в другой категории и другом оттенке; мы берём только технику «неотраслевой основной цвет + один горячий акцент», а не цвет-в-цвет.

### Подпись бренда (signature) — три детали, которые повторяются везде
1. **«Дверца»**: карточки и панели со скруглением, где один угол почти острый (`28px 28px 28px 6px`) — силуэт кабины с дверью. Реализуется одним `border-radius`.
2. **Твёрдая тень и чернильный контур**: 2px обводка цвета `ink` и сдвинутая тень без размытия (`6px 6px 0 ink`). Как наклейка/упаковка. Отсылка к «рисованным» рамкам LEIF и ярким плашкам DTC.
3. **Волнистый шов** между секциями: край в виде волны (`mask` + SVG, раздел 5.4) и цветные вкладки-«папки» для «Частным / Организациям» (Great Jones).

Плюс игривые «штампы-стикеры» (наклонённая плашка «Зима не страшна −35°») для акцентов.

### Тон интерфейса
Дружелюбный, уверенный, лёгкий юмор в микрокопи (ошибки форм, пустые состояния, подписи). Никакого юмора ниже пояса. Примеры заданы в разделе 6.

### Чего нет (из «Что не брать»)
Попапов поверх первого экрана (кроме мобильной sticky-панели), 
Плёночной зернистости, акварели, стоковых фото кабин, тяжёлых анимаций, корзины, платных шрифтов.

---

## 1. Шрифты

Два семейства, оба Google Fonts, оба с кириллицей:

| Роль | Семейство | Где | Почему |
|---|---|---|---|
| Заголовки, цены, числа-акценты, лого | **Unbounded** (вариативный, 200–900) | H1–H3, цена, шаги, бегущая строка, мобильное меню | Широкий, округлый, «конфетный» геометрический гротеск. Узнаваем, дружелюбен, не отраслевой. В нём есть `tnum` для цифр. |
| Текст, формы, кнопки, подписи | **Onest** (вариативный, 100–900) | всё остальное | Спокойный, очень читаемый на мобильном, родной кириллический дизайн, есть `tnum`, стрелка `→`, `−`, `×`. |

Проверка (ответ `fonts.googleapis.com/css2` с современным User-Agent): у Unbounded подмножества `cyrillic`, `cyrillic-ext`, `latin`, `latin-ext`, `vietnamese`; у Onest то же плюс `math`, `symbols`. Знак рубля `₽` (U+20BD) лежит в подмножестве `latin-ext` обоих шрифтов (глиф есть в файле), минус `−` (U+2212) и `×` — в `latin`. Браузер сам подтянет `latin-ext` из-за `₽` (ещё один небольшой файл на шрифт); `preconnect` ниже ускоряет это.

Если нужен резерв: Golos Text и Dela Gothic One тоже содержат кириллицу, но не берём: Golos неотличим от «ещё одного интерфейсного» шрифта, Dela Gothic One только один вес и слишком тяжёл для длинных русских слов.

### Подключение (в `<head>`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&family=Unbounded:wght@500;700;900&display=swap">
```

Используемые начертания: Onest 400/500/600/700, Unbounded 500/700/900. Больше не добавлять (вес загрузки).

```css
:root {
  --font-display: "Unbounded", "Onest", system-ui, sans-serif;
  --font-text: "Onest", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
```

`<html lang="ru">` обязателен (переносы и кавычки).

---

## 2. Палитра

Основа: тёплый сливочный фон, густо-фиолетовые «чернила» вместо чёрного, фиолетовый бренд, мандариновый акцент.

### 2.1 Токены

| Токен | Hex | Роль |
|---|---|---|
| `--c-cream` | `#FFF6E6` | основной фон страницы (bg) |
| `--c-paper` | `#FFFFFF` | поверхности: карточки, поля, формы (surface) |
| `--c-lilac-soft` | `#F2EDFF` | фон чередующихся секций, треки |
| `--c-ink` | `#1D0F3A` | основной текст, контуры, тёмные блоки |
| `--c-ink-2` | `#4B3F6B` | вторичный текст |
| `--c-ink-3` | `#6B5F8A` | третичный текст, подсказки, плейсхолдеры (только на cream/paper/lilac-soft/yellow-soft/ice) |
| `--c-violet` | `#5B2EFF` | **primary**: кнопки, ссылки, hero, активные состояния |
| `--c-violet-press` | `#4318D9` | primary hover/active |
| `--c-lilac` | `#E8E0FF` | светлый фиолетовый: бейджи, трек слайдера, stage карточки «База» |
| `--c-tangerine` | `#FF5A1F` | **accent**: горячая точка (цена-акцент, штампы, прогресс скидки, иконки). Никогда не цвет текста на светлом |
| `--c-tangerine-deep` | `#C93A00` | текст-акцент на светлом (ссылка «подробнее», «−5%») |
| `--c-pink` | `#FFA6C4` | **аудитория «Частным лицам»** (вкладка, чипы) |
| `--c-pink-deep` | `#B3124F` | текст/иконки в цвете «Частным» на cream/paper |
| `--c-yellow` | `#FFD82B` | **аудитория «Организациям»**, marquee, focus на тёмном, суммы в калькуляторе |
| `--c-yellow-deep` | `#7A5C00` | текст в цвете «Организациям» на светлом (4.5:1 на жёлтом, 5.8 на cream) |
| `--c-success` / `-bg` | `#0B7A4B` / `#DDF5E7` | успех (иконка + текст) |
| `--c-error` / `-bg` | `#C8183A` / `#FFE3E8` | ошибка |
| `--c-warning` / `-bg` | `#8A5200` / `#FFF0C2` | предупреждение |
| `--c-focus` | `#5B2EFF` | кольцо фокуса на светлом фоне |
| `--c-focus-on-dark` | `#FFD82B` | кольцо фокуса на ink/violet |
| `--c-ink-mute-on-dark` | `#CDC3EC` | вторичный текст на `ink` |
| `--c-stage-1…5` | `#E8E0FF #FFD6E5 #FFF0A8 #DCEBFF #FFD9C7` | фоны «сцен» с кабиной в карточках каталога (База / Чистые руки / Без барьеров / Зима / Дачник). Ледяной `#DCEBFF` — только для зимней кабины, смысловая отсылка, не основной цвет |
| `--c-disabled-bg` / `-fg` | `#E9E4F2` / `#6B5F8A` | отключённые элементы |

### 2.2 Разрешённые пары текст/фон и контраст

Порог: обычный текст ≥ 4.5:1, крупный (≥ 24px или ≥ 18.66px bold) и элементы UI ≥ 3:1.

| Текст / элемент | Фон | Контраст | Уровень | Применение |
|---|---|---|---|---|
| ink `#1D0F3A` | cream `#FFF6E6` | 16.57 | AAA | основной текст |
| ink | paper `#FFFFFF` | 17.77 | AAA | текст в карточках |
| ink | lilac-soft `#F2EDFF` | 15.51 | AAA | текст в чередующихся секциях |
| ink-2 `#4B3F6B` | cream | 8.81 | AAA | вторичный текст |
| ink-2 | paper | 9.45 | AAA | |
| ink-2 | lilac-soft | 8.25 | AAA | |
| ink-2 | stage 1…5 | 7.44 / 7.20 / 8.23 / 7.82 / 7.20 | AAA | описания в карточках каталога |
| ink-3 `#6B5F8A` | cream | 5.39 | AA | подсказки, плейсхолдер |
| ink-3 | paper | 5.79 | AA | |
| ink-3 | lilac-soft | 5.05 | AA | |
| ink-3 | yellow-soft `#FFF0A8` / ice `#DCEBFF` | 5.04 / 4.79 | AA | |
| white `#FFFFFF` | violet `#5B2EFF` | 6.40 | AA | текст кнопки primary, hero |
| white | violet-press `#4318D9` | 8.86 | AAA | hover |
| cream | violet | 5.97 | AA | текст в hero |
| lilac `#E8E0FF` | violet | 5.04 | AA | вторичный текст в hero |
| yellow `#FFD82B` | violet | 4.61 | AA | выделенное слово в H1 (крупный текст) |
| violet | cream | 5.97 | AA | ссылки, акцентный текст |
| violet | paper | 6.40 | AA | |
| violet | lilac `#E8E0FF` | 5.04 | AA | бейджи, активный чип-текст |
| violet | lilac-soft | 5.59 | AA | |
| ink | tangerine `#FF5A1F` | 5.70 | AA | текст на мандариновых штампах (кнопка-акцент) |
| tangerine-deep `#C93A00` | cream | 4.79 | AA | акцентный текст на светлом |
| white | tangerine-deep | 5.14 | AA | |
| ink | pink `#FFA6C4` | 9.74 | AAA | вкладка «Частным» |
| ink-2 | pink | 5.18 | AA | |
| pink-deep `#B3124F` | cream | 6.28 | AA | текст в цвете «Частным» на светлом |
| ink | yellow `#FFD82B` | 12.79 | AAA | вкладка «Организациям», marquee |
| ink-2 | yellow | 6.80 | AA | |
| yellow-deep `#7A5C00` | yellow | 4.50 | AA (на границе) | допускается только ≥ 16px/600 |
| cream / white | ink | 16.57 / 17.77 | AAA | тёмные секции, footer, карточка результата |
| yellow | ink | 12.79 | AAA | сумма и фокус на тёмном |
| tangerine | ink | 5.70 | AA | прогресс-бар скидки на тёмном |
| ink-mute-on-dark `#CDC3EC` | ink | 10.67 | AAA | подписи в тёмных блоках |
| success `#0B7A4B` | paper / success-bg | 5.39 / 4.69 | AA | сообщение об успехе |
| error `#C8183A` | paper / cream / error-bg | 5.76 / 5.37 / 4.77 | AA | сообщения об ошибках |
| warning `#8A5200` | warning-bg | 5.63 | AA | |
| ink-3 | disabled-bg `#E9E4F2` | 4.64 | AA | отключённое (требований нет, но читается) |

**Элементы UI (граница/иконка ≥ 3:1):**

| Элемент | Фон | Контраст |
|---|---|---|
| граница ink на paper/cream | | 17.77 / 16.57 |
| граница полей `ink` (2px) | | 17+ |
| focus violet `#5B2EFF` | cream | 5.97 (между кольцом и контентом зазор 3px, фон страницы даёт ≥ 3:1) |
| focus yellow `#FFD82B` | ink | 12.79 |
| focus yellow | violet | 4.61 |
| fill прогресса violet | track lilac | 5.04 |
| fill прогресса tangerine | track на ink (rgba cream .18 ≈ `#43385D`) | ≥ 3:1 (проверить в браузере) |

### 2.3 Запрещённые пары (проверено — не проходят)

| Пара | Контраст | Что делать |
|---|---|---|
| tangerine `#FF5A1F` текстом на cream/paper | 2.91 | использовать `tangerine-deep` или ink на мандариновой плашке |
| white на tangerine | 3.12 | только ink на tangerine |
| tangerine на violet | 2.05 | не ставить рядом как текст/иконку-смысл; допустим как чистый декор |
| pink на violet | 3.51 | только декор или крупный текст ≥ 24px |
| pink-deep на pink | 3.69 | на розовом — только ink / ink-2 |
| ink-3 на stage-2 / stage-5 | 4.41 | использовать ink-2 |
| `#D9D0EE` (линии) на paper | 1.48 | линии-разделители только декор; смысловые границы — ink |

### 2.4 CSS

```css
:root {
  /* Базовые */
  --c-cream: #FFF6E6;
  --c-paper: #FFFFFF;
  --c-lilac-soft: #F2EDFF;
  --c-ink: #1D0F3A;
  --c-ink-2: #4B3F6B;
  --c-ink-3: #6B5F8A;
  --c-line: #D9D0EE;              /* только декор */

  /* Бренд */
  --c-violet: #5B2EFF;
  --c-violet-press: #4318D9;
  --c-lilac: #E8E0FF;
  --c-tangerine: #FF5A1F;
  --c-tangerine-deep: #C93A00;

  /* Аудитории */
  --c-private: #FFA6C4;           /* Частным */
  --c-private-deep: #B3124F;
  --c-private-soft: #FFD6E5;
  --c-org: #FFD82B;               /* Организациям */
  --c-org-deep: #7A5C00;
  --c-org-soft: #FFF0A8;

  /* Статусы */
  --c-success: #0B7A4B;  --c-success-bg: #DDF5E7;
  --c-error:   #C8183A;  --c-error-bg:   #FFE3E8;
  --c-warning: #8A5200;  --c-warning-bg: #FFF0C2;

  /* Фокус */
  --c-focus: #5B2EFF;
  --c-focus-on-dark: #FFD82B;

  /* Тёмный контекст */
  --c-ink-mute-on-dark: #CDC3EC;

  /* Сцены каталога */
  --c-stage-1: #E8E0FF; --c-stage-2: #FFD6E5; --c-stage-3: #FFF0A8;
  --c-stage-4: #DCEBFF; --c-stage-5: #FFD9C7;

  /* Отключено */
  --c-disabled-bg: #E9E4F2; --c-disabled-fg: #6B5F8A;

  /* Семантические алиасы (использовать в компонентах) */
  --bg: var(--c-cream);
  --surface: var(--c-paper);
  --text: var(--c-ink);
  --text-2: var(--c-ink-2);
  --text-3: var(--c-ink-3);
  --primary: var(--c-violet);
  --primary-press: var(--c-violet-press);
  --accent: var(--c-tangerine);
  --border: var(--c-ink);
  --focus: var(--c-focus);
}

/* Тёмные контексты: переопределяем алиасы, компоненты не меняются */
.on-dark {            /* .section--ink, .section--violet, footer */
  --text: var(--c-cream);
  --text-2: var(--c-ink-mute-on-dark);
  --text-3: var(--c-ink-mute-on-dark);
  --focus: var(--c-focus-on-dark);
  color: var(--text);
}
.section--violet.on-dark { --text-2: #E8E0FF; --text-3: #E8E0FF; }   /* 5.04:1 на violet */
```

### 2.5 Цвет секций (ритм страницы)

| Блок | Фон | Текст |
|---|---|---|
| Header | cream | ink |
| 1. Первый экран | **violet** | cream / white, слово в H1 — yellow |
| 3. Marquee | **yellow** | ink |
| 4. Частным / Организациям | cream (вкладки pink / yellow) | ink |
| 5. Каталог | lilac-soft (у карточек свои stage-цвета) | ink |
| 6. Калькулятор | `--c-private-soft` `#FFD6E5` (карточка результата — ink) | ink |
| 7. Как работаем | cream | ink |
| 8–9. Обслуживание / Почему мы | yellow-soft `#FFF0A8` | ink |
| 10. Юрлицам | lilac-soft | ink |
| 11. Зоны | cream | ink |
| 12. Отзывы | **violet** | cream (карточки белые) |
| 13. FAQ | cream | ink |
| 14. Контакты | lilac-soft | ink |
| Footer | **ink** | cream |

Правило: подряд не больше двух светлых секций; раз в 3–4 блока — насыщенная (violet, yellow, ink). Это «эмоциональная секция / рациональная сетка» (Snacklins).

---

## 3. Типографика

Mobile-first, fluid `clamp(min, base + k·vw, max)`. Расчёты привязаны к 360 px и 1280 px (REM = 16px).

```css
:root {
  /* размеры */
  --fs-h1: clamp(1.625rem, 1.05rem + 2.6vw, 3.5rem);     /* 26 → ~50 → 56 */
  --fs-h2: clamp(1.375rem, 0.95rem + 1.9vw, 2.5rem);     /* 22 → ~39.5 → 40 */
  --fs-h3: clamp(1.125rem, 0.95rem + 0.8vw, 1.5rem);     /* 18 → 24 */
  --fs-h4: clamp(1rem, 0.92rem + 0.35vw, 1.1875rem);     /* 16 → 19 */
  --fs-lead: clamp(1.0625rem, 0.98rem + 0.4vw, 1.25rem); /* 17 → 20 */
  --fs-body: 1rem;                                       /* 16 */
  --fs-small: 0.875rem;                                  /* 14 */
  --fs-label: 0.8125rem;                                 /* 13 (минимум на сайте) */
  --fs-button: 1rem;                                     /* 16 */
  --fs-price-xl: clamp(2rem, 1.4rem + 3vw, 3.5rem);      /* итог калькулятора 32 → 56 */
  --fs-price: clamp(1.375rem, 1.2rem + 0.9vw, 1.75rem);  /* цена в карточке 22 → 28 */
  --fs-step-num: clamp(1.75rem, 1.4rem + 1.6vw, 2.75rem);

  /* межстрочные */
  --lh-tight: 1.08;   /* H1 */
  --lh-heading: 1.15; /* H2, H3 */
  --lh-snug: 1.3;     /* H4, лид, кнопки в 2 строки */
  --lh-body: 1.55;
  --lh-small: 1.45;

  /* трекинг */
  --ls-h1: -0.025em;
  --ls-h2: -0.02em;
  --ls-h3: -0.01em;
  --ls-label: 0.06em;
}
```

| Стиль | Семейство | Размер | Вес | Line-height | Трекинг | Примечание |
|---|---|---|---|---|---|---|
| H1 | Unbounded | `--fs-h1` | 700 | 1.08 | −0.025em | max-width 18ch на desktop; `text-wrap: balance`; слово-акцент в `<mark>` жёлтым |
| H2 | Unbounded | `--fs-h2` | 700 | 1.15 | −0.02em | `text-wrap: balance` |
| H3 | Unbounded | `--fs-h3` | 500 | 1.15 | −0.01em | названия моделей, вопросы FAQ в Onest (см. ниже) |
| H4 | Onest | `--fs-h4` | 700 | 1.3 | 0 | заголовки подблоков |
| Lead | Onest | `--fs-lead` | 500 | 1.3 / 1.45 | 0 | подзаголовки секций, `max-width: 56ch` |
| Body | Onest | 16px | 400 | 1.55 | 0 | `max-width: 68ch` |
| Small | Onest | 14px | 400/500 | 1.45 | 0 | подсказки, сноски |
| Button | Onest | 16px | 700 | 1.1 | 0.01em | не uppercase |
| Label | Onest | 13px | 700 | 1.2 | 0.06em | uppercase для бейджей и меток; для подписей полей — 14px 600 без uppercase |
| Price | Unbounded | `--fs-price` / `-xl` | 700 | 1 | −0.02em | `font-variant-numeric: tabular-nums lining-nums` |

Заметки по Unbounded: шрифт широкий, поэтому на 360 px в H1 помещается ~17 знаков в строку; слово «биотуалетов» (11 знаков) влезает. Обязательно `overflow-wrap: break-word; hyphens: auto;` (lang="ru") для длинных слов; не ставить Unbounded мельче 18px и не использовать для абзацев.

```css
html { font-size: 100%; -webkit-text-size-adjust: 100%; }
body {
  font: 400 var(--fs-body)/var(--lh-body) var(--font-text);
  color: var(--text); background: var(--bg);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3 { font-family: var(--font-display); margin: 0; text-wrap: balance; overflow-wrap: break-word; hyphens: auto; }
h1 { font-size: var(--fs-h1); font-weight: 700; line-height: var(--lh-tight);  letter-spacing: var(--ls-h1); }
h2 { font-size: var(--fs-h2); font-weight: 700; line-height: var(--lh-heading); letter-spacing: var(--ls-h2); }
h3 { font-size: var(--fs-h3); font-weight: 500; line-height: var(--lh-heading); letter-spacing: var(--ls-h3); }
h4 { font: 700 var(--fs-h4)/var(--lh-snug) var(--font-text); margin: 0; }
.lead  { font-size: var(--fs-lead); font-weight: 500; line-height: 1.4; max-width: 56ch; color: var(--text-2); }
.small { font-size: var(--fs-small); line-height: var(--lh-small); color: var(--text-2); }
.label { font-size: var(--fs-label); font-weight: 700; letter-spacing: var(--ls-label); text-transform: uppercase; line-height: 1.2; }
.price { font-family: var(--font-display); font-weight: 700; font-size: var(--fs-price);
         font-variant-numeric: tabular-nums lining-nums; letter-spacing: -0.02em; line-height: 1; }
.price--xl { font-size: var(--fs-price-xl); }
.price small { font: 600 var(--fs-small)/1 var(--font-text); letter-spacing: 0; }   /* «₽/сутки» */
mark.hl { background: none; color: var(--c-yellow); }   /* только на violet/ink */
```

Числа: пробел-разделитель тысяч неразрывный (`13&nbsp;400&nbsp;₽`), рубль всегда через `&nbsp;`. Минус — настоящий `−` (U+2212), а не дефис: `−35 °C`, `−5%`.

---

## 4. Сетка

Mobile-first, `min-width` медиа-запросы.

| Брейкпоинт | Токен | Колонок | Gutter | Внешний отступ | Макс. ширина контента |
|---|---|---|---|---|---|
| 0–479 (база, ориентир 360) | — | 4 | 16 | 16 | 100% |
| 480 | `--bp-sm` | 4 | 16 | 20 | 100% |
| 768 | `--bp-md` | 8 | 24 | 24 | 100% (до 1023) |
| 1024 | `--bp-lg` | 12 | 24 | 32 | 100% |
| 1280+ | `--bp-xl` | 12 | 32 | авто | **1200** (+ отступы 32 = 1264 край-в-край) |

Медиа-запросы не принимают `var()`: значения 480 / 768 / 1024 / 1280 писать прямо.

```css
:root {
  --container: 1200px;
  --gutter: 16px;
  --page-pad: 16px;
}
@media (min-width: 480px)  { :root { --page-pad: 20px; } }
@media (min-width: 768px)  { :root { --gutter: 24px; --page-pad: 24px; } }
@media (min-width: 1024px) { :root { --page-pad: 32px; } }
@media (min-width: 1280px) { :root { --gutter: 32px; } }

.container { width: 100%; max-width: calc(var(--container) + var(--page-pad) * 2);
             margin-inline: auto; padding-inline: var(--page-pad); }
.grid { display: grid; gap: var(--gutter); grid-template-columns: repeat(4, minmax(0, 1fr)); }
@media (min-width: 768px)  { .grid { grid-template-columns: repeat(8, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(12, minmax(0, 1fr)); } }

/* Хелперы: span на колонки */
.col-full { grid-column: 1 / -1; }
@media (min-width: 768px)  { .md-4 { grid-column: span 4; } .md-8 { grid-column: span 8; } }
@media (min-width: 1024px) { .lg-4 { grid-column: span 4; } .lg-5 { grid-column: span 5; }
                             .lg-6 { grid-column: span 6; } .lg-7 { grid-column: span 7; } .lg-8 { grid-column: span 8; } }
```

Раскладка блоков:

| Блок | 360 | 768 | 1024+ |
|---|---|---|---|
| Hero | 1 колонка: H1, лид, форма, иллюстрация | H1+лид (8), форма (8) под ним, иллюстрация справа-абсолютно | H1/лид/форма — 6 колонок слева, иллюстрация 6 колонок справа |
| Факты (4) | 2×2 | 4 в ряд | 4 в ряд |
| Audience | табы 50/50, панель на всю ширину | то же | табы сверху, панель на 12 колонок: текст 7 + плюсы 5 |
| Каталог | горизонтальный scroll-snap, карточка 82vw (max 320) | 2 колонки | 3 + 2 (первая строка 3 по 4 колонки, вторая 2 по 6) |
| Калькулятор | поля, затем результат (sticky внизу) | 1 колонка | поля 7 + результат 5 (sticky top 96px) |
| Шаги | вертикально | 2×2 | 4 в ряд (по 3 колонки) |
| Зоны | карта, затем карточки | карта 8, карточки 8 | карта 6 + карточки 6 |
| Отзывы | слайдер, 1 | 2 | 3 |
| Контакты | контакты, форма | то же | 5 + 7 |

---

## 5. Отступы, ритм, формы

### 5.1 Шкала отступов (база 4, шаг 8 для крупных)

```css
:root {
  --sp-0: 0;
  --sp-1: 4px;   --sp-2: 8px;   --sp-3: 12px;  --sp-4: 16px;
  --sp-5: 20px;  --sp-6: 24px;  --sp-8: 32px;  --sp-10: 40px;
  --sp-12: 48px; --sp-16: 64px; --sp-20: 80px; --sp-24: 96px; --sp-32: 128px;

  /* ритм секций */
  --section-py: clamp(3.5rem, 2.2rem + 5.5vw, 7.5rem);  /* 56 → ~100 → 120 */
  --section-head-gap: clamp(1.5rem, 1rem + 2vw, 3rem);   /* от заголовка секции до контента */
  --stack-gap: var(--sp-4);                               /* внутри текстового блока */
}
.section { position: relative; padding-block: var(--section-py); background: var(--section-bg, var(--bg)); }
.section__head { margin-bottom: var(--section-head-gap); display: grid; gap: var(--sp-3); }
.section__head .lead { margin: 0; }
```

Правила: между H2 и лидом — 12px; между лидом и контентом — `--section-head-gap`; внутри карточки — 12–16px между элементами, padding карточки 20px (mobile) / 28px (desktop); между соседними кнопками — не меньше 8px (12 в sticky-панели).

### 5.2 Радиусы

```css
:root {
  --r-xs: 8px;     /* чипы, мелкие бейджи */
  --r-sm: 14px;    /* поля ввода, select */
  --r-md: 20px;    /* внутренние блоки */
  --r-door: 28px 28px 28px 6px;    /* «дверца»: карточки, панели (signature) */
  --r-door-r: 28px 28px 6px 28px;  /* зеркальная — для чередования в сетке */
  --r-pill: 999px; /* кнопки, чипы, табы-сегменты */
}
```

### 5.3 Границы и тени

```css
:root {
  --bw: 2px;                          /* стандартная чернильная граница */
  --bw-bold: 3px;                     /* иллюстрации, крупные панели */
  --shadow-hard-sm: 3px 3px 0 var(--c-ink);   /* чипы, поля в focus */
  --shadow-hard:    6px 6px 0 var(--c-ink);   /* карточки */
  --shadow-hard-lg: 10px 10px 0 var(--c-ink); /* hero-форма, результат калькулятора */
  --shadow-soft: 0 12px 32px -12px rgba(29, 15, 58, .35);  /* только плавающие: меню, FAB, sticky-бар */
}
.on-dark { --shadow-hard: 6px 6px 0 var(--c-yellow); --shadow-hard-lg: 10px 10px 0 var(--c-yellow); }
```

Подпись: контур 2px `ink` + твёрдая тень + радиус «дверца». Тень без blur, поэтому дёшево рисуется; анимируем только `transform` (см. кнопку).

### 5.4 Signature-детали (реализация)

**A. Волнистый шов секции.** Волна — маска из SVG; цвет волны берётся из `--section-bg` секции, лежит поверх нижнего края предыдущей.

```css
:root {
  --wave: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 16' preserveAspectRatio='none'%3E%3Cpath d='M0 16V8Q12 0 24 8T48 8V16Z'/%3E%3C/svg%3E");
}
.section--wave::before {
  content: ""; position: absolute; left: 0; right: 0; top: -15px; height: 16px;
  background: var(--section-bg);
  -webkit-mask: var(--wave) repeat-x bottom left / 48px 16px;
          mask: var(--wave) repeat-x bottom left / 48px 16px;
  pointer-events: none;
}
.section--violet { --section-bg: var(--c-violet); }
.section--yellow { --section-bg: var(--c-yellow); }
.section--lilac  { --section-bg: var(--c-lilac-soft); }
.section--pink   { --section-bg: var(--c-private-soft); }
.section--sun    { --section-bg: var(--c-org-soft); }
.section--ink    { --section-bg: var(--c-ink); }
```

Волну включать (`.section--wave`) на границах «цветная ↔ светлая», не на каждой секции (максимум 4–5 на странице). Для зеркальной (волна сверху вниз) — `transform: scaleY(-1)` на `::before` и `top: auto; bottom: -15px`.

**B. Цветные вкладки-«папки»** — раздел 6.7 (Audience tab).

**C. Стикер-штамп.** Наклонённая плашка с контуром и твёрдой тенью.

```css
.sticker {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; border: var(--bw) solid var(--c-ink); border-radius: var(--r-pill);
  background: var(--c-tangerine); color: var(--c-ink);
  font: 700 var(--fs-label)/1 var(--font-text); letter-spacing: var(--ls-label); text-transform: uppercase;
  transform: rotate(-4deg); box-shadow: var(--shadow-hard-sm);
}
.sticker--yellow { background: var(--c-yellow); } .sticker--pink { background: var(--c-private); }
.sticker--dev { background: var(--c-paper); border-style: dashed; transform: none; box-shadow: none; }   /* плашка «ЗАГЛУШКА», убрать при запуске */
```

**D. Дверная карточка.** `.door { border: var(--bw) solid var(--c-ink); border-radius: var(--r-door); box-shadow: var(--shadow-hard); background: var(--surface); }`

---

## 6. Компоненты

Общее:

```css
*, *::before, *::after { box-sizing: border-box; }
:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 3px solid var(--focus); outline-offset: 3px; border-radius: inherit;
}
:where(a, button, input, select, textarea):focus:not(:focus-visible) { outline: none; }
a { color: var(--c-violet); text-underline-offset: 3px; text-decoration-thickness: 2px; }
a:hover { color: var(--c-violet-press); }
.on-dark a { color: var(--c-yellow); }
.visually-hidden { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
```

### 6.1 Кнопки

Варианты: `primary` (violet), `secondary` (белая с контуром), `ghost` (текст-ссылка со стрелкой), `accent` (мандарин, редко — одно действие на экран, «Заказать за N ₽»), `contact` (телефон / мессенджер: иконка + текст).

Конструкция: «поднятая» кнопка. Тень — псевдоэлемент `::before`, который двигается `transform`-ом, сама кнопка тоже `transform`. Тень остаётся на месте, кнопка приподнимается и «вдавливается». Только transform, без анимации `box-shadow`.

```css
.btn {
  --btn-bg: var(--c-violet); --btn-fg: #fff; --btn-bd: var(--c-ink);
  position: relative; isolation: isolate;
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  min-height: 48px; padding: 0 24px;
  font: 700 var(--fs-button)/1.1 var(--font-text); letter-spacing: .01em; text-decoration: none; text-align: center;
  color: var(--btn-fg); background: var(--btn-bg);
  border: var(--bw) solid var(--btn-bd); border-radius: var(--r-pill);
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: transform var(--dur-fast) var(--ease-out), background-color var(--dur-fast) linear;
  will-change: transform;
}
.btn::before {                 /* твёрдая тень */
  content: ""; position: absolute; inset: -2px; z-index: -1;
  border-radius: inherit; background: var(--c-ink);
  transform: translateY(4px);
  transition: transform var(--dur-fast) var(--ease-out);
}
.on-dark .btn::before { background: var(--c-yellow); }   /* на тёмном — жёлтая тень */
.btn:hover        { transform: translateY(-2px); background: var(--btn-bg-hover, var(--c-violet-press)); }
.btn:hover::before{ transform: translateY(6px); }
.btn:active       { transform: translateY(3px); }
.btn:active::before { transform: translateY(1px); }
.btn--lg { min-height: 56px; padding: 0 32px; font-size: 1.0625rem; }
.btn--block { width: 100%; }

/* secondary */
.btn--secondary { --btn-bg: var(--c-paper); --btn-fg: var(--c-ink); --btn-bg-hover: var(--c-lilac); }
/* accent (мандарин; текст ink — 5.70:1) */
.btn--accent { --btn-bg: var(--c-tangerine); --btn-fg: var(--c-ink); --btn-bg-hover: #FF7040; }
/* ink-кнопка для violet-фона hero (контраст: yellow/ink) */
.on-dark .btn--primary { --btn-bg: var(--c-yellow); --btn-fg: var(--c-ink); --btn-bg-hover: #FFE35C; --btn-bd: var(--c-ink); }

/* CTA со стрелкой «→» (закономерность референсов): добавлять к главным кнопкам блоков */
.btn--arrow::after { content: "→"; font-weight: 700; transition: transform var(--dur-fast) var(--ease-out); }
.btn--arrow:hover::after { transform: translateX(4px); }

/* ghost: текстовая ссылка со стрелкой */
.btn--ghost { --btn-bg: transparent; --btn-fg: var(--c-violet); --btn-bd: transparent;
              min-height: 44px; padding: 0 4px; border-radius: var(--r-xs); text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 2px; }
.btn--ghost::before { display: none; }
.btn--ghost:hover { transform: none; background: transparent; color: var(--c-violet-press); }
.btn--ghost::after { content: "→"; transition: transform var(--dur-fast) var(--ease-out); }
.btn--ghost:hover::after { transform: translateX(4px); }
.on-dark .btn--ghost { --btn-fg: var(--c-yellow); }

/* phone / messenger: иконка 22px слева, текст — номер, tabular-nums */
.btn--contact { --btn-bg: var(--c-paper); --btn-fg: var(--c-ink); --btn-bg-hover: var(--c-lilac); font-variant-numeric: tabular-nums; }
.btn--contact svg { width: 22px; height: 22px; flex: none; }

/* состояния */
.btn:focus-visible { outline: 3px solid var(--focus); outline-offset: 5px; }      /* offset 5, чтобы не слипалось с тенью */
.btn[disabled], .btn[aria-disabled="true"] {
  --btn-bg: var(--c-disabled-bg); --btn-fg: var(--c-disabled-fg); --btn-bd: #9A91B5;
  cursor: not-allowed; transform: none; pointer-events: none;
}
.btn[disabled]::before, .btn[aria-disabled="true"]::before { display: none; }
.btn.is-loading { color: transparent; pointer-events: none; }                      /* aria-busy="true" */
.btn.is-loading::after {
  content: ""; position: absolute; width: 20px; height: 20px; inset: 0; margin: auto;
  border: 3px solid var(--c-lilac); border-top-color: #fff; border-radius: 50%;
  animation: spin .7s linear infinite;
}
.btn.is-success { --btn-bg: var(--c-success); --btn-fg: #fff; }                    /* белый на success 5.39 */
.btn.is-error   { --btn-bg: var(--c-error);   --btn-fg: #fff; }                    /* 5.76 */
@keyframes spin { to { transform: rotate(360deg); } }
```

Состояния: default / hover (поднимается на 2px) / focus-visible (кольцо с отступом 5px) / active (вдавливается) / disabled (серо-лиловая без тени) / loading (спиннер, label скрыт, `aria-busy="true"`, текст кнопки остаётся в DOM) / success (кнопка зеленеет, текст «Готово!» 2 секунды) / error (текст «Не вышло, ещё раз»).

Одна главная (`primary` или `accent`) кнопка на блок.

### 6.2 Поля ввода и select

Подпись всегда над полем (не плейсхолдер вместо подписи). Высота 52px.

```html
<div class="field" data-state="default">
  <label class="field__label" for="phone">Телефон</label>
  <input class="input" id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel"
         placeholder="+7 (___) ___-__-__" required aria-describedby="phone-msg">
  <p class="field__msg" id="phone-msg" role="alert"></p>
</div>
```

```css
.field { display: grid; gap: 6px; }
.field__label { font: 600 var(--fs-small)/1.2 var(--font-text); color: var(--text); }
.field__hint  { font-size: var(--fs-small); color: var(--text-3); }

.input, .select, .textarea {
  width: 100%; min-height: 52px; padding: 0 16px;
  font: 500 1rem/1.3 var(--font-text);      /* >= 16px: iOS не зумит поле */
  color: var(--c-ink); background: var(--c-paper);
  border: var(--bw) solid var(--c-ink); border-radius: var(--r-sm);
  transition: border-color var(--dur-fast) linear, box-shadow var(--dur-fast) linear;
  appearance: none; -webkit-appearance: none;
}
.textarea { min-height: 112px; padding: 14px 16px; resize: vertical; }
.input::placeholder, .textarea::placeholder { color: var(--c-ink-3); opacity: 1; }          /* 5.79:1 */
.input:hover, .select:hover { border-color: var(--c-violet); }
.input:focus-visible, .select:focus-visible, .textarea:focus-visible {
  outline: 3px solid var(--focus); outline-offset: 2px; border-color: var(--c-violet); box-shadow: var(--shadow-hard-sm);
}
.input:disabled, .select:disabled { background: var(--c-disabled-bg); color: var(--c-disabled-fg); border-color: #9A91B5; cursor: not-allowed; }

/* select: свой шеврон */
.select {
  padding-right: 48px; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='10' viewBox='0 0 16 10'%3E%3Cpath d='M2 2l6 6 6-6' fill='none' stroke='%231D0F3A' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 18px center;
}
.select:invalid { color: var(--c-ink-3); }   /* первый option value="" disabled selected: «Выберите» */

/* error */
.field[data-state="error"] .input, .field[data-state="error"] .select, .field[data-state="error"] .textarea,
.input[aria-invalid="true"], .select[aria-invalid="true"] { border-color: var(--c-error); background: var(--c-error-bg); }
/* success */
.field[data-state="success"] .input { border-color: var(--c-success); }

/* сообщения: иконка + текст (не только цвет) */
.field__msg { margin: 0; min-height: 0; font: 600 var(--fs-small)/1.35 var(--font-text); display: none; align-items: flex-start; gap: 6px; }
.field[data-state="error"] .field__msg   { display: flex; color: var(--c-error); }
.field[data-state="success"] .field__msg { display: flex; color: var(--c-success); }
.field__msg::before { content: ""; flex: none; width: 16px; height: 16px; margin-top: 1px; background: currentColor;
  -webkit-mask: var(--i-alert) center/contain no-repeat; mask: var(--i-alert) center/contain no-repeat; }
.field[data-state="success"] .field__msg::before { -webkit-mask-image: var(--i-check); mask-image: var(--i-check); }
```

(`--i-alert`, `--i-check` — data-URI SVG круг с «!» и галочка 16×16, одноцветные.)

**Валидация:** проверять на `blur` и на `submit`; во время ввода — только снимать ошибку, когда поле стало валидным. Первое невалидное поле получает фокус, в форме над кнопкой сводка `role="alert"` не нужна, если ошибка у каждого поля. Тексты берутся из `structure.md` («Подскажите, как вас зовут», «Введите номер полностью, например +7 913 000-00-00»).

Успех формы — блок `.form-success`: фон `--c-success-bg`, 2px граница `--c-success`, иконка-галочка, заголовок Onest 700 «Спасибо, {имя}! Заявка у нас.», `role="status"`, фокус переносится на него. Ошибка отправки — `.form-error` с `--c-error-bg` и телефоном-ссылкой.

### 6.3 Слайдер (range)

Для «Расстояние, км» (1–300) и опционально «Срок». Рядом всегда числовое поле/значение (слайдер не единственный способ ввода).

```css
.range { -webkit-appearance: none; appearance: none; width: 100%; height: 44px; background: transparent; cursor: pointer; --p: 0%; }
.range::-webkit-slider-runnable-track { height: 10px; border: var(--bw) solid var(--c-ink); border-radius: var(--r-pill);
  background: linear-gradient(90deg, var(--c-violet) var(--p), var(--c-lilac) var(--p)); }
.range::-moz-range-track { height: 10px; border: var(--bw) solid var(--c-ink); border-radius: var(--r-pill); background: var(--c-lilac); }
.range::-moz-range-progress { height: 10px; background: var(--c-violet); border-radius: var(--r-pill); }
.range::-webkit-slider-thumb { -webkit-appearance: none; width: 28px; height: 28px; margin-top: -10px; /* (10+4−28)/2 */
  border-radius: 50%; background: var(--c-yellow); border: var(--bw) solid var(--c-ink); box-shadow: var(--shadow-hard-sm);
  transition: transform var(--dur-fast) var(--ease-spring); }
.range::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: var(--c-yellow); border: var(--bw) solid var(--c-ink); box-shadow: var(--shadow-hard-sm); }
.range:hover::-webkit-slider-thumb { transform: scale(1.1); }
.range:active::-webkit-slider-thumb { transform: scale(.95); }
.range:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; border-radius: var(--r-sm); }
.range:disabled { opacity: .45; cursor: not-allowed; }
```

JS обновляет `--p` на `input` (`style.setProperty('--p', ((v-min)/(max-min)*100)+'%')`). `aria-valuetext="45 километров"` при необходимости. Цвет заливки (violet на lilac) — 5.04:1.

### 6.4 Segmented control и радио-чипы

Segmented — «дни / месяцы», «до 4 ч / 4–8 ч / больше 8 ч», «Да / Нет». Радио-чипы — обслуживание, доставка, модель.

```html
<fieldset class="seg">
  <legend class="field__label">Срок аренды</legend>
  <input type="radio" name="unit" id="u-d" value="d" checked><label for="u-d">Дни</label>
  <input type="radio" name="unit" id="u-m" value="m"><label for="u-m">Месяцы</label>
</fieldset>
```

```css
.seg { display: inline-flex; flex-wrap: wrap; gap: 0; padding: 4px; border: var(--bw) solid var(--c-ink); border-radius: var(--r-pill); background: var(--c-paper); margin: 0; }
.seg legend { padding: 0; margin-bottom: 6px; float: left; width: 100%; }
.seg input, .chip input { position: absolute; opacity: 0; width: 1px; height: 1px; }   /* не display:none: сохраняем фокус и клавиатуру */
.seg label { min-height: 44px; padding: 0 20px; display: inline-flex; align-items: center; border-radius: var(--r-pill);
  font: 700 .9375rem/1 var(--font-text); cursor: pointer; transition: background-color var(--dur-fast) linear, color var(--dur-fast) linear; }
.seg label:hover { background: var(--c-lilac); }
.seg input:checked + label { background: var(--c-ink); color: var(--c-cream); }          /* 16.57:1 */
.seg input:focus-visible + label { outline: 3px solid var(--focus); outline-offset: 3px; }
.seg input:disabled + label { color: var(--c-disabled-fg); cursor: not-allowed; }

/* чип-радио (подпись в 1–2 строки) */
.chips { display: flex; flex-wrap: wrap; gap: 8px; border: 0; padding: 0; margin: 0; }
.chip { position: relative; }
.chip label { display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 8px 18px;
  border: var(--bw) solid var(--c-ink); border-radius: var(--r-pill); background: var(--c-paper);
  font: 600 .9375rem/1.2 var(--font-text); cursor: pointer;
  transition: transform var(--dur-fast) var(--ease-out), background-color var(--dur-fast) linear; }
.chip label:hover { background: var(--c-lilac); transform: translateY(-1px); }
.chip input:checked + label { background: var(--c-violet); color: #fff; box-shadow: var(--shadow-hard-sm); }   /* 6.40:1 */
.chip input:checked + label::before { content: "✓"; font-weight: 700; }
.chip input:focus-visible + label { outline: 3px solid var(--focus); outline-offset: 3px; }
.chip input:disabled + label { background: var(--c-disabled-bg); color: var(--c-disabled-fg); border-color: #9A91B5; cursor: not-allowed; }
.chip--private input:checked + label { background: var(--c-private); color: var(--c-ink); }
.chip--org input:checked + label { background: var(--c-org); color: var(--c-ink); }
```

Выбранное состояние обозначено не только цветом: галочка и тень.

### 6.5 Степпер (− / +)

```html
<div class="stepper" role="group" aria-labelledby="n-label">
  <button type="button" class="stepper__btn" aria-label="Уменьшить количество кабин">−</button>
  <input class="stepper__input" id="n" type="number" inputmode="numeric" min="1" max="50" value="1" aria-labelledby="n-label">
  <button type="button" class="stepper__btn" aria-label="Увеличить количество кабин">+</button>
</div>
```

```css
.stepper { display: inline-grid; grid-template-columns: 52px minmax(64px, 88px) 52px; align-items: stretch;
  border: var(--bw) solid var(--c-ink); border-radius: var(--r-pill); background: var(--c-paper); overflow: hidden; }
.stepper__btn { min-height: 52px; border: 0; background: var(--c-lilac); color: var(--c-ink);
  font: 700 1.5rem/1 var(--font-display); cursor: pointer; transition: background-color var(--dur-fast) linear; }
.stepper__btn:hover { background: var(--c-violet); color: #fff; }
.stepper__btn:active { background: var(--c-violet-press); color: #fff; }
.stepper__btn:focus-visible { outline: 3px solid var(--focus); outline-offset: -5px; }
.stepper__btn:disabled { background: var(--c-disabled-bg); color: var(--c-disabled-fg); cursor: not-allowed; }  /* на min/max */
.stepper__input { min-width: 0; width: 100%; border: 0; text-align: center; background: transparent;
  font: 700 1.25rem/1 var(--font-display); font-variant-numeric: tabular-nums; -moz-appearance: textfield; appearance: textfield; }
.stepper__input::-webkit-outer-spin-button, .stepper__input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.stepper.is-error { border-color: var(--c-error); background: var(--c-error-bg); }
```

Долгое нажатие на +/− — автоповтор (400 мс задержка, затем 80 мс). Ввод руками разрешён; значение зажимается 1–50 на `change`, ошибка «Укажите количество кабин от 1 до 50».

### 6.6 Чекбокс

```html
<label class="check">
  <input type="checkbox" name="agree" required aria-describedby="agree-msg">
  <span class="check__box" aria-hidden="true"></span>
  <span class="check__text">Согласен(на) на обработку <a href="/privacy">персональных данных</a></span>
</label>
```

```css
.check { display: grid; grid-template-columns: 28px 1fr; gap: 12px; align-items: start; min-height: 44px; padding-block: 8px; cursor: pointer; position: relative; font-size: var(--fs-small); line-height: 1.4; }
.check input { position: absolute; opacity: 0; width: 28px; height: 28px; margin: 0; }
.check__box { width: 28px; height: 28px; border: var(--bw) solid var(--c-ink); border-radius: 8px; background: var(--c-paper); display: grid; place-items: center;
  transition: background-color var(--dur-fast) linear, transform var(--dur-fast) var(--ease-spring); }
.check__box::after { content: ""; width: 14px; height: 8px; border-left: 3px solid #fff; border-bottom: 3px solid #fff; transform: rotate(-45deg) scale(0); margin-top: -3px; transition: transform var(--dur-fast) var(--ease-spring); }
.check:hover .check__box { background: var(--c-lilac); }
.check input:checked + .check__box { background: var(--c-violet); }
.check input:checked + .check__box::after { transform: rotate(-45deg) scale(1); }
.check input:focus-visible + .check__box { outline: 3px solid var(--focus); outline-offset: 3px; }
.check input:disabled + .check__box { background: var(--c-disabled-bg); border-color: #9A91B5; }
.check.is-error .check__box { border-color: var(--c-error); background: var(--c-error-bg); }
```

Ссылку внутри label нажимать отдельно (клик по ссылке не переключает чекбокс — `a { position: relative; z-index: 1 }` и `event.stopPropagation()` не требуется: нативно переходит по ссылке, но label тоже срабатывает; добавьте `target="_blank"` и не блокируйте).

### 6.7 Карточка каталога

Структура: «сцена» (цветной фон + SVG-кабина) → стикер → название (H3) → описание → 3–4 характеристики → блок цены → кнопка. Остальные характеристики — `<details>` внутри карточки (приём Hardgraft). Каждая модель — свой stage-цвет.

```html
<article class="cab-card" style="--stage: var(--c-stage-1); --cab: #5B2EFF; --cab-d: #4318D9; --cab-l: #E8E0FF">
  <div class="cab-card__stage">
    <span class="sticker">Хит</span>
    <svg class="cab-card__art" viewBox="0 0 200 260" role="img" aria-label="Кабина «База»"><use href="#cabin"/></svg>
  </div>
  <div class="cab-card__body">
    <h3>Стандартная «База»</h3>
    <p class="small">Классика для стройки, дачи и мероприятий. Просто работает.</p>
    <ul class="specs"><li>Бак 250 л</li><li>110×110×230 см</li><li>75 кг</li></ul>
    <details class="more"><summary>Подробнее</summary><p>Вентиляция, запирающаяся дверь, держатель бумаги</p></details>
    <div class="cab-card__price"><span class="price">600&nbsp;₽<small>/сутки</small></span><span class="small">от 6&nbsp;500&nbsp;₽/месяц</span></div>
    <a class="btn btn--primary btn--block" href="#calc">Арендовать</a>
  </div>
</article>
```

```css
.cab-card { display: flex; flex-direction: column; background: var(--c-paper); border: var(--bw) solid var(--c-ink);
  border-radius: var(--r-door); box-shadow: var(--shadow-hard); overflow: hidden;
  transition: transform var(--dur-base) var(--ease-out); }
.cab-card:nth-child(even) { border-radius: var(--r-door-r); }
.cab-card:hover { transform: translateY(-4px) rotate(-.4deg); }
.cab-card:focus-within { outline: 3px solid var(--focus); outline-offset: 4px; }
.cab-card__stage { position: relative; background: var(--stage); height: 220px; display: grid; place-items: end center; border-bottom: var(--bw) solid var(--c-ink); }
.cab-card__stage .sticker { position: absolute; top: 16px; left: 16px; }
.cab-card__art { height: 88%; width: auto; transition: transform var(--dur-slow) var(--ease-spring); transform-origin: 50% 100%; }
.cab-card:hover .cab-card__art { transform: scale(1.04) rotate(-1.5deg); }   /* кабина «кивает» */
.cab-card__body { padding: 20px; display: grid; gap: 12px; flex: 1; align-content: start; }
.specs { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.specs li { padding: 4px 10px; border-radius: var(--r-pill); background: var(--c-lilac-soft); border: 1.5px solid var(--c-ink); font: 600 var(--fs-small)/1.2 var(--font-text); }
.cab-card__price { display: grid; gap: 4px; margin-top: auto; padding-top: 4px; }
.cab-card__body > .btn { margin-top: 8px; }
.cab-card.is-sale .price::after { content: "продажа"; margin-left: 8px; font: 700 var(--fs-label)/1 var(--font-text); letter-spacing: var(--ls-label); text-transform: uppercase; color: var(--c-tangerine-deep); }

/* слайдер на мобильном */
.cab-grid { display: grid; gap: var(--gutter); }
@media (max-width: 767px) {
  .cab-grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 16px; padding: 4px var(--page-pad) 24px; margin-inline: calc(var(--page-pad) * -1); scrollbar-width: none; }
  .cab-card { flex: 0 0 min(82vw, 320px); scroll-snap-align: center; }
}
@media (min-width: 768px) { .cab-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .cab-grid { grid-template-columns: repeat(6, 1fr); }
  .cab-card { grid-column: span 2; } .cab-card:nth-child(n+4) { grid-column: span 3; } }
```

Состояния карточки: default; hover (поднятие + кивок кабины); focus-within (кольцо); «нет в наличии» — `.is-off`: `opacity .6`, кнопка disabled и текст «Сейчас в рейсе. Позвоните — освободим». Loading — скелетон: stage `--c-lilac` с мерцанием `opacity` 1 → .6.
Плашка заглушки цен «ЗАГЛУШКА» — `.sticker--dev` с пунктирной границей, убирается перед запуском.

### 6.8 Вкладка аудитории («папки»)

Два цвета проходят через весь сайт: **розовый = «Частным лицам»**, **жёлтый = «Организациям»**. Вкладки — выступы папки над панелью; активная сливается с панелью (общий цвет, нет границы между ними), неактивная светлее и опущена.

```html
<div class="aud" data-active="private">
  <div class="aud__tabs" role="tablist" aria-label="Для кого">
    <button class="aud__tab aud__tab--private" role="tab" id="t-p" aria-selected="true"  aria-controls="p-p">Частным лицам</button>
    <button class="aud__tab aud__tab--org"     role="tab" id="t-o" aria-selected="false" aria-controls="p-o" tabindex="-1">Организациям</button>
  </div>
  <section class="aud__panel" role="tabpanel" id="p-p" aria-labelledby="t-p">…</section>
  <section class="aud__panel" role="tabpanel" id="p-o" aria-labelledby="t-o" hidden>…</section>
</div>
```

```css
.aud { --tab: var(--c-private); }
.aud[data-active="org"] { --tab: var(--c-org); }
.aud__tabs { display: flex; gap: 8px; padding-inline: 12px; position: relative; z-index: 1; }
.aud__tab { flex: 1 1 0; min-height: 56px; padding: 0 16px;
  font: 700 .9375rem/1.1 var(--font-display); color: var(--c-ink); text-align: center; cursor: pointer;
  background: var(--c-paper); border: var(--bw) solid var(--c-ink); border-bottom-color: var(--c-ink);
  border-radius: 20px 20px 0 0; transform: translateY(6px);
  transition: transform var(--dur-base) var(--ease-spring), background-color var(--dur-fast) linear; }
.aud__tab--private:hover { background: var(--c-private-soft); }
.aud__tab--org:hover     { background: var(--c-org-soft); }
.aud__tab[aria-selected="true"] { transform: translateY(2px); border-bottom-color: transparent; padding-bottom: 2px; }   /* перекрывает верхний край панели */
.aud__tab--private[aria-selected="true"] { background: var(--c-private); }
.aud__tab--org[aria-selected="true"]     { background: var(--c-org); }
.aud__tab:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
.aud__panel { background: var(--tab); border: var(--bw) solid var(--c-ink); border-radius: var(--r-door); box-shadow: var(--shadow-hard);
  padding: 24px 20px; display: grid; gap: 24px; animation: tabIn var(--dur-base) var(--ease-out); }
@media (min-width: 768px) { .aud__tab { flex: 0 0 auto; padding: 0 32px; font-size: 1.0625rem; } .aud__panel { padding: 40px; } }
@media (min-width: 1024px) { .aud__panel { grid-template-columns: 7fr 5fr; } }
@keyframes tabIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.aud__panel .small { color: var(--c-ink-2); }       /* 5.18 на pink, 6.80 на yellow */
```

Клавиатура: стрелки ←/→ переключают вкладки, Home/End, активная вкладка `tabindex="0"`. Те же цвета используются дальше: чипы в отзывах, бейджи «Частное лицо / Организация», цвет кнопки CTA внутри панели не меняется (primary violet).

Состояния: default (белая, опущена); hover (светлый тон своего цвета); active/selected (цвет, поднята, слита с панелью); focus-visible (кольцо); disabled не применяется.

### 6.9 Карточка шага (4 шага, «маршрут»)

```html
<ol class="steps">
  <li class="step" style="--i:0">
    <span class="step__num" aria-hidden="true">1</span>
    <h3 class="step__title">Заявка</h3>
    <p>Звоните, пишите или заполните форму. Назовём цену и время за 15 минут.</p>
  </li>…
</ol>
```

```css
.steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 32px; position: relative; counter-reset: s; }
.step { position: relative; padding: 24px 20px 20px; background: var(--c-paper); border: var(--bw) solid var(--c-ink);
  border-radius: var(--r-door); box-shadow: var(--shadow-hard-sm); }
.step__num { position: absolute; top: -22px; left: 20px; width: 52px; height: 52px; display: grid; place-items: center;
  border: var(--bw) solid var(--c-ink); border-radius: 50%; background: var(--c-yellow);
  font: 900 var(--fs-step-num)/1 var(--font-display); font-variant-numeric: tabular-nums; }
.step:nth-child(2) .step__num { background: var(--c-private); }
.step:nth-child(3) .step__num { background: var(--c-lilac); }
.step:nth-child(4) .step__num { background: var(--c-tangerine); }
.step__title { margin: 12px 0 8px; }

/* маршрут: пунктирная линия + грузовик */
.route { position: absolute; pointer-events: none; z-index: 0; overflow: hidden; }
.route__line { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, var(--c-ink) 0 10px, transparent 10px 20px); height: 3px; top: 50%; }
.route__cover { position: absolute; inset: -4px 0; background: var(--section-bg, var(--bg)); transform-origin: 100% 50%; transition: transform 1.4s var(--ease-in-out); }   /* закрывает линию, уезжает scaleX(0) */
.steps.is-in .route__cover { transform: scaleX(0); }
.route__truck { position: absolute; top: 50%; left: 0; width: 40px; height: 28px; margin-top: -26px; transform: translateX(0); transition: transform 1.4s var(--ease-in-out); }
.steps.is-in .route__truck { transform: translateX(var(--route-w)); }   /* --route-w = ширина маршрута, JS ставит в px */

@media (min-width: 1024px) { .steps { grid-template-columns: repeat(4, 1fr); gap: var(--gutter); }
  .route { left: 8%; right: 8%; top: 2px; height: 28px; } }
@media (max-width: 1023px) {   /* вертикальный маршрут */
  .route { left: 46px; top: 24px; bottom: 24px; width: 28px; }
  .route__line { width: 3px; height: auto; left: 50%; top: 0; bottom: 0; background: repeating-linear-gradient(180deg, var(--c-ink) 0 10px, transparent 10px 20px); }
  .route__cover { transform-origin: 50% 100%; } .steps.is-in .route__cover { transform: scaleY(0); }
}
```

Идея: направление всегда «заявка → вывоз» (слева направо или сверху вниз). При входе секции в экран линия «прорисовывается» (обложка сжимается), грузовик (маленький SVG) едет вдоль неё. Один проход, не цикл. Вертикальный вариант на мобильном: JS меняет `--route-h`, и грузовик двигается `translateY`. Если проще, на мобиле только «прорисовка» линии, без грузовика. Всё через `transform`.

### 6.10 Карточка отзыва

```css
.review { display: flex; flex-direction: column; gap: 14px; padding: 24px 20px; background: var(--c-paper); color: var(--c-ink);
  border: var(--bw) solid var(--c-ink); border-radius: var(--r-door); box-shadow: 6px 6px 0 var(--c-yellow); }   /* на violet-секции */
.review:nth-child(odd)  { transform: rotate(-.6deg); } .review:nth-child(even) { transform: rotate(.6deg); }
.review__stars { display: flex; gap: 2px; color: var(--c-ink); } .review__stars svg { width: 20px; height: 20px; fill: var(--c-yellow); stroke: var(--c-ink); stroke-width: 1.5; }
.review__stars .off { fill: var(--c-paper); }
.review__quote { margin: 0; font-size: 1rem; line-height: 1.5; }
.review__meta { margin-top: auto; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: var(--fs-small); }
.review__who { font-weight: 700; }
.badge { display: inline-flex; padding: 4px 10px; border: 1.5px solid var(--c-ink); border-radius: var(--r-pill); font: 700 var(--fs-label)/1 var(--font-text); letter-spacing: var(--ls-label); text-transform: uppercase; }
.badge--private { background: var(--c-private); } .badge--org { background: var(--c-org); }
.review:hover { transform: rotate(0) translateY(-3px); transition: transform var(--dur-base) var(--ease-out); }
```

Звёзды: `role="img" aria-label="Оценка 4 из 5"`; не только цвет — есть пустые контуры. Слайдер: scroll-snap, стрелки-кнопки 48px (`aria-label="Предыдущий отзыв"`), `scroll-snap-type: x mandatory`; на ≥1024 — 3 колонки без слайдера, если отзывов ≤ 6 (сетка).
Плашка «ЗАГЛУШКА — отзывы вымышленные» — `.sticker--dev` в углу секции.

### 6.11 Аккордеон FAQ

Нативный `<details name="faq">` (эксклюзивное раскрытие) или несколько открытых, по желанию. Первый пункт `open`.

```html
<details class="faq" name="faq" open>
  <summary><h3 class="faq__q">Как часто нужно чистить кабину?</h3><span class="faq__icon" aria-hidden="true"></span></summary>
  <div class="faq__a"><p>…</p></div>
</details>
```

```css
.faq { border: var(--bw) solid var(--c-ink); border-radius: var(--r-md); background: var(--c-paper); transition: background-color var(--dur-fast) linear; }
.faq + .faq { margin-top: 12px; }
.faq summary { list-style: none; display: grid; grid-template-columns: 1fr 40px; gap: 16px; align-items: center; min-height: 64px; padding: 12px 16px 12px 20px; cursor: pointer; }
.faq summary::-webkit-details-marker { display: none; }
.faq__q { font: 700 1rem/1.3 var(--font-text); letter-spacing: 0; margin: 0; hyphens: manual; }      /* вопрос в Onest, не Unbounded: читаемость */
.faq__icon { width: 40px; height: 40px; border: var(--bw) solid var(--c-ink); border-radius: 50%; background: var(--c-lilac); position: relative; transition: transform var(--dur-base) var(--ease-spring), background-color var(--dur-fast) linear; }
.faq__icon::before, .faq__icon::after { content: ""; position: absolute; inset: 0; margin: auto; width: 14px; height: 3px; background: var(--c-ink); border-radius: 2px; }
.faq__icon::after { transform: rotate(90deg); transition: transform var(--dur-base) var(--ease-out); }
.faq summary:hover .faq__icon { background: var(--c-yellow); }
.faq[open] { background: var(--c-lilac-soft); box-shadow: var(--shadow-hard-sm); }
.faq[open] .faq__icon { background: var(--c-violet); transform: rotate(180deg); }
.faq[open] .faq__icon::before, .faq[open] .faq__icon::after { background: #fff; }
.faq[open] .faq__icon::after { transform: rotate(0); }       /* плюс превращается в минус */
.faq summary:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; border-radius: var(--r-md); }
.faq__a { padding: 0 20px 20px; max-width: 68ch; animation: fadeIn var(--dur-base) var(--ease-out); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
```

Высоту не анимируем (чтобы не было layout-анимации), раскрытие мгновенное + плавное проявление текста (`opacity`). Состояния: default / hover (иконка жёлтая) / focus-visible / open / disabled не применяется.

### 6.12 Зоны доставки: список и карта-заглушка

Карта — SVG «радар»: три концентрических круга вокруг маркера «Новосибирск». Цвета совпадают с карточками зон. Пока нет реальной карты, это и есть финальная иллюстрация.

```html
<svg class="zone-map" viewBox="0 0 400 400" role="img" aria-label="Схема зон доставки: город, до 30 км, 30–300 км">
  <circle cx="200" cy="200" r="190" fill="#E8E0FF" stroke="#1D0F3A" stroke-width="3" stroke-dasharray="3 10" stroke-linecap="round"/>
  <circle cx="200" cy="200" r="120" fill="#FFF0A8" stroke="#1D0F3A" stroke-width="3"/>
  <circle cx="200" cy="200" r="58"  fill="#FFA6C4" stroke="#1D0F3A" stroke-width="3"/>
  <path d="M170 215c12-14 24 10 40-4s30 6 22 18" fill="none" stroke="#1D0F3A" stroke-width="3" stroke-linecap="round" opacity=".5"/> <!-- условная река Обь -->
  <circle cx="200" cy="200" r="9" fill="#5B2EFF" stroke="#1D0F3A" stroke-width="3"/>
  <!-- подписи городов: text Onest 700 14px fill #1D0F3A, Бердск, Обь, Кольцово -->
</svg>
```

```css
.zone-map { width: 100%; max-width: 480px; height: auto; }
.zone { display: grid; grid-template-columns: 20px 1fr; gap: 6px 14px; padding: 18px 20px; background: var(--c-paper);
  border: var(--bw) solid var(--c-ink); border-radius: var(--r-door); box-shadow: var(--shadow-hard-sm); }
.zone + .zone { margin-top: 16px; }
.zone__dot { width: 20px; height: 20px; border-radius: 50%; border: var(--bw) solid var(--c-ink); margin-top: 4px; }
.zone--city .zone__dot { background: var(--c-private); } .zone--near .zone__dot { background: var(--c-org-soft); } .zone--far .zone__dot { background: var(--c-lilac); }
.zone__name { font: 700 1.0625rem/1.25 var(--font-text); } .zone__terms, .zone__time { grid-column: 2; margin: 0; }
.zone__price { font-variant-numeric: tabular-nums; font-weight: 700; }
.zone.is-active { background: var(--c-lilac-soft); box-shadow: var(--shadow-hard); transform: translateY(-2px); }   /* hover подсвечивает кольцо на карте */
```

Мини-форма «населённый пункт»: поле + кнопка `btn--secondary`; успех — `.form-success`.

### 6.13 Блок цены: разбивка + прогресс скидки

Тёмная карточка-«чек». Сумма жёлтым (12.79:1), строки разбивки — leader-dots, прогресс до скидки внизу.

```html
<aside class="calc-result on-dark" aria-labelledby="res-t">
  <p class="label" id="res-t">Примерно</p>
  <p class="price price--xl calc-result__total" aria-hidden="true"><span data-total>13 400</span>&nbsp;₽</p>
  <p class="visually-hidden" role="status" aria-live="polite" data-total-sr>Примерно 13 400 рублей</p>
  <dl class="breakdown">
    <div><dt>Аренда</dt><dd data-rent>11 000 ₽</dd></div>
    <div><dt>Обслуживание</dt><dd>1 600 ₽</dd></div>
    <div><dt>Доставка и вывоз</dt><dd>800 ₽</dd></div>
    <div class="breakdown__discount" hidden><dt>Скидка за количество −5%</dt><dd>−550 ₽</dd></div>
  </dl>
  <div class="discount">
    <p class="discount__text" id="disc-t">Ещё 3 кабины — и скидка 5% на аренду</p>
    <div class="discount__bar" role="progressbar" aria-valuemin="0" aria-valuemax="10" aria-valuenow="2" aria-labelledby="disc-t" style="--p:.2">
      <span class="discount__fill"></span>
      <span class="discount__tick" style="left:50%"><i>5%</i></span>
      <span class="discount__tick" style="left:100%"><i>10%</i></span>
    </div>
  </div>
  <p class="small">Это ориентир. Итоговую цену назовём до оплаты, и она не изменится.</p>
  <a class="btn btn--accent btn--block btn--lg" href="#order">Заказать за 13&nbsp;400&nbsp;₽</a>
  <a class="btn btn--ghost" href="#">Отправить расчёт в Telegram</a>
</aside>
```

```css
.calc-result { background: var(--c-ink); color: var(--c-cream); padding: 24px 20px; border-radius: var(--r-door);
  border: var(--bw) solid var(--c-ink); box-shadow: 10px 10px 0 var(--c-yellow); display: grid; gap: 16px; }
.calc-result .label { color: var(--c-ink-mute-on-dark); }
.calc-result__total { color: var(--c-yellow); }                         /* 12.79:1 */
.breakdown { margin: 0; display: grid; gap: 10px; font-size: .9375rem; }
.breakdown > div { display: flex; align-items: baseline; gap: 8px; }
.breakdown dt { color: var(--c-ink-mute-on-dark); }
.breakdown > div::after { content: ""; order: 1; flex: 1; border-bottom: 2px dotted rgba(205,195,236,.5); transform: translateY(-4px); }   /* leader-dots */
.breakdown dd { order: 2; margin: 0; font: 700 1rem/1 var(--font-display); font-variant-numeric: tabular-nums; }
.breakdown__discount dd { color: var(--c-yellow); }
@media (min-width: 1024px) { .calc-result { position: sticky; top: 96px; padding: 32px; } }

/* прогресс до скидки: заливка только transform: scaleX */
.discount__bar { position: relative; height: 14px; border: var(--bw) solid var(--c-cream); border-radius: var(--r-pill); background: rgba(255,246,230,.12); margin-block: 22px 26px; }
.discount__fill { position: absolute; inset: 0; border-radius: inherit; background: var(--c-tangerine); transform-origin: 0 50%; transform: scaleX(var(--p)); transition: transform var(--dur-slow) var(--ease-out); }
.discount__tick { position: absolute; top: -2px; width: 3px; height: 18px; background: var(--c-cream); transform: translateX(-100%); }
.discount__tick i { position: absolute; top: 22px; right: 0; font: 700 var(--fs-label)/1 var(--font-text); font-style: normal; transform: translateX(50%); }
.discount.is-reached .discount__fill { background: var(--c-yellow); }           /* достигли — жёлтый + текст «Скидка 5% применена» */
.discount.is-max .discount__text::before { content: "★ "; }
```

JS: `--p = min(N, 10) / 10`. Тексты: N<5 «Ещё {5−N} кабин — и скидка 5% на аренду»; 5≤N<10 «Скидка 5% уже ваша. Ещё {10−N} — и будет 10%»; N≥10 «Максимальная скидка −10%. Дальше только бесплатные эмоции». Прогресс несёт и числовой/текстовый смысл (не только цвет).

Состояния блока: default; updating (число твинится); ошибка ввода (`.calc-result.is-invalid` — сумма заменяется «—» и текст «Проверьте поля слева», кнопка disabled); «индивидуальный расчёт» (N>50 / km>300): вместо суммы текст из `structure.md`, кнопка «Оставить заявку».

Тween числа: см. раздел 8. Разбивка также обновляется.

### 6.14 Бегущая строка (marquee)

```html
<div class="marquee" role="region" aria-label="Наши обещания">
  <div class="marquee__track">
    <ul class="marquee__group">
      <li>Работаем зимой при −35</li><li>Без скрытых доплат</li><li>Чистая кабина или возврат денег за сутки</li>…
    </ul>
    <ul class="marquee__group" aria-hidden="true">…то же…</ul>
  </div>
</div>
```

```css
.marquee { background: var(--c-yellow); color: var(--c-ink); border-block: var(--bw) solid var(--c-ink); overflow: hidden; }
.marquee__track { display: flex; width: max-content; animation: marquee 45s linear infinite; will-change: transform; }
.marquee:hover .marquee__track, .marquee:focus-within .marquee__track { animation-play-state: paused; }
.marquee__group { display: flex; flex: none; align-items: center; margin: 0; padding: 0; list-style: none; }
.marquee__group li { display: flex; align-items: center; padding: 14px 0; font: 700 1rem/1 var(--font-display); letter-spacing: -.01em; white-space: nowrap; }
.marquee__group li::after { content: ""; width: 22px; height: 22px; margin-inline: 24px; flex: none;     /* разделитель — цветок-звезда */
  background: var(--c-violet); -webkit-mask: var(--star) center/contain no-repeat; mask: var(--star) center/contain no-repeat; }
@media (min-width: 1024px) { .marquee__group li { font-size: 1.125rem; padding-block: 18px; } }
@keyframes marquee { to { transform: translateX(-50%); } }
```

`--star`: data-URI SVG 8-лучевой «снежинка/звезда» (любой простой полигон/кривая; рисуется самостоятельно). Скорость: ~60–80 px/с (45 с на цикл при ~3500 px группы); на мобиле 35 с. Опционально лёгкий наклон `rotate(-1deg)` на всей ленте; контейнер с `overflow: clip` и `margin-inline: -2%`.

### 6.15 Sticky-панель на мобильном

Появляется после ухода hero (IntersectionObserver на hero), скрывается на ≥1024. Две кнопки по 50%.

```html
<nav class="sticky-cta" aria-label="Быстрые действия" data-visible="false">
  <a class="btn btn--secondary" href="tel:+73830000000"><svg aria-hidden="true">…</svg>Позвонить</a>
  <a class="btn btn--primary" href="#calc">Рассчитать</a>
</nav>
```

```css
.sticky-cta { position: fixed; z-index: 50; left: 0; right: 0; bottom: 0;
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  padding: 12px var(--page-pad) calc(12px + env(safe-area-inset-bottom));
  background: var(--c-paper); border-top: var(--bw) solid var(--c-ink); box-shadow: var(--shadow-soft);
  transform: translateY(110%); transition: transform var(--dur-base) var(--ease-out); }
.sticky-cta[data-visible="true"] { transform: translateY(0); }
.sticky-cta .btn { min-height: 52px; padding-inline: 12px; }
@media (min-width: 1024px) { .sticky-cta { display: none; } }
body.has-sticky { padding-bottom: calc(76px + env(safe-area-inset-bottom)); }
body.keyboard-open .sticky-cta { transform: translateY(110%); }   /* прятать, когда в фокусе поле формы (focusin/out) */
```

Правила: высота панели ≥ 76px; кнопки не меньше 52px; между кнопками 12px; не перекрывает последний блок (отступ у body); на десктопе — плавающая кнопка «Заказать звонок»:

```css
.fab { position: fixed; z-index: 50; right: 24px; bottom: 24px; display: none; }
@media (min-width: 1024px) { .fab { display: inline-flex; box-shadow: var(--shadow-soft); } }
```
FAB — `btn btn--accent` с иконкой телефона; пульсация только 2 раза после загрузки (`transform: scale`, потом остановка).

### 6.16 Header, навигация, мобильное меню

```css
.header { position: sticky; top: 0; z-index: 60; background: var(--c-cream); border-bottom: var(--bw) solid var(--c-ink); }
.header__row { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 64px; }
@media (min-width: 1024px) { .header__row { min-height: 76px; } }
.logo { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: var(--c-ink); min-height: 44px; }
.logo__mark { width: 32px; height: 38px; }                 /* знак: «дверца» (скруглённый прямоугольник) + кружок-ручка, SVG */
.logo__text { display: grid; line-height: 1; }
.logo__text b { font: 900 1.0625rem/1 var(--font-display); letter-spacing: -.02em; }       /* ЭКО СЕРВИС */
.logo__text span { font: 700 .6875rem/1 var(--font-text); letter-spacing: .18em; margin-top: 4px; color: var(--c-violet); }   /* НОВОСИБИРСК */

.nav { display: none; }
@media (min-width: 1024px) {
  .nav { display: flex; align-items: center; gap: 4px; }
  .nav a { position: relative; display: inline-flex; align-items: center; min-height: 44px; padding: 0 12px; font: 600 .9375rem/1 var(--font-text); color: var(--c-ink); text-decoration: none; }
  .nav a::after { content: ""; position: absolute; left: 12px; right: 12px; bottom: 6px; height: 3px; border-radius: 2px; background: var(--c-violet);
    transform: scaleX(0); transform-origin: 0 50%; transition: transform var(--dur-base) var(--ease-out); }
  .nav a:hover::after, .nav a[aria-current="true"]::after { transform: scaleX(1); }
  .header__phone { font: 700 1rem/1 var(--font-text); font-variant-numeric: tabular-nums; color: var(--c-ink); text-decoration: none; }
}
.burger { width: 48px; height: 48px; border: var(--bw) solid var(--c-ink); border-radius: 50%; background: var(--c-paper); display: grid; place-items: center; cursor: pointer; }
.burger:hover { background: var(--c-lilac); }
.burger[aria-expanded="true"] { background: var(--c-yellow); }
@media (min-width: 1024px) { .burger { display: none; } }
```

Мобильное меню: полноэкранная панель под хедером, фон violet, ссылки Unbounded 700 24px (cream, 5.97), по одной в строке с высотой ≥ 56px и разделителями-волнами; внизу — телефон (`btn--contact`) и «Рассчитать» (accent). Анимация `opacity` + `translateY(-8px → 0)`, 220 мс. `aria-expanded` на кнопке, `aria-controls`, Esc закрывает, фокус возвращается на кнопку, фокус заперт внутри меню, у `body` `overflow: hidden`. Клик по якорю закрывает меню. В хедере на мобильном: лого слева, справа — иконка-телефон 48px и бургер. «Рассчитать» только внутри меню и sticky-панели.

Активный пункт при скролле (`aria-current="true"`) выставляется IntersectionObserver. `scroll-margin-top` у секций = высота хедера + 8px; `html { scroll-behavior: smooth }` только при отсутствии reduced motion.

### 6.17 Footer

```css
.footer { --section-bg: var(--c-ink); background: var(--c-ink); color: var(--c-cream); padding-block: 64px 32px; position: relative; }
.footer a { color: var(--c-cream); text-decoration-color: var(--c-yellow); }
.footer a:hover { color: var(--c-yellow); }
.footer__brand { font: 900 clamp(2rem, 1rem + 5vw, 4.5rem)/.95 var(--font-display); letter-spacing: -.03em; color: var(--c-yellow); }
.footer__grid { display: grid; gap: 32px; margin-top: 40px; }
@media (min-width: 768px) { .footer__grid { grid-template-columns: 2fr 1fr 1fr; } }
.footer__legal { margin-top: 48px; padding-top: 24px; border-top: var(--bw) solid rgba(205,195,236,.3); font-size: var(--fs-small); color: var(--c-ink-mute-on-dark); }
.footer li { min-height: 44px; display: flex; align-items: center; }
```

Содержимое: огромный вордмарк «ЭКО СЕРВИС» желтым, телефон, мессенджеры, адрес, часы, ссылки на политику и реквизиты, мелкая шутка в нижней строке («Сделано в Новосибирске. Руки мыли»). Вордмарк — декор; для скринридеров `aria-hidden="true"` или обычный текст.

### 6.18 Таблица «Мы vs обычный прокат»

Две колонки значений, строки-критерии. На 360px без горизонтального скролла: каждая строка превращается в карточку (критерий сверху, под ним две ячейки рядом с подписями «Мы» / «Обычный прокат»). На ≥768px — настоящая таблица.

```html
<div class="vs" role="table" aria-label="Сравнение с обычным прокатом">
  <div class="vs__head" role="row">
    <span role="columnheader" class="vs__corner"></span>
    <span role="columnheader" class="vs__us">Мы</span>
    <span role="columnheader" class="vs__them">Обычный прокат</span>
  </div>
  <div class="vs__row" role="row">
    <span role="rowheader" class="vs__crit">Мойка и дезинфекция перед выдачей</span>
    <span role="cell" class="vs__us"><i class="vs__ico vs__ico--yes" aria-hidden="true">✓</i><span class="visually-hidden">Да: </span>Каждую кабину</span>
    <span role="cell" class="vs__them"><i class="vs__ico vs__ico--no" aria-hidden="true">✗</i><span class="visually-hidden">Нет: </span>«Кажется, мыли»</span>
  </div>
</div>
```

```css
.vs { border: var(--bw) solid var(--c-ink); border-radius: var(--r-door); background: var(--c-paper); box-shadow: var(--shadow-hard); overflow: hidden; }
.vs__head { display: grid; grid-template-columns: 1fr 1fr; }
.vs__corner { display: none; }
.vs__head .vs__us   { background: var(--c-violet); color: #fff; }          /* 6.40 */
.vs__head .vs__them { background: var(--c-lilac-soft); color: var(--c-ink-2); }
.vs__head > span { padding: 14px 16px; font: 700 .9375rem/1.2 var(--font-display); }
.vs__row { display: grid; grid-template-columns: 1fr 1fr; border-top: var(--bw) solid var(--c-ink); }
.vs__crit { grid-column: 1 / -1; padding: 12px 16px 4px; font: 700 1rem/1.3 var(--font-text); }   /* критерий на всю ширину */
.vs__row .vs__us, .vs__row .vs__them { display: flex; gap: 8px; align-items: flex-start; padding: 8px 16px 14px; font-size: var(--fs-small); line-height: 1.35; }
.vs__row .vs__us { font-weight: 600; background: var(--c-lilac-soft); }
.vs__ico { flex: none; width: 24px; height: 24px; display: grid; place-items: center; border: 2px solid var(--c-ink); border-radius: 50%; font: 700 .8125rem/1 var(--font-text); font-style: normal; }
.vs__ico--yes { background: var(--c-yellow); color: var(--c-ink); } .vs__ico--no { background: var(--c-paper); color: var(--c-error); }   /* смысл и в символе, не только в цвете */
@media (min-width: 768px) {
  .vs__head, .vs__row { grid-template-columns: 1.4fr 1fr 1fr; }
  .vs__corner { display: block; }
  .vs__crit { grid-column: auto; padding: 18px 20px; display: flex; align-items: center; }
  .vs__row .vs__us, .vs__row .vs__them { padding: 18px 20px; align-items: center; font-size: 1rem; }
}
```

Строки (из структуры): мойка перед выдачей; окно доставки 2 часа; цена в договоре = цена в калькуляторе; работа зимой при −35; документы для юрлиц; фотоотчёт после визита. Подпись «обычного проката» — мягкая и без называния конкурентов. Строк 5–6, не больше.

### 6.19 Переключатель групп FAQ

Три группы: «Частным», «Организациям», «Обслуживание и зима». Цвета групп: розовый, жёлтый, лиловый. Это радио-чипы (фильтр), аккордеон 6.11 ниже. Панели не ARIA-tabs, а фильтр списка; `<details>` вне выбранной группы получают `hidden`.

```html
<fieldset class="chips faq-groups">
  <legend class="visually-hidden">Группа вопросов</legend>
  <span class="chip chip--private"><input type="radio" name="fg" id="fg-p" value="private" checked><label for="fg-p">Частным</label></span>
  <span class="chip chip--org"><input type="radio" name="fg" id="fg-o" value="org"><label for="fg-o">Организациям</label></span>
  <span class="chip chip--service"><input type="radio" name="fg" id="fg-s" value="service"><label for="fg-s">Обслуживание и зима</label></span>
</fieldset>
<div class="faq-list" data-group="private" aria-live="polite">…<details class="faq" data-g="private">…</details>…</div>
```

```css
.faq-groups { margin-bottom: 24px; }
.chip--service input:checked + label { background: var(--c-lilac); color: var(--c-violet-press); }  /* 6.97+ на lilac */
.faq-list > .faq[hidden] { display: none; }
.faq-list { animation: fadeIn var(--dur-base) var(--ease-out); }   /* перезапускать классом при смене */
@media (max-width: 767px) { .faq-groups { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin-inline: calc(var(--page-pad) * -1); padding: 4px var(--page-pad); scroll-snap-type: x proximity; } .faq-groups .chip { flex: none; } }
```

При смене группы раскрыт первый вопрос новой группы; сводка группы не нужна. Вопросы из `structure.md` раскидать: «Частным» (чистка, предоплата, повреждение, свой ли приезд), «Организациям» (документы и НДС, сколько кабин на мероприятие, утилизация), «Обслуживание и зима» (частота, не замерзает, скорость доставки). Вопрос без группы не оставлять; общий (покупка) — в «Частным».

### 6.20 Гигантский вордмарк в футере

Занимает всю ширину контейнера и не вылезает на 360px. Две строки «ЭКО / СЕРВИС» вместо одной — шрифт Unbounded очень широкий.

```html
<div class="footer__word" aria-hidden="true"><span>ЭКО</span><span>СЕРВИС</span></div>
```

```css
.footer__word { display: grid; font: 900 min(15.5vw, 5rem)/.86 var(--font-display); letter-spacing: -.04em;
  color: var(--c-yellow); text-transform: uppercase; user-select: none; overflow: clip; margin-top: 40px; }
.footer__word span { display: block; white-space: nowrap; }
.footer__word span:last-child { color: transparent; -webkit-text-stroke: 3px var(--c-yellow); }   /* вторая строка контуром */
@media (min-width: 768px) { .footer__word { grid-auto-flow: column; justify-content: space-between; font-size: min(10.4vw, 11rem); } }
```

Расчёт: «СЕРВИС» в Unbounded 900 ≈ 5.2em шириной. На 360px (контент 328px) `15.5vw` = 55.8px даёт ≈ 290px, влезает. На ≥768px обе строки в один ряд «ЭКО СЕРВИС» ≈ 8.8em с зазором; `10.4vw` при 1280px = 133px → кап 11rem (176px) не достигается, ряд занимает ≈ 1170px при контейнере 1200. Это оценка по ширине глифов: обязательно проверить в браузере на 360/768/1280 и подправить множитель, если ряд шире контейнера (`overflow: clip` — только страховка). Декор: `aria-hidden`, настоящее название лежит в `.logo` и тексте.

### 6.21 Рейтинг и доверие под CTA в hero

Одна строка под формой/кнопкой: 5 звёзд + текст. Данные — заглушки (4,9 из 5, «по 240 отзывам», «1 200+ кабин с 2018»). Не имитировать чужие сервисы-агрегаторы, пока нет реальной ссылки.

```html
<p class="trust">
  <span class="trust__stars" role="img" aria-label="Оценка 4,9 из 5">★★★★★</span>
  <span><b>4,9</b> по 240 отзывам · <span class="trust__sep">1 200+ кабин с 2018 года</span></span>
</p>
```

```css
.trust { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; margin: 16px 0 0; font-size: var(--fs-small); line-height: 1.35; color: var(--text-2); }
.trust__stars { color: var(--c-yellow); font-size: 1.125rem; letter-spacing: 2px; text-shadow: 0 0 0 var(--c-ink); }
.trust b { color: var(--text); font-weight: 700; }
.trust__sep::before { content: ""; display: inline-block; width: 4px; height: 4px; margin: 0 8px 3px 0; border-radius: 50%; background: currentColor; }
.on-dark.hero .trust { color: var(--c-lilac); }   /* 5.04:1 на violet */
```

Звёзды жёлтые на violet: 4.61:1 (UI ≥ 3:1). Рядом всегда числовой рейтинг (смысл не только в цвете).

### 6.22 «Клякса»-врезка с фактом (blob callout)

Органичный цветной блок с одним крупным фактом («1 200+ кабин», «−35 °C — не страшно», «15 минут — перезвоним»). Форма — через `border-radius` с эллиптическими значениями (без SVG) либо SVG-маска для более неровного контура.

```html
<aside class="blob blob--yellow">
  <p class="blob__num price price--xl">15<small>мин</small></p>
  <p class="blob__text">Столько уходит, чтобы перезвонить и назвать цену</p>
</aside>
```

```css
.blob { --blob-bg: var(--c-yellow); position: relative; display: grid; align-content: center; justify-items: center; text-align: center; gap: 8px;
  width: min(100%, 280px); aspect-ratio: 1 / .92; padding: 28px; color: var(--c-ink); background: var(--blob-bg);
  border: var(--bw-bold) solid var(--c-ink);
  border-radius: 58% 42% 55% 45% / 48% 56% 44% 52%;       /* органика CSS-ом */
  box-shadow: 6px 6px 0 var(--c-ink); transform: rotate(-3deg); }
.blob--pink { --blob-bg: var(--c-private); } .blob--lilac { --blob-bg: var(--c-lilac); } .blob--tang { --blob-bg: var(--c-tangerine); }   /* ink на tangerine 5.70 */
.blob__num { margin: 0; } .blob__text { margin: 0; font: 600 var(--fs-small)/1.35 var(--font-text); max-width: 20ch; color: var(--c-ink); }
@media (hover: hover) { .blob { transition: border-radius var(--dur-slow) var(--ease-out), transform var(--dur-base) var(--ease-spring); }
  .blob:hover { transform: rotate(1deg) scale(1.03); } }          /* border-radius не анимируем на мобильных; на десктопе допустимо, элемент один */
.blob--b { border-radius: 44% 56% 48% 52% / 56% 44% 56% 44%; transform: rotate(2.5deg); }   /* вариант формы для чередования */
```

Вариант с SVG: `mask: url("data:image/svg+xml,…") center/100% 100% no-repeat` с кривой `path` на 8 точках; контур тогда рисуется вторым SVG-слоем. Для простоты начинать с CSS-варианта. Размещать 1–3 клякс в блоках «Почему мы», hero (рядом с иллюстрацией, частично перекрывая кабину) и калькуляторе; не больше двух на экран; цвета чередовать, не использовать tangerine рядом с жёлтой. Текст внутри — только ink.

---

## 7. Иллюстрации и плейсхолдеры (вместо фото)

Принцип: **плоские геометрические SVG с чернильным контуром** — как этикетка на упаковке. Никаких градиентов, текстур, фото-вставок и «реалистичных» теней. Нужны: 5 кабин, 4 сцены (дача, стройка, свадьба, фестиваль/забег), сервисная машина, иконки.

### 7.1 Язык формы

| Параметр | Значение |
|---|---|
| Контур | `stroke: #1D0F3A`, толщина 4 на viewBox 200 (≈ 3px на экране), `stroke-linejoin: round`, `stroke-linecap: round` |
| Заливка | плоская, из токенов палитры; 1 основной цвет + 1 тёмный тон (−15% яркости) для крыши/тени + 1 светлый для двери |
| Тень | овал на земле: `ellipse`, fill `#1D0F3A`, `opacity .15`. Блики не рисуем |
| Углы | скругления `rx` 8–12 (вписываются в «дверцу») |
| Детали | не более 6 деталей на объект: крыша, дверь, вентиляция, ручка, индикатор, модельная деталь (раковина, пандус, радиатор) |
| Композиция | объект стоит на цветной «сцене», фон = цвет секции (Bite: бесшовность) |
| Цвет кабины | у каждой модели свой: База violet, Чистые руки pink, Без барьеров yellow, Зима ice blue + violet крыша, Дачник tangerine |
| Лицо/юмор | у индикатора «занято» — маленькая улыбка; у зимней кабины шарф, у «Чистых рук» мыльные пузыри, у «Без барьеров» пандус. Максимум одна шутка на иллюстрацию |

### 7.2 Базовая кабина (symbol)

Кладётся один раз в скрытый `<svg>`, используется через `<use href="#cabin">`. Цвета меняются CSS-переменными `--cab`, `--cab-d`, `--cab-l` на родителе.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="cabin" viewBox="0 0 200 260">
    <ellipse cx="100" cy="248" rx="74" ry="8" fill="#1D0F3A" opacity=".15"/>
    <g stroke="#1D0F3A" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <rect x="40" y="40" width="120" height="200" rx="10" fill="var(--cab,#5B2EFF)"/>          <!-- корпус -->
      <rect x="32" y="24" width="136" height="26" rx="10" fill="var(--cab-d,#4318D9)"/>          <!-- крыша -->
      <rect x="58" y="70" width="84" height="162" rx="8" fill="var(--cab-l,#E8E0FF)"/>           <!-- дверь -->
      <path d="M74 88h52M74 98h52M74 108h52" fill="none"/>                                       <!-- вентиляция -->
      <circle cx="100" cy="134" r="8" fill="#FFD82B"/>                                           <!-- индикатор -->
      <path d="M96 134q4 3 8 0" fill="none" stroke-width="2.5"/>                                 <!-- улыбка индикатора -->
      <circle cx="128" cy="170" r="5" fill="#1D0F3A"/>                                           <!-- ручка -->
    </g>
  </symbol>
</svg>
```

Варианты: «Чистые руки» — добавить слева `<g>` раковины (трапеция + кран, 3 пузыря-круга fill white), «Без барьеров» — корпус шире (viewBox 280×260) + пандус-трапеция + значок доступности из круга и ломаной линии, «Зима» — снежная шапка на крыше (волнистый path fill white), шарф-полоса на двери, снежинки-крестики; «Дачник» — меньше, с торфяным ведром (цилиндр) и лопаточкой.

### 7.3 Сцены

Размер: 4:3 или 1:1, фон — плоский цвет секции/stage. Состав сцены: небо (цвет-плашка), 1–2 крупных «солнца/луны» (круг yellow с контуром), волнистый горизонт (тот же `--wave` в крупном масштабе, цвет земли), ёлки/берёзы (треугольники и белые вертикальные штрихи на тёмных стволах — сибирский фон), 1–2 бытовых силуэта и кабина на переднем плане.

| Сцена | Фон | Состав |
|---|---|---|
| Дача / праздник | pink-soft | беседка из прямоугольников + гирлянда флажков (треугольники в 4 цветах), кабина База |
| Стройка | yellow-soft | кран из линий 4px, куча (полукруг), бытовка, кабина |
| Свадьба | lilac | арка из полукруга, сердечки, фонарики, 2 кабины, «Без очереди» на табличке |
| Фестиваль / забег | tangerine-soft `#FFD9C7` | гирлянда-арка финиша, человечки-кружки в ряд (не очередь), ряд кабин |
| Зима | ice `#DCEBFF` | снег — белые волны, ёлки с белыми шапками, зимняя кабина с дымком-пледом |

Люди — кружок (голова) + капля (тело), без лиц; контур 3px. Сервисная машина — прямоугольник кузова + кабина с окном, 2 колеса (круги r=14, внутри r=5), бочка-цилиндр. Движется (`translateX`) только в блоке «Шаги».

Иконки (24/32px): тот же контур 2.5–3px, скруглённые концы, заливка 1 цвет; набор: телефон, мессенджер, галочка, чистота (искры), часы, снежинка, документ, грузовик, место-пин, звезда отзыва, плюс/минус, бургер, закрыть.

### 7.4 Плейсхолдер фото (пока нет реальных)

```css
.ph { position: relative; display: grid; place-items: center; text-align: center; aspect-ratio: 4 / 3; padding: 16px;
  border: var(--bw) dashed var(--c-ink); border-radius: var(--r-door); color: var(--c-ink-2); font: 600 var(--fs-small)/1.3 var(--font-text);
  background: repeating-linear-gradient(135deg, var(--c-lilac-soft) 0 14px, var(--c-lilac) 14px 28px); }
.ph::before { content: "ФОТО"; position: absolute; top: 12px; left: 12px; font: 700 var(--fs-label)/1 var(--font-text); letter-spacing: var(--ls-label); color: var(--c-ink-2); }
```

Подпись: что именно должно быть («Фото сервисной машины на фоне Новосибирска, ведущая сторона слева»). Если фото появятся: рамка `--bw` ink и «дверной» радиус, тёплая цветокоррекция, фон секции в цвет неба. Без зерна и плёночных фильтров.

---

## 8. Движение

Принцип: **одно направление и один смысл**. Кабина «приезжает» слева направо (шаги, маршрут), всё остальное — короткие отклики. Анимируем **только `transform` и `opacity`** (исключения: `background-color` на hover — дёшево и без layout; переход цвета трека слайдера).

### 8.1 Токены

```css
:root {
  --dur-instant: 80ms;
  --dur-fast: 140ms;     /* hover, нажатия */
  --dur-base: 240ms;     /* вкладки, аккордеон, меню */
  --dur-slow: 480ms;     /* прогресс скидки, подъём карточек */
  --dur-reveal: 640ms;   /* появление при скролле */
  --dur-route: 1400ms;   /* маршрут шагов */
  --dur-tween: 450ms;    /* твин числа в калькуляторе (JS) */

  --ease-out: cubic-bezier(.22, 1, .36, 1);          /* основное замедление */
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);       /* маршрут, длинные переходы */
  --ease-spring: cubic-bezier(.34, 1.56, .64, 1);    /* пружина: стикеры, иконки, вкладки */
  --ease-linear: linear;                             /* marquee, спиннер */
}
```

### 8.2 Список анимаций

| Анимация | Что | Параметры |
|---|---|---|
| Marquee | `translateX(0 → −50%)`, бесконечно | 45 с (мобайл 35 с), linear; пауза на hover/focus-within |
| Scroll reveal | `opacity 0→1`, `translateY(24px→0)` | `--dur-reveal`, `--ease-out`, stagger `calc(var(--i) * 80ms)`, один раз (`unobserve`), порог 0.15 |
| Маршрут шагов | линия «прорисовывается» (`scaleX` обложки), грузовик едет `translateX`; номера шагов поочерёдно «выпрыгивают» (`scale .6 → 1`, spring) | `--dur-route`, `--ease-in-out`, один раз, слева направо / сверху вниз |
| Кнопки | поднятие `translateY(−2px)`, вдавливание, стрелка в ghost `translateX(4px)`; стикеры при hover «покачиваются» `rotate(−4° → 2° → −4°)` 600 мс | `--dur-fast`, `--ease-out` / spring |
| Карточки каталога | `translateY(−4px) rotate(−.4deg)`, кабина «кивает» `scale 1.04 rotate(−1.5deg)` | `--dur-base` / `--dur-slow` |
| Вкладки | панель `opacity+translateY(8px)` | `--dur-base` |
| FAQ | плюс → минус (поворот), текст `opacity` | `--dur-base` |
| Калькулятор: твин числа | JS `requestAnimationFrame`, от старого к новому значению за `--dur-tween`, easeOutCubic, округление до 50 ₽ на каждом кадре; тот же приём для строк разбивки | см. код ниже |
| Прогресс скидки | `scaleX` заливки | `--dur-slow` |
| Sticky-панель / меню | `translateY` / `opacity` | `--dur-base` |
| Hero | кабина «въезжает» (`translateX(40px → 0)` + opacity), солнце медленно «дышит» `scale 1 → 1.06` 6 с, 1 раз после загрузки в 3 цикла, потом стоп | `--dur-slow` |

```css
/* scroll reveal: скрываем только при работающем JS */
.js .reveal { opacity: 0; transform: translateY(24px);
  transition: opacity var(--dur-reveal) var(--ease-out), transform var(--dur-reveal) var(--ease-out);
  transition-delay: calc(var(--i, 0) * 80ms); }
.js .reveal.is-in { opacity: 1; transform: none; }
```

```js
// Твин числа (без библиотек)
function tween(el, to, ms = 450) {
  const from = Number(el.dataset.v || 0), t0 = performance.now();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); el.dataset.v = to; return; }
  cancelAnimationFrame(el._raf);
  (function step(t) {
    const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(Math.round((from + (to - from) * e) / 50) * 50);
    if (k < 1) el._raf = requestAnimationFrame(step); else { el.dataset.v = to; el.textContent = fmt(to); }
  })(t0);
}
const fmt = n => n.toLocaleString('ru-RU').replace(/\s/g, ' ');
```

Скринридеру обновлять отдельный `aria-live="polite"` узел **один раз** через 600 мс после последнего ввода (debounce), а не на каждом кадре твина.

### 8.3 Performance

- Только `transform` / `opacity`; `will-change: transform` у marquee и кнопок, не ставить на всё подряд.
- Волны и звёзды — один data-URI SVG (повтор по `mask`), не JS.
- IntersectionObserver вместо scroll-слушателей; анимации приостанавливаются вне экрана (`animation-play-state` через класс).
- Нет видео, Lottie, WebGL, параллакса по скроллу (сайт открывают на телефоне на стройке).
- Общий бюджет JS анимаций: ≤ 2 КБ (твин + reveal + observer).

### 8.4 prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; transition-delay: 0s !important; scroll-behavior: auto !important; }
  .js .reveal { opacity: 1; transform: none; }
  .marquee__track { animation: none; width: auto; flex-wrap: wrap; justify-content: center; }
  .marquee__group[aria-hidden="true"] { display: none; }           /* копия не нужна */
  .marquee__group { flex-wrap: wrap; justify-content: center; }
  .route__cover { display: none; } .route__truck { display: none; }  /* линия сразу видна */
  .btn:hover, .cab-card:hover, .review:hover { transform: none; }
}
```

Остаются **без** анимации: смена состояния фокуса (кольцо), смена цвета, финальные значения. Твин числа в этом режиме мгновенный (см. код). Дополнительно: на странице есть кнопка-пауза marquee не требуется, т.к. пауза на hover/focus и ≤ 5 секунд внимания; для WCAG 2.2.2 (движение дольше 5 с) добавить `button.marquee__pause` (48px) с `aria-pressed`, ставит `animation-play-state: paused`.

---

## 9. Доступность

1. **Цели касания ≥ 44×44 px** (мы делаем 48–56): кнопки 48+, поля 52, чипы 48, степпер 52, бургер 48, пункты меню 56, ссылки в footer — высота строки 44. Между соседними целями ≥ 8px. Текстовые ссылки внутри абзацев исключение (но `min-height: 44px` для ссылок-блоков).
2. **Кольцо фокуса:** `outline: 3px solid var(--focus); outline-offset: 3px` на всех интерактивных элементах; `violet` на светлом (≥ 5.97:1 к фону), `yellow` на тёмном (≥ 4.61:1). Никогда `outline: none` без замены. Показывать по `:focus-visible`.
3. **Контраст:** только пары из раздела 2.2; не размещать текст на иллюстрациях без плашки; состояние не передаётся одним цветом (иконка, текст, галочка, обводка).
4. **Формы:** у каждого поля видимый `<label for>`; плейсхолдер — пример формата, а не подпись; `required` + `aria-required`; ошибки через `aria-invalid="true"` + `aria-describedby` на сообщение `role="alert"`; `autocomplete="name"`, `tel`, `inputmode="tel"`/`numeric`; шрифт полей ≥ 16px (без зума на iOS); чекбокс согласия в `<label>`; группы радио в `<fieldset><legend>`.
5. **Семантика:** один `<h1>`; H2 на блок; H3 для карточек и вопросов; `<main>`, `<header>`, `<nav aria-label>`, `<footer>`; skip-link «К содержимому» первым в DOM; якоря с `scroll-margin-top`; `<ol>` для шагов; `<dl>` для разбивки цены.
6. **Вкладки, аккордеон, меню:** ARIA-паттерн tabs со стрелками; `<details>` для FAQ; меню — `aria-expanded`, Esc, ловушка фокуса, возврат фокуса.
7. **Иллюстрации:** `role="img"` + `aria-label` для значимых (карта зон), `aria-hidden="true"` для декоративных.
8. **Движение:** см. 8.4, пауза marquee, нет мигания > 3 раз в секунду.
9. **Язык и текст:** `lang="ru"`; строки ≤ 68 знаков; выравнивание влево; без `text-align: justify`; размер текста можно увеличить до 200% без потери функций (используем `rem`, макеты не ломаются: проверять при 200% на 360px).
10. **Прочее:** `forced-colors: active` — кнопки и поля сохраняют `border` (мы их и так рисуем); `color-scheme: light` (тёмной темы нет, чтобы не ломать бренд-палитру); `meta theme-color` `#5B2EFF`.
11. **Минимальные тексты:** ничего мельче 13px; юридический текст 14px.

---

## 10. Do / Don't

**Do**
- Держать три цвета на экране как основу: violet, cream, ink. Остальные — по роли (pink и yellow только как цвета аудиторий и стикеры; tangerine — точка, а не заливка).
- Использовать розовый всегда для «Частным», жёлтый всегда для «Организациям»: в вкладках, чипах, бейджах отзывов.
- Одна главная кнопка на блок, текст кнопки — глагол действия («Получить расчёт», «Заказать за 13 400 ₽»).
- Показывать цену цифрой Unbounded с `tabular-nums` и сразу разбивку (аренда + обслуживание + доставка).
- Рисовать кабины SVG с чернильным контуром на цветной сцене; чередовать «эмоциональные» цветные секции и спокойные сетки.
- Юмор: короткий, мягкий, в микрокопи: «Нужен только телефон. Руки мыть не требуется» (подпись к форме), «Не получилось отправить. Бывает и в лучших кабинах. Позвоните нам». Основной текст блоков остаётся предметным.
- Проверять каждый новый цвет текста по таблице 2.2.
- Анимировать только `transform` и `opacity` и уважать `prefers-reduced-motion`.

**Don't**
- Не использовать зелёный «эко» и водяной синий как основные цвета, листики, капли, галочки-экологичности, стоковые фото кабин в поле.
- Не ставить tangerine, pink или yellow текстом на cream/white. Не ставить белый на tangerine.
- Не делать пастельный «медицинский» вид: цвета плотные, контуры чёрно-фиолетовые.
- Не добавлять зернистость, акварель, градиентные blob-фоны, глассморфизм, тени с размытием на карточках.
- Не использовать Unbounded для абзацев и мелкого текста (< 18px); не подключать больше двух семейств и лишние веса.
- Не шутить про процесс, запах и «ниже пояса». Не шутить в юридических блоках и сообщениях об ошибке оплаты/договора.
- Не скрывать фокус; не делать плейсхолдер единственной подписью поля; не передавать ошибку только красным.
- Не копировать логотипы, тексты и иллюстрации референсов: берём только приёмы (свой цвет, вкладки, marquee, прогресс-скидка, прозрачная смета, SVG на цветном фоне).
- Не делать корзину, подписки и mix-and-match: у нас заявка.
- **Никаких попапов, модальных окон и оверлеев поверх первого экрана** (подписка, скидка, «заказать звонок», cookie-баннер на пол-экрана, чат-виджеты с автооткрытием). Единственное разрешённое фиксированное наложение на мобильном — sticky-панель CTA (она появляется после ухода hero). Форма «Заказать звонок» открывается только по клику пользователя. Cookie-уведомление — узкая строка внизу, не перекрывающая форму и не одновременно со sticky-панелью.

---

## 11. Changelog (сверка с живым исследованием 14 сайтов)

Сверка показала, что система уже совпадает с доминирующими паттернами: pill-кнопки (`--r-pill`, r ≥ 30px), кремовый фон `#FFF6E6`, бегущая лента, волнистые швы, FAQ ближе к концу, отзывы-карточки со звёздами, рисованная карта зон. Концепция, палитра и шрифты не менялись. Изменено:

| Что | Почему |
|---|---|
| Добавлен `.btn--arrow` («→» в главных CTA), в hero/каталоге/калькуляторе использовать на primary | Стрелка в CTA — повторяющийся приём референсов; подсказывает движение, мы уже используем её в ghost |
| 6.18 таблица «Мы vs обычный прокат» | Приём из топ-10 (Duradry, Snacklins, Collider); закрывает страхи «грязно / опоздают / цена вырастет» |
| 6.19 переключатель групп FAQ | Приём топ-10 (Calm): три группы вместо длинного списка из 10 вопросов |
| 6.20 гигантский вордмарк | Приём топ-10 (FreshCap, 207ouest); заменил обычный `footer__brand` по размеру; расчёт ширины для 360px |
| 6.21 рейтинг под CTA | Приём топ-10 (Collider); данные — заглушки |
| 6.22 «клякса» с фактом | Приём топ-10 (Nugget, LEIF, WGAC): органичные формы вместо только волн |
| Новый пункт в Don't: никаких попапов поверх первого экрана | Антипример из исследования (Nugget, Great Jones, Everlane); мешает главной форме |
| Не добавлено: курсивные заголовки (WGAC), фото-сцены/видео, полоса «о нас пишут» | У Unbounded нет курсива, своих фото нет, реальных публикаций нет |

---

## 12. Чек-лист для вёрстки

1. Подключить шрифты (раздел 1), `lang="ru"`, `meta theme-color #5B2EFF`.
2. Вставить `:root` из разделов 2.4, 3, 4, 5, 8.1 одним блоком в начало CSS.
3. Скопировать базовые стили (типографика, `.container`, `.grid`, фокус).
4. Вставить SVG-sprite: `#cabin`, иконки, `--wave`, `--star`, `--i-alert`, `--i-check`.
5. Собирать блоки по порядку из `structure.md`, чередуя фон по таблице 2.5.
6. Проверить: тап-цели, контраст пар, фокус с клавиатуры, 200% масштаб на 360px, reduced-motion, горизонтальная прокрутка отсутствует (`overflow-x: clip` на `body`).
7. Заглушки (цены, отзывы, фото) помечены `.sticker--dev` или `.ph` и убираются при запуске.

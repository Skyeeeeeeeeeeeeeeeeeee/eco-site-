# Дизайн-система v2 «ЭКО СЕРВИС НОВОСИБИРСК»: «Графит и сигнальный лайм»

Многостраничный сайт аренды и продажи биотуалетов (Новосибирск; частные клиенты и организации). Документ для вёрстки на чистом HTML/CSS/JS: токены, правила, раскладки страниц, компоненты со всеми состояниями.

Контекст: `/home/user/eco-site-/research.md` (приёмы референсов), `/home/user/eco-site-/design-system.md` (v1, из него взяты структура токенов, подход к контрастам, правила фокуса, motion и a11y), `v2/structure.md` (тексты и состав страниц, пишется параллельно; здесь описаны типы страниц и блоков).

Все контрасты посчитаны по формуле WCAG 2.x (относительная яркость sRGB) скриптом, значения округлены до сотых. Шрифты проверены по ответу Google Fonts CSS API и по самим файлам woff2 (таблица cmap и метрики), а не по описанию.

---

## 0. Концепция

**Строгий деловой поставщик инфраструктуры, которому доверяют и частные клиенты.** Образ: паспорт оборудования, чертёж, накладная. Мало цветов, жёсткая сетка, тонкие линии, много данных, и один уверенный акцент, который невозможно перепутать.

### Почему акцент: сигнальный лайм `#D2F03C`
1. **Свободная территория.** Ниша красит всё в «эко-зелёный» и «водяной синий». Кислотно-жёлтый лайм (цвет светоотражающего жилета) читается не как «природа», а как «спецтехника, стройка, мероприятие на площадке»: именно там стоят кабины. Это зелёный, который не выглядит экологичным, и поэтому не клише.
2. **Функция, а не декор.** Лайм на графите (`#12171A`) даёт контраст 13.99:1: кнопка «Рассчитать» видна с другого конца экрана на солнце на стройке. Графитовый текст на лайме читается лучше, чем белый на любом фирменном синем.
3. **Один акцент.** Лайм встречается только там, где есть действие или ключевая цифра: главная кнопка, «маркер» под ключевым словом H1, итог сметы, выбранное значение. Всё остальное чёрно-белое. Сдержанность, при которой акцент работает как «маркер текстовыделителя».
4. **Дисциплина.** Лайм никогда не используется как цвет текста и как единственный признак состояния на светлом фоне (контраст лайма с белым 1.29:1). Для текста-акцента на светлом есть тёмно-оливковый `#4A5A00`.

### Подпись бренда: четыре повторяющиеся детали
1. **«Маркер».** Ключевое слово или цифра подсвечены лаймовой полосой на нижние 40% высоты строки (`.mark`). Одна подсветка на экран.
2. **«Чертёжная рамка».** Тонкие линии 1px, видимые колонки сетки в hero (6% графита), метки обрезки (crop marks) в углах иллюстраций и фото, моноширинные индексы секций `03 / Каталог`, артикулы `ЭС-02`. Сайт выглядит как технический лист.
3. **«Табличка».** Карточки модели и сметы оформлены как шильдик оборудования: артикул в Plex Mono, ключевые параметры списком «параметр … значение», цена справа. Углы почти прямые (радиус 2px).
4. **Изометрические схемы в одну линию 1.5px** вместо фото (раздел 7), с размерными линиями и лаймовой дверью как единственным цветным пятном.

### Тон интерфейса
Короткие точные формулировки, числа вместо эпитетов, никакого юмора ниже пояса и вообще минимум юмора (в отличие от v1). Ошибки форм: что случилось и что сделать, без восклицательных знаков.

### Чего нет
Попапов и модалок поверх первого экрана (раздел 5.8), стоковых фото кабин, теней и размытий как украшения, скруглённых «таблеток», твёрдых теней v1, волнистых швов, стикеров, бегущих строк, слайдеров-каруселей, анимаций появления при скролле, градиентов.

---

## 1. Шрифты

Два семейства, оба Google Fonts, оба с кириллицей, различаются с v1 (Unbounded/Onest).

| Роль | Семейство | Где | Почему |
|---|---|---|---|
| Всё: заголовки, текст, кнопки, формы, цены | **IBM Plex Sans** (вариативный, ось wght 100–700) | H1–H4, абзацы, интерфейс, цены | Инженерный гротеск со строгой кириллицей (она нарисована в семействе изначально, а не «пририсована»). Узнаваем, нейтрален, надёжен. Цифры в нём **табличные по умолчанию** (проверено: все 10 цифр шириной 600/1000), поэтому колонки цен ровные без OpenType-фич. |
| Данные и метки | **IBM Plex Mono** (статичный, 400 и 500) | артикулы, индексы секций, подписи таблиц, габариты, единицы, хлебные крошки, теги | Тот же дизайн-язык: пара «гротеск + моно» задаёт «паспорт оборудования». Кириллица есть. |

### Проверка (ответ `fonts.googleapis.com/css2`, современный User-Agent, плюс разбор файлов fontTools)
- IBM Plex Sans: подмножества `cyrillic-ext`, `cyrillic`, `greek`, `vietnamese`, `latin-ext`, `latin`. Подмножество `cyrillic` (`U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116`) существует, 29.5 КБ, содержит весь русский алфавит и `№`.
- IBM Plex Mono: те же подмножества, `cyrillic` 8.4 КБ.
- **Знак рубля `₽` (U+20BD)** лежит в подмножестве `latin-ext` обоих шрифтов (глиф есть, ширина в Plex Sans 623/1000). Минус `−` (U+2212), `×` (U+00D7), «ёлочки» `«»`, тире `–`/`—` лежат в `latin`.
- **Стрелки `→` (U+2192) в этих подмножествах нет**, как и `✓`, `≤`, `≈`. Браузер подставит системный глиф с другой толщиной. Поэтому все стрелки, галочки, плюсы и шевроны рисуем SVG-масками (раздел 2.5), а в текст эти символы не вставляем.
- Тонкий неразрывный пробел `U+202F` отсутствует. Разряды и рубль отделяем обычным `&nbsp;`.
- В сборке Google отсутствует OpenType-фича `tnum`, но она и не нужна (цифры табличные). `font-variant-numeric: tabular-nums` остаётся в CSS как страховка для шрифта-запаски.

### Файлы для self-host (скачать с gstatic, положить в `/fonts/`, формат woff2)

| Файл | Начертания | Подмножество | Размер |
|---|---|---|---|
| `plex-sans-var-cyrillic.woff2` | 400 500 600 (700 в резерве; один файл, ось wght) | cyrillic | 29.5 КБ |
| `plex-sans-var-latin.woff2` | то же | latin | 45.7 КБ |
| `plex-sans-var-latin-ext.woff2` | то же | latin-ext | 31 КБ (нужен только ради `₽`: можно срезать до `U+20BD` через `pyftsubset`, около 2 КБ) |
| `plex-mono-400-cyrillic.woff2` / `-latin` / `-latin-ext` | 400 | три подмножества | 8.4 / 14.7 / 13.3 КБ |
| `plex-mono-500-cyrillic.woff2` / `-latin` / `-latin-ext` | 500 | три подмножества | по запросу API |

Исходные URL (из CSS API на 2026-10-04; при сомнении перезапросить CSS и взять актуальные):
- Sans cyrillic: `https://fonts.gstatic.com/s/ibmplexsans/v23/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxaKYbABA.woff2`
- Sans latin-ext: `…/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxQKYbABA.woff2`
- Sans latin: `…/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxeKYY.woff2`
- Mono 400: `https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n1isq129k.woff2` (cyrillic), `…n1iEq129k.woff2` (latin-ext), `…n1i8q1w.woff2` (latin)
- Mono 500: `…/-F6qfjptAgt5VM-kVkqdyU8n3twJwlRFgtIU.woff2` (cyrillic), `…wl5FgtIU.woff2` (latin-ext), `…wlBFgg.woff2` (latin)

Если self-host отложен, временно подключить так (одна строка, `display=swap`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
```

### @font-face для self-host

```css
@font-face { font-family: "IBM Plex Sans"; font-style: normal; font-weight: 100 700; font-display: swap;
  src: url("/fonts/plex-sans-var-cyrillic.woff2") format("woff2");
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
@font-face { font-family: "IBM Plex Sans"; font-style: normal; font-weight: 100 700; font-display: swap;
  src: url("/fonts/plex-sans-var-latin-ext.woff2") format("woff2");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: "IBM Plex Sans"; font-style: normal; font-weight: 100 700; font-display: swap;
  src: url("/fonts/plex-sans-var-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
/* Plex Mono: те же три unicode-range, по два начертания (400, 500) на подмножество */
@font-face { font-family: "IBM Plex Mono"; font-style: normal; font-weight: 400; font-display: swap;
  src: url("/fonts/plex-mono-400-cyrillic.woff2") format("woff2"); unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
/* … остальные подмножества и вес 500 по тому же шаблону */
```

Предзагрузка: `<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/plex-sans-var-cyrillic.woff2">` (только он). Бюджет шрифтов: около 110 КБ для Sans + около 50 КБ для Mono.

`<html lang="ru">` обязателен (переносы, кавычки, `hyphens: auto`).

---

## 2. Токены

### 2.1 Палитра: цвета

Принцип: тёплый «бумажный» светлый фон, холодный графит вместо чёрного, один лайм. Статусные цвета приглушены и используются только вместе с иконкой и текстом.

| Токен | Hex | Роль |
|---|---|---|
| `--c-bg` | `#F4F3EE` | фон страницы |
| `--c-paper` | `#FFFFFF` | поверхности: карточки, поля, таблицы, шапка |
| `--c-sunk` | `#E9E7DF` | утопленные поверхности: плейсхолдер фото, шапка таблицы, disabled |
| `--c-ink` | `#12171A` | основной текст, сильные линии, тёмные секции, кнопка-контур |
| `--c-ink-2` | `#363E43` | вторичный текст |
| `--c-ink-3` | `#576066` | подписи, подсказки, плейсхолдер поля (минимум 5.19:1 на разрешённых фонах) |
| `--c-line` | `#CBC8BD` | **только декор**: разделители строк, hairline (1.51:1 на bg, не граница элемента) |
| `--c-ui` | `#7A8388` | граница интерактивных элементов (поля, чекбокс), не текст (3.12–3.87:1 к фонам) |
| `--c-lime` | `#D2F03C` | **бренд-акцент**: заливка главной кнопки, маркер, итог на тёмном |
| `--c-lime-hover` | `#C2E22B` | hover главной кнопки |
| `--c-lime-press` | `#B2D11E` | active главной кнопки |
| `--c-lime-soft` | `#EEF8B8` | подложка выбранного, hover строки, выноска «важно» |
| `--c-lime-deep` | `#4A5A00` | **текст-акцент на светлом**: «подробнее», маркер-ссылка, иконка (6.16–7.63:1) |
| `--c-dark` | `#12171A` | тёмная секция (совпадает с ink) |
| `--c-dark-2` | `#1C2328` | карточка на тёмной секции |
| `--c-dark-3` | `#2A3338` | линии и вложенные блоки на тёмном (декор) |
| `--c-mute-on-dark` | `#B7C0C5` | вторичный текст на тёмном |
| `--c-success` / `-bg` | `#17683A` / `#E1F2E7` | успех |
| `--c-error` / `-bg` | `#B3261E` / `#FCE6E3` | ошибка |
| `--c-warning` / `-bg` | `#80520A` / `#FBEFCC` | предупреждение |
| `--c-info` / `-bg` | `#244F7A` / `#E3EDF6` | справка (единственное место, где допустим синий: это статус, не бренд) |
| `--c-focus` | `#12171A` | кольцо фокуса на светлом (16.25:1 к bg) |
| `--c-focus-on-dark` | `#D2F03C` | кольцо фокуса на тёмном (13.99:1) |

### 2.2 Разрешённые пары текст/фон

Порог: обычный текст ≥ 4.5:1; крупный (≥ 24px или ≥ 18.66px жирный) и элементы UI ≥ 3:1.

| Текст / элемент | Фон | Контраст | Применение |
|---|---|---|---|
| ink `#12171A` | bg `#F4F3EE` | 16.25 | основной текст |
| ink | paper `#FFFFFF` | 18.05 | текст в карточках, таблицах |
| ink | sunk `#E9E7DF` | 14.58 | шапка таблицы, плейсхолдер |
| ink | lime-soft `#EEF8B8` | 16.12 | выбранные строки, выноска |
| ink | **lime `#D2F03C`** | **13.99** | кнопка primary, маркер, тег |
| ink | lime-hover `#C2E22B` | 12.21 | hover primary |
| ink | lime-press `#B2D11E` | 10.34 | active primary |
| ink-2 `#363E43` | bg / paper / sunk | 9.81 / 10.90 / 8.80 | вторичный текст |
| ink-2 | lime-soft / lime | 9.73 / 8.44 | |
| ink-3 `#576066` | bg / paper / sunk | 5.78 / 6.42 / 5.19 | подписи, плейсхолдеры, hint |
| ink-3 | lime-soft / lime | 5.73 / 4.98 | мелкие подписи на лайме |
| lime-deep `#4A5A00` | bg / paper / sunk | 6.86 / 7.63 / 6.16 | ссылки-акценты, «−5%», иконки |
| lime-deep | lime-soft / lime | 6.81 / 5.91 | |
| white / bg | ink (dark) | 18.05 / 16.25 | текст на тёмной секции |
| white / bg | dark-2 `#1C2328` | 15.90 / 14.31 | карточка на тёмном |
| white | dark-3 `#2A3338` | 12.89 | вложенные блоки на тёмном |
| **lime** | ink (dark) | **13.99** | итог, ссылка, фокус на тёмном |
| lime | dark-2 / dark-3 | 12.32 / 9.99 | |
| mute-on-dark `#B7C0C5` | dark / dark-2 / dark-3 | 9.77 / 8.60 / 6.97 | вторичный текст на тёмном |
| success `#17683A` | paper / bg / success-bg / sunk | 6.82 / 6.14 / 5.87 / 5.51 | сообщение об успехе |
| error `#B3261E` | paper / bg / error-bg / sunk | 6.54 / 5.88 / 5.47 / 5.28 | ошибка |
| warning `#80520A` | paper / warning-bg | 6.71 / 5.85 | предупреждение |
| info `#244F7A` | paper / info-bg | 8.49 / 7.16 | справка |
| white | success / error / ink-2 / lime-deep | 6.82 / 6.54 / 10.90 / 7.63 | текст на залитой кнопке-статусе или тёмном теге |

**Элементы UI (граница, иконка, индикатор ≥ 3:1):**

| Элемент | Фон | Контраст |
|---|---|---|
| граница полей `--c-ui` `#7A8388` | paper / lime-soft / bg / sunk | 3.87 / 3.45 / 3.48 / 3.12 |
| граница `--c-ui` на тёмном | dark | 4.67 |
| ink (сильная линия, рамка карточки, галочка) | любой светлый | ≥ 14.58 |
| кольцо фокуса ink | bg / paper | 16.25 / 18.05 |
| кольцо фокуса lime | dark / dark-2 | 13.99 / 12.32 |

### 2.3 Запрещённые пары (проверено, не проходят)

| Пара | Контраст | Что делать |
|---|---|---|
| lime `#D2F03C` как цвет **текста, иконки, границы, индикатора состояния** на paper / bg | 1.29 / 1.16 | заливка с графитовым текстом; текст-акцент только lime-deep |
| белый на lime | 1.29 | только ink на lime |
| ink-3 `#576066` на тёмном (dark) | 2.81 | на тёмном только white / mute-on-dark |
| ink-2 `#363E43` на тёмном | 1.66 | то же |
| lime-deep `#4A5A00` на тёмном | 2.37 | на тёмном акцент только lime |
| `--c-ui` `#7A8388` как цвет текста | 3.87 максимум | граница и «неактивная» иконка рядом с подписью, не текст |
| `--c-line` `#CBC8BD` как граница поля, чекбокса, кнопки | 1.68 / 1.51 | только разделители строк и hairline-декор |
| mute-on-dark на ink-3 | 3.47 | не делать серую плашку на тёмном |
| lime на paper как «выбранное»/«активное» без второго признака | 1.29 | выбранное = ink-заливка с белым текстом или ink-рамка 2px + галочка |
| статус только цветом (красная граница без иконки и текста) | n/a | всегда иконка + текст |

### 2.4 Единый CSS-блок токенов

```css
:root {
  /* Цвета: базовые */
  --c-bg: #F4F3EE;  --c-paper: #FFFFFF;  --c-sunk: #E9E7DF;
  --c-ink: #12171A; --c-ink-2: #363E43;  --c-ink-3: #576066;
  --c-line: #CBC8BD;   /* только декор */
  --c-ui: #7A8388;     /* границы интерактивных элементов */

  /* Бренд-акцент */
  --c-lime: #D2F03C;  --c-lime-hover: #C2E22B;  --c-lime-press: #B2D11E;
  --c-lime-soft: #EEF8B8;  --c-lime-deep: #4A5A00;

  /* Тёмный контекст */
  --c-dark: #12171A;  --c-dark-2: #1C2328;  --c-dark-3: #2A3338;
  --c-mute-on-dark: #B7C0C5;

  /* Статусы */
  --c-success: #17683A;  --c-success-bg: #E1F2E7;
  --c-error:   #B3261E;  --c-error-bg:   #FCE6E3;
  --c-warning: #80520A;  --c-warning-bg: #FBEFCC;
  --c-info:    #244F7A;  --c-info-bg:    #E3EDF6;

  /* Фокус */
  --c-focus: #12171A;  --c-focus-on-dark: #D2F03C;

  /* Семантические алиасы: в компонентах использовать только их */
  --bg: var(--c-bg);  --surface: var(--c-paper);  --surface-2: var(--c-sunk);
  --text: var(--c-ink);  --text-2: var(--c-ink-2);  --text-3: var(--c-ink-3);
  --accent-fill: var(--c-lime);  --accent-text: var(--c-lime-deep);
  --border: var(--c-ink);        /* сильная линия */
  --border-ui: var(--c-ui);      /* поля, чекбоксы */
  --hair: var(--c-line);         /* hairline-декор */
  --focus: var(--c-focus);

  /* Шрифты */
  --font-sans: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;

  /* Типографика: размеры (кламп считан для 360 -> 1440) */
  --fs-display: clamp(2.25rem, 1.3rem + 4vw, 4.5rem);      /* 35 -> 72, только H1 главной */
  --fs-h1: clamp(2rem, 1.35rem + 2.9vw, 3.75rem);          /* 32 -> 60 */
  --fs-h2: clamp(1.5rem, 1.15rem + 1.5vw, 2.5rem);         /* 24 -> 40 */
  --fs-h3: clamp(1.25rem, 1.1rem + 0.65vw, 1.625rem);      /* 20 -> 26 */
  --fs-h4: clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem);     /* 17 -> 19 */
  --fs-lead: clamp(1.0625rem, 1rem + 0.3vw, 1.25rem);      /* 17 -> 20 */
  --fs-body: 1rem;        /* 16 */
  --fs-small: 0.875rem;   /* 14 */
  --fs-label: 0.8125rem;  /* 13: минимум на сайте (моно-метки) */
  --fs-price-xl: clamp(2.25rem, 1.5rem + 3vw, 3.5rem);     /* итог сметы 36 -> 56 */
  --fs-price: clamp(1.375rem, 1.2rem + 0.6vw, 1.75rem);    /* цена в карточке 22 -> 28 */
  --fs-stat: clamp(2rem, 1.4rem + 2.4vw, 3.25rem);         /* цифры stats strip 32 -> 52 */
  --lh-tight: 1.05; --lh-heading: 1.15; --lh-snug: 1.3; --lh-body: 1.6; --lh-small: 1.5;
  --ls-display: -0.03em; --ls-h: -0.02em; --ls-label: 0.06em;

  /* Сетка */
  --container: 1200px;  --gutter: 16px;  --page-pad: 16px;
  --header-h: 56px;     --topbar-h: 0px;

  /* Отступы (база 4) */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px; --sp-5: 20px; --sp-6: 24px;
  --sp-8: 32px; --sp-10: 40px; --sp-12: 48px; --sp-16: 64px; --sp-20: 80px; --sp-24: 96px; --sp-32: 128px;
  --section-py: clamp(3.5rem, 2.4rem + 4.6vw, 7rem);       /* 56 -> 112 */
  --section-py-sm: clamp(2.5rem, 1.9rem + 2.6vw, 4.5rem);  /* внутренние страницы, плотные блоки 40 -> 72 */
  --section-head-gap: clamp(1.5rem, 1rem + 2vw, 3rem);

  /* Радиусы: строго, почти прямые углы */
  --r-0: 0;  --r-1: 2px;  --r-2: 4px;  --r-round: 999px;   /* round только для точек-индикаторов и радио */

  /* Линии и тень */
  --bw: 1px;  --bw-strong: 2px;
  --shadow-float: 0 8px 24px rgba(18, 23, 26, .14);        /* единственная тень: выпадающее меню */

  /* Aspect-ratio системы изображений */
  --ar-hero: 4 / 3;  --ar-card: 4 / 3;  --ar-gallery: 3 / 2;  --ar-thumb: 1 / 1;
  --ar-wide: 21 / 9; --ar-portrait: 3 / 4;  --ar-map: 16 / 10;

  /* Motion */
  --dur-1: 100ms; --dur-2: 160ms; --dur-3: 240ms; --dur-4: 360ms;
  --ease-out: cubic-bezier(.2, 0, 0, 1);
  --ease-io: cubic-bezier(.4, 0, .2, 1);

  /* Слои */
  --z-header: 50; --z-dropdown: 60; --z-mobile-menu: 55; --z-sticky-cta: 45; --z-skip: 100;
}
@media (min-width: 480px)  { :root { --page-pad: 20px; } }
@media (min-width: 768px)  { :root { --gutter: 24px; --page-pad: 32px; --header-h: 64px; } }
@media (min-width: 1024px) { :root { --page-pad: 40px; --topbar-h: 36px; } }
@media (min-width: 1280px) { :root { --container: 1200px; } }
@media (min-width: 1440px) { :root { --container: 1320px; } }

/* Тёмный контекст: .on-dark на секции, футере, карточке сметы. Компоненты не меняются */
.on-dark {
  --bg: var(--c-dark);  --surface: var(--c-dark-2);  --surface-2: var(--c-dark-3);
  --text: #F4F3EE;  --text-2: var(--c-mute-on-dark);  --text-3: var(--c-mute-on-dark);
  --border: #F4F3EE;  --border-ui: var(--c-ui);  --hair: var(--c-dark-3);
  --accent-text: var(--c-lime);  --focus: var(--c-focus-on-dark);
  background: var(--c-dark);  color: var(--text);
}
```

### 2.5 Иконки: SVG-маски (стрелка, галочка и прочее не набираются шрифтом)

Одноцветные, штрих 1.75px, `stroke-linecap: square`, 16×16. Красятся `background: currentColor` через `mask`. Это решает отсутствие `→` и `✓` в Plex.

```css
:root {
  --i-arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.75' stroke-linecap='square'%3E%3Cpath d='M2 8h11M9 4l4 4-4 4'/%3E%3C/svg%3E");
  --i-arrow-l: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.75' stroke-linecap='square'%3E%3Cpath d='M14 8H3M7 4L3 8l4 4'/%3E%3C/svg%3E");
  --i-check: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='square'%3E%3Cpath d='M3 8.5l3.5 3.5L13 4.5'/%3E%3C/svg%3E");
  --i-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.75' stroke-linecap='square'%3E%3Cpath d='M3 6l5 5 5-5'/%3E%3C/svg%3E");
  --i-plus: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.75' stroke-linecap='square'%3E%3Cpath d='M8 3v10M3 8h10'/%3E%3C/svg%3E");
  --i-minus: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.75' stroke-linecap='square'%3E%3Cpath d='M3 8h10'/%3E%3C/svg%3E");
  --i-alert: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.75' stroke-linejoin='miter'%3E%3Cpath d='M8 1.8l6.7 12H1.3zM8 6.5v3.2M8 11.6v.1'/%3E%3C/svg%3E");
  --i-close: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.75' stroke-linecap='square'%3E%3Cpath d='M3 3l10 10M13 3L3 13'/%3E%3C/svg%3E");
  --i-download: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.75' stroke-linecap='square'%3E%3Cpath d='M8 2v9M4 7.5L8 11.5l4-4M2.5 14h11'/%3E%3C/svg%3E");
}
.i { display: inline-block; flex: none; width: 1em; height: 1em; background: currentColor;
     -webkit-mask: var(--i) center / contain no-repeat; mask: var(--i) center / contain no-repeat; }
.i--arrow { --i: var(--i-arrow); } .i--check { --i: var(--i-check); } .i--chevron { --i: var(--i-chevron); }
.i--plus { --i: var(--i-plus); } .i--minus { --i: var(--i-minus); } .i--alert { --i: var(--i-alert); }
.i--close { --i: var(--i-close); } .i--download { --i: var(--i-download); } .i--arrow-l { --i: var(--i-arrow-l); }
```

Остальные иконки (телефон, мессенджер, геометка, документ, часы, замок) рисует та же рука: 16/24px, штрих 1.75px, квадратные концы, без заливки. Иконки в инлайн-SVG с `aria-hidden="true"`, если рядом есть текст.

---

## 3. Типографика

Plex Sans 600 для заголовков (настоящий начертанный вес, не синтетический), 400 для текста, 500 для интерфейсных подписей. Plex Mono только для «данных»: артикул, индекс, единицы, габариты, метки таблиц, крошки.

| Стиль | Семейство | Размер | Вес | Line-height | Трекинг | Примечание |
|---|---|---|---|---|---|---|
| Display (H1 главной) | Sans | `--fs-display` (35 → 72) | 600 | 1.05 | −0.03em | только главная; `max-width: 14ch` desktop |
| H1 внутренних | Sans | `--fs-h1` (32 → 60) | 600 | 1.1 | −0.02em | `text-wrap: balance`; одно слово в `.mark` |
| H2 | Sans | `--fs-h2` (24 → 40) | 600 | 1.15 | −0.02em | |
| H3 | Sans | `--fs-h3` (20 → 26) | 600 | 1.2 | −0.01em | названия моделей, подблоки |
| H4 | Sans | `--fs-h4` (17 → 19) | 600 | 1.3 | 0 | |
| Lead | Sans | `--fs-lead` (17 → 20) | 400 | 1.45 | 0 | `max-width: 60ch`, цвет `--text-2` |
| Body | Sans | 16px | 400 | 1.6 | 0 | `max-width: 68ch` |
| Small | Sans | 14px | 400 | 1.5 | 0 | сноски, подсказки |
| Button | Sans | 16px | 600 | 1.1 | 0.005em | не uppercase |
| Метка (eyebrow, th, тег) | **Mono** | 13px | 500 | 1.2 | 0.06em | uppercase; цвет `--text-2` |
| Цена в карточке | Sans | `--fs-price` | 600 | 1 | −0.01em | tabular |
| Итог сметы | Sans | `--fs-price-xl` | 600 | 1 | −0.02em | tabular |
| Цифра в stats | Sans | `--fs-stat` | 600 | 1 | −0.02em | tabular |
| Артикул, габариты | **Mono** | 13–14px | 400 | 1.4 | 0 | `ЭС-02`, `1100×1200×2300 мм` |

```css
*, *::before, *::after { box-sizing: border-box; }
html { font-size: 100%; -webkit-text-size-adjust: 100%; scroll-padding-top: calc(var(--header-h) + 16px); }
body { margin: 0; font: 400 var(--fs-body)/var(--lh-body) var(--font-sans);
       color: var(--text); background: var(--bg);
       font-variant-numeric: tabular-nums; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
h1, h2, h3, h4 { margin: 0; font-family: var(--font-sans); font-weight: 600; text-wrap: balance;
                 overflow-wrap: break-word; hyphens: auto; }
h1 { font-size: var(--fs-h1); line-height: 1.1;  letter-spacing: var(--ls-h); }
.display { font-size: var(--fs-display); line-height: var(--lh-tight); letter-spacing: var(--ls-display); }
h2 { font-size: var(--fs-h2); line-height: var(--lh-heading); letter-spacing: var(--ls-h); }
h3 { font-size: var(--fs-h3); line-height: 1.2; letter-spacing: -0.01em; }
h4 { font-size: var(--fs-h4); line-height: var(--lh-snug); }
p { margin: 0; max-width: 68ch; text-wrap: pretty; }
.lead  { font-size: var(--fs-lead); line-height: 1.45; max-width: 60ch; color: var(--text-2); }
.small { font-size: var(--fs-small); line-height: var(--lh-small); color: var(--text-2); }
.mono  { font-family: var(--font-mono); }
.label { font: 500 var(--fs-label)/1.2 var(--font-mono); letter-spacing: var(--ls-label); text-transform: uppercase; color: var(--text-2); }
.num   { font-variant-numeric: tabular-nums lining-nums; }
.price     { font-weight: 600; font-size: var(--fs-price); line-height: 1; letter-spacing: -0.01em; white-space: nowrap; }
.price--xl { font-size: var(--fs-price-xl); letter-spacing: -0.02em; }
.price small { font: 500 var(--fs-small)/1 var(--font-sans); letter-spacing: 0; color: var(--text-2); }  /* «/сутки» */
::selection { background: var(--c-lime); color: var(--c-ink); }

/* Маркер: подсветка нижних 40% строки. Один на экран. Работает и на светлом, и на тёмном (ink на lime) */
.mark { background: linear-gradient(transparent 60%, var(--c-lime) 60%); color: inherit;
        padding-inline: .08em; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.on-dark .mark { background: none; color: var(--c-lime); }       /* на тёмном: лаймовый текст, 13.99:1 */
```

Правила чисел и текста:
- Цены: `13&nbsp;400&nbsp;₽`, единица `₽/сутки`, «от» отделять `&nbsp;`. Минус настоящий `−` (U+2212): `−35&nbsp;°C`, `−5&nbsp;%`. Габариты через `×` (U+00D7).
- Колонки цен выравнивать по правому краю (`text-align: right`), числа в одинаковом формате (без «от» внутри колонки без необходимости).
- В заголовках не использовать капслок и разрядку (капслок только в Mono-метках).
- Длинные русские слова: `hyphens: auto`, `overflow-wrap: anywhere` в ячейках таблиц.
- Plex Sans шире Onest на 2–4%: на 360px в H1 помещается около 14 знаков в строку; проверять «Организациям», «Обслуживание», «Биотуалетов» в H1 на 360: размещаются без переноса по слогам (32px, ширина слова около 215px при доступных 328px).

---

## 4. Сетка, брейкпоинты, отступы

Mobile-first, `min-width`. Строгая 12-колоночная сетка: на мобильном 4 колонки, на планшете 8, далее 12.

| Диапазон | Токен | Колонок | Gutter | Поле страницы | Контент |
|---|---|---|---|---|---|
| 360–479 (база) | — | 4 | 16 | 16 | 100% |
| 480–767 | `sm` 480 | 4 | 16 | 20 | 100% |
| 768–1023 | `md` 768 | 8 | 24 | 32 | 100% |
| 1024–1279 | `lg` 1024 | 12 | 24 | 40 | 100% |
| 1280–1439 | `xl` 1280 | 12 | 24 | auto | 1200 |
| 1440+ | `xxl` 1440 | 12 | 24 | auto | 1320 (максимум; шире 1600 страница не растёт, по краям фон) |

Минимально поддерживаемая ширина 320 (без горизонтального скролла страницы); ориентир 360. Медиа-запросы не принимают `var()`, значения 480/768/1024/1280/1440 писать прямо. Правило для выкладки: по вертикали **всё держится на сетке 12 колонок и на шкале 4px**, произвольные ширины блоков запрещены (допустимы только span 3/4/5/6/7/8/9/12).

```css
.container { width: 100%; max-width: calc(var(--container) + var(--page-pad) * 2);
             margin-inline: auto; padding-inline: var(--page-pad); }
.grid { display: grid; gap: var(--gutter); grid-template-columns: repeat(4, minmax(0, 1fr)); }
@media (min-width: 768px)  { .grid { grid-template-columns: repeat(8,  minmax(0, 1fr)); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(12, minmax(0, 1fr)); } }
.col-full { grid-column: 1 / -1; }
@media (min-width: 768px)  { .md-4 { grid-column: span 4; } .md-5 { grid-column: span 5; } .md-8 { grid-column: span 8; } }
@media (min-width: 1024px) {
  .lg-3 { grid-column: span 3; } .lg-4 { grid-column: span 4; } .lg-5 { grid-column: span 5; } .lg-6 { grid-column: span 6; }
  .lg-7 { grid-column: span 7; } .lg-8 { grid-column: span 8; } .lg-9 { grid-column: span 9; } .lg-12 { grid-column: 1 / -1; }
  .lg-start-2 { grid-column-start: 2; } .lg-start-5 { grid-column-start: 5; }
}

/* Видимые колонки как «чертёж»: декор для hero и тёмных секций, только ≥1024 */
@media (min-width: 1024px) {
  .guides { position: relative; }
  .guides::before { content: ""; position: absolute; inset: 0 auto 0 50%; width: min(100% - var(--page-pad) * 2, var(--container));
    transform: translateX(-50%); pointer-events: none;
    background: repeating-linear-gradient(90deg, rgba(18,23,26,.06) 0 1px, transparent 1px calc(100% / 12)); }
  .on-dark.guides::before { background: repeating-linear-gradient(90deg, rgba(244,243,238,.07) 0 1px, transparent 1px calc(100% / 12)); }
}
```

### Шкала отступов и ритм секций
Шкала задана токенами `--sp-1…--sp-32` (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128). Вертикальный ритм:
- Секция: `padding-block: var(--section-py)` (56 → 112); на внутренних страницах для плотных блоков `--section-py-sm`.
- Заголовок секции → контент: `--section-head-gap` (24 → 48). Eyebrow → H2: 12. H2 → lead: 12.
- Карточки: padding 20 (mobile) / 24 (desktop); внутри элементы через 12–16.
- Между рядами карточек = gutter; между соседними кнопками 12.
- Каждая секция отделена hairline сверху (`border-top: 1px solid var(--hair)`) и несёт индекс (`02 / Каталог`), кроме hero.

```css
.section { padding-block: var(--section-py); background: var(--bg); border-top: 1px solid var(--hair); }
.section--tight { padding-block: var(--section-py-sm); }
.section--paper { background: var(--c-paper); }
.section--sunk  { background: var(--c-sunk); }
.section--lime  { background: var(--c-lime); color: var(--c-ink); --text: var(--c-ink); --text-2: var(--c-ink-2); --text-3: var(--c-ink-2); --hair: rgba(18,23,26,.25); }
.section--dark  { /* + класс .on-dark */ border-top-color: var(--c-dark-3); }
.sec-head { display: grid; gap: var(--sp-3); margin-bottom: var(--section-head-gap); }
.sec-head__idx { display: flex; align-items: center; gap: var(--sp-3); }
.sec-head__idx::after { content: ""; flex: 1; height: 1px; background: var(--hair); }
```

Правило ритма: чередовать `bg` и `paper`, не более одной тёмной секции и одной лаймовой полосы на страницу (кроме тёмного футера). Лаймовая полоса (CTA-блок) ставится только перед футером или в середине длинной страницы как «сквозной» призыв.

---

## 5. Раскладки страниц и каркас

### 5.1 Скелет документа и landmarks

```html
<body class="has-sticky">
  <a class="skip" href="#main">Перейти к содержимому</a>
  <header class="site-header" role="banner"> … top bar + main nav … </header>
  <main id="main" tabindex="-1">
    <nav class="crumbs" aria-label="Хлебные крошки"> … </nav>   <!-- внутри hero внутренней страницы -->
    …секции…
  </main>
  <footer class="site-footer on-dark" role="contentinfo"> … </footer>
  <div class="sticky-cta" role="region" aria-label="Быстрые действия"> … </div>
</body>
```

```css
.skip { position: absolute; left: var(--sp-4); top: -100px; z-index: var(--z-skip); padding: 12px 16px; background: var(--c-ink); color: #fff;
        border: 2px solid var(--c-lime); font-weight: 600; text-decoration: none; }
.skip:focus { top: var(--sp-4); }
main:focus { outline: none; }
.visually-hidden { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
```

### 5.2 Шапка: top bar + главное меню + выпадающие

Состав desktop (≥1024): **top bar 36px** (фон `--c-ink`, текст white 13px): слева режим работы и география («Новосибирск и область», `{{часы работы}}`), справа телефон (`tel:`, Mono, tabular) и мессенджер. **Главная строка 64px** (фон paper, нижняя линия 1px ink): логотип слева, меню по центру, справа кнопка primary «Рассчитать стоимость» (одна на экран).
Мобильная (<1024): top bar скрыт; шапка 56px: логотип, иконка-телефон (44×44), кнопка «Меню» (44×44, с текстом `Меню` для ясности).

Пункты меню (не более 6 верхнего уровня): **Аренда ▾** (Обзор, Частным лицам, Организациям, Мероприятия), **Каталог ▾** (5 моделей списком, «Весь каталог»), **Продажа**, **Цены и калькулятор**, **Сервис ▾** (Обслуживание, Доставка и зона), **О компании ▾** (О компании и отзывы, Вопросы, Контакты). Точные названия берутся из `v2/structure.md`.

Поведение выпадающих: это кнопка-раскрытие (`<button aria-expanded aria-controls>`), а не `role="menu"`. Открывается по клику/Enter/Space и по hover с задержкой 120мс (только `@media (hover:hover)`); Esc закрывает и возвращает фокус на кнопку; Tab идёт по ссылкам панели; клик вне закрывает; текущая страница помечена `aria-current="page"`. Панель: фон paper, рамка 1px ink, сверху 3px lime (декор), тень `--shadow-float`, 2–3 колонки ссылок с описанием в одну строку (Mono-метка + название).

```html
<header class="site-header">
  <div class="topbar"><div class="container topbar__in">
    <span>Новосибирск и область · {{часы работы}}</span>
    <span><a class="tel num" href="tel:+7{{номер}}">+7 {{номер}}</a></span>
  </div></div>
  <div class="mainbar"><div class="container mainbar__in">
    <a class="logo" href="/" aria-label="ЭКО СЕРВИС НОВОСИБИРСК, на главную">
      <span class="logo__mark" aria-hidden="true"></span>
      <span class="logo__t"><b>ЭКО СЕРВИС</b><small>НОВОСИБИРСК</small></span></a>
    <nav class="nav" aria-label="Основная">
      <ul class="nav__list">
        <li class="nav__item">
          <button class="nav__btn" aria-expanded="false" aria-controls="dd-rent">Аренда <span class="i i--chevron" aria-hidden="true"></span></button>
          <div class="nav__panel" id="dd-rent">
            <ul>
              <li><a href="/arenda/"><span class="label">01</span>Обзор аренды</a></li>
              <li><a href="/arenda/chastnym/"><span class="label">02</span>Частным лицам</a></li>
              <li><a href="/arenda/organizacziyam/"><span class="label">03</span>Организациям</a></li>
              <li><a href="/arenda/meropriyatiya/"><span class="label">04</span>Мероприятия</a></li>
            </ul>
          </div>
        </li>
        <li class="nav__item"><a class="nav__link" href="/prodazha/">Продажа</a></li>
        <li class="nav__item"><a class="nav__link" href="/ceny/" aria-current="page">Цены и калькулятор</a></li>
      </ul>
    </nav>
    <a class="btn btn--primary nav__cta" href="/ceny/">Рассчитать стоимость</a>
    <button class="burger" aria-expanded="false" aria-controls="m-menu"><span class="burger__t">Меню</span><span class="burger__ico" aria-hidden="true"></span></button>
  </div></div>
</header>
```

```css
.site-header { position: sticky; top: 0; z-index: var(--z-header); background: var(--c-paper); border-bottom: 1px solid var(--c-ink); }
.topbar { display: none; background: var(--c-ink); color: #F4F3EE; font: 400 var(--fs-label)/1 var(--font-mono); height: var(--topbar-h); }
.topbar a { color: #F4F3EE; text-decoration: none; } .topbar a:hover { color: var(--c-lime); }
.topbar__in { display: flex; justify-content: space-between; align-items: center; height: 100%; }
@media (min-width: 1024px) { .topbar { display: block; } }
.mainbar__in { display: flex; align-items: center; gap: var(--sp-6); height: var(--header-h); }
.logo { display: inline-flex; align-items: center; gap: 10px; color: var(--c-ink); text-decoration: none; min-height: 44px; }
.logo__mark { width: 28px; height: 28px; background: var(--c-lime); border: 1px solid var(--c-ink); position: relative; }
.logo__mark::after { content: ""; position: absolute; inset: 6px; border: 1.5px solid var(--c-ink); }       /* временный знак: «кабина» в плане */
.logo__t b { display: block; font: 700 1rem/1 var(--font-sans); letter-spacing: .02em; }
.logo__t small { display: block; margin-top: 3px; font: 500 .6875rem/1 var(--font-mono); letter-spacing: .14em; color: var(--c-ink-3); }
.nav { display: none; margin-inline: auto; }
@media (min-width: 1024px) { .nav { display: block; } .burger { display: none; } .nav__cta { margin-left: 0; } }
.nav__list { display: flex; gap: 4px; margin: 0; padding: 0; list-style: none; }
.nav__item { position: relative; }
.nav__link, .nav__btn { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 12px; font: 500 .9375rem/1 var(--font-sans);
  color: var(--c-ink); background: none; border: 0; border-radius: var(--r-1); text-decoration: none; cursor: pointer; }
.nav__link:hover, .nav__btn:hover { background: var(--c-sunk); }
.nav__link[aria-current="page"] { box-shadow: inset 0 -2px 0 var(--c-ink); font-weight: 600; }
.nav__btn[aria-expanded="true"] { background: var(--c-sunk); }
.nav__btn .i { transition: transform var(--dur-2) var(--ease-out); } .nav__btn[aria-expanded="true"] .i { transform: rotate(180deg); }
.nav__panel { position: absolute; left: 0; top: calc(100% + 8px); z-index: var(--z-dropdown); min-width: 280px; padding: 8px;
  background: var(--c-paper); border: 1px solid var(--c-ink); border-top: 3px solid var(--c-lime); box-shadow: var(--shadow-float);
  opacity: 0; visibility: hidden; transform: translateY(4px);
  transition: opacity var(--dur-2) var(--ease-out), transform var(--dur-2) var(--ease-out), visibility 0s linear var(--dur-2); }
.nav__btn[aria-expanded="true"] + .nav__panel { opacity: 1; visibility: visible; transform: none; transition-delay: 0s; }
.nav__panel ul { margin: 0; padding: 0; list-style: none; }
.nav__panel a { display: flex; align-items: baseline; gap: 12px; min-height: 44px; padding: 10px 12px; color: var(--c-ink); text-decoration: none; font-weight: 500; }
.nav__panel a:hover { background: var(--c-lime-soft); }
.nav__panel a[aria-current="page"] { background: var(--c-sunk); font-weight: 600; }
.nav__panel .label { min-width: 2ch; }
```

Состояния пункта: default / hover (подложка sunk) / focus-visible (кольцо 3px ink) / active (раскрыт: подложка sunk, шеврон перевёрнут) / current (подчёркивание 2px ink + 600) / disabled не применяется.

**Мобильное меню** (<1024). Кнопка «Меню» открывает панель под шапкой на всю высоту окна (`position: fixed; inset: var(--header-h) 0 0`), фон paper, `overflow: auto`; внутри аккордеоны групп (те же кнопки-раскрытия, строки по 56px, hairline между ними), внизу блок «Позвонить» (outline) и «Рассчитать стоимость» (primary) на всю ширину. Скролл страницы блокируется (`overflow: hidden` на `html`), Esc закрывает, фокус возвращается на кнопку; при открытии фокус переходит на первую ссылку. Открывается только по действию пользователя (это не попап первого экрана).

```css
.m-menu { position: fixed; inset: var(--header-h) 0 0 0; z-index: var(--z-mobile-menu); overflow-y: auto; background: var(--c-paper);
  padding: var(--sp-2) var(--page-pad) calc(var(--sp-8) + env(safe-area-inset-bottom));
  opacity: 0; visibility: hidden; transform: translateY(-8px);
  transition: opacity var(--dur-3) var(--ease-out), transform var(--dur-3) var(--ease-out), visibility 0s linear var(--dur-3); }
.m-menu.is-open { opacity: 1; visibility: visible; transform: none; transition-delay: 0s; }
.m-menu a, .m-menu button.m-group { display: flex; width: 100%; align-items: center; justify-content: space-between; min-height: 56px; padding: 0 4px;
  font: 500 1.0625rem/1.2 var(--font-sans); color: var(--c-ink); background: none; border: 0; border-bottom: 1px solid var(--c-line); text-decoration: none; text-align: left; }
.m-menu .m-sub a { padding-left: 20px; min-height: 48px; font-size: 1rem; color: var(--c-ink-2); }
@media (min-width: 1024px) { .m-menu { display: none; } }
```

### 5.3 Хлебные крошки

Нужны на всех страницах, кроме главной и 404. Mono 13px, разделитель «/» через CSS, текущая страница без ссылки (`aria-current="page"`). На <640 показывается только родитель со стрелкой назад (экономия высоты, тап 44px). Разметка схемы BreadcrumbList (JSON-LD) обязательна.

```html
<nav class="crumbs" aria-label="Хлебные крошки">
  <ol>
    <li><a href="/">Главная</a></li>
    <li><a href="/katalog/">Каталог</a></li>
    <li><span aria-current="page">Модель ЭС-02</span></li>
  </ol>
</nav>
```
```css
.crumbs ol { display: flex; flex-wrap: wrap; gap: 0 8px; margin: 0; padding: 0; list-style: none; font: 400 var(--fs-label)/1.4 var(--font-mono); color: var(--text-3); }
.crumbs li + li::before { content: "/"; margin-right: 8px; color: var(--c-ui); }
.crumbs a { display: inline-flex; align-items: center; min-height: 44px; color: var(--text-2); text-decoration: none; border-bottom: 1px solid transparent; }
.crumbs a:hover { color: var(--text); border-bottom-color: currentColor; }
.crumbs [aria-current] { color: var(--text); }
@media (max-width: 639.98px) {                      /* только «назад к родителю» */
  .crumbs li { display: none; } .crumbs li:nth-last-child(2) { display: list-item; }
  .crumbs li:nth-last-child(2)::before { display: none; }
  .crumbs li:nth-last-child(2) a::before { content: ""; width: 1em; height: 1em; margin-right: 6px; background: currentColor;
    -webkit-mask: var(--i-arrow-l) center/contain no-repeat; mask: var(--i-arrow-l) center/contain no-repeat; }
}
```

### 5.4 Hero: два варианта

**A. Главная (home hero).** Светлый фон `--bg` с видимыми колонками (`.guides`). Занимает не больше `min(100svh − шапка, 680px)` на desktop; на 360×640 в первом экране обязаны уместиться: H1, лид (2–3 строки), primary CTA, телефон. Ничего поверх (без попапов, плавающих карточек, баннеров).

```
≥1024 (12 колонок)
┌─ eyebrow (mono): «Аренда и продажа биотуалетов · Новосибирск» ──────────────────┐
│ 1–7: DISPLAY H1 (с .mark на 1 слове)                │ 8–12: Панель «Быстрый расчёт»  │
│      lead (60ch)                                     │       (paper, рамка 1px ink,   │
│      [Primary: Рассчитать] [Outline: Позвонить]      │       3 поля + кнопка;         │
│      trust ribbon: Договор · Акт · НДС · Свой парк   │       индекс «Смета № …»)      │
└───────────────────────────────────────────────────────────────────────────────────┘
├─ Stats strip на всю ширину (4 ячейки) ─────────────────────────────────────────────┤
768–1023: H1+lead 8 колонок, панель расчёта под ним 8 колонок.
360–767: колонка: eyebrow, H1, lead, [Primary] (на всю ширину), ссылка «Позвонить», затем панель/trust (ниже первого экрана).
```

**B. Внутренняя страница (inner hero).** Компактная: фон `--bg`, нижняя линия 1px ink. Состав: крошки, eyebrow с индексом раздела, H1, лид, справа (≥1024, колонки 9–12) блок «Ключевые условия» (3 строки dl: срок подачи, документы, оплата) или контакт-карточка. Высота 200–320px. Для «Организаций» допускается тёмный вариант `.on-dark` (контраст всего текста ≥ 9.77).

```
≥1024:  [Крошки ................................................]
        1–8: eyebrow · H1 · lead · [Primary] [Link]     |  9–12: dl «Ключевые условия» (рамка 1px)
        ─────────── hairline 1px ink на всю ширину ───────────
360:    крошка-назад, eyebrow, H1, lead, [Primary] 100%
```

```css
.hero { padding-block: clamp(2rem, 1rem + 4vw, 4.5rem); border-bottom: 1px solid var(--c-ink); background: var(--bg); }
.hero--inner { padding-block: clamp(1.25rem, .8rem + 2vw, 3rem); }
.hero__eyebrow { display: flex; gap: 12px; align-items: center; margin-bottom: var(--sp-4); }
.hero__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: var(--sp-6); }
.hero__facts { border: 1px solid var(--c-ink); background: var(--c-paper); padding: var(--sp-5); }
@media (max-width: 479.98px) { .hero__actions .btn--primary { width: 100%; } }
```

### 5.5 Трастовая лента (trust ribbon)
Статичная строка из 4–5 фактов (не бегущая): `Договор и акты · НДС · Свой автопарк · Работаем зимой · Подача от {{N}} часов`. Mono 13px, разделитель вертикальная черта 1px, перенос на 2 строки на мобильном. Иконка-галочка (SVG-маска). Факты только те, что подтверждены в `structure.md`.

### 5.6 Футер
Тёмный `.on-dark`, 12 колонок: бренд и реквизиты (колонки 1–4: логотип в инверсии, `ООО «…»`, ИНН/ОГРН `{{…}}`, адрес), навигация в 3 колонки (5–10: Аренда / Каталог и продажа / Компания), контакты (11–12: телефон, e-mail, график). Над футером допустима лаймовая CTA-полоса (`.section--lime`). Нижняя строка: `© 2026 …`, ссылка «Политика обработки персональных данных», `Карта сайта`. Без гигантского вордмарка (в отличие от v1/референсов). На мобильном колонки в стопку, группы навигации аккордеонами нет (ссылки видны, строка 44px).

```css
.site-footer { padding-block: var(--sp-16) var(--sp-8); }
.site-footer a { color: var(--text); text-decoration: none; display: inline-flex; min-height: 44px; align-items: center; }
.site-footer a:hover { color: var(--c-lime); text-decoration: underline; text-underline-offset: 4px; }
.site-footer h2 { font: 500 var(--fs-label)/1 var(--font-mono); letter-spacing: var(--ls-label); text-transform: uppercase; color: var(--text-2); margin-bottom: var(--sp-3); }
.site-footer__bottom { margin-top: var(--sp-12); padding-top: var(--sp-5); border-top: 1px solid var(--c-dark-3); display: flex; flex-wrap: wrap; gap: 8px 24px; font-size: var(--fs-small); color: var(--text-2); }
```

### 5.7 Sticky mobile CTA
Только <768px. Нижняя панель 64px: слева «Позвонить» (outline, иконка телефона), справа «Рассчитать» (primary). Появляется **только после того, как hero ушёл за экран** (IntersectionObserver по hero), поэтому первый экран остаётся чистым. Скрывается, когда в форме на странице есть фокус (`:has(:focus-visible)` на форме или класс из JS), не показывается на 404 и в политике ПДн. На странице калькулятора вместо неё панель с итогом и кнопкой «Оставить заявку». `body.has-sticky` получает нижний отступ, чтобы панель не закрывала футер.

```css
.sticky-cta { display: none; }
@media (max-width: 767.98px) {
  .sticky-cta { position: fixed; inset: auto 0 0 0; z-index: var(--z-sticky-cta); display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
    padding: 8px 12px calc(8px + env(safe-area-inset-bottom)); background: var(--c-paper); border-top: 1px solid var(--c-ink);
    transform: translateY(100%); transition: transform var(--dur-3) var(--ease-out); }
  .sticky-cta.is-visible { transform: none; }
  .sticky-cta .btn { min-height: 48px; padding-inline: 12px; }
  body.has-sticky { padding-bottom: calc(64px + env(safe-area-inset-bottom)); }
}
```

### 5.8 Правило «без попапов»
Нет модальных окон, подписок, «получите скидку», чат-виджетов на первом экране. Всё обратное связи происходит на странице (формы встроены, успех показывается на месте). Уведомление о cookie/ПДн (если юридически нужно) показывается как узкая строка в потоке страницы над футером, не фиксируется на первом экране и не перекрывает CTA; на мобильном не одновременно со sticky CTA.

### 5.9 Шаблоны страниц (схемы блоков)

Обозначения: `[12]` — на все 12 колонок; `[7|5]` — 7 + 5 колонок на ≥1024; на 360 все блоки в одну колонку. Hero: «H» (home) и «I» (inner). Секции чередуют `bg` / `paper` слева направо по порядку, если не указано иное.

**T1 Главная**
1. Hero H [7|5]: заголовок + панель «Быстрый расчёт».
2. Stats strip [12] (4 ячейки).
3. Аудитории [4|4|4]: карточки «Частным лицам», «Организациям», «Мероприятия» (audience card).
4. Каталог превью [3 колонки × 5 карточек модели: 3+2; на 768: 2 колонки; на 360: стопка].
5. Сравнение «ЭКО СЕРВИС и обычный прокат» (comparison table) [12].
6. Как работаем (timeline, 4 шага) [12].
7. Услуги: обслуживание, доставка (service cards) [6|6].
8. Trust strip + отзывы (3 review cards) [4|4|4].
9. Мини-FAQ (5 вопросов, accordion) [4|8]: заголовок слева, список справа.
10. Лаймовая CTA-полоса: «Рассчитать за 2 минуты» [8|4].

**T2 Аренда (обзор)** I → «Кому и на какой срок» (3 audience card) → Что входит в аренду (service cards 2×2) → Таблица цен «от» по моделям [12] → Timeline → Callout «Договор и документы» → CTA-полоса.

**T3 Частным лицам** I (+ facts) → Сценарии (дача, ремонт, праздник: 3 карточки) → Рекомендованные модели (2–3 model cards) → Прозрачная цена (price table, 1 модель × сроки) → Timeline (3 шага) → Мини-FAQ группы «Частным» → форма заявки [7|5] (поля + контакт).

**T4 Организациям** I (dark допускается) → Что получает организация: документы, НДС, договор (service cards + doc list) [7|5] → Сравнение (comparison, расширенное) → Тарифы объёма (price table «от N кабин») → Кейсы типов объектов (stats strip + перечень: стройка, УК, ресторан) → Trust strip (placeholder) → Форма «Запрос коммерческого предложения» [7|5].

**T5 Мероприятия** I → Калькулятор-подбор (панель: гости × часы → число кабин) [7|5] → Схема расстановки (иллюстрация-схема, aspect 16/10) → Таблица «Нормативы на гостей» (spec table) → Timeline → Callout «Заказать заранее: даты» → FAQ группы «Мероприятия».

**T6 Каталог (список)** I → Панель фильтров: tabs по назначению (Все / Частным / Стройка / Мероприятия) + select сортировки [12] → Сетка model cards [4|4|4], 5 карточек (на 768 — 2 колонки, 360 — 1) → Сравнение моделей (comparison, колонки = модели; на мобильном стопка) → CTA «Не знаете, что выбрать?» (callout lime-soft).

**T7 Модель (деталь, 5 страниц)** Крошки + [Галерея 7 | Покупательский блок 5 (sticky top = шапка+16)]:
- Галерея: главное фото/схема (`--ar-gallery`), под ним 4 миниатюры (`--ar-thumb`), переключение кнопками (не слайдер-карусель; без автопрокрутки).
- Блок справа: eyebrow артикул, H1 название, лид, цена «от … ₽/сутки» (price), segmented «срок», stepper «кол-во», primary «Заказать», ссылка «Рассчитать точнее».
Далее: Tabs «Характеристики / Что входит / Доставка» (первый таб — specs table) [12] → Related: 3 других model cards → FAQ модели (3 вопроса) → CTA-полоса.

**T8 Продажа** I → Фильтры: tabs (Новые / Б/у) если применимо → Сетка model cards с ценой продажи и наличием (тег «В наличии» / «Под заказ»; тег всегда с текстом) → Таблица условий (оплата, гарантия, доставка) → Doc list (договор, гарантия) → Форма заявки [7|5].

**T9 Цены и калькулятор** I (компактный) → Калькулятор (поля 7 | смета 5 sticky) [раздел 6.9] → Price table «Аренда: цена за сутки по срокам» [12] → Price table «Дополнительно: обслуживание, доставка» → Callout «Что влияет на цену» → Doc list (прайс PDF) → CTA.

**T10 Обслуживание** I → Service cards 3×2 (что входит) → Timeline «Цикл обслуживания» (график → выезд → откачка → мойка → акт) → Таблица «Периодичность и объём» (spec table) → Callout warning (зима: что учитывать) → FAQ группы «Обслуживание» → CTA.

**T11 Доставка и зона** I → [Карта-плейсхолдер 7 | Zone table 5] (на ≤1023: карта, затем таблица) → Timeline «Подача» (3 шага) → Callout info «Срочная подача» → Мини-FAQ → форма «Проверить адрес» [7|5].

**T12 О компании** I → Stats strip → Текст о компании (2 колонки: [7 текст | 5 requisites dl]) → Принципы работы (service cards) → Документы и реквизиты (doc list) → Отзывы: сетка review cards [4|4|4] + блок оценки → Trust strip (placeholder) → CTA.

**T13 Вопросы** I → [Навигация групп (tabs) 3 | Accordion 9]; на ≤1023 tabs сверху в строку-wrap. Группы: Частным, Организациям, Обслуживание и зима, Оплата и документы. Внизу callout «Не нашли ответ?» + телефон.

**T14 Контакты** I → [Контакт-блок 5 (телефон, мессенджеры, e-mail, график, адрес, реквизиты как dl) | Форма 7] → Карта-плейсхолдер [12] (`--ar-map`) → Doc list (карточка предприятия).

**T15 Политика ПДн (длинный текст)** Hero I минимальный (без CTA) → Две колонки на ≥1024: **оглавление sticky [3]** (список якорей, текущий раздел подсвечивается ink-рамкой слева) + **текст [7]** (measure 68ch, нумерованные H2 `1.`, `1.1`, подпункты в `ol`) + пустая [2]. Дата редакции вверху (`Редакция от …`, Mono). Кнопка «Версия для печати» (`window.print()`). Печатный CSS: без шапки, без sticky, ссылки раскрываются (`a[href]::after { content: " (" attr(href) ")" }` кроме якорей). Sticky CTA отключён.

**T16 404** Минимальная шапка + крошки нет. По центру в 8 колонках: Mono «404» в рамке с `.mark`, H1 «Страница не найдена», 1 строка пояснения, 4 ссылки-кнопки (Аренда, Каталог, Цены и калькулятор, Контакты) и телефон. Без попапов, без поиска, статус HTTP 404.

---

## 6. Компоненты

Общее для интерактивных элементов:

```css
:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 3px solid var(--focus); outline-offset: 2px; }
:where(a, button, input, select, textarea):focus:not(:focus-visible) { outline: none; }
a { color: var(--text); text-decoration-line: underline; text-decoration-color: var(--c-lime-deep); text-decoration-thickness: 2px; text-underline-offset: 3px; }
a:hover { background: var(--c-lime-soft); text-decoration-color: var(--c-ink); }
.on-dark a { text-decoration-color: var(--c-lime); } .on-dark a:hover { background: none; color: var(--c-lime); }
.tag { display: inline-flex; align-items: center; gap: 6px; min-height: 24px; padding: 0 8px; font: 500 var(--fs-label)/1 var(--font-mono);
  letter-spacing: var(--ls-label); text-transform: uppercase; color: var(--c-ink); border: 1px solid var(--c-ink); border-radius: var(--r-1); background: transparent; }
.tag--lime { background: var(--c-lime); } .tag--dark { background: var(--c-ink); color: #fff; }
.tag--ok { color: var(--c-success); border-color: var(--c-success); background: var(--c-success-bg); }
.dev-flag { border: 1px dashed var(--c-ui); background: var(--c-paper); color: var(--c-ink-3); }   /* «ЗАГЛУШКА»: убрать при запуске */
```

Ссылка в тексте: графитовая, подчёркивание 2px тёмно-оливковое (лайм не используется как цвет ссылки). Hover подкрашивает лаймовой подложкой.

### 6.1 Кнопки

Варианты: `primary` (лайм, одна на блок/экран), `dark` (графит, белый текст), `outline` (контур 1px ink), `link` (текст со стрелкой), `contact` (телефон, мессенджер: outline + иконка). Радиус 2px, высота 48 (lg 56, sm 44), заливка плоская, без теней. Стрелка рисуется SVG-маской, не символом.

```css
.btn { --btn-bg: var(--c-lime); --btn-fg: var(--c-ink); --btn-bd: var(--c-ink);
  position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; padding: 0 22px;
  font: 600 1rem/1.1 var(--font-sans); letter-spacing: .005em; text-align: center; text-decoration: none;
  color: var(--btn-fg); background: var(--btn-bg); border: 1px solid var(--btn-bd); border-radius: var(--r-1);
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: background-color var(--dur-1) linear, color var(--dur-1) linear, transform var(--dur-1) var(--ease-out); }
.btn:hover  { background: var(--btn-bg-hover, var(--c-lime-hover)); color: var(--btn-fg); }
.btn:active { background: var(--btn-bg-press, var(--c-lime-press)); transform: translateY(1px); }
.btn--lg { min-height: 56px; padding: 0 28px; font-size: 1.0625rem; }
.btn--sm { min-height: 44px; padding: 0 16px; font-size: .9375rem; }
.btn--block { width: 100%; }
.btn--arrow::after, .btn--link::after { content: ""; width: 1em; height: 1em; background: currentColor; flex: none;
  -webkit-mask: var(--i-arrow) center/contain no-repeat; mask: var(--i-arrow) center/contain no-repeat; transition: transform var(--dur-2) var(--ease-out); }
.btn--arrow:hover::after, .btn--link:hover::after { transform: translateX(3px); }

.btn--dark    { --btn-bg: var(--c-ink); --btn-fg: #fff; --btn-bg-hover: var(--c-ink-2); --btn-bg-press: #000; }
.btn--outline { --btn-bg: transparent; --btn-fg: var(--c-ink); --btn-bg-hover: var(--c-sunk); --btn-bg-press: var(--c-line); }
.btn--link    { --btn-bg: transparent; --btn-bd: transparent; --btn-bg-hover: transparent; --btn-bg-press: transparent;
  min-height: 44px; padding: 0 2px; text-decoration: underline; text-decoration-color: var(--c-lime-deep); text-decoration-thickness: 2px; text-underline-offset: 4px; }
.btn--contact { --btn-bg: var(--c-paper); --btn-bg-hover: var(--c-sunk); --btn-bg-press: var(--c-line); font-variant-numeric: tabular-nums; }
.btn--contact svg { width: 20px; height: 20px; }

/* на тёмном: primary остаётся лаймовым, контур белый */
.on-dark .btn--primary { --btn-bd: var(--c-lime); }
.on-dark .btn--outline { --btn-fg: #F4F3EE; --btn-bd: #F4F3EE; --btn-bg-hover: var(--c-dark-3); --btn-bg-press: var(--c-dark-3); }
.on-dark .btn--link { --btn-fg: var(--c-lime); text-decoration-color: var(--c-lime); }
.on-dark .btn--dark { --btn-bg: #F4F3EE; --btn-fg: var(--c-ink); --btn-bg-hover: #fff; --btn-bd: #F4F3EE; }

.btn:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
.btn[disabled], .btn[aria-disabled="true"] { --btn-bg: var(--c-sunk); --btn-fg: var(--c-ink-3); --btn-bd: var(--c-line);
  cursor: not-allowed; pointer-events: none; transform: none; }               /* ink-3 на sunk 5.19:1 */
.btn.is-loading { color: transparent; pointer-events: none; }                    /* + aria-busy="true", текст остаётся в DOM */
.btn.is-loading::before { content: ""; position: absolute; inset: 0; margin: auto; width: 18px; height: 18px;
  border: 2px solid rgba(18,23,26,.25); border-top-color: var(--c-ink); border-radius: 50%; animation: spin .7s linear infinite; }
.btn.is-success { --btn-bg: var(--c-success); --btn-fg: #fff; --btn-bd: var(--c-success); }   /* 6.82:1 */
.btn.is-error   { --btn-bg: var(--c-error);   --btn-fg: #fff; --btn-bd: var(--c-error); }     /* 6.54:1 */
@keyframes spin { to { transform: rotate(360deg); } }
```

| Состояние | Как выглядит |
|---|---|
| default | лайм, ink-текст, рамка 1px ink |
| hover | `#C2E22B`, стрелка сдвигается на 3px (только у `--arrow`/`--link`) |
| focus-visible | кольцо 3px ink (на тёмном lime), отступ 3px |
| active | `#B2D11E`, сдвиг вниз на 1px |
| disabled | sunk-фон, ink-3 текст, рамка line, курсор not-allowed, `disabled` или `aria-disabled` |
| loading | текст скрыт цветом, спиннер 18px, `aria-busy="true"`, повторный клик заблокирован |
| error | красная заливка, текст «Не отправилось. Повторить» |
| success | зелёная заливка, текст «Отправлено», 2 с, затем форма заменяется inline-блоком успеха |

Правило: одна primary на блок. Ссылка-кнопка «Подробнее» всегда со стрелкой. Кнопки одной строки на 360: `flex-wrap`, primary на всю ширину.

### 6.2 Поля ввода, select, textarea

Подпись над полем (не placeholder вместо подписи), высота 48, шрифт 16px (iOS не зумит), граница 1px `--c-ui` (3.87:1 к paper).

```html
<div class="field" data-state="default">
  <label class="field__label" for="phone">Телефон</label>
  <input class="input" id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 ___ ___-__-__"
         required aria-describedby="phone-hint phone-msg">
  <p class="field__hint" id="phone-hint">Позвоним для подтверждения заказа</p>
  <p class="field__msg" id="phone-msg"></p>
</div>
```
```css
.field { display: grid; gap: 6px; align-content: start; }
.field__label { font: 500 var(--fs-small)/1.2 var(--font-sans); color: var(--text); }
.field__label .req { color: var(--c-error); }       /* звёздочка + в подписи слово «обязательно» для скринридера */
.field__hint { margin: 0; font-size: var(--fs-small); color: var(--text-3); }
.input, .select, .textarea { width: 100%; min-height: 48px; padding: 0 14px; font: 400 1rem/1.3 var(--font-sans); color: var(--c-ink);
  background: var(--c-paper); border: 1px solid var(--c-ui); border-radius: var(--r-1); appearance: none; -webkit-appearance: none;
  transition: border-color var(--dur-1) linear, box-shadow var(--dur-1) linear; }
.textarea { min-height: 120px; padding: 12px 14px; resize: vertical; }
.input::placeholder, .textarea::placeholder { color: var(--c-ink-3); opacity: 1; }       /* 6.42:1 */
.input:hover, .select:hover, .textarea:hover { border-color: var(--c-ink); }
.input:focus-visible, .select:focus-visible, .textarea:focus-visible { outline: 3px solid var(--focus); outline-offset: 1px; border-color: var(--c-ink); }
.input:disabled, .select:disabled, .textarea:disabled { background: var(--c-sunk); color: var(--c-ink-3); border-color: var(--c-line); cursor: not-allowed; }
.input[readonly] { background: var(--c-sunk); }
.select { padding-right: 44px; cursor: pointer; }
.select-wrap { position: relative; } .select-wrap::after { content: ""; position: absolute; right: 14px; top: 50%; width: 16px; height: 16px; margin-top: -8px;
  background: var(--c-ink); pointer-events: none; -webkit-mask: var(--i-chevron) center/contain no-repeat; mask: var(--i-chevron) center/contain no-repeat; }
.select:invalid { color: var(--c-ink-3); }       /* первый option value="" disabled selected: «Выберите» */

/* error: толстая граница внутрь (без сдвига вёрстки) + иконка + текст. Фон остаётся белым */
.field[data-state="error"] .input, .field[data-state="error"] .select, .field[data-state="error"] .textarea,
[aria-invalid="true"] { border-color: var(--c-error); box-shadow: inset 0 0 0 1px var(--c-error); }
.field[data-state="success"] .input { border-color: var(--c-success); box-shadow: inset 0 0 0 1px var(--c-success); }
.field__msg { display: none; margin: 0; gap: 6px; align-items: flex-start; font: 500 var(--fs-small)/1.35 var(--font-sans); }
.field[data-state="error"] .field__msg   { display: flex; color: var(--c-error); }      /* 6.54:1 */
.field[data-state="success"] .field__msg { display: flex; color: var(--c-success); }    /* 6.82:1 */
.field__msg::before { content: ""; flex: none; width: 16px; height: 16px; margin-top: 1px; background: currentColor;
  -webkit-mask: var(--i-alert) center/contain no-repeat; mask: var(--i-alert) center/contain no-repeat; }
.field[data-state="success"] .field__msg::before { -webkit-mask-image: var(--i-check); mask-image: var(--i-check); }
```

Состояния: default / hover (граница ink) / focus-visible (кольцо 3px ink + граница ink) / filled / disabled (sunk) / readonly / error (красная граница 2px, иконка, текст, `aria-invalid="true"`) / success (зелёная граница, галочка, текст).

### 6.3 Stepper (количество)

Кнопки 44×48 слева и справа, число в центре (`type="text" inputmode="numeric"`, а не `number`, чтобы не было стрелок и скролла колёсиком). Границы общие, чтобы получился единый блок 140px.

```html
<div class="field"><span class="field__label" id="qty-l">Количество кабин</span>
  <div class="stepper" role="group" aria-labelledby="qty-l">
    <button class="stepper__btn" type="button" aria-label="Уменьшить количество"><span class="i i--minus" aria-hidden="true"></span></button>
    <input class="stepper__val" type="text" inputmode="numeric" pattern="[0-9]*" value="1" aria-live="off" aria-label="Количество">
    <button class="stepper__btn" type="button" aria-label="Увеличить количество"><span class="i i--plus" aria-hidden="true"></span></button>
  </div></div>
```
```css
.stepper { display: inline-flex; width: 152px; border: 1px solid var(--c-ui); border-radius: var(--r-1); background: var(--c-paper); }
.stepper__btn { width: 48px; min-height: 48px; display: grid; place-items: center; background: none; border: 0; color: var(--c-ink); cursor: pointer; font-size: 1.125rem; }
.stepper__btn:hover { background: var(--c-lime-soft); } .stepper__btn:active { background: var(--c-lime); }
.stepper__btn[disabled] { color: var(--c-ink-3); background: var(--c-sunk); cursor: not-allowed; }       /* на min/max */
.stepper__val { flex: 1; min-width: 0; text-align: center; font: 600 1.0625rem/1 var(--font-sans); border: 0; border-inline: 1px solid var(--c-line); background: none; color: var(--c-ink); }
.stepper:hover { border-color: var(--c-ink); }
.stepper:focus-within { outline: 3px solid var(--focus); outline-offset: 1px; border-color: var(--c-ink); }
.stepper__val:focus-visible, .stepper__btn:focus-visible { outline: none; }          /* кольцо рисует :focus-within */
.stepper[data-state="error"] { border-color: var(--c-error); box-shadow: inset 0 0 0 1px var(--c-error); }
```
Границы значения: min 1, max задаётся данными; при выходе значение зажимается, `aria-live` сообщает «Количество: 3». Нажатие и удержание: повтор с задержкой 400/80мс.

### 6.4 Segmented control

Для «Срок: сутки / недели / месяцы» и «Для кого: Частным / Организациям». Радио-кнопки в `fieldset`. Выбранное: заливка ink + белый текст + галочка (не только цвет).

```html
<fieldset class="seg"><legend class="field__label">Единица срока</legend>
  <div class="seg__row">
    <input type="radio" name="unit" id="u-d" value="day" checked><label for="u-d">Сутки</label>
    <input type="radio" name="unit" id="u-w" value="week"><label for="u-w">Недели</label>
    <input type="radio" name="unit" id="u-m" value="month"><label for="u-m">Месяцы</label>
  </div></fieldset>
```
```css
.seg { border: 0; padding: 0; margin: 0; min-width: 0; } .seg legend { padding: 0; margin-bottom: 6px; }
.seg__row { display: inline-flex; max-width: 100%; border: 1px solid var(--c-ui); border-radius: var(--r-1); background: var(--c-paper); }
.seg input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.seg label { display: inline-flex; align-items: center; justify-content: center; gap: 6px; flex: 1; min-height: 46px; padding: 0 16px;
  font: 500 .9375rem/1 var(--font-sans); cursor: pointer; border-right: 1px solid var(--c-line); transition: background-color var(--dur-1) linear; }
.seg label:last-of-type { border-right: 0; }
.seg label:hover { background: var(--c-lime-soft); }
.seg input:checked + label { background: var(--c-ink); color: #fff; font-weight: 600; }            /* 18.05:1 */
.seg input:checked + label::before { content: ""; width: 14px; height: 14px; background: var(--c-lime);
  -webkit-mask: var(--i-check) center/contain no-repeat; mask: var(--i-check) center/contain no-repeat; }
.seg input:focus-visible + label { outline: 3px solid var(--focus); outline-offset: 2px; }
.seg input:disabled + label { color: var(--c-ink-3); background: var(--c-sunk); cursor: not-allowed; }
@media (max-width: 479.98px) { .seg__row { display: flex; } .seg label { padding: 0 8px; } }
```

### 6.5 Checkbox и радио

Бокс 24px (зона нажатия всей строки ≥ 44px), граница `--c-ui`, отмеченный: ink-заливка с лаймовой галочкой (13.99:1).

```html
<label class="check"><input type="checkbox" name="service" value="1"><span class="check__box" aria-hidden="true"></span>
  <span class="check__t">Регулярное обслуживание <span class="small">+ {{N}}&nbsp;₽/неделя</span></span></label>
```
```css
.check { display: flex; align-items: flex-start; gap: 12px; min-height: 44px; padding: 10px 0; cursor: pointer; }
.check input { position: absolute; opacity: 0; width: 24px; height: 24px; margin: 0; }
.check__box { flex: none; width: 24px; height: 24px; margin-top: 0; background: var(--c-paper); border: 1px solid var(--c-ui); border-radius: var(--r-1);
  display: grid; place-items: center; transition: background-color var(--dur-1) linear, border-color var(--dur-1) linear; }
.check:hover .check__box { border-color: var(--c-ink); }
.check input:checked + .check__box { background: var(--c-ink); border-color: var(--c-ink); }
.check input:checked + .check__box::after { content: ""; width: 16px; height: 16px; background: var(--c-lime);
  -webkit-mask: var(--i-check) center/contain no-repeat; mask: var(--i-check) center/contain no-repeat; }
.check input:indeterminate + .check__box::after { -webkit-mask-image: var(--i-minus); mask-image: var(--i-minus); }
.check input:focus-visible + .check__box { outline: 3px solid var(--focus); outline-offset: 2px; }
.check input:disabled + .check__box { background: var(--c-sunk); border-color: var(--c-line); }
.check input:disabled ~ .check__t { color: var(--c-ink-3); }
.check[data-state="error"] .check__box, .check input[aria-invalid="true"] + .check__box { border-color: var(--c-error); box-shadow: inset 0 0 0 1px var(--c-error); }
/* радио: тот же шаблон, .check__box { border-radius: 50% }, отмеченное = точка lime 10px внутри ink-круга */
```
Обязательное согласие с политикой ПДн: чекбокс **не отмечен по умолчанию**, текст «Согласен на обработку персональных данных» со ссылкой на `T15`, ошибка: «Подтвердите согласие, чтобы отправить заявку».

### 6.6 Валидация форм

- Проверка при `blur` и при отправке; во время ввода только снимать ошибку, когда поле стало корректным.
- Ошибки в каждом поле (иконка + текст ниже поля). **Если форма длиннее 4 полей** над ней показывается сводка `role="alert"` со ссылками-якорями на поля: «Исправьте 2 поля: Телефон, Согласие». Первое невалидное поле получает фокус.
- Не блокировать кнопку отправки до валидности (это скрывает причину): кнопка активна, ошибки объясняют.
- Маска телефона мягкая: принимать любые форматы, нормализовать при отправке.
- Тексты ошибок: «Введите телефон полностью, например +7 913 000-00-00», «Укажите имя», «Выберите модель». Без восклицательных знаков.
- **Успех без тоста**: форма заменяется на месте блоком `.notice--ok` (`role="status"`, фокус на нём): заголовок «Заявка принята», строка «Позвоним в течение {{N}} минут в рабочее время» и кнопка-ссылка «Отправить ещё одну». Номер заявки в Mono (`№ 000124`) если есть.
- Ошибка отправки: блок `.notice--error` над кнопкой: «Не удалось отправить. Позвоните: +7 {{номер}}» (телефон ссылкой), введённые данные сохраняются.
- Honeypot-поле и капча без графических задач; не использовать reCAPTCHA-окна над экраном.

### 6.7 Карточка модели (model card)

Шильдик: сверху схема/фото в рамке с метками обрезки (`--ar-card` 4:3), артикул и тег, название, три ключевые характеристики, цена, ссылка. Вся карточка кликабельна (псевдоэлемент на заголовке-ссылке), одна ссылка, чтобы не плодить табстопы.

```html
<article class="model-card">
  <figure class="ph ph--card crop"><!-- иллюстрация: svg, потом фото -->…</figure>
  <div class="model-card__body">
    <div class="model-card__top"><span class="label">ЭС-02</span><span class="tag tag--lime">Хит</span></div>
    <h3 class="model-card__title"><a href="/katalog/es-02/">Кабина с рукомойником</a></h3>
    <dl class="kv">
      <div><dt>Бак</dt><dd>250&nbsp;л</dd></div>
      <div><dt>Габариты</dt><dd class="mono">1100×1200×2300&nbsp;мм</dd></div>
      <div><dt>Вес</dt><dd>72&nbsp;кг</dd></div>
    </dl>
    <div class="model-card__foot"><span class="price"><small>от&nbsp;</small>450&nbsp;₽<small>/сутки</small></span>
      <span class="btn--link btn" aria-hidden="true">Подробнее</span></div>
  </div>
</article>
```
```css
.model-card { position: relative; display: flex; flex-direction: column; background: var(--c-paper); border: 1px solid var(--c-ink); border-radius: var(--r-1); }
.model-card::before { content: ""; position: absolute; left: -1px; right: -1px; top: -1px; height: 4px; background: var(--c-lime); border-top: 0; transform: scaleX(0); transform-origin: left;
  transition: transform var(--dur-3) var(--ease-out); z-index: 1; }
.model-card:hover::before, .model-card:focus-within::before { transform: scaleX(1); }
.model-card__body { display: grid; gap: var(--sp-3); padding: var(--sp-5); border-top: 1px solid var(--c-ink); }
@media (min-width: 1024px) { .model-card__body { padding: var(--sp-6); } }
.model-card__top { display: flex; justify-content: space-between; align-items: center; }
.model-card__title a { color: var(--c-ink); text-decoration: none; }
.model-card__title a::after { content: ""; position: absolute; inset: 0; }                  /* кликабельная карточка */
.model-card:hover { background: var(--c-lime-soft); }
.model-card:focus-within { outline: 3px solid var(--focus); outline-offset: 2px; }
.model-card__title a:focus-visible { outline: none; }
.model-card__foot { display: flex; justify-content: space-between; align-items: end; gap: 12px; margin-top: var(--sp-2); padding-top: var(--sp-3); border-top: 1px solid var(--c-line); }
.kv { margin: 0; display: grid; gap: 0; } .kv > div { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px dotted var(--c-ui); font-size: var(--fs-small); }
.kv dt { color: var(--text-2); } .kv dd { margin: 0; font-weight: 500; text-align: right; }
```
Состояния: default / hover (лайм-полоса 4px выезжает сверху, фон lime-soft) / focus-visible (кольцо на всей карточке) / active (без смены, переход на страницу) / disabled («Нет в наличии»: фон sunk, тег `Под заказ`, ссылка остаётся) / loading (скелетон: серые блоки sunk без анимации мерцания; при reduced-motion статично).

### 6.8 Карточки аудитории и услуг

**Audience card** (Частным лицам / Организациям / Мероприятия): верхняя линия 2px ink, индекс `01` (Mono), H3, список из 3 пунктов с галочками, ссылка-кнопка. Без фоновой заливки; hover подкрашивает lime-soft.

```css
.aud-card { position: relative; display: grid; gap: var(--sp-4); align-content: start; padding: var(--sp-5) 0 var(--sp-6); border-top: 2px solid var(--c-ink); background: transparent; }
@media (min-width: 1024px) { .aud-card { padding-inline: 0 var(--sp-6); } }
.aud-card:hover { background: linear-gradient(var(--c-lime-soft), var(--c-lime-soft)) no-repeat 0 0 / 100% 100%; }
.aud-card ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.aud-card li { display: flex; gap: 10px; } .aud-card li::before { content: ""; flex: none; width: 16px; height: 16px; margin-top: 4px; background: var(--c-lime-deep);
  -webkit-mask: var(--i-check) center/contain no-repeat; mask: var(--i-check) center/contain no-repeat; }
.aud-card a.stretched::after { content: ""; position: absolute; inset: 0; }
```

**Service card** (Что входит / Услуги): рамка 1px line (hairline), квадратная иконка 40px (контур 1.75px), H4, описание, мета-строка Mono («входит в аренду» или «+ {{N}} ₽»).

```css
.svc-card { display: grid; gap: var(--sp-3); align-content: start; padding: var(--sp-5); background: var(--c-paper); border: 1px solid var(--c-line); border-radius: var(--r-1); }
.svc-card:hover { border-color: var(--c-ink); }
.svc-card__ico { width: 40px; height: 40px; display: grid; place-items: center; border: 1px solid var(--c-ink); background: var(--c-lime); }
.svc-card__meta { font: 500 var(--fs-label)/1.2 var(--font-mono); color: var(--text-2); text-transform: uppercase; letter-spacing: var(--ls-label); }
```

### 6.9 Таблицы

Единые правила: `<caption>` (виден или `visually-hidden`), `<th scope>`, числовые колонки по правому краю, tabular-цифры, шапка Mono-меткой на сильной линии 2px ink, строки разделены hairline. **Горизонтального скролла страницы нет:** ниже 640px таблицы превращаются в стопку карточек (`data-label`), для сохранения семантики добавляются явные ARIA-роли.

```css
.tbl { width: 100%; border-collapse: collapse; background: var(--c-paper); border: 1px solid var(--c-ink); font-variant-numeric: tabular-nums; }
.tbl caption { padding: 0 0 var(--sp-3); text-align: left; font: 600 var(--fs-h4)/1.3 var(--font-sans); caption-side: top; }
.tbl th, .tbl td { padding: 14px 16px; text-align: left; vertical-align: top; border-bottom: 1px solid var(--c-line); overflow-wrap: anywhere; }
.tbl thead th { font: 500 var(--fs-label)/1.2 var(--font-mono); letter-spacing: var(--ls-label); text-transform: uppercase; color: var(--c-ink-2);
  background: var(--c-sunk); border-bottom: 2px solid var(--c-ink); }
.tbl tbody th { font-weight: 600; background: transparent; }
.tbl tbody tr:hover { background: var(--c-lime-soft); }
.tbl tbody tr:last-child > * { border-bottom: 0; }
.tbl .num { text-align: right; white-space: nowrap; }
.tbl .grp th, .tbl .grp td { background: var(--c-sunk); font: 500 var(--fs-label)/1.2 var(--font-mono); letter-spacing: var(--ls-label); text-transform: uppercase; color: var(--c-ink-2); }

@media (max-width: 639.98px) {
  .tbl--stack { border: 0; background: transparent; }
  .tbl--stack thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .tbl--stack, .tbl--stack tbody, .tbl--stack tr, .tbl--stack th, .tbl--stack td { display: block; }
  .tbl--stack tr { margin-bottom: 12px; background: var(--c-paper); border: 1px solid var(--c-ink); }
  .tbl--stack tbody th { padding: 12px 16px; background: var(--c-ink); color: #fff; border-bottom: 0; }
  .tbl--stack td { display: grid; grid-template-columns: minmax(0, 42%) minmax(0, 1fr); gap: 12px; padding: 10px 16px; text-align: left; }
  .tbl--stack td::before { content: attr(data-label); font: 500 var(--fs-label)/1.3 var(--font-mono); letter-spacing: var(--ls-label); text-transform: uppercase; color: var(--c-ink-2); }
  .tbl--stack .num { text-align: left; white-space: normal; }
}
```

**Specs table** (характеристики модели): две колонки, на 360 остаётся двухколоночной (стопка не нужна), `th` 42% ширины, группы строк «Габариты / Бак / Комплектация».

```html
<table class="tbl tbl--spec">
  <caption class="visually-hidden">Характеристики модели ЭС-02</caption>
  <tbody>
    <tr class="grp"><th colspan="2" scope="colgroup">Габариты и вес</th></tr>
    <tr><th scope="row">Размеры (Ш×Г×В)</th><td class="mono">1100×1200×2300&nbsp;мм</td></tr>
    <tr><th scope="row">Вес пустой</th><td>72&nbsp;кг</td></tr>
    <tr class="grp"><th colspan="2" scope="colgroup">Бак и водоснабжение</th></tr>
    <tr><th scope="row">Объём бака</th><td>250&nbsp;л</td></tr>
  </tbody>
</table>
```
`.tbl--spec th { width: 42%; font-weight: 500; color: var(--text-2); }`

**Price table** (цена за сутки по срокам и моделям): колонки `Модель | 1 сутки | 2–6 | 7–29 | от 30`; числа справа; строка-подпись «Цены в ₽ за кабину в сутки, НДС {{…}}». Выбранная или рекомендуемая строка отмечена тегом `Хит`, не цветом. Ячейка «по запросу» в Mono.

```html
<table class="tbl tbl--stack" role="table">
  <caption>Аренда: цена за кабину в сутки, ₽</caption>
  <thead role="rowgroup"><tr role="row">
    <th scope="col" role="columnheader">Модель</th><th scope="col" class="num" role="columnheader">1 сутки</th>
    <th scope="col" class="num" role="columnheader">2–6 суток</th><th scope="col" class="num" role="columnheader">7–29 суток</th><th scope="col" class="num" role="columnheader">от 30 суток</th></tr></thead>
  <tbody role="rowgroup">
    <tr role="row"><th scope="row" role="rowheader">ЭС-01 База</th>
      <td class="num" role="cell" data-label="1 сутки">{{…}}&nbsp;₽</td><td class="num" role="cell" data-label="2–6 суток">{{…}}&nbsp;₽</td>
      <td class="num" role="cell" data-label="7–29 суток">{{…}}&nbsp;₽</td><td class="num" role="cell" data-label="от 30 суток">{{…}}&nbsp;₽</td></tr>
  </tbody>
</table>
```
Числа-плейсхолдеры `{{…}}` заменяются из `structure.md`; цены и сроки в вёрстке не выдумывать.

**Comparison table** («ЭКО СЕРВИС и обычный прокат», также «сравнение моделей»): первая колонка критерии, вторая **наша** (верхняя полоса lime 4px, фон lime-soft, заголовок `th` жирный), остальные «обычно». Значения: `Да`/`Нет` словом плюс иконка, не только галочка. На <640 каждая строка-критерий превращается в карточку: заголовок (критерий) и две строки «Мы: …» / «Обычно: …».

```html
<table class="tbl tbl--stack tbl--compare" role="table">
  <caption class="visually-hidden">Сравнение условий</caption>
  <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Условие</th>
    <th scope="col" class="is-us" role="columnheader">ЭКО СЕРВИС</th><th scope="col" role="columnheader">Обычный прокат</th></tr></thead>
  <tbody role="rowgroup">
    <tr role="row"><th scope="row" role="rowheader">Мойка и дезинфекция перед выдачей</th>
      <td class="is-us" role="cell" data-label="ЭКО СЕРВИС"><span class="yn yn--y"><span class="i i--check" aria-hidden="true"></span>Да, с актом</span></td>
      <td role="cell" data-label="Обычный прокат"><span class="yn yn--n"><span class="i i--minus" aria-hidden="true"></span>Не всегда</span></td></tr>
  </tbody>
</table>
```
```css
.tbl--compare thead th.is-us { background: var(--c-lime); color: var(--c-ink); border-bottom-color: var(--c-ink); }
.tbl--compare td.is-us { background: var(--c-lime-soft); font-weight: 500; }
.yn { display: inline-flex; align-items: center; gap: 8px; } .yn--y .i { color: var(--c-success); } .yn--n { color: var(--c-ink-2); }
@media (max-width: 639.98px) { .tbl--compare td.is-us { background: var(--c-lime-soft); } }
```
Честность: в колонке «Обычный прокат» не называть конкретных конкурентов и не приписывать им то, чего мы не знаем; формулировки «часто», «не всегда» из `structure.md`.

**Zone table** (зоны доставки): колонки `Зона | Расстояние от границы города | Подача | Доставка в обе стороны | Условие`. Зона обозначена Mono-метками «A / B / C / D» (метка совпадает с меткой кольца на карте-плейсхолдере), оттенки: A lime, B lime-soft, C sunk, D paper с рамкой. Строка «Новосибирск и область: уточняйте» в конце, не более 5 строк.

```css
.zone-chip { display: inline-grid; place-items: center; width: 28px; height: 28px; font: 500 .8125rem/1 var(--font-mono); border: 1px solid var(--c-ink); border-radius: var(--r-1); }
.zone-a { background: var(--c-lime); } .zone-b { background: var(--c-lime-soft); } .zone-c { background: var(--c-sunk); } .zone-d { background: var(--c-paper); }
```

**Карта-плейсхолдер** (`--ar-map`): блок с сеткой 24px (hairline), концентрические кольца зон (A/B/C/D) через `radial-gradient`, в центре метка «Новосибирск», подпись Mono «Карта подключается позже · Яндекс.Карты». Размер задан заранее (нет CLS при подключении настоящей карты).

```css
.map-ph { position: relative; aspect-ratio: var(--ar-map); background:
    radial-gradient(circle at 50% 50%, transparent 0 14%, rgba(18,23,26,.5) 14% calc(14% + 1px), transparent calc(14% + 1px) 26%, rgba(18,23,26,.4) 26% calc(26% + 1px), transparent calc(26% + 1px) 38%, rgba(18,23,26,.3) 38% calc(38% + 1px), transparent calc(38% + 1px)),
    linear-gradient(var(--c-line) 1px, transparent 1px) 0 0 / 24px 24px, linear-gradient(90deg, var(--c-line) 1px, transparent 1px) 0 0 / 24px 24px, var(--c-paper);
  border: 1px solid var(--c-ink); }
.map-ph__pin { position: absolute; left: 50%; top: 50%; width: 14px; height: 14px; margin: -7px; background: var(--c-lime); border: 2px solid var(--c-ink); border-radius: 50%; }
.map-ph__cap { position: absolute; left: 12px; bottom: 12px; padding: 4px 8px; background: var(--c-paper); border: 1px dashed var(--c-ui); font: 400 var(--fs-label)/1.2 var(--font-mono); color: var(--c-ink-3); }
@media (max-width: 639.98px) { .map-ph { aspect-ratio: 4 / 3; } }
```

### 6.10 Калькулятор: панель и смета

Раскладка ≥1024: поля [7 колонок] + смета [5 колонок, `position: sticky; top: calc(var(--header-h) + 16px)`]. На <1024: поля, затем смета, плюс нижняя панель-итог (вместо sticky CTA).

Поля по порядку: Модель (select) → Количество (stepper) → Срок (segmented «сутки/недели/месяцы» + поле числа) → Адрес/зона (select A/B/C/D) → Опции (checkbox: обслуживание, доставка в выходной) → Контакт (телефон + имя) → согласие → кнопка «Оставить заявку».

Смета: «табличка» на ink, строки «параметр … значение» с пунктирным выводом, скидка выделена `lime-deep` → на тёмном `lime`, итог Plex Sans 600 `--fs-price-xl` лаймовый. Под итогом строка: «Предварительный расчёт. Окончательная цена в договоре».

```html
<aside class="quote on-dark" aria-labelledby="q-h">
  <div class="quote__head"><h3 id="q-h">Смета</h3><span class="label">№ черновик</span></div>
  <dl class="quote__list" aria-live="polite" aria-atomic="false">
    <div><dt>ЭС-02 × 3 шт. × 7 суток</dt><dd>{{…}}&nbsp;₽</dd></div>
    <div><dt>Доставка, зона A</dt><dd>{{…}}&nbsp;₽</dd></div>
    <div class="is-disc"><dt>Скидка за срок</dt><dd>−{{…}}&nbsp;₽</dd></div>
  </dl>
  <p class="quote__total"><span class="label">Итого</span><output class="price price--xl" for="model qty term zone">{{…}}&nbsp;₽</output></p>
  <p class="small">Предварительный расчёт. Окончательная цена фиксируется в договоре.</p>
  <button class="btn btn--primary btn--block btn--lg" type="submit">Оставить заявку</button>
</aside>
```
```css
.quote { padding: var(--sp-6); border: 1px solid var(--c-ink); border-top: 4px solid var(--c-lime); }
.quote__head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--sp-4); }
.quote__list { margin: 0; } .quote__list > div { display: flex; gap: 12px; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted var(--c-ui); }
.quote__list dt { color: var(--text-2); min-width: 0; } .quote__list dd { margin: 0; white-space: nowrap; font-weight: 500; }
.quote__list .is-disc dd { color: var(--c-lime); }
.quote__total { display: grid; gap: 6px; margin: var(--sp-5) 0 var(--sp-3); } .quote__total .price { color: var(--c-lime); }
.quote .small { color: var(--text-2); margin-bottom: var(--sp-4); }
.quote.is-loading .quote__list, .quote.is-loading .price { opacity: .45; }       /* пересчёт: 120–200 мс, без спиннера и анимации чисел */
.quote.is-empty .price::after { content: "—"; }                                   /* пока не заполнены обязательные поля */
```
Состояния панели: empty (итог «—», подсказка «Выберите модель и срок») / filled / loading (значения приглушены, `aria-busy`) / error (над сметой `.notice--error`, итог «—») / success (после отправки смета заменяется `.notice--ok` с номером заявки и итогом в Mono). Скидка за объём показывается строкой со знаком «−», а не «зачёркнутой ценой». Числа не анимируются счётчиком; значение в `<output>` обновляется сразу, `aria-live="polite"` озвучивает итог.

### 6.11 Timeline / шаги процесса

Горизонтально ≥1024 (4–5 шагов, линия 1px ink через узлы), вертикально на <1024 (левая линия, узлы 40px). Узел: квадрат 40px, Mono-номер; текущий/первый шаг заливается лаймом. Это нумерованный `<ol>`.

```html
<ol class="steps">
  <li class="steps__i"><span class="steps__n">01</span><h3 class="steps__t">Заявка</h3><p>Звонок или форма: модель, срок, адрес.</p></li>
  <li class="steps__i"><span class="steps__n">02</span>…</li>
</ol>
```
```css
.steps { counter-reset: s; margin: 0; padding: 0; list-style: none; display: grid; gap: var(--sp-6); }
.steps__i { position: relative; display: grid; gap: 8px; padding-left: 64px; }
.steps__n { position: absolute; left: 0; top: 0; width: 40px; height: 40px; display: grid; place-items: center; font: 500 .875rem/1 var(--font-mono); background: var(--c-paper); border: 1px solid var(--c-ink); }
.steps__i:first-child .steps__n { background: var(--c-lime); }
.steps__i:not(:last-child)::before { content: ""; position: absolute; left: 19.5px; top: 40px; bottom: -24px; width: 1px; background: var(--c-ink); }
@media (min-width: 1024px) {
  .steps { grid-template-columns: repeat(var(--n, 4), minmax(0, 1fr)); gap: var(--gutter); }
  .steps__i { padding: 56px 0 0; }
  .steps__i:not(:last-child)::before { left: 40px; right: calc(var(--gutter) * -1); top: 19.5px; bottom: auto; width: auto; height: 1px; }
}
```
Состояния не интерактивные. Если шаги ведут на страницы, заголовок становится ссылкой с hover подложкой lime-soft.

### 6.12 Stats strip (полоса цифр)

4 ячейки (3 допустимо), разделены вертикальными hairline, цифра `--fs-stat`, подпись 14px. На 360: 2×2, на ≥768: в ряд. Числа **статичные** (без счётчика). Цифры только подтверждённые (источники в `structure.md`); на этапе макета помечать `.dev-flag`.

```html
<dl class="stats"><div><dt class="small">Лет на рынке</dt><dd class="stat">{{N}}</dd></div> … </dl>
```
```css
.stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0; border-block: 1px solid var(--c-ink); background: var(--c-paper); }
.stats > div { display: flex; flex-direction: column-reverse; justify-content: flex-end; gap: 6px; padding: var(--sp-5) var(--sp-4); border-right: 1px solid var(--c-line); border-bottom: 1px solid var(--c-line); }
.stats > div:nth-child(2n) { border-right: 0; }
.stats .stat { margin: 0; font: 600 var(--fs-stat)/1 var(--font-sans); letter-spacing: -0.02em; }
.stats .stat .mark { padding-inline: .12em; }
@media (min-width: 768px) { .stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } .stats > div { border-bottom: 0; } .stats > div:nth-child(2n) { border-right: 1px solid var(--c-line); } .stats > div:last-child { border-right: 0; } }
```

### 6.13 Trust / logo strip (заглушка)

Две формы: (1) **Лента фактов** (раздел 5.5), всегда доступна; (2) **полоса логотипов клиентов**, пока без реальных логотипов: 6 ячеек 160×64 (2×3 на 360, 6 в ряд ≥1024), пунктирная рамка, внутри Mono «ЛОГОТИП КЛИЕНТА» и `.dev-flag`. Логотипы вставляются только с письменного разрешения клиента и в монохроме (`filter: grayscale(1)`, `opacity: .8`, на hover полный цвет не нужен). Чужие логотипы, выдуманные клиенты запрещены.

```css
.logos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; border: 1px solid var(--c-ink); background: var(--c-paper); }
.logos > li { display: grid; place-items: center; height: 72px; list-style: none; border: 1px dashed var(--c-ui); margin: -1px 0 0 -1px; font: 400 var(--fs-label)/1 var(--font-mono); color: var(--c-ink-3); text-transform: uppercase; letter-spacing: var(--ls-label); }
@media (min-width: 1024px) { .logos { grid-template-columns: repeat(6, minmax(0, 1fr)); } }
.logos img { max-height: 36px; width: auto; max-width: 70%; filter: grayscale(1); opacity: .85; }
```

### 6.14 Карточка отзыва (review card)

Цитата 16–18px, ниже имя, тип клиента (Mono-тег «Частное лицо» / «Организация»), дата, источник («Яндекс Карты», «2ГИС» или «Письмо клиента») со ссылкой, если публично. Без звёздочек-рейтингов, если нет реальной выборки. Без аватаров (инициал в квадрате 40px). Реальные отзывы только настоящие; пока их нет, блок помечается `.dev-flag` и содержит явные макет-заглушки.

```html
<figure class="review">
  <blockquote><p>«{{Текст отзыва}}»</p></blockquote>
  <figcaption class="review__by"><span class="review__ini" aria-hidden="true">А</span>
    <span><b>{{Имя}}</b><br><span class="small">{{Роль, город}} · {{месяц год}}</span></span><span class="tag">Организация</span></figcaption>
</figure>
```
```css
.review { display: grid; gap: var(--sp-5); margin: 0; padding: var(--sp-6); background: var(--c-paper); border: 1px solid var(--c-line); border-left: 4px solid var(--c-ink); border-radius: 0 var(--r-1) var(--r-1) 0; }
.review blockquote { margin: 0; font-size: 1.0625rem; line-height: 1.55; } .review blockquote p { max-width: none; }
.review__by { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.review__ini { width: 40px; height: 40px; display: grid; place-items: center; background: var(--c-lime); border: 1px solid var(--c-ink); font-weight: 600; }
.review .tag { margin-left: auto; }
```
Сетка отзывов: ≥1024 три колонки, 768 две, 360 стопкой (без слайдера). Если отзывов больше 6: кнопка «Показать ещё» (раскрывает на месте, `aria-expanded`).

### 6.15 FAQ: вкладки групп + аккордеон

Группы: Частным лицам / Организациям / Обслуживание и зима / Оплата и документы. Вкладки: `role="tablist"`, стрелки ← → переключают, Home/End; панель `role="tabpanel"`. На ≤1023 вкладки переносятся в строки (`flex-wrap`), без горизонтального скролла. Аккордеон — нативный `<details>` (работает без JS, поиск по странице раскрывает), `name` для эксклюзивности по желанию. Поддержка `#якоря` на конкретный вопрос (раскрывает и скроллит).

```html
<div class="tabs" role="tablist" aria-label="Группы вопросов">
  <button role="tab" id="t-priv" aria-selected="true"  aria-controls="p-priv">Частным лицам</button>
  <button role="tab" id="t-org"  aria-selected="false" aria-controls="p-org" tabindex="-1">Организациям</button>
</div>
<div role="tabpanel" id="p-priv" aria-labelledby="t-priv">
  <details class="acc"><summary class="acc__q"><span>Сколько стоит аренда на выходные?</span><span class="acc__ico" aria-hidden="true"></span></summary>
    <div class="acc__a"><p>{{Ответ}}</p></div></details>
</div>
```
```css
/* Tabs (общий компонент) */
.tabs { display: flex; flex-wrap: wrap; gap: 0 4px; border-bottom: 1px solid var(--c-ink); margin-bottom: var(--sp-6); }
.tabs [role="tab"] { min-height: 48px; padding: 0 16px; font: 500 .9375rem/1 var(--font-sans); color: var(--c-ink-2); background: none; border: 0; border-bottom: 3px solid transparent; margin-bottom: -1px; cursor: pointer; }
.tabs [role="tab"]:hover { color: var(--c-ink); background: var(--c-sunk); }
.tabs [role="tab"][aria-selected="true"] { color: var(--c-ink); font-weight: 600; border-bottom-color: var(--c-ink); }           /* индикатор ink, не lime */
.tabs [role="tab"]:focus-visible { outline: 3px solid var(--focus); outline-offset: -3px; }
.tabs [role="tab"][disabled] { color: var(--c-ink-3); cursor: not-allowed; background: none; }
[role="tabpanel"]:focus-visible { outline: 3px solid var(--focus); outline-offset: 4px; }

/* Accordion */
.acc { border-bottom: 1px solid var(--c-line); } .acc:first-of-type { border-top: 1px solid var(--c-ink); }
.acc__q { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 56px; padding: 12px 0; font: 600 1.0625rem/1.35 var(--font-sans); cursor: pointer; list-style: none; }
.acc__q::-webkit-details-marker { display: none; }
.acc__q:hover { background: var(--c-lime-soft); }
.acc__ico { flex: none; width: 24px; height: 24px; background: var(--c-ink);
  -webkit-mask: var(--i-plus) center/16px no-repeat; mask: var(--i-plus) center/16px no-repeat; transition: transform var(--dur-3) var(--ease-out); }
.acc[open] .acc__ico { transform: rotate(135deg); }                       /* плюс превращается в крест */
.acc__a { padding: 0 40px var(--sp-5) 0; color: var(--c-ink-2); } .acc[open] .acc__q { color: var(--c-ink); }
```
Раскрытие: без анимации высоты в базовой версии (нативный `details`); допускается `interpolate-size`/`::details-content` с `transition: block-size var(--dur-3)` там, где поддерживается; при `prefers-reduced-motion` отключить.

### 6.16 Tabs (общие)
Тот же компонент, что в 6.15. Применения: каталог (по назначению), страница модели («Характеристики / Что входит / Доставка»), продажа (новые/б/у). На 360 вкладки переносятся на 2 строки; если вкладок больше 4, превращать в `select` (`.tabs-select` с `aria-label`) только на <640. При смене вкладки URL получает `#hash`; активная панель получает `tabindex="0"`.

### 6.17 Callout / notice

Четыре статуса + «важно». Структура: иконка 20px слева, заголовок 600, текст, рамка 1px и полоса слева 4px цвета статуса. Статус всегда озвучивается: `role="status"` (info, success), `role="alert"` (error, warning, если появляется динамически); статичная справка без роли.

```html
<div class="notice notice--warn" role="note"><span class="notice__ico i i--alert" aria-hidden="true"></span>
  <div><p class="notice__t">Зимой подача занимает дольше</p><p>При −30&nbsp;°C для кабины требуется утепление, это учтено в тарифе «Зима».</p></div></div>
```
```css
.notice { display: grid; grid-template-columns: 20px 1fr; gap: 12px; padding: 14px 16px; border: 1px solid var(--n-c); border-left-width: 4px; background: var(--n-bg); color: var(--c-ink); border-radius: var(--r-1); }
.notice__ico { width: 20px; height: 20px; margin-top: 2px; color: var(--n-c); } .notice__t { margin: 0 0 4px; font-weight: 600; } .notice p:last-child { margin-bottom: 0; }
.notice--info  { --n-c: var(--c-info);    --n-bg: var(--c-info-bg); }
.notice--ok    { --n-c: var(--c-success); --n-bg: var(--c-success-bg); }
.notice--warn  { --n-c: var(--c-warning); --n-bg: var(--c-warning-bg); }
.notice--error { --n-c: var(--c-error);   --n-bg: var(--c-error-bg); }
.notice--key   { --n-c: var(--c-ink);     --n-bg: var(--c-lime-soft); }     /* «важно»: единственная выноска с лаймовой подложкой */
```
(Заголовок и текст в `--c-ink` на фонах статусов ≥ 14:1; иконка и рамка в цвете статуса ≥ 5:1.) Закрываемых выносок нет (не плодить состояния); если закрытие нужно, кнопка 44×44 с `aria-label="Закрыть"`.

### 6.18 Список документов (document list)

Строка: Mono-бейдж формата (PDF/DOCX/XLSX), название, мета «PDF · 184 КБ · обновлено 01.10.2026», кнопка-ссылка «Скачать». Вся строка не ссылка (чтобы не было дублей), ссылка на название с `download` и `type`. Высота ≥ 64px. Перед загрузкой кнопка показывает размер.

```html
<ul class="docs">
  <li class="docs__i"><span class="docs__ext" aria-hidden="true">PDF</span>
    <div class="docs__main"><a class="docs__name" href="/docs/dogovor-arendy.pdf" download>Договор аренды (образец)</a><span class="small mono">PDF · 184&nbsp;КБ · обновлено {{дата}}</span></div>
    <a class="btn btn--outline btn--sm docs__dl" href="/docs/dogovor-arendy.pdf" download aria-label="Скачать: Договор аренды (образец), PDF, 184 КБ"><span class="i i--download" aria-hidden="true"></span>Скачать</a></li>
</ul>
```
```css
.docs { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--c-ink); }
.docs__i { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 16px; min-height: 72px; padding: 12px 0; border-bottom: 1px solid var(--c-line); }
.docs__i:hover { background: var(--c-lime-soft); }
.docs__ext { width: 48px; height: 48px; display: grid; place-items: center; font: 500 .75rem/1 var(--font-mono); letter-spacing: .06em; border: 1px solid var(--c-ink); background: var(--c-paper); }
.docs__name { display: block; font-weight: 600; color: var(--c-ink); }
@media (max-width: 479.98px) { .docs__i { grid-template-columns: auto 1fr; } .docs__dl { grid-column: 1 / -1; } }
```
Состояния: default / hover / focus-visible / loading (кнопка с `is-loading`) / disabled («Скоро», `aria-disabled`, текст без ссылки) / error (файл недоступен: `.notice--error` ниже списка).

### 6.19 Ссылка-пункт «Контакты» (contact dl)
`dl` из строк «Метка (Mono) / значение»; телефон крупно (`--fs-h3`, tabular), под ним мессенджеры как `btn--contact`. Часы и адрес — из `structure.md`. Копирование реквизитов: кнопка-ссылка «Скопировать» (меняет текст на «Скопировано», `aria-live`).

### 6.20 Inline-success и пустые состояния
Тостов нет. Подтверждение всегда в потоке: `notice--ok` заменяет форму или появляется рядом с кнопкой. Пустые состояния (нет результатов фильтра): рамка dashed, H4 «Ничего не найдено», кнопка «Сбросить фильтры».

---

## 7. Образы: плейсхолдеры и иллюстрации

Фото пока нет. Система должна выглядеть цельно и «готовой», а настоящие снимки подставляться без правок вёрстки.

### 7.1 Аспекты (все контейнеры имеют фиксированный aspect-ratio, CLS = 0)

| Токен | Соотношение | Где | Размер исходника |
|---|---|---|---|
| `--ar-hero` | 4:3 | hero внутренней, блок «о компании» | 1600×1200 |
| `--ar-card` | 4:3 | model card, audience card | 1200×900 |
| `--ar-gallery` | 3:2 | главное фото модели | 1800×1200 |
| `--ar-thumb` | 1:1 | миниатюры галереи, отзывы | 400×400 |
| `--ar-wide` | 21:9 | широкая полоса между секциями | 2100×900 |
| `--ar-portrait` | 3:4 | схема модели вертикально | 900×1200 |
| `--ar-map` | 16:10 | карта-плейсхолдер | 1600×1000 |

### 7.2 Плейсхолдер фото (нейтральный, технический)

Светло-серая плоскость sunk, диагонали «пустого кадра», метки обрезки в углах, внизу Mono-подпись: что должно быть на кадре и размер. Подписи удаляются при замене.

```html
<figure class="ph ph--card crop" data-ph="4:3 · 1200×900">
  <figcaption class="ph__cap"><span class="tag dev-flag">Заглушка</span> Фото: кабина «База» на строительной площадке, вид 3/4</figcaption>
</figure>
```
```css
.ph { position: relative; margin: 0; overflow: hidden; background: var(--c-sunk); border: 1px solid var(--c-line); border-radius: var(--r-1); aspect-ratio: var(--ar, 4 / 3);
  background-image: linear-gradient(to top right, transparent calc(50% - .5px), var(--c-line) 50%, transparent calc(50% + .5px)),
                    linear-gradient(to top left,  transparent calc(50% - .5px), var(--c-line) 50%, transparent calc(50% + .5px)); }
.ph--hero { --ar: var(--ar-hero); } .ph--card { --ar: var(--ar-card); } .ph--gallery { --ar: var(--ar-gallery); }
.ph--thumb { --ar: var(--ar-thumb); } .ph--wide { --ar: var(--ar-wide); } .ph--portrait { --ar: var(--ar-portrait); }
.ph__cap { position: absolute; inset: auto 8px 8px 8px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 6px 8px; background: var(--c-paper);
  font: 400 var(--fs-label)/1.3 var(--font-mono); color: var(--c-ink-2); }
.ph > img, .ph > picture > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

/* метки обрезки: 4 уголка по 12px */
.crop { --cm: var(--c-ink);
  background-image:
    linear-gradient(var(--cm), var(--cm)), linear-gradient(var(--cm), var(--cm)),
    linear-gradient(var(--cm), var(--cm)), linear-gradient(var(--cm), var(--cm)),
    linear-gradient(var(--cm), var(--cm)), linear-gradient(var(--cm), var(--cm)),
    linear-gradient(var(--cm), var(--cm)), linear-gradient(var(--cm), var(--cm));
  background-repeat: no-repeat;
  background-size: 12px 1px, 1px 12px, 12px 1px, 1px 12px, 12px 1px, 1px 12px, 12px 1px, 1px 12px;
  background-position: 6px 6px, 6px 6px, calc(100% - 6px) 6px, calc(100% - 6px) 6px, 6px calc(100% - 6px), 6px calc(100% - 6px), calc(100% - 6px) calc(100% - 6px), calc(100% - 6px) calc(100% - 6px); }
.ph.crop { background-color: var(--c-sunk); }
```
(Для `.ph` без `.crop` используется диагональный фон; `.crop` его перекрывает, при использовании обоих держать метки внутри схемы.)

### 7.3 Правила для будущих фото
- Нейтральная цветокоррекция, без фильтров и «плёнки», без текста на снимке. Кабины на реальных объектах, не студия-инфографика.
- Кадрирование под аспекты таблицы; один объект на кадр; для гида-серии одинаковая высота горизонта.
- `<picture>` AVIF/WebP + JPEG, `srcset` 480/800/1200/1600, `sizes`, `width`/`height`, `loading="lazy"` (кроме hero: `fetchpriority="high"`), `decoding="async"`, осмысленный `alt` (что на снимке, а не «фото»).
- Люди и номера машин: только с разрешения; без лиц клиентов без согласия.
- Рамка 1px `--c-line`, радиус 2px; без теней и наложений.

### 7.4 Иллюстрации: изометрические схемы (одна линия 1.5px)

Единый язык для 5 моделей кабин, схем зон, расстановки на мероприятии, шагов обслуживания.

Правила:
1. **Проекция изометрическая 30°**; никаких перспективных сокращений.
2. **Одна толщина контура 1.5px** (`vector-effect: non-scaling-stroke`), `stroke-linejoin: miter`, `stroke-linecap: square`, цвет `--c-ink`; заливок нет.
3. **Один цветной акцент на схему**: дверь (или ключевой элемент модели: рукомойник, пандус, утепление) заливается `--c-lime`. Остальное прозрачное.
4. **Размерные линии** пунктиром (`stroke-dasharray: 3 3`), цвет `--c-ink-3`, подписи Mono 12px («2300», «1100» в мм), размер текста в SVG не меньше 12px при отображении.
5. Фон под схемой `--c-paper` или `--c-bg`, поле схемы с метками обрезки (`.crop`), сверху слева Mono-артикул (`ЭС-02`).
6. Отличия моделей: рукомойник (маленький блок сбоку), пандус и широкая дверь (доступная), утеплитель (двойная линия контура и снежинка-точки), компактная (дачная) модель ниже и уже. Названия и состав моделей берутся из `v2/structure.md`.
7. Схемы декоративные: `role="img"` + `aria-label` с описанием или `aria-hidden="true"` рядом с подписью.

Базовая схема (кабина, вид изометрический; координаты посчитаны для проекции x' = 120 + (x − y)·0.866, y' = 100 + (x + y)·0.5 − z):

```html
<svg class="illus" viewBox="0 0 240 180" role="img" aria-label="Схема кабины: вид в изометрии, дверь выделена" fill="none"
     stroke="#12171A" stroke-width="1.5" stroke-linejoin="miter" stroke-linecap="square">
  <!-- грани: верх, левая, правая -->
  <path vector-effect="non-scaling-stroke" d="M120 10 154.6 30 120 50 85.4 30Z"/>
  <path vector-effect="non-scaling-stroke" d="M85.4 30 120 50V140L85.4 120Z"/>
  <path vector-effect="non-scaling-stroke" d="M120 50 154.6 30V120L120 140Z"/>
  <!-- дверь на правой грани (единственная заливка) -->
  <path vector-effect="non-scaling-stroke" fill="#D2F03C" d="M126.9 136 147.7 124V54L126.9 66Z"/>
  <path vector-effect="non-scaling-stroke" d="M142 98v10"/>                         <!-- ручка -->
  <path vector-effect="non-scaling-stroke" d="M96 38 108 45"/>                      <!-- вентиляционная щель на левой грани -->
  <!-- размерная линия высоты -->
  <g stroke="#576066" stroke-dasharray="3 3">
    <path vector-effect="non-scaling-stroke" d="M72 31V121M68 31h8M68 121h8"/>
  </g>
  <text x="60" y="80" transform="rotate(-90 60 80)" font-family="IBM Plex Mono, monospace" font-size="12" fill="#576066" stroke="none" text-anchor="middle">2300</text>
</svg>
```
```css
.illus { display: block; width: 100%; height: auto; }
.illus--on-dark { stroke: #F4F3EE; }                 /* на тёмном: контур светлый, дверь остаётся lime */
```
Размер в контейнере: схема в карточке модели занимает `--ar-card`, по центру, с внутренним отступом 24px, фон `--c-paper`.

### 7.5 Иконки и пиктограммы
Линейные 24px, штрих 1.75px, квадратные концы, без заливки, без двухцветности; цвет `currentColor`. Набор ограничен ≈20 иконок (услуги, документы, контакты). Эмодзи не использовать.

---

## 8. Motion

Минимально и функционально: движение только объясняет изменение состояния. Анимируем `transform` и `opacity`; никаких анимаций `height`/`box-shadow`/`filter` (кроме раскрытия аккордеона по поддержке). Никаких scroll-reveal, параллакса, автопрокрутки, бегущих строк, счётчиков чисел.

| Токен | Значение | Где |
|---|---|---|
| `--dur-1` | 100мс linear | hover цвета кнопок, строк, чекбокса |
| `--dur-2` | 160мс `--ease-out` | выпадающее меню, стрелка кнопки, шеврон |
| `--dur-3` | 240мс `--ease-out` | выезд лаймовой полосы карточки, мобильное меню, sticky CTA, плюс/крест аккордеона |
| `--dur-4` | 360мс `--ease-io` | зарезервировано (смена вкладки галереи, fade фото) |

Правила:
- Появление (меню, панели): opacity 0→1 и сдвиг ≤ 8px; исчезновение быстрее появления.
- Пересчёт калькулятора: без анимации чисел, значения приглушаются на 120–200мс (`opacity: .45`).
- Спиннеры только на кнопках и в смете; 0.7с на оборот.
- Нет автозапуска анимаций при загрузке страницы; первый экран статичен.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
  .btn.is-loading::before { animation: none; border-top-color: var(--c-ink); border-style: dotted; }      /* статичный индикатор */
  .nav__panel, .m-menu, .sticky-cta { transform: none; }
}
```

---

## 9. Доступность (WCAG 2.2 AA как цель)

- **Контраст:** все текстовые пары из раздела 2.2; запрещённые из 2.3; индикаторы состояний только с вторым признаком (иконка, текст, ink-заливка).
- **Размер цели ≥ 44×44px** (кнопки 48, поля 48, пункты меню 44–56, чекбокс-строка 44, крошки 44, ссылки в футере 44); между соседними целями не менее 8px. Встроенные в абзац ссылки исключение.
- **Фокус:** кольцо 3px, ink на светлом (16.25:1) и lime на тёмном (13.99:1), всегда видимо, не скрывается `outline: none` без замены; `scroll-padding-top` учитывает sticky-шапку, чтобы фокус не уезжал под неё (2.4.11).
- **Landmarks:** `header`, `nav` (с `aria-label`: «Основная», «Хлебные крошки», «Подвал»), `main#main`, `aside` (смета, оглавление политики), `footer`. Skip-ссылка первой в DOM и видна при фокусе.
- **Заголовки:** один H1 на страницу, без пропуска уровней; визуальный размер независим от уровня (классы `.h2` и т.п.).
- **Формы:** подпись всегда `label for`, `aria-describedby` на подсказку и сообщение, `aria-invalid`, `autocomplete` (`name`, `tel`, `email`, `organization`), `inputmode`, обязательность словами, не только «*».
- **Таблицы:** `caption`, `th scope`, при стопке на мобильном явные ARIA-роли (раздел 6.9).
- **Динамика:** `aria-live="polite"` для итога калькулятора, `role="status"` для успеха, `role="alert"` для ошибки; фокус переносится на блок успеха.
- **Клавиатура:** все компоненты управляются с клавиатуры: меню (Enter/Space/Esc/Tab), вкладки (стрелки, Home/End), аккордеон (Enter/Space), stepper (стрелки вверх/вниз меняют значение), segmented (стрелки).
- **Масштаб:** без потери функций при 200% и 400% (reflow на 320 CSS px); `rem`-размеры; не блокировать zoom (`user-scalable` не отключать); межстрочный интервал и текст-spacing переопределяются без поломок (`min-height`, не `height`).
- **Цвет и режимы:** `forced-colors`: границы и фокус сохраняются (`outline`, `border` вместо теней и фона); `@media (forced-colors: active) { .btn { border: 2px solid ButtonText; } .mark { background: Mark; color: MarkText; } }`.
- **Язык и числа:** `lang="ru"`, `abbr` для ИНН/ОГРН при первом упоминании; номера телефонов `tel:`, `aria-label` не переписывать.
- **Изображения:** `alt` по содержанию; схемы декоративные `aria-hidden` (если рядом есть текстовое описание) или `role="img"` с подписью.
- **Без таймеров, автопрокрутки, мигания;** никаких попапов, перехватывающих фокус на первом экране.

---

## 10. Производительность

- Шрифты self-host woff2, `font-display: swap`, preload одного файла (Sans cyrillic); latin-ext для `₽` урезать до одного глифа.
- CSS: один файл ≤ 40 КБ без сжатия (токены + компоненты); критический CSS hero инлайном.
- JS по необходимости: меню, вкладки, калькулятор, sticky CTA (IntersectionObserver), валидация. Без фреймворков; общий размер ≤ 30 КБ.
- Изображения: AVIF/WebP, lazy, фиксированный aspect-ratio. Схемы SVG инлайном (≤ 4 КБ каждая) или спрайтом.
- Карты подключаются по клику/при видимости блока (`IntersectionObserver`), с плейсхолдером из 6.9.

---

## 11. Do / Don't

**Do**
1. Держать один акцент: лайм только на главной кнопке, `.mark`, итоге сметы, лого-знаке, выбранном шаге.
2. Ставить графитовый текст на лайме, лаймовый текст только на графите.
3. Показывать цены и числа в таблицах по правому краю, в одном формате, с неразрывными пробелами.
4. Давать каждой секции индекс и hairline; выстраивать всё по 12 колонкам.
5. Рисовать стрелки, галочки и плюсы SVG-масками (в Plex их нет).
6. Показывать успех и ошибку в потоке страницы: иконка + текст + `role`.
7. Использовать схемы-изометрии в одну линию и плейсхолдеры с аспектом, пока нет фото.
8. Применять на мобильном стопку из карточек для таблиц, а не горизонтальный скролл.
9. Помечать заглушки `.dev-flag` и удалять при запуске.
10. Давать sticky CTA только после ухода hero с экрана.
11. Писать в формулировках прямо: срок, цена, документ, условие.

**Don't**
1. Не красить лаймом текст, границы полей и индикаторы активной вкладки на светлом (1.29:1).
2. Не добавлять второй акцентный цвет, эко-зелёный и «водяной» синий (синий только в статусе info).
3. Не использовать скругления-«таблетки», твёрдые тени, стикеры, волны, градиенты (это язык v1).
4. Не ставить попапы, модалки, чат-виджеты, баннеры скидок над первым экраном; не открывать меню без действия пользователя.
5. Не набирать `→`, `✓`, `≤` символами из текста (нет в шрифте; подставится системный глиф).
6. Не использовать более двух шрифтовых семейств и более 4 весов Sans (400/500/600, 700 в резерве).
7. Не писать длинные абзацы в Mono и не набирать заголовки в Mono.
8. Не выдумывать клиентов, логотипы, цифры, отзывы, цены; чужие логотипы и тексты не копировать.
9. Не использовать бегущие строки, карусели с автопрокруткой, счётчики-анимации и scroll-reveal.
10. Не делать форму disabled-кнопкой «до валидности» (причина должна быть видна).
11. Не показывать цены зачёркнутыми «скидками»: скидка отдельной строкой сметы со знаком «−».
12. Не размещать на тёмном ink-3, ink-2, lime-deep (контраст 1.66–2.81); на тёмном только white, mute-on-dark, lime.

---

## 12. Чем v2 отличается от v1

| | v1 «Сирень и мандарин» | v2 «Графит и сигнальный лайм» |
|---|---|---|
| Формат | одностраничник | многостраничный сайт, 16 шаблонов, шапка с меню, крошки, футер |
| Характер | игривый, DTC-упаковка | деловой, паспорт оборудования, чертёж |
| Акцент | фиолетовый + мандарин + розовый/жёлтый для аудиторий | один лайм `#D2F03C` на графите; аудитории различаются текстом и индексами, не цветом |
| Фон | сливочный `#FFF6E6` | тёплый бумажный `#F4F3EE` + белый + графит |
| Шрифты | Unbounded + Onest | IBM Plex Sans + IBM Plex Mono (данные) |
| Форма | «дверца» 28/6px, пилюли | радиус 2px, острые рамки 1px |
| Глубина | твёрдые тени, контуры 2px | без теней (кроме выпадающего меню), hairline-линии |
| Сигнатура | волны, стикеры, штампы | маркер-подсветка, метки обрезки, индексы, шильдики, изометрические схемы |
| Данные | карточки, калькулятор в hero | таблицы цен, сравнение, зоны, спецификации, документы, смета-«табличка» |
| Тон | с юмором | сухой, точный, без шуток |
| Общее (унаследовано) | токены через `:root` и алиасы, контрасты по WCAG, фокус-кольцо, `prefers-reduced-motion`, mobile-first, без попапов над первым экраном, `.on-dark`-контекст, Do/Don't | |

---

## 13. Порядок внедрения (для вёрстки)
1. `:root`-токены, `@font-face`, reset, типографика, `.container`/`.grid`.
2. Каркас: шапка (top bar, nav, mobile menu), футер, крошки, skip-link, sticky CTA.
3. Кнопки, поля, stepper, segmented, checkbox, валидация.
4. Таблицы (spec, price, compare, zone) со стопкой на 360.
5. Карточки (model, audience, service, review), stats, steps, trust.
6. Калькулятор + смета; FAQ/tabs; doc list; notice.
7. Плейсхолдеры и SVG-схемы 5 моделей; финальный проход: контраст, фокус, 360/768/1024/1440, клавиатура, `prefers-reduced-motion`, печать политики.

// Шаблоны страниц. Каждый возвращает HTML содержимого <main>. Тексты берутся из structure.md, числа из content.js.
import { ctx, esc, u, a, btn, tel, ic, illus, apx, section, table, specTable, kvTable, priceTable, priceNote, modelCard, steps, processSteps,
  faqBlock, faqItem, reviewCard, reviewsBlock, form, ctaBlock, calc, checkList, dev, devTag, rub, NB } from './lib.mjs';

const S = () => ctx.S;
const mark = (h, w) => (w ? h.replace(w, `<span class="mark">${w}</span>`) : h);

function crumbs(page) {
  const items = [['/', 'Главная']].concat(page.crumbs || [], [[null, page.label]]);
  return `<nav class="crumbs" aria-label="Хлебные крошки"><ol>${items.map(([h, t]) => `<li>${h ? a(h, esc(t)) : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>`;
}
export const crumbItems = (page) => [['/', 'Главная']].concat(page.crumbs || [], [[null, page.label]]);

function facts(rows) {
  return `<dl class="hero__facts"><dt class="label hero__facts-h">Ключевые условия</dt>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
}
function heroInner(page, { eyebrow, lead, actions = '', side = '', note = '', markWord, dark = false, noCrumbs = false }) {
  return `<header class="hero hero--inner${dark ? ' on-dark' : ''}" data-hero><div class="container">${noCrumbs ? '' : crumbs(page)}<div class="grid hero__grid"><div class="hero__main lg-8"><p class="label hero__eyebrow">${eyebrow}</p><h1>${mark(esc(page.h1), markWord)}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}${actions ? `<div class="hero__actions">${actions}</div>` : ''}${note ? `<p class="small note">${note}</p>` : ''}</div>${side ? `<div class="hero__side lg-4">${side}</div>` : ''}</div></div></header>`;
}
const stdFacts = () => facts([['Срок аренды', 'от ' + S().terms.minDays + NB + 'суток'], ['Документы', 'договор, счёт, акты'], ['Оплата', 'по условиям заказа']]);
const reqBtn = (t = 'Получить расчёт') => btn('#zayavka', t, 'primary');
const calcBtn = (t, href = '#calc') => btn(href, t, 'outline').replace('btn btn--outline', 'btn btn--outline btn--arrow');

function audCards() {
  return `<div class="grid grid--3">${S().audiences.map((x, i) => `<article class="aud-card"><span class="label">${String(i + 1).padStart(2, '0')}</span><h3>${x.title}</h3><p>${x.text}</p><p>${a('/' + x.slug + '/', x.cta, 'btn btn--link stretched')}</p></article>`).join('')}</div>`;
}
function zonesTable() {
  const Z = S().zones, D = S().rates.delivery;
  const price = [rub(D.cityPerTrip), rub(D.nearPerTrip), `${rub(D.nearPerTrip)} + ${rub(D.perKmOver)} за${NB}км сверх${NB}${D.nearKm}`];
  return table({ caption: 'Зоны доставки и цена за рейс', cls: 'tbl--zone',
    head: ['Зона', 'Цена за рейс (туда и обратно)', 'Ориентир по срокам'],
    rows: Z.map((z, i) => [`<span class="zone-chip zone-${z.chip.toLowerCase()}">${z.chip}</span> ${esc(z.name)}${z.towns.length ? `<br><span class="small">${z.towns.join(', ')} и др.</span>` : ''}`, price[i], esc(z.term)]) });
}
function mapPh(label) {
  const Z = S().zones;
  return `<div class="map-ph" role="img" aria-label="${esc(label)}"><span class="map-ph__pin"></span><span class="zone-chip zone-a map-ph__z1">${Z[0].chip}</span><span class="zone-chip zone-b map-ph__z2">${Z[1].chip}</span><span class="zone-chip zone-c map-ph__z3">${Z[2].chip}</span>${ctx.production ? '' : '<span class="map-ph__cap">Заглушка: карта подключается позже, Яндекс.Карты</span>'}</div>`;
}
function docsList() {
  return `<ul class="docs">${S().documents.map((d) => `<li class="docs__i"><span class="docs__ext" aria-hidden="true">${d.ext}</span><div class="docs__main"><span class="docs__name">${esc(d.name)}</span><span class="small mono">${d.file ? d.ext + ' · ' + d.size : d.ext + ' · по запросу'}</span></div>${d.file ? `<a class="btn btn--outline btn--sm docs__dl" href="${u(d.file)}" download>Скачать</a>` : `<span class="btn btn--outline btn--sm docs__dl" aria-disabled="true">Скоро</span>`}</li>`).join('')}</ul>`;
}
const homeFaqIds = () => S().faq.groups.flatMap((g) => g.items).filter((i) => i.home).map((i) => i.id);
const groupIds = (id) => S().faqGroup(id).items.map((i) => i.id);

/* =============== ШАБЛОНЫ =============== */
export const templates = {

  home(page) {
    const s = S(), C = s.contacts;
    const hero = `<header class="hero hero--home guides" data-hero><div class="container"><div class="grid hero__grid"><div class="hero__main lg-7"><p class="label hero__eyebrow">Аренда и продажа · Новосибирск</p>
<h1 class="display">${mark(esc(page.h1), 'биотуалетов')}</h1>
<p class="lead">Доставляем, устанавливаем, обслуживаем по графику и забираем. Для частных клиентов и организаций.</p>
<div class="hero__form">${form({ mode: 'short', heading: 'Получить расчёт', cls: 'form--hero' })}<p class="more">${btn('/ceny/', 'Или посчитайте самостоятельно', 'link')}</p></div></div>
<div class="hero__side lg-5"><figure class="ph ph--hero crop hero__ph">${illus('standart', 'Туалетная кабина: схема в изометрии, дверь выделена')}${ctx.production ? '' : `<figcaption class="ph__cap">${devTag('Фото кабины на объекте, 4:3')}</figcaption>`}</figure></div></div></div>
<dl class="stats">${s.stats.map((x) => `<div><dt class="small">${esc(x.label)}</dt><dd class="stat">${esc(x.value)}</dd></div>`).join('')}</dl></header>`;
    const m = [];
    m.push(section({ id: 'zadachi', title: 'Выберите свою задачу', tag: 'Для кого' }, audCards()));
    m.push(section({ id: 'modeli', title: 'Модели в аренде', tag: 'Каталог', paper: true, lead: 'Четыре типа кабин. Все проходят мойку и дезинфекцию перед выдачей.' },
      `<div class="grid grid--cards cards-4">${s.models.filter((x) => x.kind === 'rent').map((x) => modelCard(x)).join('')}</div>
<p class="more">${btn('/katalog/', 'Смотреть каталог', 'primary')} <span class="inline-note">Торфяной туалет для дачи: ${a('/katalog/torfyanoj/', 'в продаже')}</span></p>${priceNote()}`));
    m.push(section({ id: 'calc', title: 'Предварительный расчёт стоимости', tag: 'Калькулятор', lead: 'Укажите параметры, получите ориентир. Итоговую стоимость назовём до оплаты.' },
      calc('compact')));
    m.push(section({ id: 'poryadok', title: 'Как мы работаем', tag: 'Порядок', paper: true }, processSteps() + `<p class="more">${btn('/obsluzhivanie/', 'Подробнее об обслуживании', 'link')}</p>`));
    m.push(section({ id: 'usloviya', title: 'Что важно знать до заказа', tag: 'Условия' },
      `<div class="grid grid--4">
<article class="svc-card"><h3 class="h4">Стоимость</h3><p>Складывается из аренды, обслуживания и доставки. Цены и формула расчёта открыты.</p>${btn('/ceny/', 'Цены на аренду', 'link')}</article>
<article class="svc-card"><h3 class="h4">Документы</h3><p>Договор и закрывающие документы для организаций. Образец договора по запросу.</p>${btn('/organizaciyam/#dogovor', 'Договор и документы', 'link')}</article>
<article class="svc-card"><h3 class="h4">Обслуживание</h3><p>Периодичность определяем по нагрузке. Зимой используем утеплённые кабины и незамерзающие составы.</p>${btn('/obsluzhivanie/', 'Что входит в обслуживание', 'link')}</article>
<article class="svc-card"><h3 class="h4">Ответственность</h3><p>Условия при повреждении кабины прописаны в договоре и согласуются заранее.</p>${btn('/voprosy/#q-damage', 'Что при повреждении', 'link')}</article></div>`));
    m.push(section({ id: 'zony', title: 'Новосибирск и область', tag: 'Доставка', paper: true }, zonesTable() + `<p class="more">${btn('/dostavka/', 'Подробнее о зонах и сроках', 'link')}</p>`));
    m.push(reviewsBlock(s.reviews.filter((r) => r.featuredOnHome).map((r) => r.id), { link: true, id: 'otzyvy-home' }));
    m.push(faqBlock(homeFaqIds(), { paper: true }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  arenda(page) {
    const s = S(), rent = s.models.filter((x) => x.kind === 'rent');
    const hero = heroInner(page, { eyebrow: 'Аренда', side: stdFacts(),
      lead: `Мы сдаём в аренду туалетные кабины для строек, мероприятий, дач и производственных площадок. В стоимость аренды входит подготовка кабины. Доставка, обслуживание и вывоз рассчитываются отдельно. Минимальный срок аренды: ${s.terms.minDays} сутки.`,
      actions: reqBtn() + btn('/ceny/', 'Рассчитать самостоятельно', 'outline').replace('btn btn--outline', 'btn btn--outline btn--arrow') });
    const m = [];
    m.push(section({ id: 'zadachi', title: 'Аренда для вашей задачи', tag: 'Для кого' }, audCards()));
    m.push(section({ id: 'modeli', title: 'Модели для аренды', tag: 'Модели', paper: true },
      table({ caption: 'Сравнение моделей для аренды', head: ['Модель', 'Для чего подходит', 'Особенность', `Цена за сутки при сроке ${s.tierLabel(s.rates.rentPerDay[1]).replace(' суток', '')}${NB}суток`],
        rows: rent.map((x) => [a('/katalog/' + x.slug + '/', esc(x.name)), esc({ standart: 'Стройка, дача, мероприятие', 's-rukomojnikom': 'Мероприятия, места с повышенными требованиями к гигиене', 'dlya-malomobilnyh': 'Публичные мероприятия, объекты с доступной средой', uteplennaya: 'Холодный сезон, длительная аренда зимой' }[x.id]), esc(x.short), rub(s.modelRate(x, 1))]), numFrom: 3 })
      + `<p class="small note">Цены вычисляются из ставок на странице ${a('/ceny/#stavki', 'цен')}.</p>`));
    m.push(section({ id: 'cena', title: 'Как формируется цена', tag: 'Цена' },
      `<div class="grid grid--3"><article class="svc-card"><span class="svc-card__ico">${ic('calendar')}</span><h3 class="h4">Аренда</h3><p>Ставка за кабину в сутки. Чем дольше срок, тем ниже ставка за сутки.</p></article>
<article class="svc-card"><span class="svc-card__ico">${ic('tools')}</span><h3 class="h4">Обслуживание</h3><p>Откачка, мойка, заправка, расходники. Цена визита за кабину, количество визитов зависит от графика.</p></article>
<article class="svc-card"><span class="svc-card__ico">${ic('truck')}</span><h3 class="h4">Доставка и вывоз</h3><p>Цена за рейс. Один рейс: до ${s.rates.delivery.cabinsPerTrip} кабин. Цена зависит от расстояния.</p></article></div>
<p class="more">${btn('/ceny/', 'Таблицы ставок и калькулятор', 'link')}</p>`));
    m.push(section({ id: 'usloviya', title: 'Условия', tag: 'Условия', paper: true },
      kvTable('Условия аренды', ['Параметр', 'Условие'], [
        ['Минимальный срок', s.terms.minDays + ' сутки'],
        ['Оплата для частных лиц', `Предоплата ${s.terms.prepayPct}%, остаток по факту доставки`],
        ['Оплата для организаций', 'По договору: предоплата или постоплата'],
        ['Документы', 'Организациям: договор, счёт, акты. Частным лицам: счёт или подтверждение в мессенджере'],
        ['Установка', 'На ровную площадку, место указывает клиент'],
        ['Ответственность', 'При повреждении или сверхнормативном загрязнении ущерб оценивается по акту и согласуется с клиентом'],
        ['Залог', `Для мероприятий возможен залог, ${rub(s.terms.depositPerCabin)} за кабину`]]) + (ctx.production ? '' : '<p class="small note"><span class="tag dev-flag">Заглушка</span> Условия подтвердить с клиентом.</p>')));
    m.push(section({ id: 'poryadok', title: 'Как мы работаем', tag: 'Порядок' }, processSteps()));
    m.push(faqBlock(groupIds('zakaz'), { paper: true }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  chastnym(page) {
    const s = S();
    const hero = heroInner(page, { eyebrow: 'Аренда · Частным лицам', side: stdFacts(),
      lead: 'Аренда от 1 суток. Привозим, ставим на указанное место, при необходимости обслуживаем и забираем. Оплата картой или переводом.',
      actions: reqBtn() + btn('#calc', 'Рассчитать самостоятельно', 'outline').replace('btn btn--outline', 'btn btn--outline btn--arrow') });
    const m = [];
    m.push(section({ id: 'sluchai', title: 'Для каких задач берут кабину', tag: 'Задачи' },
      `<div class="grid grid--3"><article class="svc-card"><h3 class="h4">Строительство дома</h3><p>Рабочим нужен туалет, пока нет воды и канализации. Обычно аренда на 1–6 месяцев, обслуживание раз в неделю.</p><p class="small">Рекомендуем: ${a('/katalog/standart/', 'стандартная')} или ${a('/katalog/uteplennaya/', 'утеплённая')} кабина.</p></article>
<article class="svc-card"><h3 class="h4">Праздник на участке</h3><p>Свадьба, юбилей, семейное событие. Для 40–60 гостей хватает 1–2 кабин; одна из них с рукомойником.</p><p class="small">Количество кабин считаем на странице ${a('/meropriyatiya/#raschet', 'для мероприятий')}.</p></article>
<article class="svc-card"><h3 class="h4">Дача</h3><p>Временное решение на сезон или период ремонта. Для постоянного использования подойдёт торфяной туалет.</p><p class="small">${a('/katalog/torfyanoj/', 'Торфяной туалет для дачи')}</p></article></div>`));
    m.push(section({ id: 'vhodit', title: 'Что вы получаете', tag: 'Состав', paper: true },
      checkList(['Чистую кабину: мойка и дезинфекция перед выдачей', 'Доставку и установку на указанное место', 'Обслуживание по выбранной частоте (по желанию)', 'Вывоз после окончания срока', 'Понятный расчёт: аренда, обслуживание и доставка указаны отдельными строками'])));
    m.push(section({ id: 'calc', title: 'Рассчитайте стоимость', tag: 'Калькулятор' }, calc('compact', { n: 1, d: 3, u: 'none', z: 'city', km: 0 })));
    m.push(section({ id: 'oformlenie', title: 'Порядок оформления', tag: 'Порядок', paper: true },
      steps([{ t: 'Заявка', text: 'Оставляете заявку или звоните.' }, { t: 'Стоимость и место', text: 'Называем стоимость и согласуем дату, время и место установки.' }, { t: 'Предоплата', text: `Вносите предоплату (${s.terms.prepayPct}%).` }, { t: 'Доставка', text: 'Привозим кабину. Остаток оплачивается по факту доставки.' }])
      + `<p class="small note">Договор на 20 страниц не нужен: условия фиксируем в счёте и подтверждении заказа.${ctx.production ? '' : ' <span class="tag dev-flag">Заглушка: согласовать с юристом</span>'}</p>`));
    m.push(section({ id: 'mesto', title: 'Как подготовить место', tag: 'Памятка' },
      `<div class="grid"><div class="lg-6">${checkList(['Ровная площадка', 'Подъезд для машины', 'Расстояние от жилых построек', 'Доступ в день доставки'])}</div><div class="lg-6"><p>Мы позвоним за ${s.terms.callBefore} до приезда. Вам не обязательно находиться на месте, если вы заранее указали, где ставить кабину.</p></div></div>`));
    m.push(reviewsBlock(['anna', 'sergey'], { paper: true, id: 'otzyvy-blok' }));
    m.push(faqBlock(['prepay', 'speed', 'presence', 'buy-cabin']));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  organizaciyam(page) {
    const s = S();
    const hero = heroInner(page, { eyebrow: 'Аренда · Организациям', dark: true, side: stdFacts(),
      lead: 'Договор, обслуживание по графику, закрывающие документы по итогам периода.',
      actions: reqBtn('Запросить коммерческое предложение') + btn('#calc', 'Рассчитать стоимость', 'outline').replace('btn btn--outline', 'btn btn--outline btn--arrow'),
      note: `Коммерческое предложение направляем ${s.terms.kpTerm}.` });
    const m = [];
    m.push(section({ id: 'zadachi', title: 'Для каких объектов', tag: 'Объекты' },
      `<div class="grid grid--3"><article class="svc-card" id="stroyka"><h3 class="h4">Стройплощадки</h3><p>Кабины на срок от месяца. Периодичность обслуживания закрепляем в договоре.</p><p class="small">Ориентир: 1 кабина на ${s.terms.workersPerCabin} рабочих.</p></article>
<article class="svc-card" id="proizvodstvo"><h3 class="h4">Производства, склады, парковки</h3><p>Постоянные кабины с обслуживанием по графику и отчётом о выполненных работах.</p></article>
<article class="svc-card" id="meropriyatiya-org"><h3 class="h4">Мероприятия</h3><p>Разовая аренда и монтаж к определённому времени.</p><p>${btn('/meropriyatiya/', 'Для мероприятий', 'link')}</p></article></div>`));
    m.push(section({ id: 'dogovor', title: 'Договор и документы', tag: 'Документы', paper: true },
      `<div class="grid"><div class="lg-7">${table({ caption: 'Документы по этапам работы', head: ['Этап', 'Документ'], rows: [
        ['До начала работ', `Договор аренды или оказания услуг. Подготовка: ${s.terms.contractPrep}`], ['Оплата', 'Счёт на оплату'], ['После периода обслуживания', 'Акт выполненных работ, закрывающие документы'], ['По запросу', 'Электронный документооборот (ЭДО)']] })}</div>
<div class="lg-5"><h3 class="h4">Образец договора</h3><p class="small">Образец договора по запросу.</p>${docsList()}<p class="more">${reqBtn('Запросить коммерческое предложение')}</p></div></div>`));
    m.push(section({ id: 'grafik', title: 'Обслуживание по графику', tag: 'График' },
      `<p>Периодичность зависит от числа пользователей. Для стройки обычно 1–2 визита в неделю. График фиксируется в договоре. После визита отправляем отчёт в мессенджер или на почту.</p><p class="more">${btn('/obsluzhivanie/', 'Что входит в визит', 'link')}</p>`));
    m.push(section({ id: 'raschety', title: 'Порядок расчётов', tag: 'Оплата', paper: true }, checkList(['Предоплата или постоплата по договору', 'Оплата по счёту', 'Для постоянных клиентов условия обсуждаются индивидуально'])));
    m.push(section({ id: 'calc', title: 'Предварительный расчёт', tag: 'Калькулятор' }, calc('compact', { n: 2, d: 30, u: 'weekly', z: 'city', km: 0 })));
    m.push(reviewsBlock(['stroygrad', 'beg', 'ip-andrey'], { paper: true, id: 'otzyvy-blok', title: 'Отзывы организаций' }));
    m.push(faqBlock(groupIds('organizacii'), { title: 'Вопросы организаций' }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  meropriyatiya(page) {
    const s = S(), E = s.eventRules, G = E.guestsPerCabin;
    const hero = heroInner(page, { eyebrow: 'Аренда · Для мероприятий', lead: 'Рассчитаем, сколько кабин нужно, доставим и установим к началу. После мероприятия заберём.',
      actions: reqBtn() + btn('#raschet', 'Рассчитать количество кабин', 'outline').replace('btn btn--outline', 'btn btn--outline btn--arrow') });
    const m = [];
    m.push(section({ id: 'tipy', title: 'Какие мероприятия обслуживаем', tag: 'Типы' }, `<ul class="event-types">${s.eventTypes.map((t) => `<li><b>${t.title}</b><span>${t.hint}</span></li>`).join('')}</ul>${ctx.production ? '' : '<p class="small note"><span class="tag dev-flag">Заглушка</span> Ориентиры подтвердить с клиентом.</p>'}`));
    const dur = E.durations.map((d, i) => `<input type="radio" name="evdur" id="evdur-${i}" value="${d.id}"${d.id === 'to8h' ? ' checked' : ''}><label for="evdur-${i}">${d.label}</label>`).join('');
    const defEv = ctx.CALC.events(s, { guests: 100, dur: 'to8h', alcohol: false });
    m.push(section({ id: 'raschet', title: 'Сколько кабин нужно', tag: 'Расчёт', paper: true },
      `<div class="evcalc js-only" data-evcalc><div class="evcalc__grid"><div class="evcalc__fields">
<div class="field" data-state="default"><label class="field__label" for="ev-guests">Количество гостей</label><input class="input" id="ev-guests" type="text" inputmode="numeric" value="100" data-ev="guests" aria-describedby="ev-guests-msg"><p class="field__msg" id="ev-guests-msg"></p></div>
<fieldset class="seg"><legend class="field__label">Длительность</legend><div class="seg__row">${dur}</div></fieldset>
<label class="check"><input type="checkbox" id="ev-alc" data-ev="alcohol"><span class="check__box" aria-hidden="true"></span><span class="check__t">Подаётся алкоголь</span></label></div>
<aside class="quote on-dark" aria-label="Результат"><h3 class="quote__h">Рекомендуем</h3><p class="quote__ev" data-ev-result aria-live="polite">${defEv.text}</p>
<a class="btn btn--primary btn--block" data-ev-link href="${u('/ceny/?n=' + defEv.total + '#calc')}">Перенести в калькулятор стоимости</a></aside></div>
<p class="small note">Для стройки ориентир: 1 кабина на ${s.terms.workersPerCabin} рабочих. Расчёт ориентировочный. Для мероприятий от ${E.accessibleFromGuests} человек рекомендуем согласовать схему расстановки с нашим менеджером.</p></div>
<noscript><div class="notice notice--info"><span class="notice__ico i i--alert" aria-hidden="true"></span><p>Расчёт работает при включённом JavaScript. Правило указано в таблице ниже, или позвоните: ${tel()}.</p></div></noscript>`));
    m.push(section({ id: 'normy', title: 'Нормы', tag: 'Нормы' },
      `<div class="grid"><div class="lg-6">${table({ caption: 'Сколько гостей приходится на одну кабину', head: ['Длительность', 'Гостей на 1 кабину'], rows: [['До 4 часов', G.to4h], ['4–8 часов', G.to8h], ['Более 8 часов', G.over8h]], numFrom: 1 })}</div>
<div class="lg-6"><p>При подаче алкоголя количество кабин увеличиваем на треть. От ${E.accessibleFromGuests} гостей добавляем одну кабину для маломобильных посетителей: ${a('/katalog/dlya-malomobilnyh/', 'кабина для маломобильных')}. Каждая ${E.handwashShare}-я кабина: ${a('/katalog/s-rukomojnikom/', 'с рукомойником')}.</p></div></div>`));
    m.push(section({ id: 'logistika', title: 'Как организуем доставку и монтаж', tag: 'Логистика', paper: true },
      `<ol class="num-list"><li>Заявка не позднее чем за ${s.terms.eventLead} до мероприятия. Для крупных событий раньше.</li><li>Согласовываем схему расстановки, подъезд и время монтажа.</li><li>Устанавливаем кабины до начала мероприятия, время согласуем в заявке.</li><li>При длительных мероприятиях проводим обслуживание в течение события.</li><li>После окончания забираем кабины и подтверждаем завершение работ.</li></ol><p class="more">${btn('/organizaciyam/', 'Для организаторов: договор, счёт, акты', 'link')}</p>`));
    m.push(section({ id: 'zakazchik', title: 'Что нужно от заказчика', tag: 'Заказчик' }, checkList(['Адрес и план площадки', 'Даты и время начала', 'Подъезд для машины', 'Контакт ответственного на площадке'])));
    m.push(reviewsBlock(['beg', 'ip-andrey'], { paper: true, id: 'otzyvy-blok', title: 'Отзывы организаторов' }));
    m.push(faqBlock(groupIds('meropriyatiya'), { title: 'Вопросы о мероприятиях' }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  katalog(page) {
    const s = S();
    const hero = heroInner(page, { eyebrow: 'Каталог', lead: 'Четыре модели сдаём в аренду, торфяной туалет продаём. Выберите по задаче или сравните характеристики в таблице.' });
    const chips = [['all', 'Все'], ['rent', 'Аренда'], ['sale', 'Продажа'], ['winter', 'Для зимы'], ['event', 'Для мероприятий'], ['build', 'Для стройки']];
    const m = [];
    m.push(section({ id: 'spisok', title: 'Модели', tag: 'Каталог' },
      `<div class="chips js-only" role="group" aria-label="Фильтр по назначению">${chips.map(([k, t], i) => `<button class="chip" type="button" data-filter="${k}" aria-pressed="${i === 0}">${t}</button>`).join('')}</div>
<p class="small" data-filter-status aria-live="polite" hidden></p>
<div class="grid grid--cards cards-3" data-filter-list>${s.models.map((x) => modelCard(x, { cta: true })).join('')}</div>
<div class="notice notice--info" data-filter-empty hidden><span class="notice__ico i i--alert" aria-hidden="true"></span><div><p class="notice__t">Ничего не найдено</p><p><button class="btn btn--link" type="button" data-filter-reset>Сбросить фильтры</button></p></div></div>${priceNote()}`));
    const cols = s.models;
    const row = (label, f) => [label].concat(cols.map(f));
    m.push(section({ id: 'sravnenie', title: 'Сравнение моделей', tag: 'Таблица', paper: true },
      `<div class="tbl-wrap">` + table({ caption: 'Сравнение моделей', cls: 'tbl--cmp', stack: true,
        head: ['Параметр'].concat(cols.map((x) => esc(x.name.replace(' для маломобильных посетителей', ' для маломобильных')))),
        rows: [row('Объём бака', (x) => esc(x.cmp.tank)), row('Размер', (x) => esc(x.cmp.size)), row('Вес', (x) => esc(x.cmp.weight)), row('Рабочие условия', (x) => esc(x.cmp.conditions)), row('Комплектация', (x) => esc(x.cmp.kit)),
          row('Цена аренды в сутки (4–14 суток)', (x) => (x.kind === 'rent' ? rub(s.modelRate(x, 1)) : 'не сдаётся')),
          row('Продажа', (x) => (x.kind === 'sale' ? rub(s.terms.peatPrice) : esc(x.id === 'standart' ? 'по запросу, от ' + rub(s.terms.cabinSaleFrom) : 'по запросу')))] }) + `</div>`));
    m.push(section({ id: 'pomosh', title: 'Не уверены в выборе', tag: 'Помощь' },
      `<div class="notice notice--key"><span class="notice__ico i i--check" aria-hidden="true"></span><div><p>Позвоните или напишите. Подберём модель по задаче, сроку и количеству людей.</p><p class="hero__actions">${a(s.contacts.phoneHref, ic('phone') + ' Позвонить', 'btn btn--outline btn--sm', '')}${a(s.contacts.telegramUrl, ic('telegram') + ' Написать в Telegram', 'btn btn--outline btn--sm', 'rel="noopener"')}</p></div></div>
<p class="more">${btn('/ceny/', 'Цены и калькулятор', 'link')} ${btn('/prodazha/', 'Условия покупки', 'link')} ${btn('/meropriyatiya/', 'Сколько кабин на мероприятие', 'link')}</p>`));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  model(page) {
    const s = S(), m = s.modelById(page.model), rent = m.kind === 'rent';
    const hero = `<header class="hero hero--inner hero--model" data-hero><div class="container">${crumbs(page)}<div class="grid hero__grid"><div class="lg-7 gallery" data-gallery>
<figure class="ph ph--gallery crop gallery__main" data-slide>${illus(m.slug, m.name + ': схема в изометрии')}<span class="label gallery__sku">${m.sku}</span></figure>
<figure class="ph ph--gallery crop" data-slide hidden><figcaption class="ph__cap">${ctx.production ? 'Фото 2' : devTag('Фото 2: кабина на объекте, 3:2')}</figcaption></figure>
<figure class="ph ph--gallery crop" data-slide hidden><figcaption class="ph__cap">${ctx.production ? 'Фото 3' : devTag('Фото 3: детали, 3:2')}</figcaption></figure>
<div class="gallery__thumbs js-only">${[1, 2, 3].map((n) => `<button class="gallery__t" type="button" data-thumb="${n - 1}" aria-pressed="${n === 1}" aria-label="Показать вид ${n}: ${n === 1 ? 'схема' : 'фото'}">${n === 1 ? illus(m.slug, '') .replace('role="img" aria-label=""', 'aria-hidden="true"') : '<span class="label">Фото ' + n + '</span>'}</button>`).join('')}</div></div>
<div class="lg-5 buy"><p class="label hero__eyebrow">${m.sku} · ${rent ? 'Аренда' : 'Продажа'}</p><h1>${esc(page.h1)}</h1><p class="lead">${esc(m.purpose)}</p>
${rent ? `<p class="buy__price"><span class="price"><small>от${NB}</small>${rub(s.modelFromPrice(m))}<small>${NB}в сутки</small></span><span class="small note">при аренде от ${s.rates.rentPerDay[3].from}${NB}суток</span></p>`
 : `<p class="buy__price"><span class="price">${rub(s.terms.peatPrice)}</span><span class="small note">Торф, мешок ${s.terms.peatBagLitres}${NB}л: ${rub(s.terms.peatBagPrice)}</span></p>`}
<div class="hero__actions">${rent ? reqBtn() + btn('/ceny/?m=' + m.slug + '#calc', 'Рассчитать самостоятельно', 'outline').replace('btn btn--outline', 'btn btn--outline btn--arrow') : btn('#kupit', 'Купить', 'primary')}</div>
${m.note ? `<p class="small note">${esc(m.note)}${ctx.production ? '' : ' <span class="tag dev-flag">Заглушка</span>'}</p>` : ''}</div></div></div></header>`;
    const body = [];
    const specs = specTable('Характеристики модели ' + m.sku, m.specs);
    const uses = checkList(m.useCases.map((x) => esc(x.charAt(0).toUpperCase() + x.slice(1))));
    const incl = rent
      ? `<div class="grid"><div class="lg-6"><h3 class="h4">Входит в аренду</h3>${checkList(s.rentIncludes.included)}</div><div class="lg-6"><h3 class="h4">Рассчитывается отдельно</h3>${checkList(s.rentIncludes.extra, 'checks checks--plus')}</div></div>${m.clientNeeds ? `<p class="notice notice--key"><span class="notice__ico i i--alert" aria-hidden="true"></span><span><b>Что нужно от клиента.</b> ${esc(m.clientNeeds)}</span></p>` : ''}`
      : `<ol class="num-list">${m.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol><p>Торф для засыпки можно купить вместе с туалетом: укажите это в заявке.</p>`;
    const deliv = `<p>Доставка по Новосибирску и области, один рейс до ${s.rates.delivery.cabinsPerTrip} кабин. Цена зависит от расстояния.</p><p>${btn('/dostavka/', 'Зона доставки и цены', 'link')}</p>`;
    body.push(section({ id: 'harakteristiki', title: 'Характеристики', tag: 'Паспорт' },
      `<div class="tabs-wrap" data-tabs><div data-tab-panel data-tab-title="Характеристики" id="tab-spec"><h3 class="tab-h h4">Характеристики</h3>${specs}</div>
<div data-tab-panel data-tab-title="${rent ? 'Что входит' : 'Как это работает'}" id="tab-incl"><h3 class="tab-h h4">${rent ? 'Что входит' : 'Как это работает'}</h3>${incl}</div>
<div data-tab-panel data-tab-title="Доставка" id="tab-delivery"><h3 class="tab-h h4">Доставка</h3>${deliv}</div></div>`));
    body.push(section({ id: 'zadachi', title: 'Для каких задач', tag: 'Задачи', paper: true }, uses));
    if (rent) {
      const rows = s.rates.rentPerDay.map((t, i) => [s.tierLabel(t), rub(s.modelRate(m, i))]);
      body.push(section({ id: 'raschet', title: 'Цены', tag: 'Цены' },
        `${table({ caption: 'Аренда: цена за кабину в сутки', head: ['Срок', '₽ за кабину в сутки'], rows, numFrom: 1 })}<p class="small note">Доставка и обслуживание рассчитываются отдельно. Продажа: ${esc(m.saleNote)}.</p>${priceNote()}
<h3 class="h2 sub-h">Рассчитать с доставкой и обслуживанием</h3>${calc('compact', { n: 1, d: 3, u: 'none', z: 'city', km: 0, m: m.slug })}`));
    } else {
      body.push(section({ id: 'kupit', title: 'Купить', tag: 'Покупка' }, `<div class="grid"><div class="lg-5"><p>Кнопка «Купить» открывает заявку, не корзину. Цена туалета ${rub(s.terms.peatPrice)}, торф ${rub(s.terms.peatBagPrice)} за мешок ${s.terms.peatBagLitres}${NB}л. Гарантия ${s.terms.warrantyMonths} месяцев.</p>${priceNote()}</div><div class="lg-7">${form({ mode: 'full', type: 4, heading: 'Заявка на покупку', button: 'Отправить заявку' })}</div></div>`));
    }
    body.push(section({ id: 'pohozhie', title: 'Другие модели', tag: 'Родственные', paper: true },
      `<div class="grid grid--cards cards-2">${m.related.map((id) => modelCard(s.modelById(id))).join('')}</div><p class="more">${btn('/ceny/', 'Цены на аренду', 'link')} ${btn('/dostavka/', 'Зона доставки', 'link')}${rent ? '' : ' ' + btn('/prodazha/', 'Условия покупки', 'link')}</p>`));
    body.push(faqBlock(m.faq, { title: 'Вопросы о модели' }));
    return hero + '<div class="body">' + body.join('') + '</div>';
  },

  prodazha(page) {
    const s = S(), T = s.terms;
    const hero = heroInner(page, { eyebrow: 'Продажа', lead: 'Продаём торфяные туалеты для дач и участков и туалетные кабины по запросу. Поможем с выбором, доставим, расскажем об эксплуатации.' });
    const m = [];
    m.push(section({ id: 'chto', title: 'Что продаём', tag: 'Товары' },
      `<div class="grid grid--2"><article class="svc-card"><h3>Торфяной туалет для дачи</h3><p class="price">${rub(T.peatPrice)}</p><p>В наличии. Гарантия ${T.warrantyMonths} месяцев.</p><p class="hero__actions">${btn('/katalog/torfyanoj/', 'Подробнее', 'outline').replace('btn btn--outline', 'btn btn--outline btn--arrow')}${btn('/katalog/torfyanoj/#kupit', 'Купить', 'primary')}</p></article>
<article class="svc-card"><h3>Туалетная кабина</h3><p class="price"><small>от${NB}</small>${rub(T.cabinSaleFrom)}</p><p>По запросу. Срок поставки согласуем при заявке.</p><p class="hero__actions">${btn('#zayavka', 'Запросить цену', 'primary')}</p></article></div>${priceNote()}`));
    m.push(section({ id: 'arenda-ili-pokupka', title: 'Аренда или покупка', tag: 'Выбор', paper: true },
      kvTable('Что выбрать', ['Ситуация', 'Что выбрать'], [['Нужен туалет на несколько дней или месяцев', a('/arenda/', 'Аренда')], ['Дача, постоянное использование, нет канализации', 'Покупка торфяного туалета'], ['Объект на длительный срок с обслуживанием', a('/obsluzhivanie/', 'Аренда с обслуживанием')], ['Собственная площадка с постоянным обслуживанием своими силами', 'Покупка кабины']])));
    m.push(section({ id: 'usloviya', title: 'Условия покупки', tag: 'Условия' },
      checkList(['Оплата картой, переводом, по счёту для организаций', `Доставка по Новосибирску и области, стоимость по тарифам ${a('/dostavka/', 'доставки')}`, `Гарантия ${T.warrantyMonths} месяцев`, 'Документы: чек или договор и закрывающие документы для организаций']) + (ctx.production ? '' : '<p class="small note"><span class="tag dev-flag">Заглушка</span> Условия подтвердить с клиентом.</p>')));
    m.push(faqBlock(groupIds('pokupka'), { paper: true }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  ceny(page) {
    const s = S(), R = s.rates, D = R.delivery;
    const hero = heroInner(page, { eyebrow: 'Цены', markWord: 'калькулятор',
      lead: 'Стоимость складывается из трёх частей: аренда, обслуживание, доставка и вывоз. Ставки открыты. Итоговую сумму называем до оплаты и фиксируем в договоре или счёте.',
      note: ctx.production ? '' : '<span class="tag dev-flag">Заглушка</span> Ставки ориентировочные.' });
    const m = [];
    m.push(section({ id: 'calc', title: 'Калькулятор стоимости', tag: 'Калькулятор', cls: 'section--calc' }, calc('full', { n: 1, d: 3, u: 'none', z: 'city', km: 0, m: 'standart' }), ));
    m.push(section({ id: 'stavki', title: 'Ставки аренды', tag: 'Ставки', paper: true },
      priceTable() + `<p class="small note">Скидка по количеству: ${R.qtyDiscount.map((d) => `от ${d.from} кабин ${d.pct}%`).join(', ')} на аренду.</p>
<h3 class="h2 sub-h">Обслуживание</h3>${table({ caption: 'Цена визита за 1 кабину', head: ['Частота', 'Цена визита за 1 кабину'], rows: [['Раз в неделю или 2 раза в неделю', rub(R.service.visit)], ['Ежедневно', rub(R.service.visitDaily)]], numFrom: 1 })}
<h3 class="h2 sub-h">Доставка и вывоз</h3>${table({ caption: 'Цена за рейс', head: ['Зона', 'Цена за рейс (доставка и вывоз)'], rows: [['Новосибирск', rub(D.cityPerTrip)], [`Область, до ${D.nearKm}${NB}км от города`, rub(D.nearPerTrip)], [`Область, ${D.nearKm}–${D.maxKm}${NB}км`, `${rub(D.nearPerTrip)} + ${rub(D.perKmOver)} за каждый км сверх ${D.nearKm}`]], numFrom: 1 })}
<p class="small note">Один рейс: до ${D.cabinsPerTrip} кабин. Минимальный заказ: ${rub(R.minOrder)}.</p>${priceNote()}`));
    const C = ctx.CALC, e1 = C.calculate(s, { n: 2, d: 10, u: 'weekly', z: 'city', m: 'standart' }), e2 = C.calculate(s, { n: 6, d: 30, u: 'twice', z: 'region', km: 40, m: 'standart' });
    m.push(section({ id: 'primery', title: 'Примеры', tag: 'Примеры' },
      `<div class="grid grid--2"><article class="svc-card"><h3 class="h4">2 стандартные кабины, 10 суток, обслуживание раз в неделю, Новосибирск</h3><p>Аренда ${rub(e1.rent)} + обслуживание ${rub(e1.service)} + доставка ${rub(e1.delivery)} = <b>${rub(e1.total)}</b></p></article>
<article class="svc-card"><h3 class="h4">6 стандартных кабин, 30 суток, 2 раза в неделю, 40 км от города</h3><p>Аренда ${rub(e2.rent)}, скидка ${e2.pct}% (−${rub(e2.discount)}) = ${rub(e2.rent - e2.discount)}; обслуживание ${rub(e2.service)}; доставка ${rub(e2.delivery)} = <b>${rub(e2.total)}</b></p></article></div>`));
    m.push(section({ id: 'vhodit', title: 'Что входит и что оплачивается отдельно', tag: 'Состав', paper: true },
      `<div class="grid"><div class="lg-6"><h3 class="h4">Входит в аренду</h3>${checkList(s.rentIncludes.included)}</div><div class="lg-6"><h3 class="h4">Рассчитывается отдельно</h3>${checkList(s.rentIncludes.extra, 'checks checks--plus')}</div></div>`));
    m.push(section({ id: 'oplata', title: 'Порядок оплаты', tag: 'Оплата' }, `<p>Предоплата и постоплата зависят от типа клиента. Условия описаны на странице ${a('/arenda/#usloviya', 'аренды')}.</p>`));
    m.push(faqBlock(['minterm', 'payment', 'calcfinal'], { paper: true }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  obsluzhivanie(page) {
    const s = S();
    const hero = heroInner(page, { eyebrow: 'Обслуживание', lead: `Обслуживание: регулярные визиты, которые поддерживают кабину в рабочем состоянии. Периодичность подбираем по числу пользователей и срокам. Цена визита указана на странице ${a('/ceny/#stavki', 'цен')}.` });
    const m = [];
    m.push(section({ id: 'vhodit', title: 'Что входит в обслуживание', tag: 'Визит' },
      checkList(['Откачка бака и промывка', 'Дезинфекция сиденья, стен и ручек', 'Заправка бака рабочим составом (зимой незамерзающим)', 'Пополнение туалетной бумаги и мыла по необходимости', 'Уборка территории вокруг кабины', 'Отчёт после визита в мессенджер или на почту (для организаций)'])));
    m.push(section({ id: 'periodichnost', title: 'Как часто нужно обслуживание', tag: 'Периодичность', paper: true },
      table({ caption: 'Рекомендуемая частота обслуживания', head: ['Ситуация', 'Рекомендуемая частота'], rows: [[`Стройплощадка на ${s.terms.workersPerCabin} рабочих`, '1–2 раза в неделю'], ['Дача, редкое использование', 'Раз в 1–2 недели'], ['Мероприятие до одного дня', 'Перед началом и после; при длительном событии в течение'], ['Постоянный объект с большим потоком', 'Ежедневно']] })
      + '<p class="small note">Точный график согласуем при заявке и фиксируем в договоре или заказе.</p>'));
    m.push(section({ id: 'zima', title: 'Обслуживание в зимний сезон', tag: 'Зима' },
      `<p>В холодный сезон заправляем бак незамерзающим составом, рекомендуем утеплённые кабины с обогревом. Выезжаем по графику при любой погоде, в пределах возможностей подъезда.</p><p class="more">${btn('/katalog/uteplennaya/', 'Утеплённая кабина', 'link')}</p>`));
    m.push(section({ id: 'grafik', title: 'Как организован график', tag: 'График', paper: true },
      steps([{ t: 'Согласуем дни', text: 'Выбираем дни визитов под ваш режим работы.' }, { t: 'Напоминаем', text: 'За день до визита напоминаем.' }, { t: 'Выполняем и отчитываемся', text: 'Проводим обслуживание и отправляем отчёт.' }, { t: 'Корректируем', text: 'При необходимости меняем частоту.' }])));
    m.push(section({ id: 'utilizaciya', title: 'Куда отправляются отходы', tag: 'Утилизация' }, '<p>Откачку выполняет наш спецтранспорт. Отходы вывозятся в согласованные для этого места. Детали и документы по запросу.</p>'));
    m.push(section({ id: 'calc', title: 'Рассчитайте стоимость с обслуживанием', tag: 'Калькулятор', paper: true }, calc('compact', { n: 2, d: 30, u: 'weekly', z: 'city', km: 0 })));
    m.push(faqBlock(groupIds('obsluzhivanie'), { title: 'Вопросы об обслуживании' }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  dostavka(page) {
    const s = S(), D = s.rates.delivery;
    const hero = heroInner(page, { eyebrow: 'Доставка', lead: `Привозим, устанавливаем и забираем кабины собственным транспортом. Стоимость зависит от расстояния и числа кабин: один рейс до ${D.cabinsPerTrip} кабин.` });
    const m = [];
    m.push(section({ id: 'zony', title: 'Зоны доставки', tag: 'Зоны' },
      `<div class="grid"><div class="lg-5">${mapPh('Схема зон доставки: три кольца вокруг Новосибирска')}</div><div class="lg-7">${zonesTable()}<p class="small note">Свыше ${D.maxKm} км и крупные заказы: индивидуальный расчёт.</p></div></div>`));
    m.push(section({ id: 'proverka', title: 'Узнать стоимость доставки', tag: 'Проверка адреса', paper: true },
      `<div class="grid"><div class="lg-5"><p>Укажите населённый пункт и телефон. Назовём стоимость и срок доставки.</p></div><div class="lg-7">${form({ mode: 'zone', heading: 'Проверка адреса', label: 'Проверка адреса доставки' })}</div></div>`));
    m.push(section({ id: 'kak', title: 'Как проходит доставка', tag: 'Порядок' },
      checkList(['Согласуем дату и время в заявке', `За ${s.terms.callBefore} до приезда звоним`, 'Устанавливаем на ровное место', 'Фиксируем установку, вы принимаете кабину', 'Вывоз по звонку или в оговорённую дату'])));
    m.push(section({ id: 'ustanovka', title: 'Что нужно для установки', tag: 'Установка', paper: true }, checkList(['Ровная площадка', 'Подъезд для машины', 'Ответственный на месте или заранее согласованное место'])));
    m.push(section({ id: 'event', title: 'Как заказать на мероприятие', tag: 'Мероприятия' }, `<p>Для мероприятий считаем количество кабин и согласуем время монтажа.</p><p class="more">${btn('/meropriyatiya/', 'Туалеты для мероприятий', 'link')}</p>`));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  okompanii(page) {
    const s = S(), K = s.company;
    const hero = heroInner(page, { eyebrow: 'О компании', lead: `Мы сдаём в аренду и обслуживаем туалетные кабины в Новосибирске и области с ${K.founded} года. Работаем с частными клиентами и организациями: стройки, мероприятия, дачи, производственные объекты.` });
    const m = [];
    m.push(`<div class="stats-wrap"><dl class="stats stats--5">${s.companyStats.map((x) => `<div><dt class="small">${esc(x.label)}</dt><dd class="stat">${esc(x.value)}</dd></div>`).join('')}</dl></div>`);
    m.push(section({ id: 'printsipy', title: 'Принципы работы', tag: 'Принципы' },
      checkList(['Стоимость называем до оплаты и фиксируем в договоре или счёте.', 'Кабины моем и дезинфицируем перед каждой выдачей.', 'Обслуживание ведём по графику, график согласуем заранее.', 'Условия ответственности прописаны в договоре.', 'Для организаций оформляем договор и закрывающие документы.'])));
    m.push(section({ id: 'park', title: 'Парк и оборудование', tag: 'Парк', paper: true },
      `<div class="grid"><div class="lg-7"><p>Кабины разных моделей, спецтехника для откачки, площадка для мойки и дезинфекции.</p>${dev('Количество кабин по моделям, спецтехника и фото парка: данные укажет клиент.')}</div><div class="lg-5"><figure class="ph ph--card crop">${ctx.production ? '' : `<figcaption class="ph__cap">${devTag('Фото парка, 4:3')}</figcaption>`}</figure></div></div>`));
    m.push(reviewsBlock(['anna', 'sergey', 'stroygrad', 'beg', 'olga', 'ip-andrey'], { id: 'otzyvy', devNote: 'Отзывы вымышлены. Заменить реальными с согласия авторов.' }));
    m.push(section({ id: 'rekvizity', title: 'Реквизиты', tag: 'Реквизиты', paper: true },
      kvTable('Реквизиты компании', ['Параметр', 'Значение'], [['Полное наименование', esc(K.legalName)], ['ИНН', K.inn], ['ОГРН', K.ogrn], ['Юридический адрес', esc(K.legalAddress)], ['Банковские реквизиты', esc(K.bank)]]) + dev('Реквизиты заполнит клиент.')));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  voprosy(page) {
    const s = S();
    const hero = heroInner(page, { eyebrow: 'Поддержка', lead: 'Ответы на частые вопросы об оплате, доставке, документах, обслуживании и покупке.' });
    const groups = s.faq.groups;
    ctx.faqUsed = groups.flatMap((g) => g.items);
    const m = [];
    m.push(section({ id: 'voprosy-list', title: 'Все вопросы', tag: 'Вопросы' },
      `<div class="faq-page" data-tabs data-faq-tabs>${groups.map((g) => `<div data-tab-panel data-tab-title="${esc(g.title)}" id="faq-${g.id}"><h3 class="tab-h h2">${esc(g.title)}</h3><div class="acc-list">${g.items.map((f) => faqItem(f, 'q-')).join('')}</div></div>`).join('')}</div>`));
    m.push(section({ id: 'ne-nashli', title: 'Не нашли ответ', tag: 'Связь', paper: true },
      `<div class="notice notice--key"><span class="notice__ico i i--check" aria-hidden="true"></span><div><p>Позвоните ${tel()} или оставьте заявку: уточним детали и ответим в рабочее время.</p><p class="hero__actions">${btn('#zayavka', 'Оставить заявку', 'primary')}</p></div></div>`));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  kontakty(page) {
    const s = S(), C = s.contacts, K = s.company;
    const hero = heroInner(page, { eyebrow: 'Контакты', noCrumbs: false });
    const m = [];
    m.push(section({ id: 'svyaz', title: 'Как с нами связаться', tag: 'Связь' },
      `<div class="grid"><div class="lg-5"><dl class="contact-dl"><div><dt class="label">Телефон</dt><dd>${tel('tel tel--xl')}</dd></div>
<div><dt class="label">Telegram и WhatsApp</dt><dd><a class="btn btn--contact btn--sm" href="${C.telegramUrl}" rel="noopener">${ic('telegram')} Telegram</a> <a class="btn btn--contact btn--sm" href="${C.whatsappUrl}" rel="noopener">${ic('whatsapp')} WhatsApp</a><br><span class="small">${esc(C.telegram)}</span></dd></div>
<div><dt class="label">Email</dt><dd><a href="mailto:${C.email}">${esc(C.email)}</a></dd></div>
<div><dt class="label">Адрес</dt><dd>${esc(C.address)}<br><span class="small">${esc(C.officeNote)}</span></dd></div>
<div><dt class="label">Часы работы</dt><dd>${esc(C.hours.charAt(0).toUpperCase() + C.hours.slice(1))}<br><span class="small">Заказы вне часов работы: оставьте заявку, ответим утром.</span></dd></div></dl>${dev('Все контакты, адрес и режим работы заполнит клиент.')}</div>
<div class="lg-7">${form({ mode: 'full', heading: 'Оставить заявку' })}</div></div>`));
    m.push(section({ id: 'karta', title: 'Карта', tag: 'Карта', paper: true }, `<div class="map-ph map-ph--wide" role="img" aria-label="Схема расположения офиса и склада"><span class="map-ph__pin"></span>${ctx.production ? '' : '<span class="map-ph__cap">Заглушка: карта подключается позже, Яндекс.Карты</span>'}</div>`));
    m.push(section({ id: 'rekvizity', title: 'Реквизиты', tag: 'Реквизиты' },
      kvTable('Реквизиты', ['Параметр', 'Значение'], [['Наименование', esc(K.legalName)], ['ИНН', K.inn], ['ОГРН', K.ogrn], ['Адрес', esc(K.legalAddress)]])));
    m.push(section({ id: 'bystree', title: 'Как быстрее получить расчёт', tag: 'Подсказка', paper: true },
      checkList(['Укажите адрес установки', 'Срок аренды', 'Количество кабин или гостей', 'Нужно ли обслуживание']) + `<p class="more">${btn('/dostavka/', 'Зона доставки', 'link')} ${btn('/ceny/', 'Цены и калькулятор', 'link')} ${btn('/voprosy/', 'Вопросы и ответы', 'link')}</p>`));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  politika(page) {
    const s = S(), L = s.legal;
    const hero = heroInner(page, { eyebrow: `Редакция от ${L.policyDate}`, lead: ctx.production ? '' : '' });
    const sk = L.policySkeleton;
    const toc = `<nav class="toc" aria-label="Оглавление"><ol>${sk.map((x, i) => `<li><a href="#p${i + 1}">${i + 1}. ${esc(x.h)}</a></li>`).join('')}</ol></nav>`;
    const text = sk.map((x, i) => `<section class="policy__s" id="p${i + 1}"><h2 class="h3">${i + 1}. ${esc(x.h)}</h2><p>${esc(x.text)}</p></section>`).join('');
    return hero + `<div class="body"><div class="section"><div class="container"><div class="grid"><aside class="lg-3 toc-wrap">${toc}<button class="btn btn--outline btn--sm js-only" type="button" data-print>Версия для печати</button></aside><div class="lg-7 policy">${dev('Каркас, не юридический документ. Текст обязательно проверяет юрист до публикации.')}${text}</div></div></div></div></div>`;
  },

  notfound(page) {
    const s = S();
    return `<div class="section nf"><div class="container"><div class="grid"><div class="lg-8"><p class="nf__code mono" aria-hidden="true"><span class="mark">404</span></p><h1>${esc(page.h1)}</h1>
<p class="lead">Адрес введён с ошибкой или страница удалена. Перейдите в нужный раздел или позвоните: ${tel()}.</p>
<p class="hero__actions">${btn('/', 'На главную', 'primary')}${btn('/katalog/', 'Каталог', 'outline')}${btn('/ceny/', 'Цены и калькулятор', 'outline')}${btn('/kontakty/', 'Контакты', 'outline')}</p>
<p class="small note">Если вы перешли по ссылке с нашего сайта, сообщите нам: исправим.</p></div></div></div></div>`;
  }
};
export { crumbs };

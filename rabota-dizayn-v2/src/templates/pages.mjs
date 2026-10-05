// Шаблоны страниц. Каждый возвращает HTML содержимого <main>. Тексты берутся из structure.md, числа из content.js.
import { ctx, esc, u, a, btn, tel, ic, illus, illScene, photo, apx, section, table, specTable, kvTable, priceTable, priceNote, modelCard, steps, processSteps,
  faqBlock, faqItem, reviewCard, reviewsBlock, form, ctaBlock, calc, checkList, dev, devTag, rub, tailText, lead, NB } from './lib.mjs';

const S = () => ctx.S;

function crumbs(page) {
  const items = [['/', 'Главная']].concat(page.crumbs || [], [[null, page.label]]);
  return `<nav class="crumbs" aria-label="Хлебные крошки"><ol>${items.map(([h, t]) => `<li>${h ? a(h, esc(t)) : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>`;
}
export const crumbItems = (page) => [['/', 'Главная']].concat(page.crumbs || [], [[null, page.label]]);

// ключевые условия: крупное значение и подпись (как hero-meta в макетах)
function facts(rows, cls = '') {
  return `<dl class="hero-meta${cls ? ' ' + cls : ''}">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
}
function heroInner(page, { eyebrow, lead: ld, actions = '', side = '', note = '', tail, factsRow = '', noCrumbs = false }) {
  return `<header class="hero hero--inner" data-hero><div class="container">${noCrumbs ? '' : crumbs(page)}<div class="hero__grid${side ? ' hero__grid--side' : ''}"><div class="hero__main"><p class="label">${eyebrow}</p><h1>${tailText(esc(page.h1), tail)}</h1>${ld ? `<p class="sub">${ld}</p>` : ''}${actions ? `<div class="hero__actions">${actions}</div>` : ''}${note ? `<p class="small note">${note}</p>` : ''}</div>${side ? `<div class="hero__side">${side}</div>` : ''}</div>${factsRow}</div><div class="hero-end"></div></header>`;
}
const stdFacts = () => facts([['срок аренды', 'от ' + S().terms.minDays + NB + 'суток'], ['документы', 'договор, счёт, акты'], ['оплата', 'по условиям заказа']], 'hero-meta--row');
const reqBtn = (t = 'Получить расчёт') => btn('#zayavka', t, 'primary');
const calcBtn = (t, href = '#calc') => btn(href, t, 'outline');

const AUD_PHOTO = { 'chastnym-licam': 'ulica-kontejner', organizaciyam: 'stroyka-sinyaya', meropriyatiya: 'festival-ryad' };
function audCards() {
  return `<div class="grid grid--3">${S().audiences.map((x) => `<article class="aud-card">${photo(AUD_PHOTO[x.slug], { cls: 'photo--card3', ar: '3/2', sizes: '(min-width:900px) 30vw, 100vw' })}<div class="aud-card__b"><h3>${a('/' + x.slug + '/', x.title, 'stretched')}</h3><p>${x.text}</p><p class="aud-card__cta">${x.cta}</p></div></article>`).join('')}</div>`;
}
function zonesTable() {
  const Z = S().zones, D = S().rates.delivery;
  const price = [rub(D.cityPerTrip), rub(D.nearPerTrip), `${rub(D.nearPerTrip)} + ${rub(D.perKmOver)} за${NB}км сверх${NB}${D.nearKm}`];
  return table({ caption: 'Зоны доставки и цена за рейс', cls: 'tbl--zone',
    head: ['Зона', 'Цена за рейс (туда и обратно)', 'Ориентир по срокам'],
    rows: Z.map((z, i) => [`<span class="zone-chip zone-${z.chip.toLowerCase()}">${z.chip}</span> ${esc(z.name)}${z.towns.length ? `<br><span class="small">${z.towns.join(', ')} и др.</span>` : ''}`, price[i], esc(z.term)]) });
}
function zonesList() {
  const Z = S().zones, D = S().rates.delivery;
  const price = [rub(D.cityPerTrip), rub(D.nearPerTrip), `${rub(D.nearPerTrip)} + ${rub(D.perKmOver)}/км`];
  return `<ul class="zones">${Z.map((z, i) => `<li class="zone"><h3>${esc(z.name)}</h3><b>${price[i]}</b><p>${esc(z.term)}</p><span class="sm">за рейс</span></li>`).join('')}</ul>`;
}
function mapPh(label) {
  const Z = S().zones;
  return `<div class="map-ph" role="img" aria-label="${esc(label)}"><span class="map-ph__pin"></span><span class="zone-chip zone-a map-ph__z1">${Z[0].chip}</span><span class="zone-chip zone-b map-ph__z2">${Z[1].chip}</span><span class="zone-chip zone-c map-ph__z3">${Z[2].chip}</span>${ctx.production ? '' : '<span class="map-ph__cap">Заглушка: карта подключается позже, Яндекс.Карты</span>'}</div>`;
}
function docsList() {
  return `<ul class="docs">${S().documents.map((d) => `<li class="docs__i"><span class="docs__ext" aria-hidden="true">${d.ext}</span><div class="docs__main"><span class="docs__name">${esc(d.name)}</span><span class="small">${d.file ? d.ext + ' · ' + d.size : d.ext + ' · по запросу'}</span></div>${d.file ? `<a class="btn btn--outline btn--sm docs__dl" href="${u(d.file)}" download>Скачать</a>` : `<span class="btn btn--outline btn--sm docs__dl" aria-disabled="true">Скоро</span>`}</li>`).join('')}</ul>`;
}
const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
const homeFaqIds = () => S().faq.groups.flatMap((g) => g.items).filter((i) => i.home).map((i) => i.id);
const groupIds = (id) => S().faqGroup(id).items.map((i) => i.id);
const cabSvg = '<svg class="cab-fallback" viewBox="0 20 210 245" aria-hidden="true" focusable="false"><use href="#cabg"/></svg>';

/* =============== ШАБЛОНЫ =============== */
export const templates = {

  home(page) {
    const s = S(), C = s.contacts, D = s.rates.delivery, E = s.eventRules, sc = (extra) => `<rect width="300" height="330" fill="var(--sc-bg)"/><polygon points="0,236 300,236 300,330 0,330" fill="var(--sc-floor)"/>${extra}`;
    const m1 = s.models[0];
    const hero = `<header class="hero hero--home" data-hero><div class="container"><div class="hero-top"><div class="hero-top__main">
<h1 class="display">${tailText(esc(page.h1), 'в Новосибирске и области')}</h1>
<p class="sub">Доставляем, устанавливаем, обслуживаем по графику и забираем. Для частных клиентов и организаций.</p>
<p class="hero__actions">${btn('/ceny/', 'Рассчитать стоимость', 'primary', 'data-size="lg"')}${btn('#zayavka', 'Оставить заявку', 'outline', 'data-size="lg"')}</p></div>
${facts(s.stats.slice(0, 2).map((x) => [esc(x.label), esc(x.value)]))}</div>
<div class="stage"><div class="stage__view"><svg class="stage__bg" viewBox="0 0 1200 510" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><rect width="1200" height="510" fill="var(--stage-bg)"/><polygon points="470,0 580,0 400,400 280,400" fill="var(--stage-lt1)"/><polygon points="580,0 620,0 440,400 400,400" fill="var(--stage-lt2)"/><polygon points="0,380 1200,380 1200,510 0,510" fill="var(--stage-floor)"/><polygon points="0,380 1200,380 1200,384 0,384" fill="var(--stage-lt2)"/><polygon points="0,510 300,380 420,380 220,510" fill="var(--stage-tile)"/><polygon points="760,510 940,380 1010,380 900,510" fill="var(--stage-tile)"/></svg>
<div class="stage-3d" data-cabin3d>${cabSvg}</div></div>
<div class="stage-bar"><div><b>${m1.sku} ${esc(m1.name.replace(' кабина', ''))}</b>${esc(m1.cardFacts.join(', ')).replace(/ (л|кг|см)/g, NB + '$1')}</div><div><b>Мойка и дезинфекция</b>каждую кабину, перед выдачей</div><div><b>Радиус ${D.maxKm}${NB}км</b>Новосибирск и область</div></div></div></div><div class="hero-end"></div></header>`;
    const mqItems = [`${s.stats[0].value} ${s.stats[0].label}`, `${s.stats[1].value}: ${s.stats[1].label}`, s.stats[2].label.replace(/^./, (c) => c.toUpperCase()), 'Договор и закрывающие документы для организаций', 'Обслуживание по графику, зимой с незамерзающим составом', cap(C.hours)];
    const mq = `<div class="mq" role="region" aria-label="Коротко о нас"><div class="mq__t"><ul>${mqItems.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><ul aria-hidden="true">${mqItems.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div></div>`;
    const visit = [['drop', 'Откачка и промывка', 'бак, сиденье, стены'], ['shield', 'Дезинфекция', 'сиденье, стены и ручки'], ['snow', 'Заправка бака', 'зимой незамерзающий состав'], ['doc', 'Отчёт после визита', 'в мессенджер или на почту']];
    const bento = `<div class="bento">
<article class="card"><div class="scene"><svg viewBox="0 0 300 330" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${sc('<polygon points="0,150 90,60 160,60 40,230 0,230" fill="var(--sc-lt)"/><g transform="translate(14 96) scale(.52)"><use href="#m1"/></g><g transform="translate(108 76) scale(.6)"><use href="#m2"/></g><g transform="translate(210 104) scale(.46)"><use href="#m4"/></g>')}</svg></div>
<div class="cap"><h3>${a('/katalog/', 'Подбор кабин', 'stretched')}</h3><p>Стандартная, с рукомойником, для маломобильных посетителей, утеплённая до ${s.terms.winterTemp}.</p></div></article>
<article class="card">${photo('stroyka-oranzhevaya', { cls: 'photo--card', sizes: '(min-width:1000px) 25vw, (min-width:640px) 50vw, 100vw' })}
<div class="cap"><h3>${a('/dostavka/', 'Доставка и установка', 'stretched')}</h3><p>По Новосибирску и области. В один рейс помещается до ${D.cabinsPerTrip} кабин.</p></div></article>
<article class="card"><div class="visits"><h4>Что входит в визит</h4>${visit.map(([i, b, t]) => `<div class="visit"><i>${ic(i)}</i><div><b>${b}</b><span>${t}</span></div></div>`).join('')}</div>
<div class="cap"><h3>${a('/obsluzhivanie/', 'Обслуживание по графику', 'stretched')}</h3><p>${rub(s.rates.service.visit)} за кабину за визит: откачка, мойка, расходники.</p></div></article>
<article class="card">${photo('ulica-kontejner', { cls: 'photo--card', sizes: '(min-width:1000px) 25vw, (min-width:640px) 50vw, 100vw' })}
<div class="cap"><h3>${a('/dostavka/#kak', 'Вывоз', 'stretched')}</h3><p>Забираем в срок и закрываем документы. По городу рейс ${rub(D.cityPerTrip)}.</p></div></article>
<article class="card card-wide"><div class="wide-in"><div class="wide-text"><h3>Для мероприятий</h3><p>Ориентир: 1 кабина на ${E.guestsPerCabin.to8h}–${E.guestsPerCabin.to4h} гостей при программе 4–8 часов, с алкоголем нужно больше. Для забега на 800 участников считали 20 кабин, две из них для маломобильных.</p>${btn('/meropriyatiya/', 'Туалеты для мероприятий', 'primary')}</div>
${photo('festival-ryad', { cls: 'photo--card', sizes: '(min-width:800px) 55vw, 100vw' })}</div></article></div>`;
    const who = `<div class="who">${s.audiences.map((x, i) => {
      const li = [['Аренда от 1 суток', 'от ' + rub(s.rates.rentPerDay[0].rate) + '/сут'], ['Торфяной туалет', rub(s.terms.peatPrice)]];
      const li2 = [['От ' + s.rates.rentPerDay[s.rates.rentPerDay.length - 1].from + ' суток', 'от ' + rub(s.rates.rentPerDay[s.rates.rentPerDay.length - 1].rate) + '/сут'], ['От ' + s.rates.qtyDiscount[0].from + ' кабин', 'скидка ' + s.rates.qtyDiscount[0].pct + '%']];
      const li3 = [['1 кабина', `на ${E.guestsPerCabin.to8h}–${E.guestsPerCabin.to4h} гостей`], ['От ' + s.rates.qtyDiscount[1].from + ' кабин', 'скидка ' + s.rates.qtyDiscount[1].pct + '%']];
      const l = [li, li2, li3][i];
      return `<div><h3>${a('/' + x.slug + '/', x.title)}</h3><p>${x.text}</p><ul>${l.map(([k, v]) => `<li>${k}<span>${v}</span></li>`).join('')}</ul></div>`;
    }).join('')}</div>`;
    const m = [];
    m.push(`<section class="section" id="chto" aria-labelledby="chto-h"><div class="container"><p class="label">Что мы делаем</p><div class="what-head"><h2 class="visually-hidden" id="chto-h">Что мы делаем</h2><p class="lead">${lead('Сдаём и продаём туалетные кабины в Новосибирске и области, привозим, обслуживаем по графику и вывозим по окончании аренды. Вам остаётся показать, где ставить.')}</p><p class="side">Работаем с дачниками, прорабами и организаторами мероприятий. Договор и закрывающие документы для организаций.</p></div>${bento}${who}</div></section>`);
    m.push(`<section class="section section--flush" id="poryadok" aria-labelledby="poryadok-h"><div class="container proc-head"><p class="label">Простой процесс</p><h2 class="visually-hidden" id="poryadok-h">Как мы работаем</h2><p class="lead">${lead('Четыре шага от звонка до вывоза. Вы называете адрес и даты, остальное берём на себя: от откачки до закрывающих документов.')}</p></div>${processSteps()}</section>`);
    m.push(section({ id: 'modeli', title: 'Модели под вашу задачу', tag: 'Кабины и цены', center: true },
      `<p class="mod-btns">${btn('/ceny/', 'Получить расчёт', 'primary')}${btn('/katalog/', 'Все модели', 'outline')}</p><div class="tiles">${s.models.map((x) => modelCard(x)).join('')}</div>${priceNote()}`));
    const ce = ctx.CALC.calculate(s, { n: 2, d: 10, u: 'weekly', z: 'city', m: 'standart' });
    m.push(`<section class="section section--paper" id="stoimost" aria-labelledby="stoimost-h"><div class="container"><p class="label">Сколько стоит</p><div class="price-g"><div><h2 class="lead" id="stoimost-h">${lead('Чем дольше срок, тем дешевле сутки. Ставки для всех моделей считаются от базовой ставки кабины ЭС-01.')}</h2><div class="price-tbl">${priceTable('Аренда: цена за кабину в сутки, ₽', false)}</div><div class="notes"><span>Скидка на аренду: ${s.rates.qtyDiscount.map((d) => `${d.pct}% от ${d.from} кабин`).join(', ')}.</span><span>Минимальный заказ ${rub(s.rates.minOrder)}.</span></div>${priceNote()}</div>
<div class="ex"><h3>Пример: дача на 10 суток</h3><p class="t">2 стандартные кабины, обслуживание раз в неделю, доставка по Новосибирску.</p><dl><div><dt>Аренда<small>2 кабины × 10 суток × ${rub(ce.unit)}</small></dt><dd>${rub(ce.rent)}</dd></div><div><dt>Обслуживание<small>${ce.V} ${ctx.CALC.plural(ce.V, 'визит', 'визита', 'визитов')} × 2 кабины × ${rub(ce.visit)}</small></dt><dd>${rub(ce.service)}</dd></div><div><dt>Доставка<small>один рейс по городу</small></dt><dd>${rub(ce.delivery)}</dd></div></dl><p class="tot"><span>Итого</span><b>${rub(ce.total)}</b></p></div></div></div></section>`);
    m.push(section({ id: 'calc', title: 'Предварительный расчёт стоимости', tag: 'Калькулятор', lead: 'Укажите параметры, получите ориентир. Итоговую стоимость назовём до оплаты.' }, calc('compact')));
    m.push(`<section class="section" id="zony" aria-labelledby="zony-h"><div class="container"><p class="label">Доставка и вывоз</p><div class="dl-g"><h2 class="lead" id="zony-h">${lead(`Три зоны, цена за рейс заранее. В одну машину помещается до ${D.cabinsPerTrip} кабин.`)}</h2><div>${zonesList()}<p class="zone-note">Пример: 100 км от города = ${rub(D.nearPerTrip)} + ${100 - D.nearKm} км × ${rub(D.perKmOver)} = ${rub(D.nearPerTrip + (100 - D.nearKm) * D.perKmOver)} за рейс. Вывоз считаем по тем же зонам. ${a('/dostavka/', 'Подробнее о зонах и сроках')}</p></div></div></div></section>`);
    m.push(section({ id: 'usloviya', title: 'Что важно знать до заказа', tag: 'Условия', paper: true },
      `<div class="grid grid--4">
<article class="svc-card"><h3 class="h4">Стоимость</h3><p>Складывается из аренды, обслуживания и доставки. Цены и формула расчёта открыты.</p>${btn('/ceny/', 'Цены на аренду', 'link')}</article>
<article class="svc-card"><h3 class="h4">Документы</h3><p>Договор и закрывающие документы для организаций. Образец договора по запросу.</p>${btn('/organizaciyam/#dogovor', 'Договор и документы', 'link')}</article>
<article class="svc-card"><h3 class="h4">Обслуживание</h3><p>Периодичность определяем по нагрузке. Зимой используем утеплённые кабины и незамерзающие составы.</p>${btn('/obsluzhivanie/', 'Что входит в обслуживание', 'link')}</article>
<article class="svc-card"><h3 class="h4">Ответственность</h3><p>Условия при повреждении кабины прописаны в договоре и согласуются заранее.</p>${btn('/voprosy/#q-damage', 'Что при повреждении', 'link')}</article></div>`));
    m.push(reviewsBlock(s.reviews.filter((r) => r.featuredOnHome).map((r) => r.id), { link: true, id: 'otzyvy-home', devNote: 'Отзывы вымышлены, фото иллюстративные. Заменить реальными с согласия авторов.' }));
    m.push(faqBlock(homeFaqIds(), {}));
    return hero + mq + '<div class="body">' + m.join('') + '</div>';
  },

  arenda(page) {
    const s = S(), rent = s.models.filter((x) => x.kind === 'rent');
    const hero = heroInner(page, { eyebrow: 'Аренда', factsRow: stdFacts(), tail: 'в Новосибирске',
      lead: `Мы сдаём в аренду туалетные кабины для строек, мероприятий, дач и производственных площадок. В стоимость аренды входит подготовка кабины. Доставка, обслуживание и вывоз рассчитываются отдельно. Минимальный срок аренды: ${s.terms.minDays} сутки.`,
      actions: reqBtn() + btn('/ceny/', 'Рассчитать самостоятельно', 'outline') });
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
    m.push(section({ id: 'poryadok', title: 'Как мы работаем', tag: 'Порядок', bleed: true }, processSteps()));
    m.push(faqBlock(groupIds('zakaz'), { paper: true }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  chastnym(page) {
    const s = S();
    const hero = heroInner(page, { eyebrow: 'Аренда · Частным лицам', tail: 'для дачи, стройки дома и праздника', factsRow: stdFacts(), side: photo('ulica-kontejner', { cls: 'photo--hero', ar: '4/3', eager: true, sizes: '(min-width:900px) 45vw, 100vw' }),
      lead: 'Аренда от 1 суток. Привозим, ставим на указанное место, при необходимости обслуживаем и забираем. Оплата картой или переводом.',
      actions: reqBtn() + btn('#calc', 'Рассчитать самостоятельно', 'outline') });
    const m = [];
    m.push(section({ id: 'sluchai', title: 'Для каких задач берут кабину', tag: 'Задачи' },
      `<div class="grid grid--3"><article class="svc-card"><h3 class="h4">Строительство дома</h3><p>Рабочим нужен туалет, пока нет воды и канализации. Обычно аренда на 1–6 месяцев, обслуживание раз в неделю.</p><p class="small">Рекомендуем: ${a('/katalog/standart/', 'стандартная')} или ${a('/katalog/uteplennaya/', 'утеплённая')} кабина.</p></article>
<article class="svc-card"><h3 class="h4">Праздник на участке</h3><p>Свадьба, юбилей, семейное событие. Для 40–60 гостей хватает 1–2 кабин; одна из них с рукомойником.</p><p class="small">Количество кабин считаем на странице ${a('/meropriyatiya/#raschet', 'для мероприятий')}.</p></article>
<article class="svc-card"><h3 class="h4">Дача</h3><p>Временное решение на сезон или период ремонта. Для постоянного использования подойдёт торфяной туалет.</p><p class="small">${a('/katalog/torfyanoj/', 'Торфяной туалет для дачи')}</p></article></div>`));
    m.push(section({ id: 'vhodit', title: 'Что вы получаете', tag: 'Состав', paper: true },
      checkList(['Чистую кабину: мойка и дезинфекция перед выдачей', 'Доставку и установку на указанное место', 'Обслуживание по выбранной частоте (по желанию)', 'Вывоз после окончания срока', 'Понятный расчёт: аренда, обслуживание и доставка указаны отдельными строками'])));
    m.push(section({ id: 'calc', title: 'Рассчитайте стоимость', tag: 'Калькулятор' }, calc('compact', { n: 1, d: 3, u: 'none', z: 'city', km: 0 })));
    m.push(section({ id: 'oformlenie', title: 'Порядок оформления', tag: 'Порядок', paper: true, bleed: true },
      steps([{ t: 'Заявка', text: 'Оставляете заявку или звоните.' }, { t: 'Стоимость и место', text: 'Называем стоимость и согласуем дату, время и место установки.' }, { t: 'Предоплата', text: `Вносите предоплату (${s.terms.prepayPct}%).` }, { t: 'Доставка', text: 'Привозим кабину. Остаток оплачивается по факту доставки.' }], { media: ['ill:form', 'ill:doc', 'ill:doc', 'ill:cab'] })
      + `<p class="small note">Договор на 20 страниц не нужен: условия фиксируем в счёте и подтверждении заказа.${ctx.production ? '' : ' <span class="tag dev-flag">Заглушка: согласовать с юристом</span>'}</p>`));
    m.push(section({ id: 'mesto', title: 'Как подготовить место', tag: 'Памятка' },
      `<div class="grid"><div class="lg-6">${checkList(['Ровная площадка', 'Подъезд для машины', 'Расстояние от жилых построек', 'Доступ в день доставки'])}</div><div class="lg-6"><p>Мы позвоним за ${s.terms.callBefore} до приезда. Вам не обязательно находиться на месте, если вы заранее указали, где ставить кабину.</p></div></div>`));
    m.push(reviewsBlock(['anna', 'sergey'], { paper: true, id: 'otzyvy-blok' }));
    m.push(faqBlock(['prepay', 'speed', 'presence', 'buy-cabin']));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  organizaciyam(page) {
    const s = S();
    const hero = heroInner(page, { eyebrow: 'Аренда · Организациям', tail: 'для стройплощадок и организаций', factsRow: stdFacts(), side: photo('stroyka-sinyaya', { cls: 'photo--hero', ar: '4/3', eager: true, sizes: '(min-width:900px) 45vw, 100vw' }),
      lead: 'Договор, обслуживание по графику, закрывающие документы по итогам периода.',
      actions: reqBtn('Запросить коммерческое предложение') + btn('#calc', 'Рассчитать стоимость', 'outline'),
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
      `<div class="grid grid--split"><div><p>Периодичность зависит от числа пользователей. Для стройки обычно 1–2 визита в неделю. График фиксируется в договоре. После визита отправляем отчёт в мессенджер или на почту.</p><p class="more">${btn('/obsluzhivanie/', 'Что входит в визит', 'link')}</p></div>${photo('stroyka-oranzhevaya', { cls: 'photo--card3', ar: '3/2', sizes: '(min-width:900px) 40vw, 100vw' })}</div>`));
    m.push(section({ id: 'raschety', title: 'Порядок расчётов', tag: 'Оплата', paper: true }, checkList(['Предоплата или постоплата по договору', 'Оплата по счёту', 'Для постоянных клиентов условия обсуждаются индивидуально'])));
    m.push(section({ id: 'calc', title: 'Предварительный расчёт', tag: 'Калькулятор' }, calc('compact', { n: 2, d: 30, u: 'weekly', z: 'city', km: 0 })));
    m.push(reviewsBlock(['stroygrad', 'beg', 'ip-andrey'], { paper: true, id: 'otzyvy-blok', title: 'Отзывы организаций' }));
    m.push(faqBlock(groupIds('organizacii'), { title: 'Вопросы организаций' }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  meropriyatiya(page) {
    const s = S(), E = s.eventRules, G = E.guestsPerCabin;
    const hero = heroInner(page, { eyebrow: 'Аренда · Для мероприятий', tail: 'в Новосибирске и области', side: photo('festival-ryad', { cls: 'photo--hero', ar: '4/3', eager: true, sizes: '(min-width:900px) 45vw, 100vw' }), lead: 'Рассчитаем, сколько кабин нужно, доставим и установим к началу. После мероприятия заберём.',
      actions: reqBtn() + btn('#raschet', 'Рассчитать количество кабин', 'outline') });
    const m = [];
    m.push(section({ id: 'tipy', title: 'Какие мероприятия обслуживаем', tag: 'Типы' }, `<ul class="event-types">${s.eventTypes.map((t) => `<li><b>${t.title}</b><span>${t.hint}</span></li>`).join('')}</ul>${ctx.production ? '' : '<p class="small note"><span class="tag dev-flag">Заглушка</span> Ориентиры подтвердить с клиентом.</p>'}<div class="photo-row">${['festival-lyudi', 'meropriyatie-pole', 'ochered'].map((id) => photo(id, { cls: 'photo--card3', ar: '3/2', sizes: '(min-width:900px) 30vw, 100vw' })).join('')}</div>`));
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
<div class="lg-6"><p>При подаче алкоголя количество кабин увеличиваем на треть. От ${E.accessibleFromGuests} гостей добавляем одну кабину для маломобильных посетителей: ${a('/katalog/dlya-malomobilnyh/', 'кабина для маломобильных')}. Каждая ${E.handwashShare}-я кабина: ${a('/katalog/s-rukomojnikom/', 'с рукомойником')}.</p>${photo('malomobilnye', { cls: 'photo--card3', ar: '3/2', sizes: '(min-width:900px) 40vw, 100vw' })}</div></div>`));
    m.push(section({ id: 'logistika', title: 'Как организуем доставку и монтаж', tag: 'Логистика', paper: true },
      `<ol class="num-list"><li>Заявка не позднее чем за ${s.terms.eventLead} до мероприятия. Для крупных событий раньше.</li><li>Согласовываем схему расстановки, подъезд и время монтажа.</li><li>Устанавливаем кабины до начала мероприятия, время согласуем в заявке.</li><li>При длительных мероприятиях проводим обслуживание в течение события.</li><li>После окончания забираем кабины и подтверждаем завершение работ.</li></ol><p class="more">${btn('/organizaciyam/', 'Для организаторов: договор, счёт, акты', 'link')}</p>`));
    m.push(section({ id: 'zakazchik', title: 'Что нужно от заказчика', tag: 'Заказчик' }, checkList(['Адрес и план площадки', 'Даты и время начала', 'Подъезд для машины', 'Контакт ответственного на площадке'])));
    m.push(reviewsBlock(['beg', 'ip-andrey'], { paper: true, id: 'otzyvy-blok', title: 'Отзывы организаторов' }));
    m.push(faqBlock(groupIds('meropriyatiya'), { title: 'Вопросы о мероприятиях' }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  katalog(page) {
    const s = S();
    const hero = heroInner(page, { eyebrow: 'Каталог', tail: 'и биотуалетов', lead: 'Четыре модели сдаём в аренду, торфяной туалет продаём. Выберите по задаче или сравните характеристики в таблице.' });
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
    const three = !!m.view3d, mainPhoto = m.photo;
    const scheme = `<figure class="gallery__slide gallery__slide--svg" data-slide${three || mainPhoto ? ' hidden' : ''}>${illus(m.slug, m.name + ': плоская иллюстрация', 'illus illus--big')}<figcaption class="gallery__cap">Схема модели ${m.sku}</figcaption></figure>`;
    const slides = [];
    const thumbs = [];
    if (three) {
      slides.push(`<figure class="gallery__slide gallery__slide--3d" data-slide><div class="stage-3d stage-3d--model" data-cabin3d>${cabSvg}</div><figcaption class="gallery__cap">3D-модель типовой кабины: потяните, чтобы повернуть.${m.slug === 'standart' ? '' : ' Особенности модели показаны на схеме и в характеристиках.'}</figcaption></figure>`);
      thumbs.push('3D-модель');
    }
    if (mainPhoto) {
      slides.push(`<div class="gallery__slide gallery__slide--photo" data-slide>${photo(mainPhoto, { cls: 'photo--gallery', ar: '3/2', eager: true, sizes: '(min-width:900px) 55vw, 100vw' })}</div>`);
      thumbs.push('Фото');
    }
    slides.push(scheme); thumbs.push('Схема');
    const gal = `<div class="gallery" data-gallery><div class="gallery__main">${slides.join('')}<span class="label gallery__sku">${m.sku}</span></div>${thumbs.length > 1 ? `<div class="gallery__thumbs js-only" role="group" aria-label="Вид модели">${thumbs.map((t, n) => `<button class="gallery__t" type="button" data-thumb="${n}" aria-pressed="${n === 0}">${t}</button>`).join('')}</div>` : ''}</div>`;
    const hero = `<header class="hero hero--inner hero--model" data-hero><div class="container">${crumbs(page)}<div class="model-hero">${gal}
<div class="buy"><p class="label">${m.sku} · ${rent ? 'Аренда' : 'Продажа'}</p><h1>${tailText(esc(page.h1), ['в аренду', 'для зимы', 'для дачи'].find((t) => page.h1.endsWith(t)))}</h1><p class="sub">${esc(m.purpose)}</p>
${rent ? `<p class="buy__price"><span class="price"><small>от${NB}</small>${rub(s.modelFromPrice(m))}<small>${NB}в сутки</small></span><span class="small note">при аренде от ${s.rates.rentPerDay[s.rates.rentPerDay.length - 1].from}${NB}суток</span></p>`
 : `<p class="buy__price"><span class="price">${rub(s.terms.peatPrice)}</span><span class="small note">Торф, мешок ${s.terms.peatBagLitres}${NB}л: ${rub(s.terms.peatBagPrice)}</span></p>`}
<div class="hero__actions">${rent ? reqBtn() + btn('/ceny/?m=' + m.slug + '#calc', 'Рассчитать самостоятельно', 'outline') : btn('#kupit', 'Купить', 'primary')}</div>
${m.note ? `<p class="small note">${esc(m.note)}${ctx.production ? '' : ' <span class="tag dev-flag">Заглушка</span>'}</p>` : ''}</div></div></div><div class="hero-end"></div></header>`;
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
    const hero = heroInner(page, { eyebrow: 'Продажа', tail: 'в Новосибирске', lead: 'Продаём торфяные туалеты для дач и участков и туалетные кабины по запросу. Поможем с выбором, доставим, расскажем об эксплуатации.' });
    const m = [];
    m.push(section({ id: 'chto', title: 'Что продаём', tag: 'Товары' },
      `<div class="grid grid--2"><article class="svc-card"><h3>Торфяной туалет для дачи</h3><p class="price">${rub(T.peatPrice)}</p><p>В наличии. Гарантия ${T.warrantyMonths} месяцев.</p><p class="hero__actions">${btn('/katalog/torfyanoj/', 'Подробнее', 'outline')}${btn('/katalog/torfyanoj/#kupit', 'Купить', 'primary')}</p></article>
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
    const hero = heroInner(page, { eyebrow: 'Цены', tail: 'и калькулятор стоимости',
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
    const hero = heroInner(page, { eyebrow: 'Обслуживание', tail: 'и биотуалетов', lead: `Обслуживание: регулярные визиты, которые поддерживают кабину в рабочем состоянии. Периодичность подбираем по числу пользователей и срокам. Цена визита указана на странице ${a('/ceny/#stavki', 'цен')}.` });
    const m = [];
    m.push(section({ id: 'vhodit', title: 'Что входит в обслуживание', tag: 'Визит' },
      checkList(['Откачка бака и промывка', 'Дезинфекция сиденья, стен и ручек', 'Заправка бака рабочим составом (зимой незамерзающим)', 'Пополнение туалетной бумаги и мыла по необходимости', 'Уборка территории вокруг кабины', 'Отчёт после визита в мессенджер или на почту (для организаций)'])));
    m.push(section({ id: 'periodichnost', title: 'Как часто нужно обслуживание', tag: 'Периодичность', paper: true },
      table({ caption: 'Рекомендуемая частота обслуживания', head: ['Ситуация', 'Рекомендуемая частота'], rows: [[`Стройплощадка на ${s.terms.workersPerCabin} рабочих`, '1–2 раза в неделю'], ['Дача, редкое использование', 'Раз в 1–2 недели'], ['Мероприятие до одного дня', 'Перед началом и после; при длительном событии в течение'], ['Постоянный объект с большим потоком', 'Ежедневно']] })
      + '<p class="small note">Точный график согласуем при заявке и фиксируем в договоре или заказе.</p>'));
    m.push(section({ id: 'zima', title: 'Обслуживание в зимний сезон', tag: 'Зима' },
      `<p>В холодный сезон заправляем бак незамерзающим составом, рекомендуем утеплённые кабины с обогревом. Выезжаем по графику при любой погоде, в пределах возможностей подъезда.</p><p class="more">${btn('/katalog/uteplennaya/', 'Утеплённая кабина', 'link')}</p>`));
    m.push(section({ id: 'grafik', title: 'Как организован график', tag: 'График', paper: true, bleed: true },
      steps([{ t: 'Согласуем дни', text: 'Выбираем дни визитов под ваш режим работы.' }, { t: 'Напоминаем', text: 'За день до визита напоминаем.' }, { t: 'Выполняем и отчитываемся', text: 'Проводим обслуживание и отправляем отчёт.' }, { t: 'Корректируем', text: 'При необходимости меняем частоту.' }], { media: ['ill:doc', 'ill:form', 'ill:service', 'ill:load'] })));
    m.push(section({ id: 'utilizaciya', title: 'Куда отправляются отходы', tag: 'Утилизация' }, '<p>Откачку выполняет наш спецтранспорт. Отходы вывозятся в согласованные для этого места. Детали и документы по запросу.</p>'));
    m.push(section({ id: 'calc', title: 'Рассчитайте стоимость с обслуживанием', tag: 'Калькулятор', paper: true }, calc('compact', { n: 2, d: 30, u: 'weekly', z: 'city', km: 0 })));
    m.push(faqBlock(groupIds('obsluzhivanie'), { title: 'Вопросы об обслуживании' }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  dostavka(page) {
    const s = S(), D = s.rates.delivery;
    const hero = heroInner(page, { eyebrow: 'Доставка', tail: 'по Новосибирску и области', lead: `Привозим, устанавливаем и забираем кабины собственным транспортом. Стоимость зависит от расстояния и числа кабин: один рейс до ${D.cabinsPerTrip} кабин.` });
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
    const ids = Object.keys(s.photos);
    m.push(section({ id: 'park', title: 'Парк и оборудование', tag: 'Парк', paper: true },
      `<div class="grid grid--split"><div><p>Кабины разных моделей, спецтехника для откачки, площадка для мойки и дезинфекции.</p>${dev('Количество кабин по моделям, спецтехника и фото парка: данные укажет клиент. Фото ниже иллюстративные, стоковые.')}</div></div>
<div class="strip" role="group" aria-label="Фотографии, листайте вбок" tabindex="0">${ids.map((id) => photo(id, { cls: 'photo--strip', ar: '4/3', sizes: '(min-width:900px) 24vw, 70vw' })).join('')}</div>`));
    m.push(reviewsBlock(['anna', 'sergey', 'stroygrad', 'beg', 'olga', 'ip-andrey'], { id: 'otzyvy', devNote: 'Отзывы вымышлены. Заменить реальными с согласия авторов.' }));
    m.push(section({ id: 'rekvizity', title: 'Реквизиты', tag: 'Реквизиты', paper: true },
      kvTable('Реквизиты компании', ['Параметр', 'Значение'], [['Полное наименование', esc(K.legalName)], ['ИНН', K.inn], ['ОГРН', K.ogrn], ['Юридический адрес', esc(K.legalAddress)], ['Банковские реквизиты', esc(K.bank)]]) + dev('Реквизиты заполнит клиент.')));
    const CR = s.photos;
    m.push(section({ id: 'istochniki-foto', title: 'Источники фото', tag: 'Авторы фото', lead: 'Все фотографии на сайте иллюстративные: стоковые снимки с Wikimedia Commons на условиях Creative Commons. Они будут заменены фотографиями компании.' },
      `<ol class="credits">${Object.entries(CR).map(([id, p]) => `<li class="credits__i"><img class="credits__th" src="${u('/photos/' + id + '-640.jpg')}" width="96" height="64" alt="" loading="lazy" decoding="async"><div><p class="credits__t">${esc(p.alt)}</p><p class="small">Автор: ${esc(p.author)}. Условия использования: <a href="${s.licenseUrls[p.license] || p.source}" target="_blank" rel="noopener">${esc(p.license)}</a>. Файл: <a href="${esc(p.source)}" target="_blank" rel="noopener">${esc(p.title)}</a>, Wikimedia Commons.</p></div></li>`).join('')}</ol>`));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  voprosy(page) {
    const s = S();
    const hero = heroInner(page, { eyebrow: 'Поддержка', tail: 'об аренде туалетных кабин', lead: 'Ответы на частые вопросы об оплате, доставке, документах, обслуживании и покупке.' });
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
    return `<div class="section nf"><div class="container"><div class="grid"><div class="lg-8"><p class="nf__code mono" aria-hidden="true"><span class="g">404</span></p><h1>${esc(page.h1)}</h1>
<p class="lead">Адрес введён с ошибкой или страница удалена. Перейдите в нужный раздел или позвоните: ${tel()}.</p>
<p class="hero__actions">${btn('/', 'На главную', 'primary')}${btn('/katalog/', 'Каталог', 'outline')}${btn('/ceny/', 'Цены и калькулятор', 'outline')}${btn('/kontakty/', 'Контакты', 'outline')}</p>
<p class="small note">Если вы перешли по ссылке с нашего сайта, сообщите нам: исправим.</p></div></div></div></div>`;
  }
};
export { crumbs };

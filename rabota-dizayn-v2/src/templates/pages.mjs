// Шаблоны страниц. Каждый возвращает HTML содержимого <main>. Тексты берутся из structure.md, числа из content.js.
import { ctx, esc, u, a, btn, tel, ic, illus, thumb, illScene, photo, apx, section, table, specTable, kvTable, priceTable, eventPriceTable, salePriceTable, priceSummary, priceNote, modelCard, offerTags, priceLines, steps, processSteps,
  faqBlock, faqItem, reviewCard, reviewsBlock, form, ctaBlock, calc, checkList, dev, devTag, rub, tailText, lead, NB,
  countVal, liveWidget, deliveryMap, workGallery, photoPair } from './lib.mjs';

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
function heroInner(page, { eyebrow, lead: ld, actions = '', side = '', note = '', tail, factsRow = '', noCrumbs = false, extra = '' }) {
  return `<header class="hero hero--inner" data-hero><div class="container">${noCrumbs ? '' : crumbs(page)}<div class="hero__grid${side ? ' hero__grid--side' : ''}"><div class="hero__main"><p class="label">${eyebrow}</p><h1>${tailText(esc(page.h1), tail)}</h1>${ld ? `<p class="sub">${ld}</p>` : ''}${actions ? `<div class="hero__actions">${actions}</div>` : ''}${extra}${note ? `<p class="small note">${note}</p>` : ''}</div>${side ? `<div class="hero__side">${side}</div>` : ''}</div>${factsRow}</div><div class="hero-end"></div></header>`;
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
  return table({ caption: 'Зоны доставки и цена за рейс', cls: 'tbl--zone', rowAttrs: Z.map((z) => `data-zrow="${z.id}"`),
    head: ['Зона', 'Цена за рейс (туда и обратно)', 'Ориентир по срокам'],
    rows: Z.map((z, i) => [`<span class="zone-chip zone-${z.chip.toLowerCase()}">${z.chip}</span> ${esc(z.name)}${z.towns.length ? `<br><span class="small">${z.towns.join(', ')} и др.</span>` : ''}`, price[i], esc(z.term)]) });
}
function zonesList() {
  const Z = S().zones, D = S().rates.delivery;
  const price = [rub(D.cityPerTrip), rub(D.nearPerTrip), `${rub(D.nearPerTrip)} + ${rub(D.perKmOver)}/км`];
  return `<ul class="zones">${Z.map((z, i) => `<li class="zone" data-zrow="${z.id}"><h3>${esc(z.name)}</h3><b>${price[i]}</b><p>${esc(z.term)}</p><span class="sm">за рейс</span></li>`).join('')}</ul>`;
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
const M = (id) => S().modelById(id);
// «от X ₽/сутки» для аренды, «от X ₽» для продажи
const fromDay = (m) => `от${NB}${rub(S().modelFromPrice(m))}/сутки`;
const fromSale = (m) => `от${NB}${rub(S().saleFrom(m))}`;
const truckNote = () => { const s = S(), n = s.rates.delivery.cabinsPerTrip, g = 800, cab = Math.ceil(g / s.eventRules.guestsPerCabin.to4h); return `В одну машину помещается до ${n}${NB}кабин: для мероприятия на ${g}${NB}гостей при программе до 4${NB}часов (около ${cab}${NB}кабин) хватит одного рейса.`; };
// условия аренды на мероприятие (ЗАГЛУШКА): цена за кабину за сутки, доставка и визит обслуживания считаются отдельно
const eventScheme = () => `Цена за кабину за одни сутки (до 24${NB}часов), каждые следующие сутки по той же ставке. Доставка и вывоз, а также визит обслуживания в цену не входят и считаются отдельно.${ctx.production ? '' : ' <span class="tag dev-flag">Заглушка</span>'}`;

/* ---------- варианты первого экрана главной: A «Фото», B «Линейка моделей», C «Какая задача?» ---------- */
function variantBar(cur) {
  if (ctx.production) return '';
  return `<nav class="vbar" aria-label="Варианты первого экрана"><span class="vbar__t">Вариант первого экрана (для выбора):</span>${S().heroVariants.map((v) => `<a href="${esc(u('/' + v.file))}"${v.id === cur ? ' aria-current="page"' : ''}>${esc(v.name)}</a>`).join('')}</nav>`;
}
const homeActions = (lg = true) => `<p class="hero__actions">${btn('/ceny/', 'Рассчитать стоимость', 'primary', lg ? 'data-size="lg"' : '')}${btn('#zayavka', 'Оставить заявку', 'outline', lg ? 'data-size="lg"' : '')}</p>`;
const homeH1 = (page) => `<h1 class="display">${tailText(esc(page.h1), 'в Новосибирске и области')}</h1>`;
const HOME_SUB = 'Аренда МТК для строек и мероприятий, продажа кабин. Доставляем, устанавливаем, обслуживаем по графику и забираем.';
const statStrip = () => `<dl class="hero-meta hero-meta--row hero-meta--4">${S().stats.map((x) => `<div><dt>${esc(x.label)}</dt><dd>${countVal(x.value)}</dd></div>`).join('')}</dl>`;

function heroA(page) {
  return `<header class="hero hero--home hero--a" data-hero><div class="container">${variantBar('a')}
<div class="hero-a">${photo('festival-ryad', { cls: 'photo--heroa', ar: '16/9', eager: true, sizes: '(min-width:1200px) 1216px, 100vw' })}
<div class="hero-a__card"><p class="label">Новосибирск и область</p>${homeH1(page)}<p class="sub">${HOME_SUB}</p>${homeActions(false)}${liveWidget()}</div></div>
${statStrip()}</div><div class="hero-end"></div></header>`;
}

function heroB(page) {
  const s = S(), order = ['ekonom', 'standart', 'komfort', 'vip'].map(M);
  const tile = (m) => `<li class="mtile" data-offer="${[m.rent ? 'rent' : '', m.sale ? 'sale' : ''].filter(Boolean).join(' ')}"><a class="mtile__a" href="${esc(u('/katalog/' + m.slug + '/'))}"><span class="mtile__img">${illus(m.id, m.name + ': плоская иллюстрация')}</span><span class="mtile__n">${esc(m.name)}</span><span class="mtile__s">${esc(m.short)}</span>${m.rent ? `<span class="mtile__p" data-p="rent"><b>Аренда</b> ${fromDay(m)}</span>` : ''}${m.sale ? `<span class="mtile__p" data-p="sale"><b>Купить</b> ${fromSale(m)}</span>` : ''}</a></li>`;
  return `<header class="hero hero--home hero--b" data-hero><div class="container">${variantBar('b')}
<div class="hero-b__head"><div>${homeH1(page)}<p class="sub">${HOME_SUB}</p>${homeActions()}</div>${liveWidget()}</div>
<div class="offer" data-offer-box><fieldset class="seg offer__seg js-only"><legend class="visually-hidden">Что вам нужно</legend><div class="seg__row"><input type="radio" name="offer" id="offer-rent" value="rent" checked><label for="offer-rent">Аренда</label><input type="radio" name="offer" id="offer-sale" value="sale"><label for="offer-sale">Купить</label></div></fieldset>
<p class="offer__st visually-hidden" data-offer-status aria-live="polite"></p>
<ul class="offer__tiles">${order.map(tile).join('')}</ul></div>
${statStrip()}</div><div class="hero-end"></div></header>`;
}

function heroC(page) {
  const s = S(), std = M('standart');
  const cards = [
    { t: 'Стройка и объекты', href: '/organizaciyam/', ph: 'stroyka-sinyaya', line: `МТК Стандарт в аренду, ${fromDay(std)}`, text: 'Длительный срок, обслуживание по графику, договор и документы.' },
    { t: 'Мероприятие', href: '/meropriyatiya/', ph: 'meropriyatie-pole', line: `МТК Комфорт и VIP, от${NB}${rub(M('komfort').rent.perDay)}/сутки`, text: 'Фестивали, забеги, свадьбы: доставим и установим к началу.' },
    { t: 'Купить кабину', href: '/prodazha/', ph: 'ulica-kontejner', line: `МТК Стандарт и Эконом, от${NB}${rub(s.minSaleFrom())}`, text: 'Для дачи и участка: с доставкой и консультацией.' }
  ];
  return `<header class="hero hero--home hero--c" data-hero><div class="container">${variantBar('c')}
<div class="hero-c__head"><div>${homeH1(page)}<p class="sub">Выберите свою задачу: подберём кабину, назовём цену и сроки.</p></div>${liveWidget()}</div>
<div class="task-grid">${cards.map((c) => `<article class="task-card">${photo(c.ph, { cls: 'photo--card3', ar: '4/3', sizes: '(min-width:900px) 380px, 100vw' })}<div class="task-card__b"><h2 class="task-card__t">${a(c.href, c.t, 'stretched')}</h2><p class="task-card__l">${c.line}</p><p class="task-card__d">${c.text}</p><span class="task-card__go" aria-hidden="true">${ic('arrow')}</span></div></article>`).join('')}</div>
${statStrip()}</div><div class="hero-end"></div></header>`;
}

/* =============== ШАБЛОНЫ =============== */
export const templates = {

  home(page, variant = 'a') {
    const s = S(), C = s.contacts, D = s.rates.delivery, E = s.eventRules, sc = (extra) => `<rect width="300" height="330" fill="var(--sc-bg)"/><polygon points="0,236 300,236 300,330 0,330" fill="var(--sc-floor)"/>${extra}`;
    const std = M('standart'), eco = M('ekonom'), kom = M('komfort'), vip = M('vip');
    const hero = { a: heroA, b: heroB, c: heroC }[variant](page);
    const mqItems = [`${s.stats[0].value} ${s.stats[0].label}`, `${s.stats[1].value}: ${s.stats[1].label}`, s.stats[2].label.replace(/^./, (c) => c.toUpperCase()), 'Договор и закрывающие документы для организаций', 'Обслуживание по графику, отчёт после визита', cap(C.hours)];
    const mq = `<div class="mq" role="region" aria-label="Коротко о нас"><div class="mq__t"><ul>${mqItems.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><ul aria-hidden="true">${mqItems.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div></div>`;
    const visit = [['drop', 'Откачка и промывка', 'бак, сиденье, стены'], ['shield', 'Дезинфекция', 'сиденье, стены и ручки'], ['tools', 'Заправка и расходники', 'вода, мыло, бумага'], ['doc', 'Отчёт после визита', 'в мессенджер или на почту']];
    const bento = `<div class="bento">
<article class="card"><div class="scene"><svg viewBox="0 0 300 330" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${sc('<polygon points="0,150 90,60 160,60 40,230 0,230" fill="var(--sc-lt)"/><g transform="translate(6 104) scale(.5)"><use href="#mS"/></g><g transform="translate(98 84) scale(.58)"><use href="#mK"/></g><g transform="translate(196 104) scale(.46)"><use href="#mV"/></g>')}</svg></div>
<div class="cap"><h3>${a('/katalog/', 'Четыре модели МТК', 'stretched')}</h3><p>Стандарт и Эконом на продажу, Стандарт для строек, Комфорт и VIP для мероприятий.</p></div></article>
<article class="card">${photo('stroyka-oranzhevaya', { cls: 'photo--card', sizes: '(min-width:1000px) 25vw, (min-width:640px) 50vw, 100vw' })}
<div class="cap"><h3>${a('/dostavka/', 'Доставка и установка', 'stretched')}</h3><p>По Новосибирску и области. В одну машину помещается до ${D.cabinsPerTrip} кабин.</p></div></article>
<article class="card"><div class="visits"><h4>Что входит в визит</h4>${visit.map(([i, b, t]) => `<div class="visit"><i>${ic(i)}</i><div><b>${b}</b><span>${t}</span></div></div>`).join('')}</div>
<div class="cap"><h3>${a('/obsluzhivanie/', 'Обслуживание по графику', 'stretched')}</h3><p>${rub(s.rates.service.visit)} за кабину за визит: откачка, мойка, расходники.</p></div></article>
<article class="card">${photo('ulica-kontejner', { cls: 'photo--card', sizes: '(min-width:1000px) 25vw, (min-width:640px) 50vw, 100vw' })}
<div class="cap"><h3>${a('/dostavka/#kak', 'Вывоз', 'stretched')}</h3><p>Забираем в срок и закрываем документы. По городу рейс ${rub(D.cityPerTrip)}.</p></div></article>
<article class="card card-wide"><div class="wide-in"><div class="wide-text"><h3>Для мероприятий</h3><p>Ориентир: 1 кабина на ${E.guestsPerCabin.to8h}–${E.guestsPerCabin.to4h} гостей при программе 4–8 часов, с алкоголем нужно больше. Каждая четвёртая: МТК VIP с рукомойником. ${truckNote()}</p>${btn('/meropriyatiya/', 'Туалеты для мероприятий', 'primary')}</div>
${photo('festival-ryad', { cls: 'photo--card', sizes: '(min-width:800px) 55vw, 100vw' })}</div></article></div>`;
    const who = `<div class="who">${s.audiences.map((x, i) => {
      const li = [['МТК Комфорт или VIP на праздник', fromDay(kom).replace('от' + NB, 'от' + NB) + ''], ['Купить МТК Эконом', fromSale(eco)]];
      const li2 = [['МТК Стандарт от ' + s.rates.rentPerDay[s.rates.rentPerDay.length - 1].from + ' суток', fromDay(std)], ['От ' + s.rates.qtyDiscount[0].from + ' кабин', 'скидка ' + s.rates.qtyDiscount[0].pct + '%']];
      const li3 = [['МТК Комфорт', rub(kom.rent.perDay) + '/сут'], ['МТК VIP', rub(vip.rent.perDay) + '/сут']];
      return `<div><h3>${a('/' + x.slug + '/', x.title)}</h3><p>${x.text}</p><ul>${[li, li2, li3][i].map(([k, v]) => `<li>${k}<span>${v}</span></li>`).join('')}</ul></div>`;
    }).join('')}</div>`;
    const m = [];
    m.push(`<section class="section" id="chto" aria-labelledby="chto-h"><div class="container"><p class="label">Что мы делаем</p><div class="what-head"><h2 class="visually-hidden" id="chto-h">Что мы делаем</h2><p class="lead">${lead('Сдаём в аренду и продаём мобильные туалетные кабины в Новосибирске и области, привозим, обслуживаем по графику и вывозим по окончании аренды. Вам остаётся показать, где ставить.')}</p><p class="side">Работаем с дачниками, прорабами и организаторами мероприятий. Договор и закрывающие документы для организаций.</p></div>${bento}${who}</div></section>`);
    m.push(`<section class="section section--flush" id="poryadok" aria-labelledby="poryadok-h"><div class="container proc-head"><p class="label">Простой процесс</p><h2 class="visually-hidden" id="poryadok-h">Как мы работаем</h2><p class="lead">${lead('Четыре шага от звонка до вывоза. Вы называете адрес и даты, остальное берём на себя: от откачки до закрывающих документов.')}</p></div>${processSteps()}</section>`);
    m.push(workGallery());
    m.push(section({ id: 'modeli', title: 'Четыре модели под вашу задачу', tag: 'Кабины и цены', center: true },
      `<p class="mod-btns">${btn('/ceny/', 'Получить расчёт', 'primary')}${btn('/katalog/', 'Каталог и сравнение', 'outline')}</p><div class="tiles">${s.models.map((x) => modelCard(x)).join('')}</div>${priceNote()}`));
    const ce = ctx.CALC.calculate(s, { n: 2, d: 10, u: 'weekly', z: 'city', m: 'standart' });
    const ev = ctx.CALC.events(s, { guests: 300, dur: 'to8h', alcohol: true }), eq = ev.quote;
    m.push(`<section class="section section--paper" id="stoimost" aria-labelledby="stoimost-h"><div class="container"><p class="label">Сколько стоит</p><div class="price-g"><div><h2 class="lead" id="stoimost-h">${lead('МТК Стандарт: чем дольше срок, тем дешевле сутки. МТК Комфорт и VIP на мероприятие: одна цена за сутки.')}</h2><div class="price-tbl">${priceSummary()}</div><div class="price-tbl">${priceTable('МТК Стандарт в аренду: цена за кабину в сутки по сроку, ₽', false)}</div><div class="notes"><span>Скидка на аренду: ${s.rates.qtyDiscount.map((d) => `${d.pct}% от ${d.from} кабин`).join(', ')}.</span><span>Минимальный заказ ${rub(s.rates.minOrder)}.</span><span>${eventScheme()}</span></div>${priceNote()}</div>
<div class="ex-col"><div class="ex"><h3>Пример: дача на 10 суток</h3><p class="t">2 кабины МТК Стандарт, обслуживание раз в неделю, доставка по Новосибирску.</p><dl><div><dt>Аренда<small>2 кабины × 10 суток × ${rub(ce.unit)}</small></dt><dd>${rub(ce.rent)}</dd></div><div><dt>Обслуживание<small>${ce.V} ${ctx.CALC.plural(ce.V, 'визит', 'визита', 'визитов')} × 2 кабины × ${rub(ce.visit)}</small></dt><dd>${rub(ce.service)}</dd></div><div><dt>Доставка<small>один рейс по городу</small></dt><dd>${rub(ce.delivery)}</dd></div></dl><p class="tot"><span>Итого</span><b>${rub(ce.total)}</b></p></div>
<div class="ex"><h3>Пример: мероприятие на 300 гостей</h3><p class="t">Одни сутки, 4–8 часов, с алкоголем: ${ev.total} кабин, ${ev.komfort} МТК Комфорт и ${ev.vip} МТК VIP. Доставка по Новосибирску.</p><dl><div><dt>Аренда<small>${ev.komfort} × ${rub(kom.rent.perDay)} + ${ev.vip} × ${rub(vip.rent.perDay)}</small></dt><dd>${rub(eq.rent)}</dd></div><div><dt>Скидка за количество<small>${eq.pct}% от ${s.rates.qtyDiscount[1].from} кабин</small></dt><dd>−${rub(eq.discount)}</dd></div><div><dt>Доставка<small>${eq.trips} рейс, в машину до ${D.cabinsPerTrip} кабин</small></dt><dd>${rub(eq.delivery)}</dd></div></dl><p class="tot"><span>Итого</span><b>${rub(eq.total)}</b></p></div></div></div></div></section>`);
    m.push(section({ id: 'calc', title: 'Предварительный расчёт стоимости', tag: 'Калькулятор', lead: 'Укажите параметры, получите ориентир. Итоговую стоимость назовём до оплаты.' }, calc('compact')));
    m.push(`<section class="section" id="zony" aria-labelledby="zony-h"><div class="container"><p class="label">Доставка и вывоз</p><div class="dl-g"><div><h2 class="lead" id="zony-h">${lead(`Три зоны, цена за рейс заранее. В одну машину помещается до ${D.cabinsPerTrip} кабин.`)}</h2><div class="zmap-wrap">${deliveryMap()}</div></div><div>${zonesList()}<p class="zone-note">${truckNote()} Пример: 100 км от города = ${rub(D.nearPerTrip)} + ${100 - D.nearKm} км × ${rub(D.perKmOver)} = ${rub(D.nearPerTrip + (100 - D.nearKm) * D.perKmOver)} за рейс. Вывоз считаем по тем же зонам. ${a('/dostavka/', 'Подробнее о зонах и сроках')}</p></div></div></div></section>`);
    m.push(section({ id: 'usloviya', title: 'Что важно знать до заказа', tag: 'Условия', paper: true },
      `<div class="grid grid--4">
<article class="svc-card"><h3 class="h4">Стоимость</h3><p>Складывается из аренды, обслуживания и доставки. Цены и формула расчёта открыты.</p>${btn('/ceny/', 'Цены на аренду', 'link')}</article>
<article class="svc-card"><h3 class="h4">Документы</h3><p>Договор и закрывающие документы для организаций. Образец договора по запросу.</p>${btn('/organizaciyam/#dogovor', 'Договор и документы', 'link')}</article>
<article class="svc-card"><h3 class="h4">Обслуживание</h3><p>Периодичность определяем по нагрузке: откачка, мойка, заправка. Отчёт после каждого визита.</p>${btn('/obsluzhivanie/', 'Что входит в обслуживание', 'link')}</article>
<article class="svc-card"><h3 class="h4">Ответственность</h3><p>Условия при повреждении кабины прописаны в договоре и согласуются заранее.</p>${btn('/voprosy/#q-damage', 'Что при повреждении', 'link')}</article></div>`));
    m.push(reviewsBlock(s.reviews.filter((r) => r.featuredOnHome).map((r) => r.id), { link: true, id: 'otzyvy-home', devNote: 'Отзывы вымышлены, фото иллюстративные. Заменить реальными с согласия авторов.' }));
    m.push(faqBlock(homeFaqIds(), {}));
    return hero + mq + '<div class="body">' + m.join('') + '</div>';
  },

  arenda(page) {
    const s = S(), rent = s.rentable();
    const hero = heroInner(page, { eyebrow: 'Аренда', factsRow: stdFacts(), tail: 'в Новосибирске',
      lead: `Сдаём в аренду мобильные туалетные кабины: МТК Стандарт на длительный срок для строек и объектов, МТК Комфорт и МТК VIP на короткий срок для мероприятий. Доставка, обслуживание и вывоз рассчитываются отдельно. Минимальный срок аренды: ${s.terms.minDays} сутки.`,
      actions: reqBtn() + btn('/ceny/', 'Рассчитать самостоятельно', 'outline') });
    const m = [];
    m.push(section({ id: 'zadachi', title: 'Аренда для вашей задачи', tag: 'Для кого' }, audCards()));
    const forWhat = { standart: 'Стройка и объекты, длительная аренда', komfort: 'Мероприятия: фестивали, забеги, свадьбы, ярмарки', vip: 'Мероприятия, где гостям нужно помыть руки: рукомойник и зеркало внутри' };
    const term = (x) => (x.rent.type === 'event' ? `${rub(x.rent.perDay)} за кабину за сутки` : `от${NB}${rub(s.modelFromPrice(x))} за сутки при сроке от ${s.rates.rentPerDay[s.rates.rentPerDay.length - 1].from}${NB}суток`);
    m.push(section({ id: 'modeli', title: 'Модели для аренды', tag: 'Модели', paper: true },
      table({ caption: 'Сравнение моделей для аренды', head: ['Модель', 'Для чего подходит', 'Срок', 'Цена'],
        rows: rent.map((x) => [thumb(x.id) + a('/katalog/' + x.slug + '/', esc(x.name)), esc(forWhat[x.id]), x.rent.type === 'event' ? 'Короткий срок, на мероприятие' : 'Длительный срок', term(x)]), numFrom: 3, cls: 'tbl--thumbs' })
      + `<p class="small note">Цены вычисляются из ставок на странице ${a('/ceny/#stavki', 'цен')}. МТК Эконом в аренду не сдаём, он продаётся: ${a('/prodazha/', 'условия покупки')}.</p>`));
    m.push(section({ id: 'cena', title: 'Как формируется цена', tag: 'Цена' },
      `<div class="grid grid--3"><article class="svc-card"><span class="svc-card__ico">${ic('calendar')}</span><h3 class="h4">Аренда</h3><p>МТК Стандарт: ставка за кабину в сутки, чем дольше срок, тем ниже ставка. МТК Комфорт и VIP: цена за кабину за сутки мероприятия.</p></article>
<article class="svc-card"><span class="svc-card__ico">${ic('tools')}</span><h3 class="h4">Обслуживание</h3><p>Откачка, мойка, заправка, расходники. Цена визита за кабину, количество визитов зависит от графика.</p></article>
<article class="svc-card"><span class="svc-card__ico">${ic('truck')}</span><h3 class="h4">Доставка и вывоз</h3><p>Цена за рейс. В одну машину помещается до ${s.rates.delivery.cabinsPerTrip} кабин. Цена зависит от расстояния.</p></article></div>
<p class="small note">${eventScheme()}</p><p class="more">${btn('/ceny/', 'Таблицы ставок и калькулятор', 'link')}</p>`));
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
    const s = S(), std = M('standart'), eco = M('ekonom'), kom = M('komfort'), vip = M('vip');
    const hero = heroInner(page, { eyebrow: 'Аренда и покупка · Частным лицам', tail: 'для дачи, стройки дома и праздника', factsRow: stdFacts(), side: photo('ulica-kontejner', { cls: 'photo--hero', ar: '4/3', eager: true, sizes: '(min-width:900px) 45vw, 100vw' }),
      lead: 'Аренда от 1 суток или покупка кабины. Привозим, ставим на указанное место, при необходимости обслуживаем и забираем. Оплата картой или переводом.',
      actions: reqBtn() + btn('#calc', 'Рассчитать самостоятельно', 'outline') });
    const m = [];
    m.push(section({ id: 'sluchai', title: 'Для каких задач берут кабину', tag: 'Задачи' },
      `<div class="grid grid--3"><article class="svc-card"><h3 class="h4">Праздник на участке</h3><p>Свадьба, юбилей, семейное событие: арендуйте МТК Комфорт, а гостям, которым важно помыть руки, МТК VIP. Для 40–60 гостей хватает 1–2 кабин.</p><p class="small">${a('/katalog/' + kom.slug + '/', 'МТК Комфорт')}, ${fromDay(kom)}; ${a('/katalog/' + vip.slug + '/', 'МТК VIP')}, ${fromDay(vip)}. Количество считаем ${a('/meropriyatiya/#raschet', 'здесь')}.</p></article>
<article class="svc-card"><h3 class="h4">Строительство дома</h3><p>Рабочим нужен туалет, пока нет воды и канализации. Обычно аренда на 1–6 месяцев, обслуживание раз в неделю.</p><p class="small">Арендуйте ${a('/katalog/' + std.slug + '/', 'МТК Стандарт')}, ${fromDay(std)}, или купите Стандарт или Эконом.</p></article>
<article class="svc-card"><h3 class="h4">Дача</h3><p>На сезон или период ремонта: аренда МТК Стандарт. Для постоянного использования купите кабину.</p><p class="small">${a('/katalog/' + eco.slug + '/', 'МТК Эконом')}, ${fromSale(eco)}; ${a('/katalog/' + std.slug + '/', 'МТК Стандарт')}, ${fromSale(std)}.</p></article></div>`));
    m.push(section({ id: 'vhodit', title: 'Что вы получаете', tag: 'Состав', paper: true },
      checkList(['Чистую кабину: мойка и дезинфекция перед выдачей', 'Доставку и установку на указанное место', 'Обслуживание по выбранной частоте (по желанию)', 'Вывоз после окончания срока', 'Понятный расчёт: аренда, обслуживание и доставка указаны отдельными строками'])));
    m.push(`<div class="section section--tight">${photoPair('stroyka-sinyaya', 'meropriyatie-pole')}</div>`);
    m.push(section({ id: 'calc', title: 'Рассчитайте стоимость', tag: 'Калькулятор' }, calc('compact', { n: 1, d: 3, u: 'none', z: 'city', km: 0 })));
    m.push(section({ id: 'oformlenie', title: 'Порядок оформления', tag: 'Порядок', paper: true, bleed: true },
      steps([{ t: 'Заявка', text: 'Оставляете заявку или звоните.' }, { t: 'Стоимость и место', text: 'Называем стоимость и согласуем дату, время и место установки.' }, { t: 'Предоплата', text: `Вносите предоплату (${s.terms.prepayPct}%).` }, { t: 'Доставка', text: 'Привозим кабину. Остаток оплачивается по факту доставки.' }], { media: ['ill:form', 'ill:doc', 'ill:doc', 'ill:cab'] })
      + `<p class="small note">Договор на 20 страниц не нужен: условия фиксируем в счёте и подтверждении заказа.${ctx.production ? '' : ' <span class="tag dev-flag">Заглушка: согласовать с юристом</span>'}</p>`));
    m.push(section({ id: 'mesto', title: 'Как подготовить место', tag: 'Памятка' },
      `<div class="grid"><div class="lg-6">${checkList(['Ровная площадка', 'Подъезд для машины', 'Расстояние от жилых построек', 'Доступ в день доставки'])}</div><div class="lg-6"><p>Мы позвоним за ${s.terms.callBefore} до приезда. Вам не обязательно находиться на месте, если вы заранее указали, где ставить кабину.</p></div></div>`));
    m.push(reviewsBlock(['anna', 'sergey', 'olga'], { paper: true, id: 'otzyvy-blok' }));
    m.push(faqBlock(['prepay', 'speed', 'presence', 'buy-cabin']));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  organizaciyam(page) {
    const s = S(), std = M('standart');
    const hero = heroInner(page, { eyebrow: 'Аренда · Организациям', tail: 'для стройплощадок и организаций', factsRow: stdFacts(), side: photo('stroyka-sinyaya', { cls: 'photo--hero', ar: '4/3', eager: true, sizes: '(min-width:900px) 45vw, 100vw' }),
      lead: 'Длительная аренда МТК Стандарт: договор, обслуживание по графику, закрывающие документы по итогам периода.',
      actions: reqBtn('Запросить коммерческое предложение') + btn('#calc', 'Рассчитать стоимость', 'outline'),
      note: `Коммерческое предложение направляем ${s.terms.kpTerm}.` });
    const m = [];
    m.push(section({ id: 'zadachi', title: 'Для каких объектов', tag: 'Объекты' },
      `<div class="grid grid--3"><article class="svc-card" id="stroyka"><h3 class="h4">Стройплощадки</h3><p>${a('/katalog/' + std.slug + '/', 'МТК Стандарт')} на срок от месяца, ${fromDay(std)}. Периодичность обслуживания закрепляем в договоре.</p><p class="small">Ориентир: 1 кабина на ${s.terms.workersPerCabin} рабочих.</p></article>
<article class="svc-card" id="proizvodstvo"><h3 class="h4">Производства, склады, парковки</h3><p>Постоянные кабины МТК Стандарт с обслуживанием по графику и отчётом о выполненных работах.</p></article>
<article class="svc-card" id="meropriyatiya-org"><h3 class="h4">Мероприятия</h3><p>Разовая аренда МТК Комфорт и МТК VIP и монтаж к определённому времени.</p><p>${btn('/meropriyatiya/', 'Для мероприятий', 'link')}</p></article></div>`));
    m.push(section({ id: 'dogovor', title: 'Договор и документы', tag: 'Документы', paper: true },
      `<div class="grid"><div class="lg-7">${table({ caption: 'Документы по этапам работы', head: ['Этап', 'Документ'], rows: [
        ['До начала работ', `Договор аренды или оказания услуг. Подготовка: ${s.terms.contractPrep}`], ['Оплата', 'Счёт на оплату'], ['После периода обслуживания', 'Акт выполненных работ, закрывающие документы'], ['По запросу', 'Электронный документооборот (ЭДО)']] })}</div>
<div class="lg-5"><h3 class="h4">Образец договора</h3><p class="small">Образец договора по запросу.</p>${docsList()}<p class="more">${reqBtn('Запросить коммерческое предложение')}</p></div></div>`));
    m.push(section({ id: 'grafik', title: 'Обслуживание по графику', tag: 'График' },
      `<div class="grid grid--split"><div><p>Периодичность зависит от числа пользователей. Для стройки обычно 1–2 визита в неделю. График фиксируется в договоре. После визита отправляем отчёт в мессенджер или на почту.</p><p class="more">${btn('/obsluzhivanie/', 'Что входит в визит', 'link')}</p></div>${photo('stroyka-oranzhevaya', { cls: 'photo--card3', ar: '3/2', sizes: '(min-width:900px) 40vw, 100vw' })}</div>`));
    m.push(`<div class="section section--tight">${photoPair('ulica-kontejner', 'ochered')}</div>`);
    m.push(section({ id: 'raschety', title: 'Порядок расчётов', tag: 'Оплата', paper: true }, checkList(['Предоплата или постоплата по договору', 'Оплата по счёту', 'Для постоянных клиентов условия обсуждаются индивидуально'])));
    m.push(section({ id: 'calc', title: 'Предварительный расчёт', tag: 'Калькулятор' }, calc('compact', { n: 2, d: 30, u: 'weekly', z: 'city', km: 0 })));
    m.push(reviewsBlock(['stroygrad', 'beg', 'ip-andrey'], { paper: true, id: 'otzyvy-blok', title: 'Отзывы организаций' }));
    m.push(faqBlock(groupIds('organizacii'), { title: 'Вопросы организаций' }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  meropriyatiya(page) {
    const s = S(), E = s.eventRules, G = E.guestsPerCabin, kom = M('komfort'), vip = M('vip');
    const hero = heroInner(page, { eyebrow: 'Аренда · Для мероприятий', tail: 'в Новосибирске и области', side: photo('festival-ryad', { cls: 'photo--hero', ar: '4/3', eager: true, sizes: '(min-width:900px) 45vw, 100vw' }), lead: 'МТК Комфорт и МТК VIP на сутки. Рассчитаем, сколько кабин нужно, доставим и установим к началу. После мероприятия заберём.',
      actions: reqBtn() + btn('#raschet', 'Рассчитать количество кабин', 'outline') });
    const m = [];
    m.push(section({ id: 'modeli', title: 'Какие кабины для мероприятия', tag: 'Модели' },
      `<div class="grid grid--2"><article class="svc-card"><div class="evmodel">${illus('komfort', kom.name + ': плоская иллюстрация', 'illus evmodel__i')}<div><h3 class="h4">${a('/katalog/' + kom.slug + '/', 'МТК Комфорт')}</h3><p>${esc(kom.purpose)}</p><p class="price"><small>от${NB}</small>${rub(kom.rent.perDay)}<small>/сутки</small></p></div></div></article>
<article class="svc-card"><div class="evmodel">${illus('vip', vip.name + ': плоская иллюстрация', 'illus evmodel__i')}<div><h3 class="h4">${a('/katalog/' + vip.slug + '/', 'МТК VIP')}</h3><p>${esc(vip.purpose)}</p><p class="price"><small>от${NB}</small>${rub(vip.rent.perDay)}<small>/сутки</small></p></div></div></article></div>
<p class="small note">${eventScheme()}</p>`));
    m.push(section({ id: 'tipy', title: 'Какие мероприятия обслуживаем', tag: 'Типы', paper: true }, `<ul class="event-types">${s.eventTypes.map((t) => `<li><b>${t.title}</b><span>${t.hint}</span></li>`).join('')}</ul>${ctx.production ? '' : '<p class="small note"><span class="tag dev-flag">Заглушка</span> Ориентиры подтвердить с клиентом.</p>'}<div class="photo-row">${['festival-lyudi', 'meropriyatie-pole', 'ochered'].map((id) => photo(id, { cls: 'photo--card3', ar: '3/2', sizes: '(min-width:900px) 30vw, 100vw' })).join('')}</div>`));
    const dur = E.durations.map((d, i) => `<input type="radio" name="evdur" id="evdur-${i}" value="${d.id}"${d.id === 'to8h' ? ' checked' : ''}><label for="evdur-${i}">${d.label}</label>`).join('');
    const defEv = ctx.CALC.events(s, { guests: 100, dur: 'to8h', alcohol: false });
    m.push(section({ id: 'raschet', title: 'Сколько кабин нужно', tag: 'Расчёт' },
      `<div class="evcalc js-only" data-evcalc><div class="evcalc__grid"><div class="evcalc__fields">
<div class="field" data-state="default"><label class="field__label" for="ev-guests">Количество гостей</label><input class="input" id="ev-guests" type="text" inputmode="numeric" value="100" data-ev="guests" aria-describedby="ev-guests-msg"><p class="field__msg" id="ev-guests-msg"></p></div>
<fieldset class="seg"><legend class="field__label">Длительность</legend><div class="seg__row">${dur}</div></fieldset>
<label class="check"><input type="checkbox" id="ev-alc" data-ev="alcohol"><span class="check__box" aria-hidden="true"></span><span class="check__t">Подаётся алкоголь</span></label></div>
<aside class="quote on-dark" aria-label="Результат"><h3 class="quote__h">Результат</h3><p class="quote__ev" data-ev-result aria-live="polite">${defEv.text}</p>
<a class="btn btn--primary btn--block" data-ev-link href="${u('/ceny/?n=' + defEv.total + '&m=mtk-komfort&d=1#calc')}">Перенести в калькулятор стоимости</a></aside></div>
<p class="small note">Каждая ${E.vipShare}-я кабина: МТК VIP, остальные МТК Комфорт. Для стройки ориентир: 1 кабина на ${s.terms.workersPerCabin} рабочих. Расчёт ориентировочный. ${truckNote()}${ctx.production ? '' : ' <span class="tag dev-flag">Заглушка</span>'}</p></div>
<noscript><div class="notice notice--info"><span class="notice__ico i i--alert" aria-hidden="true"></span><p>Расчёт работает при включённом JavaScript. Правило указано в таблице ниже, или позвоните: ${tel()}.</p></div></noscript>`));
    m.push(section({ id: 'normy', title: 'Нормы и цены', tag: 'Нормы', paper: true },
      `<div class="grid"><div class="lg-5">${table({ caption: 'Сколько гостей приходится на одну кабину', head: ['Длительность', 'Гостей на 1 кабину'], rows: [['До 4 часов', G.to4h], ['4–8 часов', G.to8h], ['Более 8 часов', G.over8h]], numFrom: 1 })}<p class="small note">При подаче алкоголя количество кабин увеличиваем на треть. Каждая ${E.vipShare}-я кабина: ${a('/katalog/' + vip.slug + '/', 'МТК VIP')}.</p></div>
<div class="lg-7">${eventPriceTable()}<p class="small note">${truckNote()}</p></div></div>`));
    m.push(section({ id: 'logistika', title: 'Как организуем доставку и монтаж', tag: 'Логистика' },
      `<ol class="num-list"><li>Заявка не позднее чем за ${s.terms.eventLead} до мероприятия. Для крупных событий раньше.</li><li>Согласовываем схему расстановки, подъезд и время монтажа.</li><li>Устанавливаем кабины до начала мероприятия, время согласуем в заявке. В одну машину помещается до ${s.rates.delivery.cabinsPerTrip} кабин.</li><li>При длительных мероприятиях проводим обслуживание в течение события.</li><li>После окончания забираем кабины и подтверждаем завершение работ.</li></ol><p class="more">${btn('/organizaciyam/', 'Для организаторов: договор, счёт, акты', 'link')}</p>`));
    m.push(section({ id: 'zakazchik', title: 'Что нужно от заказчика', tag: 'Заказчик', paper: true }, checkList(['Адрес и план площадки', 'Даты и время начала', 'Подъезд для машины', 'Контакт ответственного на площадке'])));
    m.push(reviewsBlock(['beg', 'ip-andrey'], { paper: true, id: 'otzyvy-blok', title: 'Отзывы организаторов' }));
    m.push(faqBlock(groupIds('meropriyatiya'), { title: 'Вопросы о мероприятиях' }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  katalog(page) {
    const s = S();
    const hero = heroInner(page, { eyebrow: 'Каталог', tail: 'мобильных туалетных кабин', lead: 'Четыре модели МТК. МТК Стандарт сдаём в аренду для строек и продаём, МТК Эконом продаём, МТК Комфорт и VIP сдаём на мероприятия. Выберите по задаче или сравните характеристики.' });
    const chips = [['all', 'Все'], ['rent', 'Аренда'], ['sale', 'Продажа'], ['build', 'Для стройки'], ['event', 'Для мероприятий']];
    const m = [];
    m.push(section({ id: 'spisok', title: 'Модели', tag: 'Каталог' },
      `<div class="chips js-only" role="group" aria-label="Фильтр по назначению">${chips.map(([k, t], i) => `<button class="chip" type="button" data-filter="${k}" aria-pressed="${i === 0}">${t}</button>`).join('')}</div>
<p class="small" data-filter-status aria-live="polite" hidden></p>
<div class="grid grid--cards cards-4" data-filter-list>${s.models.map((x) => modelCard(x, { cta: true })).join('')}</div>
<div class="notice notice--info" data-filter-empty hidden><span class="notice__ico i i--alert" aria-hidden="true"></span><div><p class="notice__t">Ничего не найдено</p><p><button class="btn btn--link" type="button" data-filter-reset>Сбросить фильтры</button></p></div></div>${priceNote()}`));
    const cols = s.models;
    const row = (label, f) => [label].concat(cols.map(f));
    const rentCell = (x) => (!x.rent ? 'не сдаётся' : x.rent.type === 'event' ? rub(x.rent.perDay) + ' за кабину за сутки' : fromDay(x) + ' при сроке от ' + s.rates.rentPerDay[s.rates.rentPerDay.length - 1].from + NB + 'суток');
    m.push(section({ id: 'sravnenie', title: 'Сравнение моделей', tag: 'Таблица', paper: true },
      `<div class="tbl-wrap">` + table({ caption: 'Сравнение моделей', cls: 'tbl--cmp tbl--thumbs', stack: true,
        head: ['Параметр'].concat(cols.map((x) => thumb(x.id) + esc(x.name))),
        rows: [row('Для чего', (x) => esc(x.cmp.use)), row('Объём бака', (x) => esc(x.cmp.tank)), row('Размер', (x) => esc(x.cmp.size)), row('Вес', (x) => esc(x.cmp.weight)), row('Комплектация', (x) => esc(x.cmp.kit)),
          row('Аренда', (x) => esc(rentCell(x))),
          row('Продажа', (x) => (x.sale ? esc(fromSale(x)) : 'не продаётся'))] }) + `</div>`));
    m.push(section({ id: 'pomosh', title: 'Не уверены в выборе', tag: 'Помощь' },
      `<div class="notice notice--key"><span class="notice__ico i i--check" aria-hidden="true"></span><div><p>Позвоните или напишите. Подберём модель по задаче, сроку и количеству людей.</p><p class="hero__actions">${a(s.contacts.phoneHref, ic('phone') + ' Позвонить', 'btn btn--outline btn--sm', '')}${a(s.contacts.telegramUrl, ic('telegram') + ' Написать в Telegram', 'btn btn--outline btn--sm', 'rel="noopener"')}</p></div></div>
<p class="more">${btn('/ceny/', 'Цены и калькулятор', 'link')} ${btn('/prodazha/', 'Условия покупки', 'link')} ${btn('/meropriyatiya/', 'Сколько кабин на мероприятие', 'link')}</p>`));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  model(page) {
    const s = S(), m = s.modelById(page.model), rent = !!m.rent, sale = !!m.sale, ev = rent && m.rent.type === 'event';
    const slides = [`<figure class="gallery__slide" data-slide>${illus(m.id, m.name + ': плоская иллюстрация, вид снаружи', 'illus illus--big')}<figcaption class="gallery__cap">${m.id === 'vip' ? 'Вид снаружи: корпус МТК Комфорт и табличка VIP.' : 'Схематичная иллюстрация модели.'}</figcaption></figure>`];
    const thumbs = ['Снаружи'];
    if (m.id === 'vip') {
      slides.push(`<figure class="gallery__slide" data-slide hidden>${illus('vip-in', 'МТК VIP внутри: зеркало, рукомойник с педалью, бак воды, диспенсер мыла и полотенцедержатель', 'illus illus--big')}<figcaption class="gallery__cap">Внутри: зеркало, рукомойник с ножной помпой, бак воды 20 л, диспенсер мыла, полотенцедержатель.</figcaption></figure>`);
      thumbs.push('Внутри');
    }
    const gal = `<div class="gallery" data-gallery><div class="gallery__main">${slides.join('')}<span class="label gallery__sku">${esc(m.name)}</span></div>${thumbs.length > 1 ? `<div class="gallery__thumbs js-only" role="group" aria-label="Вид модели">${thumbs.map((t, n) => `<button class="gallery__t" type="button" data-thumb="${n}" aria-pressed="${n === 0}">${t}</button>`).join('')}</div>` : ''}</div>`;
    const actions = rent ? reqBtn() + (sale ? btn('#kupit', 'Купить', 'outline') : btn('/ceny/?m=' + m.slug + '#calc', 'Рассчитать самостоятельно', 'outline')) : btn('#kupit', 'Купить', 'primary');
    const hero = `<header class="hero hero--inner hero--model" data-hero><div class="container">${crumbs(page)}<div class="model-hero">${gal}
<div class="buy"><p class="label">${offerTags(m).join(' · ')}</p><h1>${tailText(esc(page.h1), m.tail)}</h1><p class="sub">${esc(m.purpose)}</p>
<ul class="buy__offers">${rent ? `<li><span class="buy__k">${ev ? 'Аренда на мероприятие' : 'Аренда на длительный срок'}</span>${priceLines(m)[0]}<span class="small note">${ev ? 'за кабину за сутки (до 24' + NB + 'часов)' : 'при аренде от ' + s.rates.rentPerDay[s.rates.rentPerDay.length - 1].from + NB + 'суток, цены по срокам ниже'}</span></li>` : ''}${sale ? `<li><span class="buy__k">Продажа</span>${priceLines(m).slice(-1)[0]}<span class="small note">с доставкой по тарифам</span></li>` : ''}</ul>
<div class="hero__actions">${actions}</div></div></div></div><div class="hero-end"></div></header>`;
    const body = [];
    const specs = specTable('Характеристики модели ' + m.name, m.specs);
    const uses = checkList(m.useCases.map((x) => esc(x.charAt(0).toUpperCase() + x.slice(1))));
    const inclRent = ev ? s.rentIncludesEvent : s.rentIncludes;
    const incl = (rent ? `<div class="grid"><div class="lg-6"><h3 class="h4">Входит в аренду</h3>${checkList(inclRent.included)}</div><div class="lg-6"><h3 class="h4">Рассчитывается отдельно</h3>${checkList(inclRent.extra, 'checks checks--plus')}</div></div>` : '')
      + (sale ? `<h3 class="h4 sub-h">Покупка</h3><ol class="num-list"><li>Оставляете заявку: называем цену и срок поставки.</li><li>Согласуем оплату и доставку.</li><li>Привозим и устанавливаем кабину на вашем участке. Гарантия ${s.terms.warrantyMonths} месяцев.</li></ol>${ctx.production ? '' : '<p class="small note"><span class="tag dev-flag">Заглушка</span> Условия поставки и гарантии подтвердить с клиентом.</p>'}` : '');
    const deliv = `<p>Доставка по Новосибирску и области. В одну машину помещается до ${s.rates.delivery.cabinsPerTrip} кабин. Цена зависит от расстояния.</p><p>${btn('/dostavka/', 'Зона доставки и цены', 'link')}</p>`;
    const stdSpec = specs + (ctx.production ? '' : '<p class="small note"><span class="tag dev-flag">Заглушка</span> Характеристики ориентировочные, их подтвердит клиент.</p>');
    body.push(section({ id: 'harakteristiki', title: 'Характеристики', tag: 'Паспорт' },
      `<div class="tabs-wrap" data-tabs><div data-tab-panel data-tab-title="Характеристики" id="tab-spec"><h3 class="tab-h h4">Характеристики</h3>${stdSpec}</div>
<div data-tab-panel data-tab-title="${rent ? 'Что входит' : 'Как купить'}" id="tab-incl"><h3 class="tab-h h4">${rent ? 'Что входит' : 'Как купить'}</h3>${incl}</div>
<div data-tab-panel data-tab-title="Доставка" id="tab-delivery"><h3 class="tab-h h4">Доставка</h3>${deliv}</div></div>`));
    body.push(section({ id: 'zadachi', title: 'Для чего эта кабина', tag: 'Задачи', paper: true }, uses));
    let paper = false;
    const pap = () => { paper = !paper; return paper; };
    if (rent) {
      const rows = s.rates.rentPerDay.map((t, i) => [s.tierLabel(t), rub(s.modelRate(m, i))]);
      const priceBlock = ev
        ? `<p class="price price--lg">${rub(m.rent.perDay)}<small> за кабину за сутки</small></p><p class="small note">${eventScheme()}</p>`
        : `${table({ caption: 'Аренда: цена за кабину в сутки', head: ['Срок', '₽ за кабину в сутки'], rows, numFrom: 1 })}<p class="small note">Доставка и обслуживание рассчитываются отдельно.</p>`;
      body.push(section({ id: 'raschet', title: 'Цены на аренду', tag: 'Аренда' },
        `${priceBlock}${priceNote()}<h3 class="h2 sub-h">Рассчитать с доставкой и обслуживанием</h3>${calc('compact', { n: ev ? 4 : 1, d: ev ? 1 : 3, u: 'none', z: 'city', km: 0, m: m.slug })}`));
    }
    if (sale) {
      body.push(section({ id: 'kupit', title: 'Купить ' + m.name, tag: 'Покупка', paper: rent }, `<div class="grid"><div class="lg-5"><p class="price">${fromSale(m)}</p><p>Кнопка «Купить» открывает заявку, не корзину. Цена зависит от доставки и комплектации. Гарантия ${s.terms.warrantyMonths} месяцев.</p>${priceNote()}</div><div class="lg-7">${form({ mode: 'full', type: 4, heading: 'Заявка на покупку', button: 'Отправить заявку' })}</div></div>`));
    }
    body.push(section({ id: 'pohozhie', title: 'Другие модели', tag: 'Родственные', paper: !sale || !rent ? true : false },
      `<div class="grid grid--cards cards-2">${m.related.slice(0, 2).map((id) => modelCard(s.modelById(id))).join('')}</div><p class="more">${btn('/ceny/', 'Цены', 'link')} ${btn('/dostavka/', 'Зона доставки', 'link')}${sale ? ' ' + btn('/prodazha/', 'Условия покупки', 'link') : ''}</p>`));
    body.push(faqBlock(m.faq, { title: 'Вопросы о модели', paper: !(!sale || !rent) }));
    return hero + '<div class="body">' + body.join('') + '</div>';
  },

  prodazha(page) {
    const s = S(), T = s.terms, std = M('standart'), eco = M('ekonom');
    const hero = heroInner(page, { eyebrow: 'Продажа', tail: 'в Новосибирске', lead: 'Продаём мобильные туалетные кабины МТК Стандарт и МТК Эконом для дач, участков и объектов. Поможем с выбором, доставим, расскажем об эксплуатации.' });
    const m = [];
    const card = (x) => `<article class="svc-card"><div class="sq sq--sale">${illus(x.id, x.name + ': плоская иллюстрация')}</div><h3>${a('/katalog/' + x.slug + '/', esc(x.name), 'stretched')}</h3><p class="price"><small>от${NB}</small>${rub(x.sale.from)}</p><p>${esc(x.short)}. Гарантия ${T.warrantyMonths} месяцев.</p><p class="hero__actions">${btn('/katalog/' + x.slug + '/', 'Подробнее', 'outline')}${btn('/katalog/' + x.slug + '/#kupit', 'Купить', 'primary')}</p></article>`;
    m.push(section({ id: 'chto', title: 'Что продаём', tag: 'Товары' }, `<div class="grid grid--2">${card(std)}${card(eco)}</div>${salePriceTable()}${priceNote()}`));
    m.push(section({ id: 'arenda-ili-pokupka', title: 'Аренда или покупка', tag: 'Выбор', paper: true },
      kvTable('Что выбрать', ['Ситуация', 'Что выбрать'], [['Мероприятие на несколько дней', a('/meropriyatiya/', 'Аренда МТК Комфорт или VIP')], ['Стройка на срок от месяца с обслуживанием', a('/organizaciyam/', 'Аренда МТК Стандарт')], ['Дача, постоянное использование', 'Покупка МТК Эконом или МТК Стандарт'], ['Собственная площадка с обслуживанием своими силами', 'Покупка МТК Стандарт']])));
    m.push(section({ id: 'usloviya', title: 'Условия покупки', tag: 'Условия' },
      checkList(['Оплата картой, переводом, по счёту для организаций', `Доставка по Новосибирску и области, стоимость по тарифам ${a('/dostavka/', 'доставки')}, в одну машину помещается до ${s.rates.delivery.cabinsPerTrip} кабин`, `Гарантия ${T.warrantyMonths} месяцев`, 'Документы: чек или договор и закрывающие документы для организаций']) + (ctx.production ? '' : '<p class="small note"><span class="tag dev-flag">Заглушка</span> Условия подтвердить с клиентом.</p>')));
    m.push(faqBlock(groupIds('pokupka').concat(['m-sale-delivery', 'm-sale-warranty']), { paper: true }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  ceny(page) {
    const s = S(), R = s.rates, D = R.delivery;
    const hero = heroInner(page, { eyebrow: 'Цены', tail: 'и калькулятор стоимости',
      lead: 'Стоимость аренды складывается из трёх частей: аренда, обслуживание, доставка и вывоз. Ставки открыты. Итоговую сумму называем до оплаты и фиксируем в договоре или счёте.',
      note: ctx.production ? '' : '<span class="tag dev-flag">Заглушка</span> Ставки ориентировочные.' });
    const m = [];
    m.push(section({ id: 'calc', title: 'Калькулятор стоимости', tag: 'Калькулятор', cls: 'section--calc' }, calc('full', { n: 1, d: 3, u: 'none', z: 'city', km: 0, m: 'standart' })));
    m.push(section({ id: 'stavki', title: 'Цены аренды и продажи', tag: 'Ставки', paper: true },
      priceSummary() + `<h3 class="h2 sub-h">МТК Стандарт: аренда по срокам</h3>` + priceTable() + `<p class="small note">Скидка по количеству: ${R.qtyDiscount.map((d) => `от ${d.from} кабин ${d.pct}%`).join(', ')} на аренду.</p>
<h3 class="h2 sub-h">МТК Комфорт и VIP: аренда на мероприятие</h3>${eventPriceTable()}<p class="small note">${eventScheme()}</p>
<h3 class="h2 sub-h">Продажа</h3>${salePriceTable()}
<h3 class="h2 sub-h">Обслуживание</h3>${table({ caption: 'Цена визита за 1 кабину', head: ['Частота', 'Цена визита за 1 кабину'], rows: [['Раз в неделю или 2 раза в неделю', rub(R.service.visit)], ['Каждый день', rub(R.service.visitDaily)]], numFrom: 1 })}
<h3 class="h2 sub-h">Доставка и вывоз</h3>${table({ caption: 'Цена за рейс', head: ['Зона', 'Цена за рейс (доставка и вывоз)'], rows: [['Новосибирск', rub(D.cityPerTrip)], [`Область, до ${D.nearKm}${NB}км от города`, rub(D.nearPerTrip)], [`Область, ${D.nearKm}–${D.maxKm}${NB}км`, `${rub(D.nearPerTrip)} + ${rub(D.perKmOver)} за каждый км сверх ${D.nearKm}`]], numFrom: 1 })}
<p class="small note">${truckNote()} Минимальный заказ: ${rub(R.minOrder)}.</p>${priceNote()}`));
    const C = ctx.CALC, e1 = C.calculate(s, { n: 2, d: 10, u: 'weekly', z: 'city', m: 'standart' }), ev = C.events(s, { guests: 300, dur: 'to8h', alcohol: true }), e2 = ev.quote;
    const kom = M('komfort'), vip = M('vip');
    m.push(section({ id: 'primery', title: 'Примеры', tag: 'Примеры' },
      `<div class="grid grid--2"><article class="svc-card"><h3 class="h4">2 кабины МТК Стандарт, 10 суток, обслуживание раз в неделю, Новосибирск</h3><p>Аренда ${rub(e1.rent)} + обслуживание ${rub(e1.service)} + доставка ${rub(e1.delivery)} = <b>${rub(e1.total)}</b></p></article>
<article class="svc-card"><h3 class="h4">Мероприятие на 300 гостей, 4–8 часов, с алкоголем, одни сутки, Новосибирск</h3><p>${ev.total} кабин: ${ev.komfort} МТК Комфорт × ${rub(kom.rent.perDay)} + ${ev.vip} МТК VIP × ${rub(vip.rent.perDay)} = ${rub(e2.rent)}, скидка ${e2.pct}% (−${rub(e2.discount)}); доставка ${rub(e2.delivery)} (${e2.trips} рейс, в машину до ${D.cabinsPerTrip} кабин) = <b>${rub(e2.total)}</b></p></article></div>`));
    m.push(section({ id: 'vhodit', title: 'Что входит и что оплачивается отдельно', tag: 'Состав', paper: true },
      `<div class="grid"><div class="lg-6"><h3 class="h4">Входит в аренду</h3>${checkList(s.rentIncludes.included)}</div><div class="lg-6"><h3 class="h4">Рассчитывается отдельно</h3>${checkList(s.rentIncludes.extra, 'checks checks--plus')}</div></div>`));
    m.push(section({ id: 'oplata', title: 'Порядок оплаты', tag: 'Оплата' }, `<p>Предоплата и постоплата зависят от типа клиента. Условия описаны на странице ${a('/arenda/#usloviya', 'аренды')}.</p>`));
    m.push(faqBlock(['minterm', 'payment', 'calcfinal'], { paper: true }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  obsluzhivanie(page) {
    const s = S();
    const hero = heroInner(page, { eyebrow: 'Обслуживание', tail: 'мобильных туалетных кабин', lead: `Обслуживание: регулярные визиты, которые поддерживают кабину в рабочем состоянии. Периодичность подбираем по числу пользователей и срокам. Цена визита указана на странице ${a('/ceny/#stavki', 'цен')}.` });
    const m = [];
    m.push(section({ id: 'vhodit', title: 'Что входит в обслуживание', tag: 'Визит' },
      checkList(['Откачка бака и промывка', 'Дезинфекция сиденья, стен и ручек', 'Заправка бака рабочим составом', 'Пополнение туалетной бумаги и мыла по необходимости, в МТК VIP заправка воды и мыла', 'Уборка территории вокруг кабины', 'Отчёт после визита в мессенджер или на почту (для организаций)'])));
    m.push(section({ id: 'periodichnost', title: 'Как часто нужно обслуживание', tag: 'Периодичность', paper: true },
      table({ caption: 'Рекомендуемая частота обслуживания', head: ['Ситуация', 'Рекомендуемая частота'], rows: [[`Стройплощадка на ${s.terms.workersPerCabin} рабочих`, '1–2 раза в неделю'], ['Дача, редкое использование', 'Раз в 1–2 недели'], ['Мероприятие до одного дня', 'Перед началом и после; при длительном событии в течение'], ['Постоянный объект с большим потоком', 'Каждый день']] })
      + '<p class="small note">Точный график согласуем при заявке и фиксируем в договоре или заказе.</p>'));
    m.push(section({ id: 'grafik', title: 'Как организован график', tag: 'График', bleed: true },
      steps([{ t: 'Согласуем дни', text: 'Выбираем дни визитов под ваш режим работы.' }, { t: 'Напоминаем', text: 'За день до визита напоминаем.' }, { t: 'Выполняем и отчитываемся', text: 'Проводим обслуживание и отправляем отчёт.' }, { t: 'Корректируем', text: 'При необходимости меняем частоту.' }], { media: ['ill:doc', 'ill:form', 'ill:service', 'ill:load'] })));
    m.push(section({ id: 'utilizaciya', title: 'Куда отправляются отходы', tag: 'Утилизация', paper: true }, '<p>Откачку выполняет наш спецтранспорт. Отходы вывозятся в согласованные для этого места. Детали и документы по запросу.</p>'));
    m.push(section({ id: 'calc', title: 'Рассчитайте стоимость с обслуживанием', tag: 'Калькулятор' }, calc('compact', { n: 2, d: 30, u: 'weekly', z: 'city', km: 0 })));
    m.push(faqBlock(groupIds('obsluzhivanie'), { title: 'Вопросы об обслуживании', paper: true }));
    return hero + '<div class="body">' + m.join('') + '</div>';
  },

  dostavka(page) {
    const s = S(), D = s.rates.delivery;
    const hero = heroInner(page, { eyebrow: 'Доставка', tail: 'по Новосибирску и области', lead: `Привозим, устанавливаем и забираем кабины собственным транспортом. Стоимость зависит от расстояния. В одну машину помещается до ${D.cabinsPerTrip} кабин: для мероприятия на 800 гостей при программе до 4 часов хватит одного рейса.`, extra: liveWidget() });
    const m = [];
    m.push(section({ id: 'zony', title: 'Зоны доставки', tag: 'Зоны' },
      `<div class="grid"><div class="lg-5">${deliveryMap()}</div><div class="lg-7">${zonesTable()}<p class="small note">${truckNote()} Свыше ${D.maxKm} км и крупные заказы: индивидуальный расчёт.</p></div></div>`));
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
    const hero = heroInner(page, { eyebrow: 'О компании', lead: `Мы сдаём в аренду, продаём и обслуживаем туалетные кабины в Новосибирске и области с ${K.founded} года. Работаем с частными клиентами и организациями: стройки, мероприятия, дачи, производственные объекты.` });
    const m = [];
    m.push(`<div class="stats-wrap"><dl class="stats stats--5">${s.companyStats.map((x) => `<div><dt class="small">${esc(x.label)}</dt><dd class="stat">${countVal(x.value)}</dd></div>`).join('')}</dl></div>`);
    m.push(section({ id: 'printsipy', title: 'Принципы работы', tag: 'Принципы' },
      checkList(['Стоимость называем до оплаты и фиксируем в договоре или счёте.', 'Кабины моем и дезинфицируем перед каждой выдачей.', 'Обслуживание ведём по графику, график согласуем заранее.', 'Условия ответственности прописаны в договоре.', 'Для организаций оформляем договор и закрывающие документы.'])));
    m.push(section({ id: 'park', title: 'Парк и оборудование', tag: 'Парк' },
      `<div class="grid grid--split"><div><p>Кабины МТК Стандарт, Эконом, Комфорт и VIP, спецтехника для откачки, площадка для мойки и дезинфекции.</p>${dev('Количество кабин по моделям, спецтехника и фото парка: данные укажет клиент. Фото ниже иллюстративные, стоковые.')}</div></div>
`));
    m.push(workGallery());
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
    const hero = heroInner(page, { eyebrow: 'Поддержка', tail: 'об аренде и покупке туалетных кабин', lead: 'Ответы на частые вопросы об оплате, доставке, документах, обслуживании и покупке.' });
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
<div><dt class="label">Часы работы</dt><dd>${esc(C.hours.charAt(0).toUpperCase() + C.hours.slice(1))}<br><span class="small">Офис не работает в выходные: заявку можно оставить в любое время, ответим в ближайший рабочий день.</span></dd></div></dl>${dev('Все контакты, адрес и режим работы заполнит клиент.')}</div>
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

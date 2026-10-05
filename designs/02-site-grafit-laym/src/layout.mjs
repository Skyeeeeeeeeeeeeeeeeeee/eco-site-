// Каркас документа: head, шапка, меню, подвал, sticky-панель, JSON-LD.
import { ctx, esc, u, a, btn, tel, ic, NB, ctaBlock } from './lib.mjs';
import { crumbItems } from './pages.mjs';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const isCurrent = (page, href) => href.split('#')[0] === page.path;
const curAttr = (page, href) => (isCurrent(page, href) && !href.includes('#') ? ' aria-current="page"' : '');

function header(page) {
  const S = ctx.S, C = S.contacts;
  const top = `<div class="topbar"><div class="container topbar__in"><span>Новосибирск и область · ${esc(C.hours)}</span>
<span class="topbar__r"><a class="tel" href="${C.phoneHref}">${esc(C.phone).replace(/ /g, NB)}</a><a href="${C.telegramUrl}" rel="noopener">Telegram</a><a href="${C.whatsappUrl}" rel="noopener">WhatsApp</a><span class="topbar__zone">Нужна доставка? ${a('/dostavka/', 'Проверьте зону')}</span></span></div></div>`;
  const items = S.nav.main.map((n) => {
    if (!n.children) return `<li class="nav__item"><a class="nav__link" href="${u(n.href)}"${curAttr(page, n.href)}>${n.label}</a></li>`;
    const cur = n.children.some((c) => isCurrent(page, c.href) && !c.href.includes('#'));
    return `<li class="nav__item"><button class="nav__btn${cur ? ' is-current' : ''}" type="button" aria-expanded="false" aria-controls="dd-${n.id}">${n.label}<span class="i i--chevron" aria-hidden="true"></span></button><div class="nav__panel" id="dd-${n.id}"><ul>${n.children.map((c, i) => `<li><a href="${u(c.href)}"${curAttr(page, c.href)}><span class="label">${String(i + 1).padStart(2, '0')}</span>${c.label}</a></li>`).join('')}</ul></div></li>`;
  }).join('');
  const mob = S.nav.main.map((n) => {
    if (!n.children) return `<a href="${u(n.href)}"${curAttr(page, n.href)}>${n.label}</a>`;
    return `<div class="m-item"><button class="m-group" type="button" aria-expanded="false" aria-controls="m-${n.id}">${n.label}<span class="i i--chevron" aria-hidden="true"></span></button><div class="m-sub" id="m-${n.id}" hidden>${n.children.map((c) => `<a href="${u(c.href)}"${curAttr(page, c.href)}>${c.label}</a>`).join('')}</div></div>`;
  }).join('');
  return `<header class="site-header" id="top">${top}<div class="mainbar"><div class="container mainbar__in">
<a class="logo" href="${u('/')}" aria-label="${esc(S.company.name)}, на главную"><span class="logo__mark" aria-hidden="true"></span><span class="logo__t"><b>ЭКО СЕРВИС</b><small>НОВОСИБИРСК</small></span></a>
<nav class="nav" aria-label="Основная"><ul class="nav__list">${items}</ul></nav>
<div class="mainbar__r"><a class="btn btn--primary btn--sm nav__cta" href="${u('/ceny/')}">Рассчитать<span class="nav__cta-long">${NB}стоимость</span></a>
<a class="mainbar__tel" href="${C.phoneHref}" aria-label="Позвонить: ${esc(C.phone)}">${ic('phone')}</a>
<button class="burger" type="button" aria-expanded="false" aria-controls="m-menu"><span class="burger__t">Меню</span><span class="burger__ico" aria-hidden="true"></span></button></div></div></div>
<div class="m-menu" id="m-menu"><div class="m-menu__in"><nav aria-label="Мобильное меню">${mob}</nav><div class="m-menu__foot"><a class="btn btn--outline" href="${C.phoneHref}">${ic('phone')} ${esc(C.phone).replace(/ /g, NB)}</a><a class="btn btn--primary" href="${u('/ceny/')}">Рассчитать стоимость</a></div></div></div></header>`;
}

function footer() {
  const S = ctx.S, C = S.contacts, K = S.company;
  const col = (c) => `<div class="footer__col lg-3"><h2 class="label">${c.title}</h2><ul>${c.links.map((l) => `<li>${a(l.href, l.label)}</li>`).join('')}</ul></div>`;
  return `<div class="cookie" data-cookie hidden role="region" aria-label="Уведомление о cookie"><div class="container cookie__in"><p>Сайт использует файлы cookie для работы и статистики. ${a('/politika-konfidencialnosti/', 'Подробнее в политике')}.</p><button class="btn btn--outline btn--sm" type="button" data-cookie-ok>Понятно</button></div></div>
<footer class="site-footer on-dark"><div class="container"><div class="grid footer__grid">
<div class="footer__col footer__brand lg-3"><a class="logo" href="${u('/')}"><span class="logo__mark" aria-hidden="true"></span><span class="logo__t"><b>ЭКО СЕРВИС</b><small>НОВОСИБИРСК</small></span></a><p class="small">${esc(K.tagline)}</p><p class="small">${esc(K.legalName)}, ИНН${NB}${K.inn}</p></div>
${S.nav.footer.map(col).join('')}
<div class="footer__col lg-3"><h2 class="label">Контакты</h2><ul><li>${tel()}</li><li><a href="mailto:${C.email}">${esc(C.email)}</a></li><li><a href="${C.telegramUrl}" rel="noopener">Telegram</a></li><li><a href="${C.whatsappUrl}" rel="noopener">WhatsApp</a></li><li><span class="footer__txt">${esc(C.address)}</span></li><li><span class="footer__txt">${cap(esc(C.hours))}</span></li><li>${a('/o-kompanii/', 'О компании')}</li></ul></div></div>
<div class="site-footer__bottom"><span>© ${S.site.year} ${esc(K.name)}</span>${a('/politika-konfidencialnosti/', 'Политика обработки персональных данных')}${a('/o-kompanii/#rekvizity', 'Реквизиты')}</div></div></footer>`;
}

function sticky(page) {
  if (page.noSticky) return '';
  const C = ctx.S.contacts;
  return `<div class="sticky-cta" data-sticky role="region" aria-label="Быстрые действия"><a class="btn btn--outline" href="${C.phoneHref}">${ic('phone')} Позвонить</a><a class="btn btn--primary" href="${u(page.path === '/ceny/' ? '#calc' : '/ceny/')}">Рассчитать</a></div>`;
}

function jsonLd(page) {
  const S = ctx.S, C = S.contacts, K = S.company, dom = S.site.domain;
  const abs = (p) => dom + p;
  const out = [];
  if (page.path === '/' || page.path === '/kontakty/') {
    out.push({ '@context': 'https://schema.org', '@type': 'LocalBusiness', name: K.name, url: abs('/'), telephone: C.phoneE164, email: C.email, image: abs(S.site.ogImage),
      address: { '@type': 'PostalAddress', streetAddress: 'ул. Примерная, 1', addressLocality: 'Новосибирск', addressCountry: 'RU' },
      geo: { '@type': 'GeoCoordinates', latitude: C.geo.lat, longitude: C.geo.lon },
      openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: C.hoursSchema.days, opens: C.hoursSchema.opens, closes: C.hoursSchema.closes }],
      areaServed: 'Новосибирская область' });
  }
  if (page.path !== '/' && page.template !== 'notfound') {
    out.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbItems(page).map(([h, t], i) => Object.assign({ '@type': 'ListItem', position: i + 1, name: t }, h ? { item: abs(h) } : {})) });
  }
  if (page.template === 'model') {
    const m = S.modelById(page.model), rent = m.kind === 'rent';
    const offer = rent
      ? { '@type': 'Offer', priceCurrency: 'RUB', price: S.modelFromPrice(m), availability: 'https://schema.org/InStock', url: abs(page.path),
          priceSpecification: { '@type': 'UnitPriceSpecification', price: S.modelFromPrice(m), priceCurrency: 'RUB', unitCode: 'DAY', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'DAY' } } }
      : { '@type': 'Offer', priceCurrency: 'RUB', price: S.terms.peatPrice, availability: 'https://schema.org/InStock', url: abs(page.path) };
    out.push({ '@context': 'https://schema.org', '@type': 'Product', name: m.name, description: m.purpose, sku: m.sku, brand: { '@type': 'Brand', name: K.short }, offers: offer });
  }
  const faq = [...new Map((ctx.faqUsed || []).map((f) => [f.id, f])).values()];
  if (faq.length && ['home', 'voprosy'].includes(page.template)) {
    out.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  }
  return out.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
}

export function layout(page, main) {
  const S = ctx.S, dom = S.site.domain;
  const canon = dom + (page.path === '/404.html' ? '' : page.path);
  const title = esc(page.title), desc = esc(page.description);
  const og = page.index === false ? '' : `<meta property="og:type" content="website"><meta property="og:locale" content="${S.site.locale}"><meta property="og:site_name" content="${esc(S.company.name)}"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:url" content="${canon}"><meta property="og:image" content="${dom}${S.site.ogImage}">`;
  const head = `<!doctype html>
<html lang="ru" data-base="${esc(ctx.base)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
${page.index === false ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="${canon}">`}
${og}
<meta name="theme-color" content="#12171A">
<link rel="icon" href="${u('/img/favicon.svg')}" type="image/svg+xml">
<link rel="preload" as="font" type="font/woff2" crossorigin href="${u('/fonts/plex-sans-var-cyrillic.woff2')}">
<link rel="preload" as="font" type="font/woff2" crossorigin href="${u('/fonts/plex-sans-var-latin.woff2')}">
<link rel="stylesheet" href="${u('/css/main.css')}">
<noscript><style>.js-only,[data-cookie]{display:none!important}.site-header{position:static}.burger{display:none}.m-menu{position:static;visibility:visible;opacity:1;transform:none;overflow:visible;padding:0}.m-sub[hidden]{display:block!important}.m-group .i{display:none}.nav__item:hover .nav__panel,.nav__item:focus-within .nav__panel{opacity:1;visibility:visible;transform:none}form[data-form]{display:none}.sticky-cta{display:none!important}</style></noscript>
<script defer src="${u('/js/content.js')}"></script>
<script defer src="${u('/js/calc.js')}"></script>
<script defer src="${u('/js/main.js')}"></script>
${jsonLd(page)}
</head>`;
  const flag = ctx.production ? '' : '';
  const body = `<body${page.noSticky ? '' : ' class="has-sticky"'}>
<a class="skip" href="#main">Перейти к содержимому</a>
${header(page)}
<main id="main" tabindex="-1">
${main}
${page.noCta ? '' : ctaBlock()}
</main>
${footer()}
${sticky(page)}
</body>
</html>
`;
  return head + '\n' + body + flag;
}

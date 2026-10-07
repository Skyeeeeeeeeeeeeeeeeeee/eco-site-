// Каркас документа: head, шапка, меню, подвал, sticky-панель, JSON-LD.
import { ctx, esc, u, a, btn, tel, ic, NB, ctaBlock } from './lib.mjs';
import { crumbItems } from './pages.mjs';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const isCurrent = (page, href) => href.split('#')[0] === page.path;
const curAttr = (page, href) => (isCurrent(page, href) && !href.includes('#') ? ' aria-current="page"' : '');
const chevron = '<svg class="chev" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const logo = (S) => `<a class="logo" href="${u('/')}" aria-label="${esc(S.company.name)}, на главную"><span class="logo__mark" aria-hidden="true"><svg width="12" height="16" viewBox="0 0 12 16"><rect width="12" height="16" rx="1.5" fill="var(--logo-fg)"/><rect x="2.5" y="4" width="7" height="10" fill="var(--logo-bg)"/></svg></span><span class="logo__t">эко сервис</span></a>`;

function header(page) {
  const S = ctx.S, C = S.contacts;
  const items = S.nav.main.map((n) => {
    if (!n.children) return `<li class="nav__item"><a class="nav__link" href="${u(n.href)}"${curAttr(page, n.href)}>${n.label}</a></li>`;
    const cur = n.children.some((c) => isCurrent(page, c.href) && !c.href.includes('#'));
    return `<li class="nav__item"><button class="nav__btn${cur ? ' is-current' : ''}" type="button" aria-expanded="false" aria-controls="dd-${n.id}">${n.label}${chevron}</button><div class="nav__panel" id="dd-${n.id}"><ul>${n.children.map((c) => `<li><a href="${u(c.href)}"${curAttr(page, c.href)}>${c.label}</a></li>`).join('')}</ul></div></li>`;
  }).join('');
  const mob = S.nav.main.map((n) => {
    if (!n.children) return `<a href="${u(n.href)}"${curAttr(page, n.href)}>${n.label}</a>`;
    return `<div class="m-item"><button class="m-group" type="button" aria-expanded="false" aria-controls="m-${n.id}">${n.label}${chevron}</button><div class="m-sub" id="m-${n.id}" hidden>${n.children.map((c) => `<a href="${u(c.href)}"${curAttr(page, c.href)}>${c.label}</a>`).join('')}</div></div>`;
  }).join('');
  return `<header class="site-header" id="top"><div class="mainbar"><div class="container mainbar__in">
${logo(S)}
<nav class="nav" aria-label="Основная"><ul class="nav__list">${items}</ul></nav>
<div class="mainbar__r"><a class="mainbar__tel tel" href="${C.phoneHref}">${esc(C.phone).replace(/ /g, NB)}</a><a class="btn btn--primary btn--sm nav__cta" href="${u('/ceny/')}">Рассчитать</a>
<a class="icon-btn mainbar__ico" href="${C.phoneHref}" aria-label="Позвонить: ${esc(C.phone)}">${ic('phone')}</a>
<button class="burger" type="button" aria-expanded="false" aria-controls="m-menu" aria-label="Меню"><span class="burger__ico" aria-hidden="true"></span></button></div></div></div>
<div class="m-menu" id="m-menu"><div class="m-menu__in container"><nav aria-label="Мобильное меню">${mob}</nav><div class="m-menu__foot"><a class="btn btn--outline" href="${C.phoneHref}">${ic('phone')} ${esc(C.phone).replace(/ /g, NB)}</a><a class="btn btn--primary" href="${u('/ceny/')}">Рассчитать стоимость</a></div></div></div></header>`;
}

function footer() {
  const S = ctx.S, C = S.contacts, K = S.company;
  const col = (c) => `<div class="footer__col"><h2 class="footer__h">${c.title}</h2><ul>${c.links.map((l) => `<li>${a(l.href, l.label)}</li>`).join('')}</ul></div>`;
  return `<footer class="site-footer"><div class="container"><div class="footer__grid">
<div class="footer__col footer__brand">${logo(S)}<p class="footer__d">${esc(K.tagline)}</p><p class="footer__d">${esc(K.legalName)}, ИНН${NB}${K.inn}</p></div>
<nav class="footer__nav" aria-label="Подвал">${S.nav.footer.map(col).join('')}</nav>
<div class="footer__col"><h2 class="footer__h">Контакты</h2><ul><li>${tel()}</li><li><a href="mailto:${C.email}">${esc(C.email)}</a></li><li><a href="${C.telegramUrl}" rel="noopener">Telegram</a></li><li><a href="${C.whatsappUrl}" rel="noopener">WhatsApp</a></li><li><span class="footer__txt">${esc(C.address)}</span></li><li><span class="footer__txt">${cap(esc(C.hours))}</span></li><li>${a('/o-kompanii/', 'О компании')}</li></ul></div></div>
<div class="site-footer__bottom"><span>© ${S.site.year} ${esc(K.name)}</span>${a('/politika-konfidencialnosti/', 'Политика обработки персональных данных')}${a('/o-kompanii/#rekvizity', 'Реквизиты')}${a('/o-kompanii/#istochniki-foto', 'Источники фото')}</div></div></footer>`;
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
    const m = S.modelById(page.model), offers = [];
    if (m.rent) { const p = S.modelFromPrice(m); offers.push({ '@type': 'Offer', name: 'Аренда', priceCurrency: 'RUB', price: p, availability: 'https://schema.org/InStock', url: abs(page.path),
      priceSpecification: { '@type': 'UnitPriceSpecification', price: p, priceCurrency: 'RUB', unitCode: 'DAY', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'DAY' } } }); }
    if (m.sale) offers.push({ '@type': 'Offer', name: 'Продажа', priceCurrency: 'RUB', price: S.saleFrom(m), availability: 'https://schema.org/InStock', url: abs(page.path) });
    out.push({ '@context': 'https://schema.org', '@type': 'Product', name: m.name, description: m.purpose, brand: { '@type': 'Brand', name: K.short }, offers });
  }
  const faq = [...new Map((ctx.faqUsed || []).map((f) => [f.id, f])).values()];
  if (faq.length && ['home', 'voprosy'].includes(page.template)) {
    out.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  }
  return out.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
}

export function layout(page, main, sprite) {
  const S = ctx.S, dom = S.site.domain;
  const canon = dom + (page.path === '/404.html' ? '' : page.path);
  const title = esc(page.title), desc = esc(page.description);
  const og = page.index === false ? '' : `<meta property="og:type" content="website"><meta property="og:locale" content="${S.site.locale}"><meta property="og:site_name" content="${esc(S.company.name)}"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:url" content="${canon}"><meta property="og:image" content="${dom}${S.site.ogImage}">`;
  const head = `<!doctype html>
<html lang="ru" data-theme="${ctx.theme}" data-base="${esc(ctx.prefix.replace(/\/$/, ''))}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.className+=" js"</script>
<title>${title}</title>
<meta name="description" content="${desc}">
${page.index === false ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="${canon}">`}
${og}
<meta name="theme-color" content="${ctx.theme === 'e' ? '#CFE4F8' : '#FFFFFF'}">
<link rel="icon" href="${u('/img/favicon.svg')}" type="image/svg+xml">
<link rel="stylesheet" href="${u('/css/main.css')}">
<noscript><style>.js-only{display:none!important}.site-header{position:static}.burger{display:none}.m-menu{position:static;visibility:visible;opacity:1;transform:none;overflow:visible;padding:0;border:0}.m-sub[hidden]{display:block!important}.m-group .chev{display:none}.nav__panel{transition:none}.nav__item:hover .nav__panel,.nav__item:focus-within .nav__panel{opacity:1;visibility:visible;transform:none}form[data-form]{display:none}.sticky-cta{display:none!important}.mq__t{animation:none}.live{display:none}.offer__seg{display:none}</style></noscript>
<script defer src="${u('/js/content.js')}"></script>
<script defer src="${u('/js/calc.js')}"></script>
<script defer src="${u('/js/main.js')}"></script>
<script defer src="${u('/js/life.js')}"></script>
${jsonLd(page)}
</head>`;
  const body = `<body${page.noSticky ? '' : ' class="has-sticky"'}>
${sprite}
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
  return head + '\n' + body;
}

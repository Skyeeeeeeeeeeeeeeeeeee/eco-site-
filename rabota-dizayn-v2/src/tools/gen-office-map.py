import xml.etree.ElementTree as ET, math, json, sys
src, out = sys.argv[1], sys.argv[2]
LAT0, LON0 = 55.0490, 82.9123          # офис (ул. Советская, 64/1)
W, H, M_PX = 800, 500, 0.62            # px на метр: окно ~1290 × 806 м
KX = 111320 * math.cos(math.radians(LAT0)); KY = 110540
def P(lat, lon): return ((lon - LON0) * KX * M_PX + W / 2, H / 2 - (lat - LAT0) * KY * M_PX)
r = ET.parse(src).getroot()
nodes = {n.get('id'): (float(n.get('lat')), float(n.get('lon'))) for n in r.iter('node')}
def dp(pts, eps):
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]; L = math.hypot(x2 - x1, y2 - y1)
    best, idx = 0, 0
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        d = abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / L if L > 1e-9 else math.hypot(x - x1, y - y1)
        if d > best: best, idx = d, i
    if best > eps: return dp(pts[:idx + 1], eps)[:-1] + dp(pts[idx:], eps)
    return [pts[0], pts[-1]]
def path(pts, close=False):
    return 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + (' Z' if close else '')
def inside(pts, m=60): return any(-m < x < W + m and -m < y < H + m for x, y in pts)
roads = {k: [] for k in ['major', 'minor', 'ped']}; bld = []; park = []; rail = []; labels = {}; office = []; sov = []
CLS = {'trunk': 'major', 'primary': 'major', 'secondary': 'major', 'tertiary': 'minor', 'residential': 'minor', 'unclassified': 'minor', 'living_street': 'minor', 'pedestrian': 'ped'}
for w in r.iter('way'):
    t = {x.get('k'): x.get('v') for x in w.iter('tag')}
    pts = [P(*nodes[n.get('ref')]) for n in w.iter('nd') if n.get('ref') in nodes]
    if len(pts) < 2 or not inside(pts): continue
    hw = t.get('highway')
    if t.get('addr:street', '').startswith('Советская') and t.get('addr:housenumber') == '64/1': office.append(path(pts, True))
    if t.get('name') == 'Советская улица': sov.extend(p for p in pts if 0 < p[0] < W and 0 < p[1] < H)
    if hw in CLS and t.get('area') != 'yes':
        roads[CLS[hw]].append(path(dp(pts, 0.8)))
        nm = t.get('name')
        if nm and CLS[hw] != 'ped':
            L = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:]))
            labels.setdefault(nm, []).append((L, pts, CLS[hw]))
    elif 'building' in t and len(pts) > 3: bld.append(path(dp(pts, 0.6), True))
    elif t.get('leisure') in ('park', 'garden') or t.get('landuse') in ('grass',) or t.get('place') == 'square' and len(pts) > 3: park.append(path(dp(pts, 0.8), True))
    elif t.get('railway') == 'rail' and 'service' not in t: rail.append(path(dp(pts, 0.8)))
# подписи: по одной на улицу, на самом длинном видимом отрезке
lab = []
for nm, segs in labels.items():
    best = None
    for L, pts, cls in segs:
        for a, b in zip(pts, pts[1:]):
            l = math.hypot(b[0] - a[0], b[1] - a[1]); mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
            if 40 < mx < W - 40 and 30 < my < H - 30 and math.hypot(mx - W / 2, my - H / 2) > 34 and (best is None or l > best[0]): best = (l, a, b, cls)
    if best and best[0] > 44:
        l, a, b, cls = best; ang = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
        if ang > 90: ang -= 180
        if ang < -90: ang += 180
        lab.append(dict(t=nm.replace('улица', 'ул.').replace('проспект', 'пр.'), x=round((a[0] + b[0]) / 2, 1), y=round((a[1] + b[1]) / 2, 1), a=round(ang, 1), major=cls == 'major'))
if sov:
    sov.sort(key=lambda p: p[1]); a, b = sov[0], sov[-1]
    mx, my = (a[0] + b[0]) / 2, max((a[1] + b[1]) / 2, 330); ang = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0])); ang = ang - 180 if ang > 90 else ang
    lab = [x for x in lab if 'Советская' not in x['t']] + [dict(t='ул. Советская', x=round(mx - 12, 1), y=round(my, 1), a=round(ang, 1), major=True)]
def esc(x): return x.replace('&','&amp;').replace('<','&lt;')
g = lambda cls, arr: f'<g class="{cls}">' + ''.join(f'<path d="{d}"/>' for d in arr) + '</g>'
css = """
.bg{fill:#EEF3F8}.park path{fill:#D8EBD3}.bld path{fill:#DCE3EB;stroke:#CBD5E0;stroke-width:.6}
.rail path{fill:none;stroke:#9AA8B6;stroke-width:2.2;stroke-dasharray:7 5}
.cas path{fill:none;stroke:#C7D2DE;stroke-linecap:round;stroke-linejoin:round}
.major path{fill:none;stroke:#fff;stroke-width:9;stroke-linecap:round;stroke-linejoin:round}
.minor path{fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.ped path{fill:none;stroke:#fff;stroke-width:4;stroke-dasharray:2 4;stroke-linecap:round}
text{font-family:Onest,Arial,sans-serif;fill:#3E5A78;font-size:12px;paint-order:stroke;stroke:#EEF3F8;stroke-width:4px;stroke-linejoin:round}
.lmaj{font-size:13px;font-weight:600;fill:#13263A}
"""
cas = '<g class="cas">' + ''.join(f'<path d="{d}" style="stroke-width:11"/>' for d in roads['major']) + ''.join(f'<path d="{d}" style="stroke-width:7"/>' for d in roads['minor']) + '</g>'
texts = ''.join(f'<text class="{"lmaj" if x["major"] else ""}" x="{x["x"]}" y="{x["y"]}" text-anchor="middle" dominant-baseline="middle" transform="rotate({x["a"]} {x["x"]} {x["y"]})">{esc(x["t"])}</text>' for x in lab)
pin = f'<g transform="translate({W/2} {H/2})"><circle r="26" fill="#0C1B2A" opacity=".10"/><path d="M0 0 C-4 -9 -15 -15 -15 -27 A15 15 0 1 1 15 -27 C15 -15 4 -9 0 0 Z" fill="#0C1B2A"/><circle cy="-27" r="6" fill="#9CC9F5"/></g>'
offb = ''.join(f'<path d="{d}" fill="#9CC9F5" stroke="#0C1B2A" stroke-width="1.5"/>' for d in office)
call = f'<g transform="translate({W/2+22} {H/2-58})"><rect width="178" height="44" rx="10" fill="#0C1B2A"/><text x="12" y="17" style="fill:#fff;stroke:none;font-size:13px;font-weight:600">ЭКО СЕРВИС, офис 553</text><text x="12" y="34" style="fill:#B9D7F4;stroke:none;font-size:12px">Советская, 64/1, 5 этаж</text></g>'
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><style>{css}</style><rect class="bg" width="{W}" height="{H}"/>{g("park", park)}{g("bld", bld)}{g("rail", rail)}{cas}{g("minor", roads["minor"])}{g("major", roads["major"])}{g("ped", roads["ped"])}{texts}{offb}{pin}{call}</svg>'
open(out, 'w').write(svg)
print(len(svg), [x['t'] for x in lab])

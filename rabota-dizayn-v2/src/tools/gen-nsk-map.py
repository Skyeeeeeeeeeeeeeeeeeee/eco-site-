import json, math, sys
D=sys.argv[1]; OUT=sys.argv[2]
# Кадр: квадрат 80x80 км вокруг склада-заглушки
LAT0, LON0 = 55.00, 82.95          # склад (ЗАГЛУШКА)
KM=6.25                            # px на км, кадр 500px = 80 км
KLAT=111.2; KLON=111.2*math.cos(math.radians(LAT0))
def P(lon,lat): return (250+(lon-LON0)*KLON*KM, 250-(lat-LAT0)*KLAT*KM)
def dp(pts,eps):
    if len(pts)<3: return pts
    (x1,y1),(x2,y2)=pts[0],pts[-1]; dx,dy=x2-x1,y2-y1; L=math.hypot(dx,dy)
    i,dm=0,0
    for k in range(1,len(pts)-1):
        x,y=pts[k]; d=abs(dy*x-dx*y+x2*y1-y2*x1)/L if L>1e-6 else math.hypot(x-x1,y-y1)
        if d>dm: i,dm=k,d
    if dm>eps: return dp(pts[:i+1],eps)[:-1]+dp(pts[i:],eps)
    return [pts[0],pts[-1]]
def path(pts,close=False):
    s='M'+' L'.join(f'{x:.1f} {y:.1f}' for x,y in pts)
    return s+('Z' if close else '')
def inside(pts,m=120): return any(-m<x<500+m and -m<y<500+m for x,y in pts)
# Река
r=json.load(open(D+'/river.json'))
river=[]
for w in r['elements']:
    pts=[P(g['lon'],g['lat']) for g in w['geometry']]
    if inside(pts): river.append(path(dp(pts,0.7)))
# Водохранилище: склейка outer-путей в кольца
res=json.load(open(D+'/res.json'))
segs=[]
for rel in res['elements']:
    for m in rel.get('members',[]):
        if m.get('role')=='outer' and m.get('geometry'):
            segs.append([(g['lon'],g['lat']) for g in m['geometry']])
rings=[]
while segs:
    ring=segs.pop(0)
    changed=True
    while changed and ring[0]!=ring[-1]:
        changed=False
        for i,s in enumerate(segs):
            if s[0]==ring[-1]: ring+=s[1:]
            elif s[-1]==ring[-1]: ring+=s[::-1][1:]
            elif s[-1]==ring[0]: ring=s[:-1]+ring
            elif s[0]==ring[0]: ring=s[::-1][:-1]+ring
            else: continue
            segs.pop(i); changed=True; break
    rings.append(ring)
resv=[]
for ring in rings:
    pts=[P(*q) for q in ring]
    if len(pts)>20 and inside(pts,300): resv.append(path(dp(pts,1.3),True))
# Город
c=json.load(open(D+'/city_nom.json'))[0]['geojson']
polys=c['coordinates'] if c['type']=='MultiPolygon' else [c['coordinates']]
city=[]
for poly in polys:
    pts=[P(lon,lat) for lon,lat in poly[0]]
    if len(pts)>8: city.append(path(dp(pts,0.8),True))
towns={'Бердск':(83.107,54.758),'Обь':(82.700,55.000),'Кольцово':(83.185,54.940),'Краснообск':(82.990,54.920),'Академгородок':(83.105,54.850),'Колывань':(82.745,55.307),'Толмачёво':(82.650,55.012)}
T={k:[round(v,1) for v in P(*ll)] for k,ll in towns.items()}
centre=[round(v,1) for v in P(82.920,55.030)]
data=dict(river=river,reservoir=resv,city=city,towns=T,centre=centre,r30=round(30*KM,1),kmpx=KM,
          note='Источник геометрии: © участники OpenStreetMap (ODbL). Упрощено.')
json.dump(data,open(OUT,'w'),ensure_ascii=False)
print('river',len(river),'resv',len(resv),'city',len(city),'bytes',len(json.dumps(data)))
print(T, centre)

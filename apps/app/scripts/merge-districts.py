# Quita de features/map/data/cities.json los "barrios" que GeoNames trae como ciudades
# (Retiro, Chamberí, Eixample, Shinjuku...): una ciudad a menos de RADIUS_KM de otra del mismo
# país al menos RATIO veces más poblada se funde con ella. Se recorre de mayor a menor población.
# Uso: python3 -I scripts/merge-districts.py features/map/data/cities.json
import json, math, sys

RADIUS_KM = 7
RATIO = 4
path = sys.argv[1]
data = json.load(open(path))
rows = sorted(data['rows'], key=lambda r: -r[5])

def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, [a[3], a[4], b[3], b[4]])
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))

grid = {}
kept = []
for r in rows:
    cell = (round(r[3] * 10), round(r[4] * 10))
    near = [o for dx in range(-1, 2) for dy in range(-1, 2) for o in grid.get((cell[0] + dx, cell[1] + dy), [])]
    if any(o[2] == r[2] and o[5] >= RATIO * r[5] and km(r, o) <= RADIUS_KM for o in near):
        continue
    kept.append(r)
    grid.setdefault(cell, []).append(r)
order = {r[0]: i for i, r in enumerate(data['rows'])}
kept.sort(key=lambda r: order[r[0]])
print(len(data['rows']), '->', len(kept))
data['rows'] = kept
with open(path, 'w') as f:
    f.write('{\n')
    f.write('  "source": ' + json.dumps(data['source'], ensure_ascii=False) + ',\n')
    f.write('  "fields": ' + json.dumps(data['fields']) + ',\n')
    f.write('  "rows": [\n' + ',\n'.join('    ' + json.dumps(r, ensure_ascii=False) for r in kept) + '\n  ]\n}\n')

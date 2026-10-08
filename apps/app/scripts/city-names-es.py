# Genera features/map/data/cities-es.json: nombres en español de ciudades de GeoNames.
# Fuentes: exónimos de CLDR (cldr-dates-full, licencia Unicode) y una lista curada.
# Uso: python3 -I scripts/city-names-es.py features/map/data/cities.json features/map/data/cities-es.json <cldr-dates-full>/main
import json, sys
CITIES = sys.argv[1]; OUT = sys.argv[2]; CLDR = sys.argv[3]
rows = json.load(open(CITIES))['rows']
# (nombre en GeoNames, país) -> nombre en español
CURATED = """
Munich,DE,Múnich|Köln,DE,Colonia|Nürnberg,DE,Núremberg|Frankfurt am Main,DE,Fráncfort|Aachen,DE,Aquisgrán|Dresden,DE,Dresde|Berlin,DE,Berlín|Hamburg,DE,Hamburgo|Hannover,DE,Hanóver|Mainz,DE,Maguncia|Trier,DE,Tréveris|Regensburg,DE,Ratisbona|Freiburg,DE,Friburgo|Heidelberg,DE,Heidelberg|Lübeck,DE,Lübeck|Bremen,DE,Bremen|Cadiz,ES,Cádiz|Göteborg,SE,Gotemburgo|Odessa,UA,Odesa|Gasteiz / Vitoria,ES,Vitoria|St. Louis,US,San Luis|Fès al Bali,MA,Fez
Vienna,AT,Viena|Salzburg,AT,Salzburgo|Innsbruck,AT,Innsbruck
Prague,CZ,Praga|Brno,CZ,Brno
Rome,IT,Roma|Florence,IT,Florencia|Venice,IT,Venecia|Milan,IT,Milán|Naples,IT,Nápoles|Turin,IT,Turín|Genoa,IT,Génova|Padova,IT,Padua|Padua,IT,Padua|Syracuse,IT,Siracusa|Siracusa,IT,Siracusa|Bergamo,IT,Bérgamo|Bologna,IT,Bolonia|Mantova,IT,Mantua|Sorrento,IT,Sorrento|Catania,IT,Catania|Bari,IT,Bari|Trieste,IT,Trieste|Livorno,IT,Livorno|Lucca,IT,Luca|Ferrara,IT,Ferrara|Ravenna,IT,Rávena|Modena,IT,Módena|Parma,IT,Parma|Perugia,IT,Perusa|Assisi,IT,Asís|Brescia,IT,Brescia
Lisbon,PT,Lisboa|Porto,PT,Oporto|Braga,PT,Braga|Coimbra,PT,Coímbra
Moscow,RU,Moscú|Saint Petersburg,RU,San Petersburgo|Kazan,RU,Kazán
Warsaw,PL,Varsovia|Kraków,PL,Cracovia|Wrocław,PL,Breslavia|Gdańsk,PL,Gdansk|Poznań,PL,Poznan
Copenhagen,DK,Copenhague|Stockholm,SE,Estocolmo|Gothenburg,SE,Gotemburgo|Oslo,NO,Oslo|Bergen,NO,Bergen|Helsinki,FI,Helsinki|Reykjavík,IS,Reikiavik|Reykjavik,IS,Reikiavik
London,GB,Londres|Edinburgh,GB,Edimburgo|Cardiff,GB,Cardiff|Plymouth,GB,Plymouth|Canterbury,GB,Canterbury|Dublin,IE,Dublín|Cork,IE,Cork
Brussels,BE,Bruselas|Antwerpen,BE,Amberes|Antwerp,BE,Amberes|Brugge,BE,Brujas|Bruges,BE,Brujas|Gent,BE,Gante|Ghent,BE,Gante|Leuven,BE,Lovaina|Liège,BE,Lieja
The Hague,NL,La Haya|Den Haag,NL,La Haya|Amsterdam,NL,Ámsterdam|Rotterdam,NL,Róterdam|Utrecht,NL,Utrecht|Maastricht,NL,Maastricht
Basel,CH,Basilea|Bern,CH,Berna|Luzern,CH,Lucerna|Genève,CH,Ginebra|Zürich,CH,Zúrich|Lausanne,CH,Lausana
Paris,FR,París|Lyon,FR,Lyon|Marseille,FR,Marsella|Bordeaux,FR,Burdeos|Strasbourg,FR,Estrasburgo|Toulouse,FR,Toulouse|Avignon,FR,Aviñón|Nice,FR,Niza|Nantes,FR,Nantes|Rouen,FR,Ruan|Lille,FR,Lille|Montpellier,FR,Montpellier|Perpignan,FR,Perpiñán|Bayonne,FR,Bayona|Biarritz,FR,Biarritz|Reims,FR,Reims|Versailles,FR,Versalles|Cannes,FR,Cannes|Carcassonne,FR,Carcasona
Monaco,MC,Mónaco|Luxembourg,LU,Luxemburgo|Andorra la Vella,AD,Andorra la Vieja
Athens,GR,Atenas|Thessaloníki,GR,Tesalónica|Thessaloniki,GR,Tesalónica|Rhodes,GR,Rodas
Istanbul,TR,Estambul|Ankara,TR,Ankara|Izmir,TR,Esmirna|İzmir,TR,Esmirna|Antalya,TR,Antalya
Belgrade,RS,Belgrado|Bucharest,RO,Bucarest|Sofia,BG,Sofía|Ljubljana,SI,Liubliana|Zagreb,HR,Zagreb|Split,HR,Split|Dubrovnik,HR,Dubrovnik|Sarajevo,BA,Sarajevo|Budapest,HU,Budapest|Bratislava,SK,Bratislava|Vilnius,LT,Vilna|Riga,LV,Riga|Tallinn,EE,Tallin|Kyiv,UA,Kiev|Lviv,UA,Leópolis|Odesa,UA,Odesa|Minsk,BY,Minsk|Chisinau,MD,Chisináu|Tirana,AL,Tirana|Skopje,MK,Skopie|Valletta,MT,La Valeta|Nicosia,CY,Nicosia
Seville,ES,Sevilla|Saragossa,ES,Zaragoza|A Coruña,ES,La Coruña|Donostia / San Sebastián,ES,San Sebastián|Vitoria-Gasteiz,ES,Vitoria|Palma,ES,Palma de Mallorca|Las Palmas de Gran Canaria,ES,Las Palmas de Gran Canaria|Gijón,ES,Gijón|Ourense,ES,Orense|Lleida,ES,Lérida|Girona,ES,Gerona|Alacant,ES,Alicante|Castelló de la Plana,ES,Castellón de la Plana|Elx,ES,Elche|Iruña,ES,Pamplona
Kyoto,JP,Kioto|Tokyo,JP,Tokio|Kobe,JP,Kobe|Sapporo,JP,Sapporo|Hiroshima,JP,Hiroshima|Nagasaki,JP,Nagasaki|Osaka,JP,Osaka|Nara,JP,Nara
Seoul,KR,Seúl|Busan,KR,Busán
Beijing,CN,Pekín|Shanghai,CN,Shanghái|Guangzhou,CN,Cantón|Nanjing,CN,Nankín|Xi'an,CN,Xi'an|Hangzhou,CN,Hangzhou|Shenzhen,CN,Shenzhen|Chongqing,CN,Chongqing|Hong Kong,HK,Hong Kong|Macau,MO,Macao|Taipei,TW,Taipéi
Mumbai,IN,Bombay|Kolkata,IN,Calcuta|Chennai,IN,Madrás|New Delhi,IN,Nueva Delhi|Bengaluru,IN,Bangalore|Varanasi,IN,Benarés|Kathmandu,NP,Katmandú
Singapore,SG,Singapur|Hanoi,VN,Hanói|Ho Chi Minh City,VN,Ciudad Ho Chi Minh|Bangkok,TH,Bangkok|Phnom Penh,KH,Nom Pen|Jakarta,ID,Yakarta|Manila,PH,Manila|Kuala Lumpur,MY,Kuala Lumpur
Sydney,AU,Sídney|Cape Town,ZA,Ciudad del Cabo|Johannesburg,ZA,Johannesburgo
Marrakesh,MA,Marrakech|Fes,MA,Fez|Fès,MA,Fez|Tangier,MA,Tánger|Tétouan,MA,Tetuán|Meknès,MA,Mequinez|Algiers,DZ,Argel|Tunis,TN,Túnez|Cairo,EG,El Cairo|Alexandria,EG,Alejandría|Luxor,EG,Lúxor|Asuán,EG,Asuán|Aswan,EG,Asuán
Damascus,SY,Damasco|Beirut,LB,Beirut|Mecca,SA,La Meca|Riyadh,SA,Riad|Medina,SA,Medina|Abu Dhabi,AE,Abu Dabi|Kabul,AF,Kabul|Jerusalem,IL,Jerusalén|Tel Aviv,IL,Tel Aviv|Petra,JO,Petra
New York City,US,Nueva York|Philadelphia,US,Filadelfia|New Orleans,US,Nueva Orleans|Los Angeles,US,Los Ángeles|San Francisco,US,San Francisco|Washington,US,Washington|Saint Louis,US,San Luis|San Antonio,US,San Antonio|Montreal,CA,Montreal|Montréal,CA,Montreal|Québec,CA,Quebec|Quebec,CA,Quebec
Havana,CU,La Habana|Panama City,PA,Ciudad de Panamá|Panamá,PA,Ciudad de Panamá|Mexico City,MX,Ciudad de México|Guatemala City,GT,Ciudad de Guatemala|Cusco,PE,Cuzco|Bogotá,CO,Bogotá|Rio de Janeiro,BR,Río de Janeiro|São Paulo,BR,São Paulo|Brasília,BR,Brasilia|Asunción,PY,Asunción
"""
pairs = {}
for line in CURATED.strip().splitlines():
    for item in line.split('|'):
        name, cc, es = item.split(',')
        pairs[(name, cc)] = es
# CLDR: nombre inglés -> español (solo nombres que cambian), aplicado a la ciudad más poblada con ese nombre.
z = json.load(open(CLDR + '/es/timeZoneNames.json'))['main']['es']['dates']['timeZoneNames']['zone']
ze = json.load(open(CLDR + '/en/timeZoneNames.json'))['main']['en']['dates']['timeZoneNames']['zone']
cldr = {}
def walk(a, b, key):
    for k, v in a.items():
        bb = b.get(k, {}) if isinstance(b, dict) else {}
        if isinstance(v, dict) and 'exemplarCity' in v:
            en = (bb or {}).get('exemplarCity') or k.replace('_', ' ')
            if en != v['exemplarCity'] and '(' not in v['exemplarCity']:
                cldr[en] = v['exemplarCity']
        elif isinstance(v, dict):
            walk(v, bb, k)
walk(z, ze, '')
out = {}
best = {}
for r in rows:
    cid, name, cc, lat, lng, pop = r
    if (name, cc) in pairs:
        out[cid] = pairs[(name, cc)]
    elif name in cldr and (name not in best or best[name][1] < pop):
        best[name] = (cid, pop)
for name, (cid, pop) in best.items():
    out.setdefault(cid, cldr[name])
out = {k: v for k, v in out.items() if v != next(r[1] for r in rows if r[0] == k)}
json.dump(dict(sorted(out.items(), key=lambda kv: int(kv[0]))), open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
missing = [k for k in pairs if not any(r[1] == k[0] and r[2] == k[1] for r in rows)]
print(len(out), 'nombres; sin encontrar:', missing[:200])

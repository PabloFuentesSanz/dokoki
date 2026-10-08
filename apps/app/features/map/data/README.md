# Datos geográficos (en el dispositivo, sin red)

| Archivo          | Qué es                                                                             | Fuente y licencia                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `countries.json` | 237 países: código ISO 3166-1 alfa-2, nombre en español, continente                | [Natural Earth](https://www.naturalearthdata.com/) 1:50m admin-0, dominio público                               |
| `regions.json`   | 4.501 regiones (prefecturas, provincias, estados): id ISO 3166-2, país, nombre     | Natural Earth 1:10m admin-1, dominio público                                                                    |
| `cities-es.json` | ~225 nombres en español por id de ciudad (Kioto, Múnich, Nueva York…)              | Exónimos de [CLDR](https://cldr.unicode.org/) (licencia Unicode) y lista curada                                 |
| `cities.json`    | ~22.600 ciudades de 15.000 habitantes o más: id, nombre, país, lat, lng, población | [GeoNames](https://www.geonames.org/) vía `all-the-cities`, **CC BY 4.0: hay que citar a GeoNames en Créditos** |

Cómo se generaron:

- Países: `ne_50m_admin_0_countries`, filtrado a `{id, level, name, continent}` (Somalilandia → SO,
  Chipre del Norte → CY) y `mapshaper -simplify 20% keep-shapes -dissolve id -o precision=0.001`.
- Regiones: `ne_10m_admin_1_states_provinces`, id = `iso_3166_2` (o `adm1_code` si falta),
  `mapshaper -simplify 5% keep-shapes -dissolve id copy-fields=country,name -o precision=0.001`.
- Ciudades: `all-the-cities` filtrado a población ≥ 15.000, coordenadas a 3 decimales, sin el
  sufijo `-shi`/`-ku` en Japón. Después `scripts/merge-districts.py` funde los barrios que
  GeoNames trae como ciudades (Retiro, Eixample, Shinjuku…) con su ciudad: a menos de 7 km de
  otra del mismo país 4 veces más poblada.
- Nombres en español: `scripts/city-names-es.py` (CLDR `cldr-dates-full` + lista curada). La
  búsqueda acepta los dos nombres ("Kioto" y "Kyoto").

Si cambian estos archivos, sube `PLACES_VERSION` en `services/places.ts`: las fotos guardadas se
reasignan solas sin volver a leer el carrete.

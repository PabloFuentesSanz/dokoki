# Datos geográficos

- `countries.json`: límites de países de [Natural Earth](https://www.naturalearthdata.com/)
  1:50m (dominio público), con código ISO 3166-1 alfa-2, nombre en español y continente.
  Simplificado con mapshaper (20 %, precisión 0,001°). Somalilandia se une a Somalia y Chipre
  del Norte a Chipre.

Regenerar:

```bash
curl -LO https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson
# filtrar a {id, level, name, continent} y después:
npx mapshaper countries_raw.geojson -simplify 20% keep-shapes -dissolve id copy-fields=level,name,continent \
  -o precision=0.001 format=geojson countries.json
```

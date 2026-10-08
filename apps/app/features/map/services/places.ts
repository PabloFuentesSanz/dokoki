/**
 * El resolvedor de lugares de la app: país → región → ciudad, todo en el dispositivo (HU-06).
 * Cambia `PLACES_VERSION` cada vez que cambien los datos geográficos: las fotos guardadas se
 * reasignan sin volver a leer el carrete.
 */
import type { PlaceResolver, UnlockCatalog } from '@atlas/domain';
import { cityIndex } from './cities';
import { countryCount, countryIndex } from './countries';
import { regionCountByCountry, regionIndexOf } from './regions';

export const PLACES_VERSION = 'ne50-countries+ne10-admin1+geonames15k-v2';

/** Una foto a más de esta distancia de cualquier ciudad no se asigna a ninguna. */
export const CITY_RADIUS_KM = 30;

export const placeResolver: PlaceResolver = {
  resolve(point) {
    const country = countryIndex.find(point);
    if (!country) return null;
    const countryCode = country.properties.id;
    const region = regionIndexOf(countryCode).find(point);
    const city = cityIndex.nearest(point, CITY_RADIUS_KM, (c) => c.country === countryCode);
    return {
      countryCode,
      regionId: region?.properties.id ?? null,
      cityId: city?.id ?? null,
      placeId: null,
    };
  },
};

export const placesCatalog: UnlockCatalog = { countryCount, regionCountByCountry };

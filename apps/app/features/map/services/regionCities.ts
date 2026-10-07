/** Ciudades principales de una región, para la ficha de región (M1.5). Todo en el dispositivo. */
import { cities, type City } from './cities';
import { regionCountry, regionIndexOf } from './regions';

const cache = new Map<string, City[]>();

/** Ciudades (≥ 15.000 hab.) dentro de la región, de más a menos pobladas. */
export function citiesInRegion(regionId: string): readonly City[] {
  const cached = cache.get(regionId);
  if (cached) return cached;
  const country = regionCountry(regionId);
  const found =
    country === undefined
      ? []
      : cities
          .filter(
            (c) =>
              c.country === country &&
              regionIndexOf(country).find({ lat: c.lat, lng: c.lng })?.properties.id === regionId,
          )
          .sort((a, b) => b.population - a.population);
  cache.set(regionId, found);
  return found;
}

/** Región de una ciudad (o undefined si cae fuera de los límites simplificados). */
export function regionOfCity(city: City): string | undefined {
  return regionIndexOf(city.country).find({ lat: city.lat, lng: city.lng })?.properties.id;
}

/**
 * El resolvedor de lugares que usa la app. Cambia `PLACES_VERSION` cada vez que cambien los
 * datos geográficos: las fotos guardadas se reasignan sin volver a leer el carrete.
 */
import type { PlaceResolver } from '@atlas/domain';
import { countryResolver } from './countries';

export const PLACES_VERSION = 'countries-ne50-v1';

export const placeResolver: PlaceResolver = countryResolver;

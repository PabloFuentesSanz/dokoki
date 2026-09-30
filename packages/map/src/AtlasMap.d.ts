// Metro elige AtlasMap.native.tsx (iOS/Android) o AtlasMap.web.tsx (web) por plataforma.
// Este archivo le da a TypeScript la interfaz común que ambos cumplen.
import type { JSX } from 'react';
import type { AtlasMapProps } from './types';

export declare function AtlasMap(props: AtlasMapProps): JSX.Element;

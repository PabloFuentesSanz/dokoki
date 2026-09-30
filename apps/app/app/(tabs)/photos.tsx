import { EmptyState } from '@atlas/design-system';
import { Screen } from '../../components/Screen';

/**
 * M3.1 · Galería por lugar. Tanda 3.
 * TODO(M3.1): carpetas País › Región › Ciudad › Lugar con portada y contador (HU-16).
 */
export default function PhotosScreen() {
  return (
    <Screen title="Tus fotos">
      <EmptyState
        icon="photos"
        title="Aún no hay fotos en tu mapa"
        body="Cuando des acceso al carrete, se ordenarán solas por país, región y ciudad. Nunca salen de tu móvil."
      />
    </Screen>
  );
}

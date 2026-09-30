import { Screen } from '../../components/Screen';
import { PhotoLibraryPanel } from '../../features/photos/ui/PhotoLibraryPanel';

/**
 * M3.1 · Fotos. Por ahora, la lectura del carrete y la prueba técnica de velocidad (HU-05).
 * TODO(M3.1): carpetas País › Región › Ciudad › Lugar con portada y contador (HU-16).
 */
export default function PhotosScreen() {
  return (
    <Screen title="Tus fotos">
      <PhotoLibraryPanel />
    </Screen>
  );
}

import { Screen } from '../components/Screen';
import { PhotoLibraryPanel } from '../features/photos/ui/PhotoLibraryPanel';

/** M3.8 · Estado de importación: leer el carrete, fotos nuevas y la prueba técnica (HU-05, HU-07). */
export default function ImportScreen() {
  return (
    <Screen title="Importación" back>
      <PhotoLibraryPanel />
    </Screen>
  );
}

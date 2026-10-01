import { EmptyState } from '@atlas/design-system';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '../components/Screen';
import { useGallery } from '../features/photos/hooks/useGallery';
import { PhotoGrid } from '../features/photos/ui/PhotoGrid';

/** Galería de un país, una ciudad o un viaje: rejilla por meses (M3.1 al entrar en una carpeta). */
export default function GalleryScreen() {
  const { scope = 'all' } = useLocalSearchParams<{ scope: string }>();
  const { title, photos } = useGallery(scope);
  return (
    <Screen title={title} back scroll={photos.length === 0}>
      {photos.length === 0 ? (
        <EmptyState icon="photos" title="Sin fotos aquí" body="Aún no hay fotos con este lugar." />
      ) : (
        <PhotoGrid photos={photos} scope={scope} />
      )}
    </Screen>
  );
}

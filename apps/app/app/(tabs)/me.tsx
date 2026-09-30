import { SyncIndicator } from '@atlas/design-system';
import { Screen } from '../../components/Screen';

/**
 * M10 · Tú: perfil, ajustes, privacidad y datos. Tanda 4.
 * TODO(M10.0): ajustes (M10.5), privacidad (M10.2), fotos y almacenamiento (M10.3) y datos (M10.7).
 */
export default function MeScreen() {
  return (
    <Screen title="Tú">
      <SyncIndicator state="offline" />
    </Screen>
  );
}

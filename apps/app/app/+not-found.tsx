import { EmptyState } from '@atlas/design-system';
import { router } from 'expo-router';
import { Screen } from '../components/Screen';

export default function NotFoundScreen() {
  return (
    <Screen title="Fuera del mapa">
      <EmptyState
        icon="compass"
        title="Esta página no existe"
        body="Vuelve al mapa para seguir explorando."
        action="Ir al mapa"
        onAction={() => router.replace('/')}
      />
    </Screen>
  );
}

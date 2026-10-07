import {
  Button,
  CountryChip,
  Icon,
  Paper,
  Polaroid,
  ProgressBar,
  Reveal,
  Stamp,
  StatStrip,
  SyncIndicator,
  Tag,
  colors,
  iconSizes,
  radii,
  shadows,
  spacing,
  typography,
} from '@atlas/design-system';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUnlockState } from '../features/map/hooks/useUnlockState';
import { cityById, type City } from '../features/map/services/cities';
import { countryName } from '../features/map/services/countries';
import { CityPicker } from '../features/map/ui/CityPicker';
import { StepDots } from '../features/onboarding/ui/StepDots';
import { WorldSketch } from '../features/onboarding/ui/WorldSketch';
import { usePhotoLibrary } from '../features/photos/store/PhotoLibraryProvider';
import { stampDate } from '../features/sharing/services/stampDate';
import { useSettings } from '../features/settings/store/SettingsProvider';
import { useTrips } from '../features/trips/hooks/useTrips';

type Step = 'cover' | 'slides' | 'permission' | 'import' | 'base' | 'reveal';

const n = (value: number): string => value.toLocaleString('es-ES');

/** Esqueleto de cada paso: ilustración arriba, texto y botones abajo, con aire. */
function Frame({
  art,
  children,
  actions,
}: {
  art?: ReactNode;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <ScrollView contentContainerStyle={styles.frame} bounces={false}>
      {art ? <View style={styles.art}>{art}</View> : null}
      <View style={styles.copy}>{children}</View>
      <View style={styles.actions}>{actions}</View>
    </ScrollView>
  );
}

const SLIDES = [
  {
    title: 'Tus fotos ya saben dónde has estado',
    body: 'Atlas lee la ubicación y la fecha de tus fotos y las ordena por país, ciudad y viaje. Sin que hagas nada.',
  },
  {
    title: 'Levanta la niebla del mapa',
    body: 'Cada lugar donde hiciste fotos se desbloquea y te da un sello. Lo que te falta sigue esperando bajo la niebla.',
  },
  {
    title: 'Cuéntalo con estilo',
    body: 'Convierte tus viajes en postales y compártelas en Instagram o WhatsApp en un toque.',
  },
] as const;

function SlideArt({ index, width }: { index: number; width: number }) {
  const w = Math.min(width - spacing[5] * 2, 342);
  if (index === 0) {
    return (
      <View style={{ width: w, height: 300 }} aria-hidden>
        <View style={[styles.polaroid, { left: 0, top: 70, transform: [{ rotate: '-6deg' }] }]}>
          <Polaroid caption="Canal de Otaru" tone={colors.water} width={w * 0.5} />
        </View>
        <View style={[styles.polaroid, { right: 0, top: 40, transform: [{ rotate: '5deg' }] }]}>
          <Polaroid caption="Kamakura" tone={colors.paperSunk} width={w * 0.5} />
        </View>
        <View style={[styles.polaroid, { left: w * 0.2, top: 6 }]}>
          <Polaroid caption="Fushimi Inari" tape tilt="left" width={w * 0.56} />
        </View>
      </View>
    );
  }
  if (index === 1) {
    return (
      <View style={styles.mapFrame}>
        <WorldSketch
          variant="map"
          width={w}
          unlock
          label="Mapa del mundo donde la niebla se levanta de los países visitados"
        />
        <View style={styles.mapStamp}>
          <Stamp label="Italia" date="03.05.2019" size={96} stampIn delay={900} />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.cardMock} aria-hidden>
      <Text style={styles.cardKind}>historia 9:16</Text>
      <Polaroid caption="Fushimi Inari" tape width={150} />
      <Text style={styles.cardTitle}>Japón</Text>
      <Text style={styles.cardKind}>abril 2024, 9 días</Text>
      <View style={styles.cardStamp}>
        <Stamp kind="city" label="Kioto" date="13.04.2024" size={88} stampIn delay={400} />
      </View>
    </View>
  );
}

function Reason({
  icon,
  title,
  body,
}: {
  icon: 'pin' | 'cloud' | 'check';
  title: string;
  body: string;
}) {
  return (
    <View style={styles.reason}>
      <View style={styles.reasonIcon}>
        <Icon name={icon} size={iconSizes.button} color={colors.ink} />
      </View>
      <View style={styles.reasonText}>
        <Text style={styles.reasonTitle}>{title}</Text>
        <Text style={styles.small}>{body}</Text>
      </View>
    </View>
  );
}

/**
 * M0 · Bienvenida: portada (M0.1), tres láminas (M0.2), permiso de fotos (M0.4), lectura en
 * directo (M0.6), tu base (M0.5) y la primera revelación (M0.7). Sin cuenta: el registro (M0.3)
 * llega con Supabase. La base va después de leer las fotos para poder sugerirla.
 */
export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const [step, setStep] = useState<Step>('cover');
  const [slide, setSlide] = useState(0);
  const pager = useRef<ScrollView>(null);
  const [pageWidth, setPageWidth] = useState(width);

  const library = usePhotoLibrary();
  const { bases, saveBases, setOnboarded } = useSettings();
  const { state } = useUnlockState();
  const { trips, suggestedCityId } = useTrips();
  const [baseCity, setBaseCity] = useState<City | null>(null);
  const [picking, setPicking] = useState(false);

  const suggested = baseCity ?? (suggestedCityId ? (cityById(suggestedCityId) ?? null) : null);
  const photosInSuggested = useMemo(
    () => (suggested ? library.assignments.filter((a) => a.cityId === suggested.id).length : 0),
    [library.assignments, suggested],
  );
  const topCountries = useMemo(
    () =>
      Object.values(state.countries)
        .sort((a, b) => b.photoCount - a.photoCount)
        .slice(0, 6),
    [state.countries],
  );
  const firstYear = useMemo(() => {
    const times = Object.values(state.countries).flatMap((c) =>
      c.firstVisitedAt === null ? [] : [c.firstVisitedAt],
    );
    return times.length > 0 ? new Date(Math.min(...times)).getFullYear() : null;
  }, [state.countries]);

  // Cuando la lectura termina sola, pasamos a la base.
  useEffect(() => {
    if (step === 'import' && library.status === 'done') {
      const timer = setTimeout(() => setStep(bases.length > 0 ? 'reveal' : 'base'), 900);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [step, library.status, bases.length]);

  const finish = async (to: '/' | '/trips') => {
    await setOnboarded(true);
    router.replace(to);
  };

  const goSlide = (i: number) => {
    setSlide(i);
    pager.current?.scrollTo({ x: i * pageWidth, animated: true });
  };

  let content: ReactNode;
  if (step === 'cover') {
    content = (
      <Frame
        art={
          <WorldSketch
            variant="globe"
            width={Math.min(width - spacing[6] * 2, 300)}
            label="Globo terráqueo cubierto de niebla"
          />
        }
        actions={
          <>
            <Button block onPress={() => setStep('slides')}>
              Empezar
            </Button>
            <Button block variant="ghost" onPress={() => setStep('permission')}>
              Saltar la presentación
            </Button>
          </>
        }
      >
        <Text role="heading" style={styles.brand}>
          Atlas
        </Text>
        <Text style={styles.claim}>Tu mundo, desbloqueado con tus fotos.</Text>
      </Frame>
    );
  } else if (step === 'slides') {
    const current = SLIDES[slide] ?? SLIDES[0];
    content = (
      <View style={styles.fill}>
        <View style={styles.skipRow}>
          <Pressable
            role="button"
            aria-label="Saltar la presentación"
            onPress={() => setStep('permission')}
            style={styles.skip}
          >
            <Text style={styles.skipText}>Saltar</Text>
          </Pressable>
        </View>
        <ScrollView
          ref={pager}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
          scrollEventThrottle={32}
          onScroll={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
            if (i !== slide && i >= 0 && i < SLIDES.length) setSlide(i);
          }}
          style={styles.pager}
        >
          {SLIDES.map((s, i) => (
            <View key={s.title} style={[styles.page, { width: pageWidth }]}>
              {i === slide ? <SlideArt index={i} width={pageWidth} /> : null}
            </View>
          ))}
        </ScrollView>
        <View style={styles.slideCopy}>
          <StepDots index={slide} total={SLIDES.length} label="Lámina" />
          <Reveal key={slide} style={styles.copy}>
            <Text role="heading" style={styles.title}>
              {current.title}
            </Text>
            <Text style={styles.body}>{current.body}</Text>
          </Reveal>
          <Button
            block
            onPress={() => (slide < SLIDES.length - 1 ? goSlide(slide + 1) : setStep('permission'))}
          >
            {slide < SLIDES.length - 1 ? 'Siguiente' : 'Empezar'}
          </Button>
        </View>
      </View>
    );
  } else if (step === 'permission') {
    const web = Platform.OS === 'web';
    content = (
      <Frame
        actions={
          web ? (
            <Button block onPress={() => void finish('/')}>
              Ver el mapa
            </Button>
          ) : (
            <>
              <Button
                block
                icon="photos"
                onPress={() => {
                  setStep('import');
                  void library.scan();
                }}
              >
                Dar acceso a mis fotos
              </Button>
              <Button block variant="ghost" onPress={() => void finish('/')}>
                Ahora no
              </Button>
            </>
          )
        }
      >
        <View style={styles.permIcon}>
          <Icon name="photos" size={34} color={colors.stampRed} />
        </View>
        <Text role="heading" style={styles.title}>
          {web ? 'Tus fotos viven en tu móvil' : 'Para ordenar tus fotos, necesitamos verlas'}
        </Text>
        {web ? (
          <Text style={styles.body}>
            Abre Atlas en tu iPhone o Android para leer el carrete. Aquí podrás ver tu mapa cuando
            llegue la cuenta.
          </Text>
        ) : (
          <View>
            <Reason
              icon="pin"
              title="Leemos ubicación y fecha"
              body="Todo se hace dentro de tu móvil, también sin conexión."
            />
            <Reason
              icon="cloud"
              title="Tus fotos se quedan contigo"
              body="No copiamos ni subimos ninguna foto ni su ubicación."
            />
            <Reason
              icon="check"
              title="Tú eliges cuántas"
              body="Puedes dar acceso a todo el carrete o solo a algunas fotos."
            />
          </View>
        )}
      </Frame>
    );
  } else if (step === 'import') {
    const denied = library.status === 'denied';
    const countries = state.totals.countries;
    content = (
      <Frame
        actions={
          denied ? (
            <Button block onPress={() => void finish('/')}>
              Seguir sin fotos
            </Button>
          ) : (
            <>
              <Button block onPress={() => setStep(bases.length > 0 ? 'reveal' : 'base')}>
                {library.status === 'done' ? 'Continuar' : 'Ver mi mapa ya'}
              </Button>
              <Text style={styles.note}>Puedes seguir: leemos el resto en segundo plano.</Text>
            </>
          )
        }
      >
        <SyncIndicator
          state={library.status === 'done' ? 'synced' : 'pending'}
          label={library.status === 'done' ? 'Carrete leído' : 'Leyendo tu carrete'}
        />
        <Text role="heading" style={styles.title} aria-live="polite">
          {denied
            ? 'Sin acceso a tus fotos'
            : countries === 0
              ? 'Buscando dónde has estado…'
              : `Ya hemos encontrado ${countries} ${countries === 1 ? 'país' : 'países'}`}
        </Text>
        {denied ? (
          <Text style={styles.body}>
            Puedes darlo cuando quieras en Ajustes del móvil. Mientras, tu mapa sigue en niebla.
          </Text>
        ) : (
          <>
            <StatStrip
              stats={[
                { value: n(library.scannedTotal), label: 'fotos leídas' },
                { value: n(library.photos.length), label: 'con lugar' },
                { value: n(state.totals.cities), label: 'ciudades' },
              ]}
            />
            <ProgressBar
              label="Tu mundo"
              value={state.worldPercent}
              detail="de los países del mundo"
            />
            {topCountries.length > 0 ? (
              <View style={styles.chips}>
                {topCountries.map((c, i) => (
                  <Reveal key={c.id} delay={i * 60}>
                    <CountryChip code={c.id} name={countryName(c.id)} />
                  </Reveal>
                ))}
              </View>
            ) : null}
          </>
        )}
      </Frame>
    );
  } else if (step === 'base') {
    content = (
      <Frame
        actions={
          <>
            <Button
              block
              disabled={!suggested}
              onPress={() => {
                if (!suggested) return;
                void saveBases([
                  {
                    id: `${suggested.id}-${Date.now()}`,
                    cityId: suggested.id,
                    name: suggested.name,
                    countryCode: suggested.country,
                    lat: suggested.lat,
                    lng: suggested.lng,
                    fromYear: null,
                    untilYear: null,
                  },
                ]).then(() => setStep('reveal'));
              }}
            >
              Confirmar mi base
            </Button>
            <Button block variant="ghost" onPress={() => setStep('reveal')}>
              Ahora no
            </Button>
          </>
        }
      >
        <Text role="heading" style={styles.title}>
          ¿Dónde está tu casa?
        </Text>
        <Text style={styles.body}>
          Lo usamos para saber qué fotos son de viaje y cuáles de tu día a día. Luego puedes añadir
          más bases, con sus años.
        </Text>
        {suggested ? (
          <Reveal>
            <View style={styles.baseCard}>
              <View style={styles.reasonIcon}>
                <Icon name="pin" size={iconSizes.nav} color={colors.ink} />
              </View>
              <View style={styles.reasonText}>
                <Text style={styles.baseName}>
                  {`${suggested.name}, ${countryName(suggested.country)}`}
                </Text>
                <Text style={styles.meta}>
                  {photosInSuggested > 0
                    ? `La ciudad con más fotos: ${n(photosInSuggested)}`
                    : 'Elegida por ti'}
                </Text>
              </View>
              <Tag tone="visited">Tu base</Tag>
            </View>
          </Reveal>
        ) : null}
        {picking ? (
          <CityPicker
            label="Busca tu ciudad"
            onPick={(city) => {
              setBaseCity(city);
              setPicking(false);
            }}
          />
        ) : (
          <Button variant="secondary" icon="search" onPress={() => setPicking(true)}>
            {suggested ? 'No es aquí' : 'Buscar mi ciudad'}
          </Button>
        )}
      </Frame>
    );
  } else {
    const top = topCountries[0];
    const countries = state.totals.countries;
    content = (
      <Frame
        art={
          top ? (
            <Stamp
              label={countryName(top.id)}
              date={stampDate(top.firstVisitedAt)}
              size={Math.min(width * 0.5, 200)}
              stampIn
              delay={250}
            />
          ) : (
            <WorldSketch variant="globe" width={220} label="Globo terráqueo cubierto de niebla" />
          )
        }
        actions={
          <>
            {trips.length > 0 ? (
              <Button block variant="secondary" onPress={() => void finish('/trips')}>
                Revisar viajes
              </Button>
            ) : null}
            <Button block icon="map" onPress={() => void finish('/')}>
              Ver mi mapa
            </Button>
          </>
        }
      >
        <Text role="heading" style={styles.title}>
          {countries > 0
            ? `Has desbloqueado ${countries} ${countries === 1 ? 'país' : 'países'}`
            : 'Tu mapa te espera'}
        </Text>
        <Text style={styles.body}>
          {countries > 0
            ? `Y ${n(state.totals.cities)} ciudades${firstYear ? ` desde ${firstYear}` : ''}.${
                trips.length > 0
                  ? ` Hemos agrupado tus fotos en ${trips.length} ${trips.length === 1 ? 'viaje' : 'viajes'}: échales un vistazo por si algo no cuadra.`
                  : ''
              }`
            : 'Cuando tus fotos tengan ubicación, los países donde has estado aparecerán solos.'}
        </Text>
        {countries > 0 ? (
          <StatStrip
            stats={[
              { value: String(countries), label: 'países' },
              { value: n(state.totals.cities), label: 'ciudades' },
              { value: `${String(state.worldPercent).replace('.', ',')} %`, label: 'del mundo' },
            ]}
          />
        ) : null}
      </Frame>
    );
  }

  return (
    <Paper>
      <SafeAreaView edges={['top', 'bottom']} style={styles.fill}>
        <Reveal key={step} style={styles.fill}>
          {content}
        </Reveal>
      </SafeAreaView>
    </Paper>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  frame: {
    flexGrow: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[5],
    gap: spacing[5],
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  art: { alignItems: 'center', paddingVertical: spacing[4] },
  copy: { gap: spacing[3] },
  actions: { marginTop: 'auto', gap: spacing[2] },
  brand: { ...typography.display, fontSize: 72, lineHeight: 72, color: colors.ink },
  claim: { ...typography.body, fontSize: 18, lineHeight: 28, color: colors.ink },
  title: { ...typography.title, color: colors.ink },
  body: { ...typography.body, color: colors.inkMuted },
  small: { ...typography.bodyS, color: colors.inkMuted },
  meta: { ...typography.data, color: colors.inkMuted },
  note: { ...typography.data, color: colors.inkMuted, textAlign: 'center' },
  skipRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing[3] },
  skip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing[2] },
  skipText: {
    ...typography.data,
    color: colors.ink,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
  },
  pager: { flex: 1 },
  page: { flex: 1, minHeight: 320, alignItems: 'center', justifyContent: 'center' },
  slideCopy: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[5],
    gap: spacing[3],
    justifyContent: 'flex-end',
  },
  polaroid: { position: 'absolute' },
  mapFrame: { borderWidth: 1, borderColor: colors.ink, overflow: 'hidden' },
  mapStamp: { position: 'absolute', right: spacing[3], top: spacing[3] },
  cardMock: {
    width: 200,
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.paperRaised,
    borderWidth: 1,
    borderColor: colors.ink,
    boxShadow: shadows.photo,
    transform: [{ rotate: '2deg' }],
  },
  cardKind: { ...typography.dataS, color: colors.inkMuted },
  cardTitle: { ...typography.stat, color: colors.ink },
  cardStamp: { position: 'absolute', right: -spacing[5], bottom: spacing[4] },
  permIcon: {
    width: 72,
    height: 72,
    borderRadius: radii.round,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.stampRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reason: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'flex-start',
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  reasonIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonText: { flex: 1, gap: 2 },
  reasonTitle: { ...typography.bodyStrong, color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  baseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.paperRaised,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.sm,
  },
  baseName: { ...typography.bodyStrong, color: colors.ink },
});

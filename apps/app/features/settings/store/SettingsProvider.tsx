import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { parseBases, type Base } from '../services/bases';
import { readSetting, writeSetting } from '../services/settingsStore';

interface SettingsValue {
  loaded: boolean;
  bases: readonly Base[];
  saveBases: (bases: readonly Base[]) => Promise<void>;
  /** Ha terminado (o saltado) la bienvenida M0. */
  onboarded: boolean;
  setOnboarded: (done: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsValue | null>(null);

/** Ajustes de la persona guardados en el móvil: sus bases (M0.5) y si ya vio la bienvenida (M0). */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [bases, setBases] = useState<readonly Base[]>([]);
  const [onboarded, setOnboardedState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([readSetting('bases'), readSetting('onboarded')]).then(([b, done]) => {
      if (cancelled) return;
      const parsed = parseBases(b);
      setBases(parsed);
      // Quien ya tenía una base es de antes de la bienvenida: no se la enseñamos otra vez.
      setOnboardedState(done === true || parsed.length > 0);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveBases = useCallback(async (next: readonly Base[]) => {
    setBases(next);
    await writeSetting('bases', next);
  }, []);

  const setOnboarded = useCallback(async (done: boolean) => {
    setOnboardedState(done);
    await writeSetting('onboarded', done);
  }, []);

  const value = useMemo(
    () => ({ loaded, bases, saveBases, onboarded, setOnboarded }),
    [loaded, bases, saveBases, onboarded, setOnboarded],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings necesita <SettingsProvider>.');
  return value;
}

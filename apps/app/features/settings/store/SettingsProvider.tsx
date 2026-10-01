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
}

const SettingsContext = createContext<SettingsValue | null>(null);

/** Ajustes de la persona guardados en el móvil. Por ahora, sus bases (M0.5). */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [bases, setBases] = useState<readonly Base[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void readSetting('bases').then((value) => {
      if (cancelled) return;
      setBases(parseBases(value));
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

  const value = useMemo(() => ({ loaded, bases, saveBases }), [loaded, bases, saveBases]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings necesita <SettingsProvider>.');
  return value;
}

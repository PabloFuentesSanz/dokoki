import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ManualMark } from '@atlas/domain';
import { parseBases, type Base } from '../services/bases';
import { parseMarks } from '../services/marks';
import { parseUnit, type DistanceUnit } from '../services/units';
import { readSetting, writeSetting } from '../services/settingsStore';

interface SettingsValue {
  loaded: boolean;
  bases: readonly Base[];
  saveBases: (bases: readonly Base[]) => Promise<void>;
  /** Ha terminado (o saltado) la bienvenida M0. */
  onboarded: boolean;
  setOnboarded: (done: boolean) => Promise<void>;
  /** Países y regiones marcados a mano (M1.4c). */
  marks: readonly ManualMark[];
  saveMarks: (marks: readonly ManualMark[]) => Promise<void>;
  /** Unidad de distancia (M10.5). */
  unit: DistanceUnit;
  saveUnit: (unit: DistanceUnit) => Promise<void>;
}

const SettingsContext = createContext<SettingsValue | null>(null);

/** Ajustes de la persona guardados en el móvil: sus bases (M0.5) y si ya vio la bienvenida (M0). */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [bases, setBases] = useState<readonly Base[]>([]);
  const [onboarded, setOnboardedState] = useState(false);
  const [marks, setMarks] = useState<readonly ManualMark[]>([]);
  const [unit, setUnit] = useState<DistanceUnit>('km');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      readSetting('bases'),
      readSetting('onboarded'),
      readSetting('manualMarks'),
      readSetting('unit'),
    ]).then(([b, done, m, u]) => {
      if (cancelled) return;
      setUnit(parseUnit(u));
      setMarks(parseMarks(m));
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

  const saveMarks = useCallback(async (next: readonly ManualMark[]) => {
    setMarks(next);
    await writeSetting('manualMarks', next);
  }, []);

  const saveUnit = useCallback(async (next: DistanceUnit) => {
    setUnit(next);
    await writeSetting('unit', next);
  }, []);

  const value = useMemo(
    () => ({ loaded, bases, saveBases, onboarded, setOnboarded, marks, saveMarks, unit, saveUnit }),
    [loaded, bases, saveBases, onboarded, setOnboarded, marks, saveMarks, unit, saveUnit],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings necesita <SettingsProvider>.');
  return value;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { readSetting, writeSetting } from '../../settings/services/settingsStore';
import { EMPTY_EDITS, parseTripEdits, type TripEdits } from '../services/tripEdits';

interface TripEditsValue {
  edits: TripEdits;
  /** Aplica un cambio y lo guarda en el móvil. */
  update: (change: (edits: TripEdits) => TripEdits) => Promise<void>;
}

const TripEditsContext = createContext<TripEditsValue | null>(null);

export function TripEditsProvider({ children }: { children: ReactNode }) {
  const [edits, setEdits] = useState<TripEdits>(EMPTY_EDITS);
  const current = useRef(edits);

  useEffect(() => {
    let cancelled = false;
    void readSetting('tripEdits').then((value) => {
      if (cancelled) return;
      current.current = parseTripEdits(value);
      setEdits(current.current);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(async (change: (edits: TripEdits) => TripEdits) => {
    current.current = change(current.current);
    setEdits(current.current);
    await writeSetting('tripEdits', current.current);
  }, []);

  const value = useMemo(() => ({ edits, update }), [edits, update]);
  return <TripEditsContext.Provider value={value}>{children}</TripEditsContext.Provider>;
}

export function useTripEdits(): TripEditsValue {
  const value = useContext(TripEditsContext);
  if (!value) throw new Error('useTripEdits necesita <TripEditsProvider>.');
  return value;
}

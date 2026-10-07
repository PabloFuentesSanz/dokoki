import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform } from 'react-native';

/** El driver nativo no existe en web: allí anima JavaScript. */
export const nativeDriver = Platform.OS !== 'web';

/** Curva de salida suave: rápido al empezar, se posa al final (como papel que cae). */
export const easeOut = Easing.out(Easing.cubic);

/**
 * "Reducir movimiento" del sistema. Con él activo, nada se desplaza ni escala: solo se funde.
 * Empieza en false y se actualiza en cuanto el sistema responde.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduced(value);
      })
      .catch(() => undefined);
    // En web (react-native-web) puede no devolver suscripción.
    const subscription: { remove: () => void } | undefined = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduced,
    );
    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);
  return reduced;
}

/** Valor animado estable entre renders (sin refs: así lo entiende el compilador de React). */
export function useAnimatedValue(initial: number): Animated.Value {
  const [value] = useState(() => new Animated.Value(initial));
  return value;
}

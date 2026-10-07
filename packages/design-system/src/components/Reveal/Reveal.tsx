import { useEffect, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { easeOut, nativeDriver, useAnimatedValue, useReducedMotion } from '../../internal/motion';
import { motion, spacing } from '../../tokens';

export interface RevealProps {
  children: ReactNode;
  /** Retraso en ms, para escalonar bloques (p. ej. índice × 60). */
  delay?: number;
  /** Desde dónde sube, en px. Con "reducir movimiento" no se mueve: solo aparece. */
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

/** Aparición de un bloque al entrar en pantalla: se funde y sube un poco, como papel que se posa. */
export function Reveal({ children, delay = 0, distance = spacing[3], style }: RevealProps) {
  const reduced = useReducedMotion();
  const progress = useAnimatedValue(0);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: motion.base,
      delay,
      easing: easeOut,
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, delay]);

  const translateY = reduced
    ? 0
    : progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

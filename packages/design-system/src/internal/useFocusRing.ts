import { useState } from 'react';
import type { ViewStyle } from 'react-native';
import { colors } from '../tokens';

/** Anillo de foco del sistema: sólido de 2 px en `focus`, con 2 px de separación. */
export const focusRingStyle: ViewStyle = {
  outlineColor: colors.focus,
  outlineStyle: 'solid',
  outlineWidth: 2,
  outlineOffset: 2,
};

/** Estado de foco de teclado para controles Pressable (web y teclados físicos en tablet). */
export function useFocusRing(): {
  focused: boolean;
  focusProps: { onFocus: () => void; onBlur: () => void };
} {
  const [focused, setFocused] = useState(false);
  return {
    focused,
    focusProps: { onFocus: () => setFocused(true), onBlur: () => setFocused(false) },
  };
}

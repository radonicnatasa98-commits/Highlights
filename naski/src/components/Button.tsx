import { useId, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors, fonts } from '../theme/tokens';

type Props = {
  label: string;
  onPress?: () => void;
  // "primary": pieno blu notte; "outline": solo bordo.
  variant?: 'primary' | 'outline';
  // "large": 48px, Avenir 16 (onboarding, Salva); "small": 40px, Gilmer 14 (Sign up, Login).
  size?: 'large' | 'small';
  // Alcuni bottoni grandi del design (Elimina, Chiudi) usano Gilmer 16.
  gilmer?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', size = 'large', gilmer, disabled, style }: Props) {
  const [w, setW] = useState(0);
  const id = useId().replace(/:/g, '');
  const h = size === 'large' ? 48 : 40;
  const primary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
      style={({ pressed }) => [
        styles.base,
        { height: h },
        primary ? styles.primary : styles.outline,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {primary && w > 0 && (
        // Bordo interno di 1px con riflesso bianco, come nel componente Button di Figma.
        <Svg pointerEvents="none" width={w} height={h} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={`b${id}`} gradientUnits="userSpaceOnUse" x1={0.07 * w} y1={0} x2={0.126 * w} y2={1.279 * h}>
              <Stop offset={0} stopColor="#ffffff" stopOpacity={0.4} />
              <Stop offset={0.41} stopColor="#ffffff" stopOpacity={0} />
              <Stop offset={0.57} stopColor="#ffffff" stopOpacity={0} />
              <Stop offset={1} stopColor="#ffffff" stopOpacity={0.1} />
            </LinearGradient>
          </Defs>
          <Rect x={0.5} y={0.5} width={w - 1} height={h - 1} rx={(h - 1) / 2} fill="none" stroke={`url(#b${id})`} strokeWidth={1} />
        </Svg>
      )}
      <View pointerEvents="none">
        <Text
          style={[
            size === 'large' ? (gilmer ? styles.labelGilmer : styles.labelLarge) : styles.labelSmall,
            { color: primary ? colors.white : colors.navy },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'stretch',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primary: { backgroundColor: colors.navy },
  outline: { borderWidth: 1, borderColor: colors.navy },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  labelLarge: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  labelGilmer: { fontFamily: fonts.button, fontSize: 16, lineHeight: 16 },
  labelSmall: { fontFamily: fonts.button, fontSize: 14, lineHeight: 16 },
});

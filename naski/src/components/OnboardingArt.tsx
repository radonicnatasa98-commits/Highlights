import { Image, ImageSource } from 'expo-image';
import { useEffect } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useReducedMotion } from '../hooks/useReducedMotion';

export type ArtKind = 'pencil' | 'bell' | 'star';
type Frame = { x: number; y: number; w: number; h: number };

type Props = {
  kind: ArtKind;
  image: ImageSource;
  frame: Frame;
  fit: 'cover' | 'fill';
  // Ombra a terra disegnata a parte (centro e larghezza), così l'oggetto può staccarsi da essa.
  shadow?: { cx: number; cy: number; w: number };
  // Posizione di partenza in orizzontale e in verticale della pagina.
  left: number;
  top: number;
};

type Transform = Extract<NonNullable<Animated.WithAnimatedValue<ViewStyle>['transform']>, readonly unknown[]>[number];

const ease = Easing.inOut(Easing.sin);
const wave = (v: Animated.Value, duration: number) =>
  Animated.loop(
    Animated.sequence([
      Animated.timing(v, { toValue: 1, duration, easing: ease, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration, easing: ease, useNativeDriver: true }),
    ]),
  );

// Le illustrazioni 3D dell'onboarding, ognuna con il suo movimento:
// la matita oscilla come se scrivesse, la campana suona, la stella fluttua tra le scintille.
export function OnboardingArt({ kind, image, frame, fit, shadow, left, top }: Props) {
  const reduced = useReducedMotion();
  const float = useAnimatedNumber(0);
  const tilt = useAnimatedNumber(0);
  const ring = useAnimatedNumber(0);
  const twinkle = useAnimatedNumber(0);

  useEffect(() => {
    if (reduced) return;
    const loops: Animated.CompositeAnimation[] = [wave(float, kind === 'star' ? 2600 : 2200)];
    if (kind === 'pencil') loops.push(wave(tilt, 900));
    if (kind === 'star') loops.push(wave(tilt, 4200));
    if (kind === 'bell') {
      // Rintocco smorzato ogni tre secondi circa.
      const step = (to: number, duration: number) =>
        Animated.timing(ring, { toValue: to, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true });
      loops.push(
        Animated.loop(
          Animated.sequence([
            Animated.delay(1400),
            step(1, 150),
            step(-0.8, 260),
            step(0.55, 240),
            step(-0.3, 220),
            step(0.12, 200),
            step(0, 180),
          ]),
        ),
      );
    }
    if (kind === 'star') {
      loops.push(
        Animated.loop(
          Animated.timing(twinkle, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true }),
        ),
      );
    }
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [reduced, kind, float, tilt, ring, twinkle]);

  const lift = kind === 'star' ? 12 : kind === 'bell' ? 5 : 7;
  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -lift] });

  const transform: Transform[] = [{ translateY }];
  if (kind === 'pencil') {
    transform.push({ rotate: tilt.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] }) });
  }
  if (kind === 'bell') {
    // Ruota attorno all'anello in alto: sposto il perno, ruoto, lo rimetto.
    transform.push(
      { translateY: -frame.h / 2 },
      { rotate: ring.interpolate({ inputRange: [-1, 1], outputRange: ['-14deg', '14deg'] }) },
      { translateY: frame.h / 2 },
    );
  }
  if (kind === 'star') {
    transform.push(
      { rotate: tilt.interpolate({ inputRange: [0, 1], outputRange: ['-5deg', '5deg'] }) },
      { scale: float.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) },
    );
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {shadow && (
        <Animated.View
          style={{
            position: 'absolute',
            left: left + shadow.cx - shadow.w / 2,
            top: top + shadow.cy - shadow.w / 8,
            opacity: float.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }),
            transform: [{ scale: float.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] }) }],
          }}
        >
          <Svg width={shadow.w} height={shadow.w / 4}>
            <Defs>
              <RadialGradient id={`sh-${kind}`} cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0" stopColor="#3b5fd6" stopOpacity={0.32} />
                <Stop offset="1" stopColor="#3b5fd6" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse
              cx={shadow.w / 2}
              cy={shadow.w / 8}
              rx={shadow.w / 2}
              ry={shadow.w / 8}
              fill={`url(#sh-${kind})`}
            />
          </Svg>
        </Animated.View>
      )}

      <Animated.View
        style={{
          position: 'absolute',
          left: left + frame.x,
          top: top + frame.y,
          width: frame.w,
          height: frame.h,
          transform,
        }}
      >
        <Image source={image} contentFit={fit} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {kind === 'star' &&
        SPARKLES.map((s, i) => {
          const phase = i / SPARKLES.length;
          const t = Animated.modulo(Animated.add(twinkle, phase), 1);
          return (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: left + s.x - s.size / 2,
                top: top + s.y - s.size / 2,
                opacity: reduced ? 0.8 : t.interpolate({ inputRange: [0, 0.25, 0.5, 1], outputRange: [0, 1, 0, 0] }),
                transform: reduced
                  ? []
                  : [
                      { scale: t.interpolate({ inputRange: [0, 0.25, 0.5, 1], outputRange: [0.3, 1, 0.3, 0.3] }) },
                      { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) },
                    ],
              }}
            >
              <View style={Platform.OS === 'ios' ? styles.sparkleGlow : null}>
                <Sparkle size={s.size} />
              </View>
            </Animated.View>
          );
        })}
    </View>
  );
}

// Scintille attorno alla stella (coordinate della schermata 375×812).
const SPARKLES = [
  { x: 88, y: 178, size: 22 },
  { x: 304, y: 210, size: 16 },
  { x: 290, y: 396, size: 24 },
  { x: 74, y: 356, size: 15 },
];

function Sparkle({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z" fill="#ffffff" />
      <Path d="M12 6C12.5 9.5 14.5 11.5 18 12C14.5 12.5 12.5 14.5 12 18C11.5 14.5 9.5 12.5 6 12C9.5 11.5 11.5 9.5 12 6Z" fill="#7fb2ff" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  // Alone azzurro, perché le scintille bianche si leggano anche sullo sfondo chiaro.
  // Solo su iPhone: altrove l'ombra segue il riquadro e non la forma della scintilla.
  sparkleGlow: { shadowColor: '#2d5cf2', shadowOpacity: 0.55, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
});

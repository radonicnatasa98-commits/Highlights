import { useEffect } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useReducedMotion } from '../hooks/useReducedMotion';

const SIZE = 440;

// Macchie di colore sfumate che attraversano lentamente lo sfondo, con i colori dei livelli
// "BG" del file Figma. Posizioni nel riferimento della schermata 375×812.
const BLOBS = [
  { color: '#19a9f9', opacity: 0.34, duration: 14000, from: [-170, -120], to: [90, 110] },
  { color: '#165dfb', opacity: 0.24, duration: 17000, from: [170, 230], to: [-110, 400] },
  { color: '#b7baed', opacity: 0.6, duration: 15000, from: [40, 520], to: [200, 280] },
  { color: '#dfe7f5', opacity: 0.75, duration: 19000, from: [170, -90], to: [-60, 180] },
  { color: '#8e9cf5', opacity: 0.36, duration: 13000, from: [-150, 560], to: [130, 640] },
];

export function BackgroundAura() {
  const reduced = useReducedMotion();
  const values = [
    useAnimatedNumber(0),
    useAnimatedNumber(1),
    useAnimatedNumber(0),
    useAnimatedNumber(1),
    useAnimatedNumber(0),
  ];
  const [a, b, c, d, e] = values;

  useEffect(() => {
    if (reduced) return;
    const ease = Easing.inOut(Easing.sin);
    const loops = [a, b, c, d, e].map((v, i) => {
      const there = Animated.timing(v, {
        toValue: 1,
        duration: BLOBS[i].duration,
        easing: ease,
        useNativeDriver: true,
      });
      const back = Animated.timing(v, { toValue: 0, duration: BLOBS[i].duration, easing: ease, useNativeDriver: true });
      // Chi parte da 1 torna indietro per primo, così le macchie non si muovono tutte insieme.
      return Animated.loop(Animated.sequence(i % 2 ? [back, there] : [there, back]));
    });
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [reduced, a, b, c, d, e]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {BLOBS.map((blob, i) => (
        <Animated.View
          key={blob.color}
          style={[
            styles.blob,
            {
              transform: [
                { translateX: values[i].interpolate({ inputRange: [0, 1], outputRange: [blob.from[0], blob.to[0]] }) },
                { translateY: values[i].interpolate({ inputRange: [0, 1], outputRange: [blob.from[1], blob.to[1]] }) },
                { scale: values[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.9, 1.2, 0.9] }) },
              ],
            },
          ]}
        >
          <Svg width={SIZE} height={SIZE}>
            <Defs>
              <RadialGradient id={`bgAura${i}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={blob.color} stopOpacity={blob.opacity} />
                <Stop offset="1" stopColor={blob.color} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2} fill={`url(#bgAura${i})`} />
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute', left: 0, top: 0, width: SIZE, height: SIZE },
});

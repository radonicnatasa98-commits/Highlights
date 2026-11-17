import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { colors, fonts } from '../theme/tokens';

const bubble = require('../../assets/images/bubble.png');

// Nel design le bolle mostrano il nome breve del tag.
export const SHORT_LABEL: Record<string, string> = {
  Famiglia: 'Famiglia',
  Amicizia: 'Amicizia',
  'Lavoro e studio': 'Lavoro',
  'Salute e Benessere': 'Salute',
  'Tempo libero': 'Tempo libero',
  Altro: 'Altro',
};

// Dimensioni del frame TrackerAI: la bolla più grande è 156px, la più piccola 82px.
const MAX = 156;
const MIN = 78;
// Centri delle bolle in Figma, dalla più grande alla più piccola, più un posto per il sesto tag.
const SEEDS = [
  [109, 311],
  [272, 335],
  [125, 519],
  [241, 471],
  [85, 406],
  [290, 590],
];
const AREA = { left: 12, right: 363, top: 205, bottom: 640 };

type Placed = { tag: string; x: number; y: number; d: number };

// Bolle ordinate per conteggio, con diametro proporzionale al conteggio,
// poi allontanate a piccoli passi finché non si sovrappongono più.
function layout(counts: [string, number][]): Placed[] {
  const max = Math.max(1, ...counts.map(([, n]) => n));
  const items = counts
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, n], i) => ({ tag, x: SEEDS[i][0], y: SEEDS[i][1], d: MIN + (MAX - MIN) * (n / max) }));

  for (let step = 0; step < 160; step++) {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        const min = (a.d + b.d) / 2 + 4;
        if (dist < min) {
          const push = (min - dist) / 2;
          a.x -= (dx / dist) * push;
          a.y -= (dy / dist) * push;
          b.x += (dx / dist) * push;
          b.y += (dy / dist) * push;
        }
      }
    }
    for (const it of items) {
      const r = it.d / 2;
      it.x = Math.min(AREA.right - r, Math.max(AREA.left + r, it.x));
      it.y = Math.min(AREA.bottom - r, Math.max(AREA.top + r, it.y));
    }
  }
  return items;
}

type Props = { counts: [string, number][]; offsetX: number; top: number };

export function TagBubbles({ counts, offsetX, top }: Props) {
  const placed = useMemo(() => layout(counts), [counts]);
  const tags = counts.map(([t]) => t);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {tags.map((tag, i) => (
        <Bubble key={tag} tag={tag} index={i} spot={placed.find((p) => p.tag === tag)} offsetX={offsetX} top={top} />
      ))}
    </View>
  );
}

type BubbleProps = { tag: string; index: number; spot: Placed | undefined; offsetX: number; top: number };

// Ogni bolla si sposta e cambia misura con una molla quando cambiano i dati,
// e intanto fluttua piano su e giù con un suo ritmo.
function Bubble({ tag, index, spot, offsetX, top }: BubbleProps) {
  const reduced = useReducedMotion();
  const [last, setLast] = useState(spot ?? { tag, x: 187, y: 420, d: MIN });
  if (spot && (spot.x !== last.x || spot.y !== last.y || spot.d !== last.d)) setLast(spot);

  const x = useAnimatedNumber(last.x);
  const y = useAnimatedNumber(last.y);
  const scale = useAnimatedNumber(0);
  const float = useAnimatedNumber(0);

  useEffect(() => {
    const target = spot ? spot.d / MAX : 0;
    const spring = { damping: 14, stiffness: 120, useNativeDriver: true } as const;
    const anim = Animated.parallel([
      Animated.spring(x, { toValue: last.x, ...spring }),
      Animated.spring(y, { toValue: last.y, ...spring }),
      Animated.sequence([
        Animated.delay(reduced ? 0 : index * 60),
        Animated.spring(scale, { toValue: target, ...spring }),
      ]),
    ]);
    anim.start();
    return () => anim.stop();
  }, [spot, last, index, reduced, x, y, scale]);

  useEffect(() => {
    if (reduced) return;
    const duration = 2600 + index * 420;
    const ease = Easing.inOut(Easing.sin);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration, easing: ease, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration, easing: ease, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, index, float]);

  // Il testo cresce meno della bolla: 20px nella più grande, circa 15px in quelle medie (come in Figma).
  const d = last.d;
  const textScale = Math.pow(d / MAX, -0.3);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: offsetX - MAX / 2,
          top: top - MAX / 2,
          transform: [
            { translateX: x },
            { translateY: Animated.add(y, float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] })) },
            { scale },
          ],
        },
      ]}
    >
      <Image source={bubble} style={StyleSheet.absoluteFill} />
      <Text style={[styles.label, { transform: [{ scale: textScale }] }]} numberOfLines={1}>
        {SHORT_LABEL[tag] ?? tag}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    width: MAX,
    height: MAX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.regular, fontSize: 20, lineHeight: 28, color: colors.navy },
});

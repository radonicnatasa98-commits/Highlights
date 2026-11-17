import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, RadialGradient, Stop } from 'react-native-svg';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { fonts } from '../theme/tokens';

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

type Placed = { tag: string; n: number; x: number; y: number; d: number };

// Bolle ordinate per conteggio, con diametro proporzionale al conteggio,
// poi allontanate a piccoli passi finché non si sovrappongono più.
function layout(counts: [string, number][]): Placed[] {
  const max = Math.max(1, ...counts.map(([, n]) => n));
  const items = counts
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, n], i) => ({ tag, n, x: SEEDS[i][0], y: SEEDS[i][1], d: MIN + (MAX - MIN) * (n / max) }));

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
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {tags.map((tag, i) => (
        <Bubble key={tag} tag={tag} index={i} spot={placed.find((p) => p.tag === tag)} offsetX={offsetX} top={top} />
      ))}
    </View>
  );
}

type BubbleProps = { tag: string; index: number; spot: Placed | undefined; offsetX: number; top: number };

const ease = Easing.inOut(Easing.sin);
const pingPong = (v: Animated.Value, duration: number) =>
  Animated.loop(
    Animated.sequence([
      Animated.timing(v, { toValue: 1, duration, easing: ease, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration, easing: ease, useNativeDriver: true }),
    ]),
  );
const spin = (v: Animated.Value, duration: number) =>
  Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }));

// Ogni bolla si sposta e cambia misura con una molla quando cambiano i dati.
// Dentro, due veli di colore ruotano in versi opposti (effetto liquido), la superficie
// ondeggia come una goccia e al tocco si schiaccia come una gelatina.
function Bubble({ tag, index, spot, offsetX, top }: BubbleProps) {
  const reduced = useReducedMotion();
  const [last, setLast] = useState(spot ?? { tag, n: 0, x: 187, y: 420, d: MIN });
  if (spot && (spot.x !== last.x || spot.y !== last.y || spot.d !== last.d || spot.n !== last.n)) setLast(spot);

  const x = useAnimatedNumber(last.x);
  const y = useAnimatedNumber(last.y);
  const scale = useAnimatedNumber(0);
  const float = useAnimatedNumber(0);
  const wobble = useAnimatedNumber(0);
  const swirlA = useAnimatedNumber(0);
  const swirlB = useAnimatedNumber(0);
  const squish = useAnimatedNumber(0);

  useEffect(() => {
    const target = spot ? spot.d / MAX : 0;
    const spring = { damping: 14, stiffness: 120, useNativeDriver: true } as const;
    const anim = Animated.parallel([
      Animated.spring(x, { toValue: last.x, ...spring }),
      Animated.spring(y, { toValue: last.y, ...spring }),
      Animated.sequence([
        Animated.delay(reduced ? 0 : index * 60),
        Animated.spring(scale, { toValue: target, damping: 9, stiffness: 110, useNativeDriver: true }),
      ]),
    ]);
    anim.start();
    return () => anim.stop();
  }, [spot, last, index, reduced, x, y, scale]);

  useEffect(() => {
    if (reduced) return;
    const loops = [
      pingPong(float, 2600 + index * 420),
      pingPong(wobble, 1700 + index * 230),
      spin(swirlA, 16000 + index * 1500),
      spin(swirlB, 23000 + index * 1100),
    ];
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [reduced, index, float, wobble, swirlA, swirlB]);

  const squishTo = (v: number) =>
    Animated.spring(squish, { toValue: v, damping: 6, stiffness: 260, mass: 0.7, useNativeDriver: true }).start();

  // Goccia: quando si allarga in orizzontale si abbassa un po', e viceversa.
  const scaleX = Animated.multiply(
    wobble.interpolate({ inputRange: [0, 1], outputRange: [0.975, 1.025] }),
    squish.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }),
  );
  const scaleY = Animated.multiply(
    wobble.interpolate({ inputRange: [0, 1], outputRange: [1.025, 0.975] }),
    squish.interpolate({ inputRange: [0, 1], outputRange: [1, 0.88] }),
  );

  // Il testo cresce meno della bolla: 20px nella più grande, circa 15px in quelle medie (come in Figma).
  const label = SHORT_LABEL[tag] ?? tag;
  // I nomi lunghi ("Tempo libero") si stringono un po' per restare dentro la bolla.
  const textScale = Math.pow(last.d / MAX, -0.3) * (label.length > 9 ? 0.86 : 1);
  const id = tag.replace(/\W/g, '');

  return (
    <Animated.View
      pointerEvents="box-none"
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
      {/* Ombra colorata a terra, che si stringe quando la bolla sale. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shadow,
          {
            opacity: float.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }),
            transform: [{ scaleX: float.interpolate({ inputRange: [0, 1], outputRange: [1, 0.88] }) }],
          },
        ]}
      >
        <Svg width={MAX} height={36}>
          <Defs>
            <RadialGradient id={`sh${id}`} cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor="#6f6be0" stopOpacity={0.32} />
              <Stop offset="1" stopColor="#6f6be0" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={MAX / 2} cy={18} rx={MAX * 0.42} ry={14} fill={`url(#sh${id})`} />
        </Svg>
      </Animated.View>

      <Pressable
        onPressIn={() => {
          squishTo(1);
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }}
        onPressOut={() => squishTo(0)}
        accessibilityRole="text"
        accessibilityLabel={`${tag}: ${last.n} ${last.n === 1 ? 'volta' : 'volte'}`}
      >
        <Animated.View style={[styles.body, { transform: [{ scaleX }, { scaleY }] }]}>
          <View style={styles.clip}>
            <Image source={bubble} style={StyleSheet.absoluteFill} />
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  transform: [{ rotate: swirlA.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
                },
              ]}
            >
              <ColorFilm id={`${id}a`} variant={0} />
            </Animated.View>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  transform: [{ rotate: swirlB.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] }) }],
                },
              ]}
            >
              <ColorFilm id={`${id}b`} variant={1} />
            </Animated.View>
            <Gloss id={id} />
          </View>

          <View style={[styles.labelBox, { transform: [{ scale: textScale }] }]}>
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
            {last.d >= 96 && (
              <Text style={styles.count}>
                {last.n} {last.n === 1 ? 'VOLTA' : 'VOLTE'}
              </Text>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// Velo di colori iridescenti (azzurro, lilla, rosa, blu) che gira dentro la bolla.
const FILMS = [
  [
    { cx: 112, cy: 46, r: 62, color: '#b5fbf7', o: 0.55 },
    { cx: 44, cy: 74, r: 58, color: '#b489fa', o: 0.42 },
    { cx: 70, cy: 128, r: 60, color: '#fae8fa', o: 0.6 },
  ],
  [
    { cx: 120, cy: 112, r: 56, color: '#a3c0fb', o: 0.45 },
    { cx: 58, cy: 40, r: 50, color: '#e8c6f8', o: 0.5 },
    { cx: 30, cy: 120, r: 46, color: '#ba69fc', o: 0.22 },
  ],
];

function ColorFilm({ id, variant }: { id: string; variant: number }) {
  return (
    <Svg width={MAX} height={MAX}>
      <Defs>
        {FILMS[variant].map((b, i) => (
          <RadialGradient key={i} id={`f${id}${i}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={b.color} stopOpacity={b.o} />
            <Stop offset="1" stopColor={b.color} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      {FILMS[variant].map((b, i) => (
        <Circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={`url(#f${id}${i})`} />
      ))}
    </Svg>
  );
}

// Riflesso lucido in alto a sinistra, puntino di luce e bordo luminoso: restano fermi
// mentre i colori girano, come su una vera bolla.
function Gloss({ id }: { id: string }) {
  const c = MAX / 2;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={MAX} height={MAX}>
        <Defs>
          <RadialGradient id={`g${id}`} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor="#ffffff" stopOpacity={0.85} />
            <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={`d${id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#ffffff" stopOpacity={0} />
            <Stop offset="0.82" stopColor="#ffffff" stopOpacity={0} />
            <Stop offset="1" stopColor="#7d76e8" stopOpacity={0.22} />
          </RadialGradient>
          <LinearGradient id={`r${id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
            <Stop offset="0.45" stopColor="#ffffff" stopOpacity={0.1} />
            <Stop offset="1" stopColor="#ffffff" stopOpacity={0.6} />
          </LinearGradient>
        </Defs>
        {/* Bordo più scuro verso l'esterno: dà volume alla sfera. */}
        <Circle cx={c} cy={c} r={c} fill={`url(#d${id})`} />
        <Ellipse cx={52} cy={40} rx={34} ry={18} fill={`url(#g${id})`} transform="rotate(-32 52 40)" />
        <Circle cx={36} cy={52} r={3.5} fill="#ffffff" opacity={0.9} />
        <Ellipse cx={112} cy={124} rx={22} ry={7} fill="#ffffff" opacity={0.25} transform="rotate(-40 112 124)" />
        <Circle cx={c} cy={c} r={c - 1} stroke={`url(#r${id})`} strokeWidth={1.6} fill="none" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { position: 'absolute', width: MAX, height: MAX },
  body: { width: MAX, height: MAX, alignItems: 'center', justifyContent: 'center' },
  clip: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: MAX / 2, overflow: 'hidden' },
  shadow: { position: 'absolute', left: 0, top: MAX - 8 },
  labelBox: { alignItems: 'center' },
  // Più leggero del blu notte pieno: peso normale e blu più morbido.
  label: {
    fontFamily: fonts.regular,
    fontSize: 20,
    lineHeight: 26,
    color: 'rgba(43,63,122,0.82)',
    textShadowColor: 'rgba(255,255,255,0.9)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  count: {
    fontFamily: fonts.heavy,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.4,
    color: 'rgba(43,63,122,0.45)',
    marginTop: 2,
  },
});

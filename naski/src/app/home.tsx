import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Appear } from '../components/Appear';
import { Glass } from '../components/Glass';
import { Icon } from '../components/Icon';
import { PostItSheet } from '../components/PostItSheet';
import { Screen, useDesignBottom, useDesignTop } from '../components/Screen';
import { TabBar } from '../components/TabBar';
import { Toast } from '../components/Toast';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { dayKey, useEntries } from '../store/entries';
import { calendar, logoMark, plusCircle } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function Home() {
  const top = useDesignTop();
  const bottom = useDesignBottom();
  const [postIt, setPostIt] = useState(false);
  const [saved, setSaved] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const { add } = useEntries();

  return (
    <Screen background="home" breathing>
      <Appear order={0} style={[styles.logo, { top: top + 56 }]}>
        <BreathingLogo />
      </Appear>

      <View style={[styles.content, { top: top + 222 }]}>
        <View style={styles.heading}>
          <Appear order={1} style={styles.date}>
            <Icon icon={calendar} color={colors.navy} />
            <Text style={styles.dateText}>{today()}</Text>
          </Appear>
          <Appear order={2}>
            <Text style={styles.title}>Cosa vuoi scrivere oggi?</Text>
          </Appear>
        </View>

        <View style={styles.cards}>
          <Appear order={3}>
            <Card label="Post-it" open={postIt} glow={saved} phase={0} onPress={() => setPostIt(true)} />
          </Appear>
          <Appear order={4}>
            <Card label="Diario" phase={0.5} />
          </Appear>
        </View>
      </View>

      <Appear order={5} style={[styles.tab, { bottom: bottom + 24 }]}>
        <TabBar active="home" />
      </Appear>

      <PostItSheet
        visible={postIt}
        onClose={() => setPostIt(false)}
        onSave={({ text, tags }) => {
          add({ type: 'postit', text, tags, date: dayKey(new Date()) });
          setPostIt(false);
          setSaved((n) => n + 1);
          setToast('Salvato nel calendario');
          if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
      />
      <Toast message={toast} onHidden={() => setToast(null)} />
    </Screen>
  );
}

// Il simbolo pulsa appena (scala 1 → 1,04 e ritorno, 3 secondi per verso).
function BreathingLogo() {
  const reduced = useReducedMotion();
  const breath = useAnimatedNumber(0);

  useEffect(() => {
    if (reduced) return;
    const ease = Easing.inOut(Easing.sin);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 3000, easing: ease, useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: 3000, easing: ease, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, breath]);

  return (
    <Animated.View
      style={{ transform: [{ scale: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }] }}
    >
      <Icon icon={logoMark} size={38} />
    </Animated.View>
  );
}

type CardProps = {
  label: string;
  onPress?: () => void;
  // Foglio aperto: il "+" resta ruotato di 90°.
  open?: boolean;
  // Cambia a ogni salvataggio: la card fa un breve bagliore.
  glow?: number;
  // Sfasamento dello sfondo animato, così le due card non si muovono all'unisono (da 0 a 1).
  phase: number;
};

function Card({ label, onPress, open = false, glow = 0, phase }: CardProps) {
  const press = useAnimatedNumber(0);
  const turn = useAnimatedNumber(0);
  const flash = useAnimatedNumber(0);

  // Pressione: la card si abbassa con una molla.
  const pressTo = (v: number) =>
    Animated.spring(press, { toValue: v, damping: 15, stiffness: 320, mass: 0.6, useNativeDriver: true }).start();

  useEffect(() => {
    Animated.spring(turn, { toValue: open ? 1 : 0, damping: 12, stiffness: 180, useNativeDriver: true }).start();
  }, [open, turn]);

  useEffect(() => {
    if (!glow) return;
    flash.setValue(0);
    Animated.sequence([
      Animated.timing(flash, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 700, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [glow, flash]);

  const scale = Animated.add(
    press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] }),
    flash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.02] }),
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressTo(1);
        if (onPress && Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => pressTo(0)}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Glass radius={30} style={styles.card}>
          <View pointerEvents="none" style={styles.clip}>
            <CardAura phase={phase} />
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                styles.flash,
                {
                  opacity: Animated.add(
                    press.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] }),
                    Animated.multiply(flash, 0.5),
                  ),
                },
              ]}
            />
          </View>
          <Text style={styles.cardLabel}>{label}</Text>
          <Animated.View
            style={{
              transform: [{ rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }],
            }}
          >
            <Icon icon={plusCircle} color={colors.blue} />
          </Animated.View>
        </Glass>
      </Animated.View>
    </Pressable>
  );
}

// Sfondo animato della card: tre macchie di colore sfumate (azzurro, blu e lilla della palette)
// che girano lentamente sotto il vetro, ciascuna con il suo ritmo.
const AURA = [
  { color: '#19a9f9', opacity: 0.32, duration: 9000, from: [-60, -70], to: [170, 10] },
  { color: '#2c63f3', opacity: 0.2, duration: 12000, from: [190, -40], to: [20, -110] },
  { color: '#b7baed', opacity: 0.55, duration: 10500, from: [60, -130], to: [200, -60] },
];

function CardAura({ phase }: { phase: number }) {
  const reduced = useReducedMotion();
  const a = useAnimatedNumber(phase);
  const b = useAnimatedNumber(1 - phase);
  const c = useAnimatedNumber(phase);
  const drivers = [a, b, c];

  useEffect(() => {
    if (reduced) return;
    const ease = Easing.inOut(Easing.sin);
    const loops = [a, b, c].map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: AURA[i].duration, easing: ease, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: AURA[i].duration, easing: ease, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [reduced, a, b, c]);

  return (
    <>
      {AURA.map((blob, i) => (
        <Animated.View
          key={blob.color}
          style={[
            styles.aura,
            {
              transform: [
                { translateX: drivers[i].interpolate({ inputRange: [0, 1], outputRange: [blob.from[0], blob.to[0]] }) },
                { translateY: drivers[i].interpolate({ inputRange: [0, 1], outputRange: [blob.from[1], blob.to[1]] }) },
                { scale: drivers[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.9, 1.15, 0.9] }) },
              ],
            },
          ]}
        >
          <Svg width={220} height={220}>
            <Defs>
              <RadialGradient id={`aura${i}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={blob.color} stopOpacity={blob.opacity} />
                <Stop offset="1" stopColor={blob.color} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={110} cy={110} r={110} fill={`url(#aura${i})`} />
          </Svg>
        </Animated.View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  logo: { position: 'absolute', alignSelf: 'center' },
  content: { position: 'absolute', left: 24, right: 24, gap: 32 },
  heading: { gap: 16, alignItems: 'center' },
  date: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 21.86, color: colors.navy },
  title: { fontFamily: fonts.heavy, fontSize: 20, lineHeight: 27.32, color: colors.navyTitle, textAlign: 'center' },
  cards: { gap: 16 },
  card: {
    height: 127,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  clip: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 30, overflow: 'hidden' },
  aura: { position: 'absolute', width: 220, height: 220 },
  flash: { backgroundColor: '#ffffff', borderRadius: 30 },
  cardLabel: { fontFamily: fonts.heavy, fontSize: 18, lineHeight: 24, color: colors.navy },
  tab: { position: 'absolute', left: 24, right: 24 },
});

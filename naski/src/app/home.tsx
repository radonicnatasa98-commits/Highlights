import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Appear } from '../components/Appear';
import { Glass } from '../components/Glass';
import { Icon } from '../components/Icon';
import { PostItSheet } from '../components/PostItSheet';
import { Screen, useDesignBottom, useDesignTop } from '../components/Screen';
import { TabBar } from '../components/TabBar';
import { Toast } from '../components/Toast';
import { TodayEntry } from '../components/TodayEntry';
import { WeekStrip } from '../components/WeekStrip';
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
  const { entries, add } = useEntries();
  const days = useMemo(() => new Set(entries.map((e) => e.date)), [entries]);
  const latestToday = entries.filter((e) => e.date === dayKey(new Date())).at(-1);

  return (
    <Screen background="home" breathing>
      <Appear order={0} style={[styles.logo, { top: top + 56 }]}>
        <BreathingLogo />
      </Appear>

      <Appear order={1} style={[styles.week, { top: top + 104 }]}>
        <WeekStrip days={days} />
      </Appear>

      <View style={[styles.content, { top: top + 222 }]}>
        <View style={styles.heading}>
          <Appear order={2} style={styles.date}>
            <Icon icon={calendar} color={colors.navy} />
            <Text style={styles.dateText}>{today()}</Text>
          </Appear>
          <Appear order={3}>
            <Text style={styles.title}>Cosa vuoi scrivere oggi?</Text>
          </Appear>
        </View>

        <View style={styles.cards}>
          <Appear order={4}>
            <Card label="Post-it" open={postIt} glow={saved} sheenDelay={900} onPress={() => setPostIt(true)} />
          </Appear>
          <Appear order={5}>
            <Card label="Diario" sheenDelay={1100} />
          </Appear>
          <Appear order={6}>
            <TodayEntry
              entry={latestToday}
              onPress={() => (latestToday ? router.replace('/calendar') : setPostIt(true))}
            />
          </Appear>
        </View>
      </View>

      <Appear order={7} style={[styles.tab, { bottom: bottom + 24 }]}>
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
  // Primo passaggio del riflesso, dopo l'entrata.
  sheenDelay: number;
};

function Card({ label, onPress, open = false, glow = 0, sheenDelay }: CardProps) {
  const reduced = useReducedMotion();
  const press = useAnimatedNumber(0);
  const turn = useAnimatedNumber(0);
  const flash = useAnimatedNumber(0);
  const sheen = useAnimatedNumber(0);
  const [width, setWidth] = useState(327);

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

  // Riflesso di luce che attraversa il vetro: dopo l'entrata, poi ogni 7 secondi.
  useEffect(() => {
    if (reduced) return;
    const pass = Animated.sequence([
      Animated.timing(sheen, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
      Animated.timing(sheen, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]);
    const loop = Animated.sequence([
      Animated.delay(sheenDelay),
      Animated.loop(Animated.sequence([pass, Animated.delay(7000)])),
    ]);
    loop.start();
    return () => loop.stop();
  }, [reduced, sheen, sheenDelay]);

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
        <Glass radius={30} style={styles.card} onLayout={setWidth}>
          <View pointerEvents="none" style={styles.clip}>
            <Animated.View
              style={[
                styles.sheen,
                {
                  transform: [
                    { translateX: sheen.interpolate({ inputRange: [0, 1], outputRange: [-160, width + 40] }) },
                    { rotate: '20deg' },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
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

const styles = StyleSheet.create({
  logo: { position: 'absolute', alignSelf: 'center' },
  week: { position: 'absolute', left: 24, right: 24 },
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
  sheen: { position: 'absolute', top: -40, bottom: -40, width: 110 },
  flash: { backgroundColor: '#ffffff', borderRadius: 30 },
  cardLabel: { fontFamily: fonts.heavy, fontSize: 18, lineHeight: 24, color: colors.navy },
  tab: { position: 'absolute', left: 24, right: 24 },
});

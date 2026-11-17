import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Appear } from '../components/Appear';
import { Glass } from '../components/Glass';
import { Icon } from '../components/Icon';
import { PostItSheet } from '../components/PostItSheet';
import { Screen, useDesignBottom, useDesignTop } from '../components/Screen';
import { TabBar } from '../components/TabBar';
import { Toast } from '../components/Toast';
import { TopBar } from '../components/TopBar';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { dayKey, EntryType, useEntries } from '../store/entries';
import { bookOpen, calendar, logoMark, plusCircle, stickerSquare, type IconSvg } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function Home() {
  const top = useDesignTop();
  const bottom = useDesignBottom();
  // Foglio aperto (Post-it o Diario); "kind" resta impostato anche durante l'animazione di chiusura.
  const [writing, setWriting] = useState(false);
  const [kind, setKind] = useState<EntryType>('postit');
  const [saved, setSaved] = useState<{ postit: number; diario: number }>({ postit: 0, diario: 0 });
  const open = (k: EntryType) => {
    setKind(k);
    setWriting(true);
  };
  const [toast, setToast] = useState<string | null>(null);
  const { add } = useEntries();

  return (
    <Screen background="home" breathing>
      <Appear order={0} style={[styles.topBar, { top: top + 60 }]}>
        <TopBar left={<BreathingLogo />} />
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
            <Card
              label="Post-it"
              hint="Una frase breve, al massimo 30 caratteri"
              icon={stickerSquare}
              open={writing && kind === 'postit'}
              glow={saved.postit}
              onPress={() => open('postit')}
            />
          </Appear>
          <Appear order={4}>
            <Card
              label="Diario"
              hint="Un pensiero più lungo, senza limiti"
              icon={bookOpen}
              open={writing && kind === 'diario'}
              glow={saved.diario}
              onPress={() => open('diario')}
            />
          </Appear>
        </View>
      </View>

      <Appear order={5} style={[styles.tab, { bottom: bottom + 24 }]}>
        <TabBar active="home" />
      </Appear>

      <PostItSheet
        visible={writing}
        kind={kind}
        onClose={() => setWriting(false)}
        onSave={({ text, tags }) => {
          add({ type: kind, text, tags, date: dayKey(new Date()) });
          setWriting(false);
          setSaved((n) => ({ ...n, [kind]: n[kind] + 1 }));
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
  // Riga che spiega la differenza tra Post-it e Diario.
  hint: string;
  icon: IconSvg;
  onPress?: () => void;
  // Foglio aperto: il "+" resta ruotato di 90°.
  open?: boolean;
  // Cambia a ogni salvataggio: la card fa un breve bagliore.
  glow?: number;
};

function Card({ label, hint, icon, onPress, open = false, glow = 0 }: CardProps) {
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
          <View style={styles.cardText}>
            <View style={styles.cardTitle}>
              <Icon icon={icon} size={20} color={colors.navy} />
              <Text style={styles.cardLabel}>{label}</Text>
            </View>
            <Text style={styles.cardHint}>{hint}</Text>
          </View>
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
  topBar: { position: 'absolute', left: 24, right: 24 },
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
  flash: { backgroundColor: '#ffffff', borderRadius: 30 },
  cardText: { flex: 1, gap: 6, paddingRight: 12 },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLabel: { fontFamily: fonts.heavy, fontSize: 18, lineHeight: 24, color: colors.navy },
  cardHint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: 'rgba(18,37,91,0.7)' },
  tab: { position: 'absolute', left: 24, right: 24 },
});

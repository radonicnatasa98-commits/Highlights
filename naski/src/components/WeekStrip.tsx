import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { dayKey } from '../store/entries';
import { star06 } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';
import { Glass } from './Glass';
import { Icon } from './Icon';

const LETTERS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
// La sfumatura del simbolo Naski.
export const BRAND_GRADIENT = ['#2d5cf2', '#19a9f9'] as const;

// Giorni di fila con almeno uno scritto, contando fino a oggi (o fino a ieri se oggi non hai ancora scritto).
function streak(days: Set<string>) {
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function Check() {
  return (
    <Svg width={11} height={11} viewBox="0 0 12 12">
      <Path
        d="M2.5 6.2l2.3 2.3 4.7-5"
        stroke="#ffffff"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// La settimana corrente, da lunedì: una capsula di vetro per giorno, con il sigillo blu nei giorni in cui hai scritto.
export function WeekStrip({ days }: { days: Set<string> }) {
  const reduced = useReducedMotion();
  const today = dayKey(new Date());
  const wroteToday = days.has(today);
  const pop = useAnimatedNumber(wroteToday ? 1 : 0);

  // Il sigillo di oggi "scoppia" quando scrivi il primo scritto della giornata.
  useEffect(() => {
    if (!wroteToday) return pop.setValue(0);
    if (reduced) return pop.setValue(1);
    Animated.spring(pop, { toValue: 1, damping: 8, stiffness: 200, useNativeDriver: true }).start();
  }, [wroteToday, reduced, pop]);

  const week = useMemo(() => {
    const now = new Date();
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
    return LETTERS.map((letter, i) => {
      const key = dayKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
      return { letter, key, done: days.has(key), isToday: key === today, future: key > today };
    });
  }, [days, today]);

  const count = streak(days);
  const doneThisWeek = week.filter((d) => d.done).length;

  return (
    <Glass radius={24} sheen fill="rgba(255,255,255,0.32)" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>
          QUESTA SETTIMANA <Text style={styles.labelCount}>· {doneThisWeek}/7</Text>
        </Text>
        <Glass radius={999} fill="rgba(255,255,255,0.7)" borderWidth={1} style={styles.pill}>
          <Icon icon={star06} size={12} color={colors.blue} />
          <Text style={styles.pillText}>
            {count === 0 ? 'Inizia oggi' : count === 1 ? '1 giorno di fila' : `${count} giorni di fila`}
          </Text>
        </Glass>
      </View>

      <View style={styles.days}>
        {week.map((d) => {
          const seal = d.done ? (
            <View style={styles.glow}>
              <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.seal}>
                <Check />
              </LinearGradient>
            </View>
          ) : (
            <View style={[styles.pending, d.future && styles.pendingFuture]} />
          );
          return (
            <View
              key={d.key}
              style={[styles.capsule, d.isToday && styles.capsuleToday, d.future && styles.capsuleFuture]}
            >
              <Text style={[styles.letter, d.isToday && styles.letterToday]}>{d.letter}</Text>
              <View style={styles.sealBox}>
                {d.isToday && d.done ? (
                  <Animated.View
                    style={{ transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }}
                  >
                    {seal}
                  </Animated.View>
                ) : (
                  seal
                )}
              </View>
            </View>
          );
        })}
      </View>
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 },
  label: { fontFamily: fonts.heavy, fontSize: 11, lineHeight: 14, letterSpacing: 1.2, color: 'rgba(18,37,91,0.55)' },
  labelCount: { color: colors.navy },
  pill: { height: 22, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  pillText: { fontFamily: fonts.heavy, fontSize: 11, lineHeight: 14, color: colors.navy },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  capsule: {
    width: 36,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  capsuleToday: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderColor: '#ffffff',
    shadowColor: '#2d5cf2',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  capsuleFuture: { opacity: 0.55 },
  letter: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14, color: 'rgba(18,37,91,0.6)' },
  letterToday: { fontFamily: fonts.heavy, color: colors.navy },
  sealBox: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  glow: {
    borderRadius: 10,
    shadowColor: '#2d5cf2',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  seal: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pending: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(18,37,91,0.18)' },
  pendingFuture: { backgroundColor: 'rgba(18,37,91,0.1)' },
});

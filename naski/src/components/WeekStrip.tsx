import { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { dayKey } from '../store/entries';
import { colors, fonts } from '../theme/tokens';
import { Glass } from './Glass';

const LETTERS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

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
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Path
        d="M2.5 6.2l2.3 2.3 4.7-5"
        stroke="#ffffff"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// La settimana corrente, da lunedì: cerchio pieno nei giorni in cui hai scritto, oggi con l'anello.
export function WeekStrip({ days }: { days: Set<string> }) {
  const reduced = useReducedMotion();
  const today = dayKey(new Date());
  const wroteToday = days.has(today);
  const pop = useAnimatedNumber(wroteToday ? 1 : 0);

  // Il cerchio di oggi "scoppia" quando scrivi il primo scritto della giornata.
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

  return (
    <Glass radius={20} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>La tua settimana</Text>
        <Text style={styles.streak}>
          {count === 0 ? 'Inizia oggi' : count === 1 ? '1 giorno di fila' : `${count} giorni di fila`}
        </Text>
      </View>
      <View style={styles.days}>
        {week.map((d) => {
          const circle = (
            <View
              style={[
                styles.circle,
                d.done ? styles.circleDone : styles.circleEmpty,
                d.future && styles.circleFuture,
                d.isToday && styles.circleToday,
              ]}
            >
              {d.done && <Check />}
            </View>
          );
          return (
            <View key={d.key} style={styles.day}>
              <Text style={[styles.letter, d.isToday && styles.letterToday]}>{d.letter}</Text>
              {d.isToday && d.done ? (
                <Animated.View
                  style={{ transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }}
                >
                  {circle}
                </Animated.View>
              ) : (
                circle
              )}
            </View>
          );
        })}
      </View>
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, gap: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: fonts.heavy, fontSize: 14, lineHeight: 18, color: colors.navy },
  streak: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: colors.blue },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 4, width: 28 },
  letter: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: 'rgba(18,37,91,0.7)' },
  letterToday: { fontFamily: fonts.heavy, color: colors.navy },
  circle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  circleDone: { backgroundColor: '#2d5cf2' },
  circleEmpty: { backgroundColor: 'rgba(255,255,255,0.45)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  circleFuture: { opacity: 0.5 },
  circleToday: { borderWidth: 2, borderColor: colors.navy },
});

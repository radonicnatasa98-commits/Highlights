import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useReducedMotion } from '../hooks/useReducedMotion';

import { bell01, calendarTab, homeSmile, star06, tabIndicator, type IconSvg } from '../theme/icons';
import { colors } from '../theme/tokens';
import { Glass } from './Glass';
import { Icon } from './Icon';

export type Tab = 'home' | 'calendar' | 'tracker' | 'reminders';

const TABS: { key: Tab; icon: IconSvg; label: string; route: '/home' | '/calendar' | '/tracker' | '/reminders' }[] = [
  { key: 'home', icon: homeSmile, label: 'Home', route: '/home' },
  { key: 'calendar', icon: calendarTab, label: 'Calendario', route: '/calendar' },
  { key: 'tracker', icon: star06, label: 'Tracker AI', route: '/tracker' },
  { key: 'reminders', icon: bell01, label: 'Promemoria', route: '/reminders' },
];

type Props = { active: Tab };

// Ogni schermata ha la sua barra: qui resta il tab di prima, da cui far partire la goccia blu.
let lastIndex: number | null = null;

export function TabBar({ active }: Props) {
  const [width, setWidth] = useState(327);
  const index = TABS.findIndex((t) => t.key === active);
  // Icone da 24px distribuite tra i padding di 40px: passo tra un'icona e l'altra.
  const step = (width - 80 - 24) / (TABS.length - 1);
  const reduced = useReducedMotion();
  const [from] = useState(() => lastIndex ?? index);
  const slide = useAnimatedNumber(from === index ? 1 : 0);
  const bounce = useAnimatedNumber(from === index ? 1 : 0);

  useEffect(() => {
    lastIndex = index;
    if (from === index) return;
    if (reduced) {
      slide.setValue(1);
      bounce.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.spring(slide, { toValue: 1, damping: 16, stiffness: 170, useNativeDriver: true }),
      Animated.spring(bounce, { toValue: 1, damping: 7, stiffness: 260, useNativeDriver: true }),
    ]).start();
  }, [from, index, reduced, slide, bounce]);

  const indicatorX = slide.interpolate({ inputRange: [0, 1], outputRange: [(from - index) * step, 0] });
  const iconScale = bounce.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  return (
    <Glass radius={30} frost style={styles.bar} onLayout={setWidth}>
      {/* Indicatore blu sotto l'icona attiva, tagliato dal bordo della barra come in Figma. */}
      <View pointerEvents="none" style={styles.clip}>
        <Animated.View style={[styles.indicator, { left: 21 + index * step, transform: [{ translateX: indicatorX }] }]}>
          <Icon icon={tabIndicator} />
        </Animated.View>
      </View>
      {TABS.map((t) => (
        <Pressable
          key={t.key}
          onPress={() => t.key !== active && router.replace(t.route)}
          hitSlop={12}
          accessibilityRole="tab"
          accessibilityLabel={t.label}
        >
          <Animated.View style={t.key === active ? { transform: [{ scale: iconScale }] } : null}>
            <Icon icon={t.icon} color={t.key === active ? colors.blue : colors.navy} />
          </Animated.View>
        </Pressable>
      ))}
    </Glass>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  clip: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 30, overflow: 'hidden' },
  indicator: { position: 'absolute', top: 56 },
});

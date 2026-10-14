import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { bell01, calendarTab, homeSmile, star06, tabIndicator, type IconSvg } from '../theme/icons';
import { colors } from '../theme/tokens';
import { Glass } from './Glass';
import { Icon } from './Icon';

export type Tab = 'home' | 'calendar' | 'tracker' | 'reminders';

const TABS: { key: Tab; icon: IconSvg; label: string }[] = [
  { key: 'home', icon: homeSmile, label: 'Home' },
  { key: 'calendar', icon: calendarTab, label: 'Calendario' },
  { key: 'tracker', icon: star06, label: 'Tracker AI' },
  { key: 'reminders', icon: bell01, label: 'Promemoria' },
];

type Props = { active: Tab; onChange?: (tab: Tab) => void };

export function TabBar({ active, onChange }: Props) {
  const [width, setWidth] = useState(327);
  const index = TABS.findIndex((t) => t.key === active);
  // Icone da 24px distribuite tra i padding di 40px: passo tra un'icona e l'altra.
  const step = (width - 80 - 24) / (TABS.length - 1);
  return (
    <Glass radius={30} style={styles.bar} onLayout={setWidth}>
      {/* Indicatore blu sotto l'icona attiva, tagliato dal bordo della barra come in Figma. */}
      <View pointerEvents="none" style={styles.clip}>
        <View style={[styles.indicator, { left: 21 + index * step }]}>
          <Icon icon={tabIndicator} />
        </View>
      </View>
      {TABS.map((t) => (
        <Pressable key={t.key} onPress={() => onChange?.(t.key)} hitSlop={12} accessibilityRole="tab" accessibilityLabel={t.label}>
          <Icon icon={t.icon} color={t.key === active ? colors.blue : colors.navy} />
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

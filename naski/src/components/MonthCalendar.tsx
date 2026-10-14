import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dayKey } from '../store/entries';
import { chevronLeft, chevronRight } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';
import { Glass } from './Glass';
import { Icon } from './Icon';

// Nel design mese e giorni della settimana sono in inglese ("October 2025", "Mo Tu …").
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

type Cell = { date: Date; inMonth: boolean } | null;

// Settimane del mese, da lunedì; i giorni del mese prima sono in grigio, quelli dopo restano vuoti.
function weeks(month: Date): Cell[][] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Cell[] = [];
  for (let i = lead; i > 0; i--) cells.push({ date: new Date(first.getFullYear(), first.getMonth(), 1 - i), inMonth: false });
  for (let d = 1; d <= days; d++) cells.push({ date: new Date(first.getFullYear(), first.getMonth(), d), inMonth: true });
  while (cells.length % 7) cells.push(null);
  const rows: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

type Props = {
  month: Date;
  selected: string;
  marked: Set<string>;
  onSelect: (key: string) => void;
  onMonthChange: (delta: number) => void;
};

// Componente "Calendar" dei frame Calendar_01–04.
export function MonthCalendar({ month, selected, marked, onSelect, onMonthChange }: Props) {
  const today = dayKey(new Date());

  return (
    <Glass radius={32} fill="rgba(255,255,255,0.3)" sheen style={styles.card}>
      <View style={styles.top}>
        <Pressable onPress={() => onMonthChange(-1)} hitSlop={10} accessibilityLabel="Mese precedente">
          <Icon icon={chevronLeft} color={colors.navy} />
        </Pressable>
        <Text style={styles.month}>
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </Text>
        <Pressable onPress={() => onMonthChange(1)} hitSlop={10} accessibilityLabel="Mese successivo">
          <Icon icon={chevronRight} color={colors.navy} />
        </Pressable>
      </View>

      <LinearGradient
        colors={['rgba(255,255,255,0)', '#ffffff', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.line}
      />

      <View style={styles.grid}>
        <View style={styles.row}>
          {WEEKDAYS.map((d) => (
            <Text key={d} style={styles.weekday}>
              {d}
            </Text>
          ))}
        </View>
        <View style={styles.weeks}>
          {weeks(month).map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map((cell, c) => {
                if (!cell) return <View key={c} style={styles.cell} />;
                const key = dayKey(cell.date);
                const isToday = cell.inMonth && key === today;
                const isSelected = cell.inMonth && key === selected && !isToday;
                const number = (
                  <Text
                    style={[
                      styles.number,
                      !cell.inMonth && styles.numberOther,
                      isToday && styles.numberToday,
                      isSelected && styles.numberSelected,
                    ]}
                  >
                    {cell.date.getDate()}
                  </Text>
                );
                return (
                  <Pressable
                    key={c}
                    style={styles.cell}
                    disabled={!cell.inMonth}
                    onPress={() => onSelect(key)}
                    accessibilityLabel={`${cell.date.getDate()} ${MONTHS[cell.date.getMonth()]}`}
                    accessibilityState={{ selected: key === selected }}
                  >
                    {isSelected ? (
                      <Glass radius={15} fill="rgba(255,255,255,0.2)" sheen borderWidth={1} style={styles.circle}>
                        {number}
                      </Glass>
                    ) : (
                      <View style={[styles.circle, isToday && styles.circleToday]}>{number}</View>
                    )}
                    {cell.inMonth && marked.has(key) && <View style={styles.dot} />}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 10, paddingTop: 16, paddingBottom: 12, gap: 16 },
  top: { height: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { fontFamily: fonts.heavy, fontSize: 18, lineHeight: 24, color: colors.navy },
  line: { height: 1 },
  grid: { gap: 20 },
  weeks: { gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  weekday: {
    width: 30,
    height: 30,
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 27,
    color: 'rgba(18,37,91,0.8)',
    textAlign: 'center',
  },
  cell: { width: 30, height: 40, alignItems: 'center', gap: 2 },
  circle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  circleToday: { backgroundColor: '#2d5cf2' },
  number: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: 'rgba(18,37,91,0.8)', textAlign: 'center' },
  numberOther: { color: 'rgba(156,156,156,0.8)' },
  numberToday: { color: colors.white },
  numberSelected: { color: colors.inputText },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.inputText },
});

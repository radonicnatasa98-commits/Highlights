import { useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import type { Time } from '../store/reminders';
import { fonts } from '../theme/tokens';

const ITEM = 25;
const VISIBLE = 7;
const PAD = ((VISIBLE - 1) / 2) * ITEM;

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

type Props = { value: Time; onChange: (time: Time) => void };

// TimePicker di Figma: tre rulli (ore, minuti, AM/PM) con la riga scelta su una barra blu
// e le altre che si inclinano e sbiadiscono verso l'alto e il basso, come la rotella di iOS.
export function TimeWheel({ value, onChange }: Props) {
  const hour12 = value.hour % 12 === 0 ? 12 : value.hour % 12;
  const pm = value.hour >= 12;
  const set = (h12: number, minute: number, isPm: boolean) => onChange({ hour: (h12 % 12) + (isPm ? 12 : 0), minute });

  return (
    <View style={styles.wheel}>
      <View pointerEvents="none" style={styles.selection} />
      <Column items={HOURS} index={hour12 - 1} align="right" onIndex={(i) => set(i + 1, value.minute, pm)} />
      <Column items={MINUTES} index={value.minute} align="left" onIndex={(i) => set(hour12, i, pm)} />
      <Column items={PERIODS} index={pm ? 1 : 0} align="left" onIndex={(i) => set(hour12, value.minute, i === 1)} />
    </View>
  );
}

type ColumnProps = { items: string[]; index: number; align: 'left' | 'right'; onIndex: (i: number) => void };

function Column({ items, index, align, onIndex }: ColumnProps) {
  const scrollY = useAnimatedNumber(index * ITEM);
  const [current, setCurrent] = useState(index);
  const scroller = useRef<ScrollView>(null);

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
    listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const i = Math.max(0, Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.y / ITEM)));
      if (i !== current) {
        setCurrent(i);
        onIndex(i);
      }
    },
  });

  return (
    <ScrollView
      ref={scroller}
      // contentOffset non vale sul web: la posizione iniziale si imposta appena la colonna è misurata.
      onLayout={() => scroller.current?.scrollTo({ y: index * ITEM, animated: false })}
      style={styles.column}
      contentContainerStyle={{ paddingVertical: PAD }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM}
      decelerationRate="fast"
      contentOffset={{ x: 0, y: index * ITEM }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      nestedScrollEnabled
    >
      {items.map((label, i) => {
        const range = [(i - 3) * ITEM, (i - 1) * ITEM, i * ITEM, (i + 1) * ITEM, (i + 3) * ITEM];
        return (
          <Animated.Text
            key={label}
            style={[
              styles.item,
              { textAlign: align },
              {
                color: scrollY.interpolate({
                  inputRange: [(i - 0.5) * ITEM, i * ITEM, (i + 0.5) * ITEM],
                  outputRange: ['#013365', '#ffffff', '#013365'],
                  extrapolate: 'clamp',
                }),
                opacity: scrollY.interpolate({
                  inputRange: range,
                  outputRange: [0.25, 0.85, 1, 0.85, 0.25],
                  extrapolate: 'clamp',
                }),
                transform: [
                  { perspective: 400 },
                  {
                    rotateX: scrollY.interpolate({
                      inputRange: range,
                      outputRange: ['-70deg', '-25deg', '0deg', '25deg', '70deg'],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          >
            {label}
          </Animated.Text>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wheel: { height: ITEM * VISIBLE, flexDirection: 'row', justifyContent: 'center', gap: 18 },
  selection: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: PAD - (34 - ITEM) / 2,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#165dfb',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  column: { width: 54, flexGrow: 0 },
  item: {
    height: ITEM,
    lineHeight: ITEM,
    fontFamily: Platform.OS === 'ios' ? undefined : fonts.roboto,
    fontSize: 21,
    letterSpacing: 1.5,
  },
});

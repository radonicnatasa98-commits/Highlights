import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { EntryBox } from '../components/EntryBox';
import { Header } from '../components/Header';
import { Icon } from '../components/Icon';
import { MenuButton } from '../components/MenuButton';
import { MonthCalendar } from '../components/MonthCalendar';
import { Screen, useDesignBottom, useDesignTop } from '../components/Screen';
import { TabBar } from '../components/TabBar';
import { TimeWheel } from '../components/TimeWheel';
import { dayKey, EntryType, useEntries } from '../store/entries';
import { formatDate, formatTime, Time, useReminders } from '../store/reminders';
import { calendar, chevronDown, chevronUp, clock } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';

// Frame Promemoria_10–13 e 19–21: data e ora in cui ricevere lo scritto.
// Si arriva qui con uno scritto scelto (entryId), uno nuovo (text) o un promemoria da modificare (reminderId).
export default function ScheduleReminder() {
  const top = useDesignTop();
  const bottom = useDesignBottom();
  const params = useLocalSearchParams<{ entryId?: string; text?: string; reminderId?: string }>();
  const { entries } = useEntries();
  const { future, addFuture, updateFuture, setNotice } = useReminders();

  const editing = future.find((f) => f.id === params.reminderId);
  const entry = entries.find((e) => e.id === params.entryId);
  const source: { type: EntryType; text: string; date: string } | null = editing
    ? { type: editing.type, text: editing.text, date: editing.date }
    : entry
      ? { type: entry.type, text: entry.text, date: entry.date }
      : params.text
        ? { type: 'postit', text: params.text, date: dayKey(new Date()) }
        : null;

  const [date, setDate] = useState<string | null>(editing?.date ?? null);
  const [time, setTime] = useState<Time | null>(editing?.time ?? null);
  const [open, setOpen] = useState<'date' | 'time' | null>(null);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const marked = useMemo(() => new Set<string>(), []);

  const ready = !!source && !!date && !!time;

  const create = () => {
    if (!ready || !source) return;
    if (editing) {
      updateFuture(editing.id, date, time);
      setNotice('Promemoria futuro aggiornato');
    } else {
      addFuture({ type: source.type, text: source.text, date, time });
      setNotice('Promemoria futuro creato con successo');
    }
    router.dismissTo('/reminders');
  };

  const toggle = (which: 'date' | 'time') => {
    if (which === 'time' && !time) setTime({ hour: 9, minute: 41 });
    setOpen((o) => (o === which ? null : which));
  };

  return (
    <Screen background="home">
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: top + 60, paddingBottom: bottom + 180 }]}>
        <View style={styles.menuRow}>
          <MenuButton />
        </View>
        <Header title="Promemoria futuro" onBack={() => router.back()} />
        <Text style={styles.subtitle}>Seleziona data e ora del promemoria</Text>

        {source && (
          <View style={styles.group}>
            <Text style={styles.date}>{formatDate(source.date)}</Text>
            <EntryBox type={source.type} text={source.text} radio="on" selected />
          </View>
        )}

        <View style={styles.accordion}>
          <Pressable
            style={styles.row}
            onPress={() => toggle('date')}
            accessibilityRole="button"
            accessibilityLabel="Data"
          >
            <View style={styles.rowLabel}>
              <Icon icon={calendar} color={colors.navy} />
              <Text style={styles.rowText}>{date ? formatDate(date) : 'Data'}</Text>
            </View>
            <Icon icon={open === 'date' ? chevronUp : chevronDown} color={colors.inputText} />
          </Pressable>
          {open === 'date' && (
            <MonthCalendar
              month={month}
              selected={date ?? ''}
              marked={marked}
              onSelect={(key) => {
                setDate(key);
                setOpen(time ? null : 'time');
                if (!time) setTime({ hour: 9, minute: 41 });
              }}
              onMonthChange={(delta) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))}
            />
          )}
          <LinearGradient
            colors={['rgba(255,255,255,0)', '#ffffff', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.line}
          />
          <Pressable
            style={styles.row}
            onPress={() => toggle('time')}
            accessibilityRole="button"
            accessibilityLabel="Ora"
          >
            <View style={styles.rowLabel}>
              <Icon icon={clock} color={colors.inputText} />
              <Text style={styles.rowText}>{time ? formatTime(time) : 'Ora'}</Text>
            </View>
            <Icon icon={open === 'time' ? chevronUp : chevronDown} color={colors.inputText} />
          </Pressable>
          {open === 'time' && time && <TimeWheel value={time} onChange={setTime} />}
        </View>
      </ScrollView>

      <View style={[styles.buttons, { bottom: bottom + 112 }]}>
        <Button
          label="Cancella"
          size="compact"
          variant="outline"
          style={styles.flex}
          onPress={() => router.dismissTo('/reminders')}
        />
        <Button
          label={editing ? 'Salva' : 'Crea'}
          size="compact"
          disabled={!ready}
          style={styles.flex}
          onPress={create}
        />
      </View>

      <View style={[styles.tab, { bottom: bottom + 24 }]}>
        <TabBar active="reminders" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, gap: 16 },
  menuRow: { alignItems: 'flex-end', height: 38, marginBottom: 8 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.navy, textAlign: 'center' },
  group: { gap: 12 },
  date: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.navy },
  accordion: { padding: 8, gap: 12 },
  row: { height: 40, padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.navy },
  line: { height: 1 },
  buttons: { position: 'absolute', left: 24, right: 24, flexDirection: 'row', gap: 16 },
  flex: { flex: 1 },
  tab: { position: 'absolute', left: 24, right: 24 },
});

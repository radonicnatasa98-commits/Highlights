import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EntrySheet, EntrySheetMode } from '../components/EntrySheet';
import { Glass } from '../components/Glass';
import { Icon } from '../components/Icon';
import { MonthCalendar } from '../components/MonthCalendar';
import { PostItSheet } from '../components/PostItSheet';
import { Screen, useDesignBottom, useDesignTop } from '../components/Screen';
import { TabBar } from '../components/TabBar';
import { dayKey, Entry, useEntries } from '../store/entries';
import { download, edit, menu, plus, search, stickerSquare } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';

// Colore della barretta a sinistra di ogni scritto (Post-it come in Calendar_02).
const RAIL = { postit: '#89e4fa', diario: '#b7baed' };

export default function CalendarScreen() {
  const top = useDesignTop();
  const bottom = useDesignBottom();
  const { entries, add, update, remove } = useEntries();

  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(() => dayKey(new Date()));
  const [open, setOpen] = useState<{ entry: Entry; mode: EntrySheetMode } | null>(null);
  const [writing, setWriting] = useState(false);

  const marked = useMemo(() => new Set(entries.map((e) => e.date)), [entries]);
  const dayEntries = entries.filter((e) => e.date === selected);

  return (
    <Screen background="home">
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: top + 60, paddingBottom: bottom + 120 }]}>
        <View style={styles.menuRow}>
          <Glass radius={4} style={styles.menu}>
            <Icon icon={menu} color={colors.navy} />
          </Glass>
        </View>

        <View style={styles.content}>
          <View style={styles.ctas}>
            <Glass radius={20} fill="rgba(255,255,255,0.5)" style={styles.round}>
              <Icon icon={search} color={colors.inputText} />
            </Glass>
            <Pressable onPress={() => setWriting(true)} accessibilityRole="button" accessibilityLabel="Nuovo Post-it">
              <Glass radius={20} fill="rgba(255,255,255,0.5)" style={styles.round}>
                <Icon icon={plus} color={colors.inputText} />
              </Glass>
            </Pressable>
          </View>

          <MonthCalendar
            month={month}
            selected={selected}
            marked={marked}
            onSelect={setSelected}
            onMonthChange={(delta) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))}
          />
        </View>

        <View style={styles.entries}>
          {dayEntries.length === 0 ? (
            <Text style={styles.empty}>Nessuna frase di gratitudine</Text>
          ) : (
            dayEntries.map((entry) => (
              <View key={entry.id}>
                <View style={styles.entry}>
                  <View style={[styles.rail, { backgroundColor: RAIL[entry.type] }]} />
                  <View style={styles.entryBody}>
                    <View style={styles.entryTitle}>
                      <Icon icon={stickerSquare} color={colors.navy} />
                      <Text style={styles.entryType}>{entry.type === 'postit' ? 'Post-it' : 'Diario'}</Text>
                    </View>
                    <Text style={styles.entryText} numberOfLines={2}>
                      {entry.text}
                    </Text>
                  </View>
                </View>
                <View style={styles.entryIcons}>
                  <Pressable onPress={() => setOpen({ entry, mode: 'share' })} hitSlop={8} accessibilityLabel="Condividi">
                    <Icon icon={download} color={colors.navy} />
                  </Pressable>
                  <Pressable onPress={() => setOpen({ entry, mode: 'edit' })} hitSlop={8} accessibilityLabel="Modifica">
                    <Icon icon={edit} color={colors.navy} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={[styles.tab, { bottom: bottom + 24 }]}>
        <TabBar active="calendar" />
      </View>

      <EntrySheet
        entry={open?.entry ?? null}
        mode={open?.mode ?? 'edit'}
        onClose={() => setOpen(null)}
        onSave={(id, text) => {
          update(id, text);
          setOpen(null);
        }}
        onDelete={(id) => {
          remove(id);
          setOpen(null);
        }}
      />
      <PostItSheet
        visible={writing}
        onClose={() => setWriting(false)}
        onSave={({ text, tags }) => {
          add({ type: 'postit', text, tags, date: selected });
          setWriting(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, gap: 24 },
  menuRow: { alignItems: 'flex-end', height: 38, marginBottom: 11 },
  menu: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  content: { gap: 32 },
  ctas: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  round: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  entries: { gap: 16 },
  empty: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.inputText, textAlign: 'center' },
  entry: { flexDirection: 'row', gap: 8 },
  rail: { width: 4, borderRadius: 999 },
  entryBody: { flex: 1 },
  entryTitle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  entryType: { fontFamily: fonts.heavy, fontSize: 14, lineHeight: 22, color: colors.navy },
  entryText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colors.navy },
  entryIcons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  tab: { position: 'absolute', left: 24, right: 24 },
});

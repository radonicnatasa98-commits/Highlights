import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { EntryBox } from '../components/EntryBox';
import { Glass } from '../components/Glass';
import { Header } from '../components/Header';
import { Icon } from '../components/Icon';
import { MonthCalendar } from '../components/MonthCalendar';
import { Screen, useDesignBottom, useDesignTop } from '../components/Screen';
import { Sheet } from '../components/Sheet';
import { TabBar } from '../components/TabBar';
import { Entry, useEntries } from '../store/entries';
import { formatDate } from '../store/reminders';
import { calendar, circlePlus, menu } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';

// Frame Promemoria_05–09: scegli un Post-it o un Diario già scritto, con filtro per data.
export default function ChooseEntry() {
  const top = useDesignTop();
  const bottom = useDesignBottom();
  const { entries } = useEntries();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [draft, setDraft] = useState('');
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [preview, setPreview] = useState<Entry | null>(null);

  const marked = useMemo(() => new Set(entries.map((e) => e.date)), [entries]);
  const groups = useMemo(() => {
    const list = [...entries].filter((e) => !filter || e.date === filter).sort((a, b) => (a.date < b.date ? 1 : -1));
    const byDate = new Map<string, Entry[]>();
    for (const e of list) byDate.set(e.date, [...(byDate.get(e.date) ?? []), e]);
    return [...byDate.entries()];
  }, [entries, filter]);

  const openPicker = () => {
    setDraft(filter ?? '');
    setPicking(true);
  };

  return (
    <Screen background="home">
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: top + 60, paddingBottom: bottom + 200 }]}>
        <View style={styles.menuRow}>
          <Glass radius={4} style={styles.menu}>
            <Icon icon={menu} color={colors.navy} />
          </Glass>
        </View>
        <Header title="Promemoria futuro" onBack={() => router.back()} />
        <Text style={styles.subtitle}>Seleziona il post-it o diario</Text>

        <Pressable
          onPress={openPicker}
          style={styles.filter}
          accessibilityRole="button"
          accessibilityLabel="Filtra per data"
        >
          <View style={styles.filterRow}>
            <View style={styles.filterLabel}>
              <Icon icon={calendar} color={colors.navy} />
              <Text style={styles.filterText}>{filter ? formatDate(filter) : 'Filtra per Data'}</Text>
            </View>
            <Icon icon={circlePlus} color={colors.inputText} />
          </View>
          <LinearGradient
            colors={['rgba(255,255,255,0)', '#ffffff', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.line}
          />
        </Pressable>

        {groups.length === 0 && <Text style={styles.empty}>Nessuno scritto in questa data</Text>}
        {groups.map(([date, list]) => (
          <View key={date} style={styles.group}>
            <Text style={styles.date}>{formatDate(date)}</Text>
            {list.map((e) => (
              <EntryBox
                key={e.id}
                type={e.type}
                text={e.text}
                radio={selected === e.id ? 'on' : 'off'}
                selected={selected === e.id}
                onPress={() => setSelected(e.id)}
                onMore={() => setPreview(e)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      {selected && (
        <View style={[styles.continue, { bottom: bottom + 112 }]}>
          <Button
            label="Continua"
            onPress={() => router.push({ pathname: '/reminders-schedule', params: { entryId: selected } })}
          />
        </View>
      )}

      <View style={[styles.tab, { bottom: bottom + 24 }]}>
        <TabBar active="reminders" />
      </View>

      {/* Promemoria_07: calendario a comparsa per filtrare per data. */}
      {picking && (
        <View style={StyleSheet.absoluteFill}>
          <BlurView intensity={8} tint="default" style={StyleSheet.absoluteFill} />
          <Pressable
            style={[StyleSheet.absoluteFill, styles.veil]}
            onPress={() => setPicking(false)}
            accessibilityLabel="Chiudi"
          />
          <View style={[styles.popup, { top: top + 191 }]}>
            <MonthCalendar
              solid
              month={month}
              selected={draft}
              marked={marked}
              onSelect={(key) => setDraft((d) => (d === key ? '' : key))}
              onMonthChange={(delta) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))}
              footer={
                <Pressable
                  onPress={() => {
                    setFilter(draft || null);
                    setPicking(false);
                  }}
                  style={styles.saveLink}
                  accessibilityRole="button"
                >
                  <Text style={styles.saveLinkText}>Salva</Text>
                </Pressable>
              }
            />
          </View>
        </View>
      )}

      {/* Promemoria_06: anteprima dello scritto. */}
      <Sheet
        visible={!!preview}
        title={preview ? `${preview.type === 'postit' ? 'Post-it' : 'Diario'} del ${formatDate(preview.date)}` : ''}
        onClose={() => setPreview(null)}
      >
        <Text style={styles.previewText}>{preview?.text}</Text>
        <View style={styles.previewButtons}>
          <Button label="Chiudi" variant="outline" gilmer style={styles.flex} onPress={() => setPreview(null)} />
          <Button
            label="Salva"
            style={styles.flex}
            onPress={() => {
              if (preview) setSelected(preview.id);
              setPreview(null);
            }}
          />
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, gap: 16 },
  menuRow: { alignItems: 'flex-end', height: 38, marginBottom: 8 },
  menu: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.navy, textAlign: 'center' },
  filter: { padding: 8, gap: 12 },
  filterRow: { height: 40, padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.navy },
  line: { height: 1 },
  empty: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.inputText, textAlign: 'center' },
  group: { gap: 12 },
  date: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.navy },
  continue: { position: 'absolute', left: 24, right: 24 },
  tab: { position: 'absolute', left: 24, right: 24 },
  veil: { backgroundColor: 'rgba(22,93,251,0.4)' },
  popup: { position: 'absolute', left: 24, right: 24 },
  saveLink: { alignSelf: 'center', paddingVertical: 4 },
  saveLinkText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.navy,
    textDecorationLine: 'underline',
  },
  previewText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.inputText },
  previewButtons: { flexDirection: 'row', gap: 16 },
  flex: { flex: 1 },
});

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomToast } from '../components/BottomToast';
import { Button } from '../components/Button';
import { EntryBox } from '../components/EntryBox';
import { Glass } from '../components/Glass';
import { Icon } from '../components/Icon';
import { TopBar } from '../components/TopBar';
import { Screen, useDesignBottom, useDesignTop } from '../components/Screen';
import { Sheet } from '../components/Sheet';
import { TabBar } from '../components/TabBar';
import { TimeWheel } from '../components/TimeWheel';
import { Toggle } from '../components/Toggle';
import { formatDate, formatTime, Time, useReminders } from '../store/reminders';
import { bell01, bellRinging, chevronDown, chevronUp, clock } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';

// Frame Promemoria_01–03, 14–16 e 17: promemoria giornaliero, capsula futura e lista dei promemoria.
export default function Reminders() {
  const top = useDesignTop();
  const bottom = useDesignBottom();
  const { daily, setDaily, future, removeFuture, notice, setNotice } = useReminders();
  const [editingTime, setEditingTime] = useState(false);
  const [draftTime, setDraftTime] = useState<Time>(daily.time);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);
  const [text, setText] = useState('');
  const scroller = useRef<ScrollView>(null);

  const toggleDaily = (on: boolean) => {
    if (on) {
      setDraftTime(daily.time);
      setEditingTime(true);
    } else {
      setDaily(false);
      setEditingTime(false);
    }
  };

  const saveDaily = () => {
    setDaily(true, draftTime);
    setEditingTime(false);
    setNotice('Promemoria giornaliero attivato');
  };

  const dailyOn = daily.enabled || editingTime;

  return (
    <Screen background="home">
      <ScrollView
        ref={scroller}
        contentContainerStyle={[styles.scroll, { paddingTop: top + 60, paddingBottom: bottom + 170 }]}
        onScrollBeginDrag={() => setMenuFor(null)}
      >
        <View style={styles.menuRow}>
          <TopBar title="Promemoria" />
        </View>

        <Glass radius={24} fill="rgba(255,255,255,0.2)" sheen style={styles.card}>
          <View style={styles.cardTitle}>
            <Icon icon={bellRinging} color={colors.navy} />
            <Text style={styles.cardTitleText}>Promemoria giornaliero</Text>
          </View>
          <Divider />
          <View style={styles.dailyRow}>
            <Text style={styles.body}>Attiva una notifica giornaliera per ricordarti di praticare la gratitudine.</Text>
            <Toggle value={dailyOn} onChange={toggleDaily} label="Promemoria giornaliero" />
          </View>
          {dailyOn && (
            <Pressable
              style={styles.dropdown}
              onPress={() => {
                setDraftTime(daily.time);
                setEditingTime((v) => !v);
              }}
              accessibilityRole="button"
              accessibilityLabel="Cambia orario"
            >
              <Text style={styles.time}>{formatTime(editingTime ? draftTime : daily.time)}</Text>
              <Icon icon={editingTime ? chevronUp : chevronDown} color={colors.inputText} />
            </Pressable>
          )}
          {editingTime && (
            <View style={styles.picker}>
              <TimeWheel value={draftTime} onChange={setDraftTime} />
              <Pressable onPress={saveDaily} style={styles.saveLink} accessibilityRole="button">
                <Text style={styles.saveLinkText}>Salva</Text>
              </Pressable>
            </View>
          )}
        </Glass>

        <Glass radius={24} fill="rgba(255,255,255,0.2)" sheen style={styles.card}>
          <View style={styles.cardTitle}>
            <Icon icon={clock} color={colors.navy} />
            <Text style={styles.cardTitleText}>Promemoria futuro</Text>
          </View>
          <Divider />
          <View style={styles.futureBody}>
            <Text style={styles.body}>
              Crea una Capsula futura.{'\n'}Scrivi un nuovo post-it o scegli uno che hai già creato per riceverlo nel
              futuro.
            </Text>
            <View style={styles.ctas}>
              <Button label="Crea nuovo promemoria" onPress={() => setWriting(true)} />
              <Button label="Scegli gratitudine già esistente" onPress={() => router.push('/reminders-choose')} />
            </View>
          </View>
        </Glass>

        {future.length > 0 && (
          <View style={styles.list}>
            <Text style={styles.listLabel}>I tuoi promemoria per il futuro</Text>
            {future.map((r) => (
              <View key={r.id} style={menuFor === r.id ? styles.raised : null}>
                <EntryBox
                  type={r.type}
                  text={r.text}
                  selected
                  moreActive={menuFor === r.id}
                  onMore={() => {
                    setMenuFor((id) => (id === r.id ? null : r.id));
                    // L'ultimo promemoria è vicino alla barra in basso: scorre su perché il menu resti visibile.
                    if (r.id === future[future.length - 1].id) setTimeout(() => scroller.current?.scrollToEnd(), 50);
                  }}
                >
                  <View style={styles.when}>
                    <Icon icon={bell01} size={16} color={colors.inputText} />
                    <Text style={styles.whenText}>
                      {formatDate(r.date)}, {formatTime(r.time)}
                    </Text>
                  </View>
                </EntryBox>
                {menuFor === r.id && (
                  <Glass radius={16} fill="rgba(255,255,255,0.92)" style={styles.popover}>
                    <Pressable
                      onPress={() => {
                        setMenuFor(null);
                        router.push({ pathname: '/reminders-schedule', params: { reminderId: r.id } });
                      }}
                    >
                      <Text style={styles.popoverText}>Modifica</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setMenuFor(null);
                        removeFuture(r.id);
                        setNotice('Promemoria eliminato');
                      }}
                    >
                      <Text style={styles.popoverText}>Elimina</Text>
                    </Pressable>
                  </Glass>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.tab, { bottom: bottom + 24 }]}>
        <TabBar active="reminders" />
      </View>

      {/* Promemoria_18: scrivere una nuova capsula per il futuro. */}
      <Sheet visible={writing} title="Promemoria futuro" onClose={() => setWriting(false)} onClosed={() => setText('')}>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder="Ricorda al te del futuro qualcosa per cui provi gratitudine adesso..."
          placeholderTextColor={colors.inputText}
          selectionColor={colors.inputText}
          style={styles.input}
        />
        <Button
          label="Salva"
          onPress={() => {
            if (!text.trim()) return;
            setWriting(false);
            router.push({ pathname: '/reminders-schedule', params: { text: text.trim() } });
          }}
        />
      </Sheet>

      <BottomToast message={notice} onHidden={() => setNotice(null)} />
    </Screen>
  );
}

function Divider() {
  return (
    <LinearGradient
      colors={['rgba(255,255,255,0)', '#ffffff', 'rgba(255,255,255,0)']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.divider}
    />
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, gap: 16 },
  menuRow: { marginBottom: 6 },
  card: { padding: 16, gap: 12 },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitleText: { fontFamily: fonts.heavy, fontSize: 16, lineHeight: 24, color: colors.navy },
  divider: { height: 1 },
  dailyRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  body: { flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.navy },
  dropdown: { height: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  time: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 22, color: colors.inputText },
  picker: { gap: 16, marginTop: 4 },
  saveLink: { alignSelf: 'center', paddingVertical: 4 },
  saveLinkText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.navy,
    textDecorationLine: 'underline',
  },
  futureBody: { gap: 24 },
  ctas: { gap: 16 },
  list: { gap: 8, marginTop: 0 },
  listLabel: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.inputText },
  raised: { zIndex: 2 },
  when: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  whenText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.inputText },
  popover: { position: 'absolute', right: 6, top: 62, padding: 8, gap: 8, alignItems: 'center' },
  popoverText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.inputText,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.inputText,
    textAlign: 'center',
    textAlignVertical: 'top',
    padding: 0,
    marginBottom: 24,
    outlineStyle: 'none',
  } as object,
  tab: { position: 'absolute', left: 24, right: 24 },
});

import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Glass } from '../components/Glass';
import { Icon } from '../components/Icon';
import { TopBar } from '../components/TopBar';
import { TAGS } from '../components/PostItSheet';
import { Screen, useDesignBottom, useDesignTop } from '../components/Screen';
import { TabBar } from '../components/TabBar';
import { TagBubbles } from '../components/TagBubbles';
import { Toast } from '../components/Toast';
import { dayKey, useEntries } from '../store/entries';
import { messageSmile } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';

type Period = 'week' | 'month';

// Come si legge ogni tag dentro la frase in fondo alla schermata.
const PHRASE: Record<string, string> = {
  Famiglia: 'la famiglia',
  Amicizia: "l'amicizia",
  'Lavoro e studio': 'il lavoro e lo studio',
  'Salute e Benessere': 'la salute e il benessere',
  'Tempo libero': 'il tempo libero',
  Altro: 'tante piccole cose',
};

// Primo giorno del periodo: gli ultimi 7 giorni (oggi compreso) o il primo del mese.
function periodStart(period: Period) {
  const now = new Date();
  return period === 'week'
    ? dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6))
    : dayKey(new Date(now.getFullYear(), now.getMonth(), 1));
}

// Frame TrackerAI: una bolla per tag, più grande quanto più spesso hai scelto quel tag.
export default function Tracker() {
  const top = useDesignTop();
  const bottom = useDesignBottom();
  const { entries } = useEntries();
  const [period, setPeriod] = useState<Period>('week');
  const [width, setWidth] = useState(375);
  const [toast, setToast] = useState<string | null>(null);

  const counts = useMemo(() => {
    const from = periodStart(period);
    const to = dayKey(new Date());
    const tally = new Map(TAGS.map((t) => [t.label, 0]));
    for (const e of entries) {
      if (e.date < from || e.date > to) continue;
      for (const tag of e.tags) tally.set(tag, (tally.get(tag) ?? 0) + 1);
    }
    return [...tally.entries()] as [string, number][];
  }, [entries, period]);

  const best = [...counts].sort((a, b) => b[1] - a[1])[0];
  const when = period === 'week' ? 'Questa settimana' : 'Questo mese';
  const message =
    best && best[1] > 0
      ? `${when} hai espresso molta gratitudine per ${PHRASE[best[0]]}, condividilo con chi vuoi.`
      : `${when} non hai ancora usato nessun tag: aggiungili ai tuoi Post-it e qui vedrai per cosa provi più gratitudine.`;

  const share = async () => {
    if (!best || best[1] === 0) return;
    const text = `${when} ho espresso molta gratitudine per ${PHRASE[best[0]]} (Naski)`;
    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(text);
      setToast('Copiato, incollalo dove vuoi');
    } else {
      await Share.share({ message: text });
    }
  };

  return (
    <Screen background="home" onWidth={setWidth}>
      <View style={[styles.menuRow, { top: top + 60 }]}>
        <TopBar title="Tracker AI" />
      </View>

      <View style={[styles.segmentWrap, { top: top + 122 }]}>
        <Glass radius={24} fill="rgba(255,255,255,0.2)" sheen style={styles.segment}>
          {(['week', 'month'] as const).map((p) => {
            const active = period === p;
            const label = p === 'week' ? 'Settimana' : 'Mese';
            return (
              <Pressable
                key={p}
                style={styles.segmentItem}
                onPress={() => setPeriod(p)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                {active ? (
                  <Glass radius={20} fill="#2d5cf2" sheen borderWidth={1} style={styles.segmentFill}>
                    <Text style={[styles.segmentText, styles.segmentTextActive]}>{label}</Text>
                  </Glass>
                ) : (
                  <View style={styles.segmentFill}>
                    <Text style={styles.segmentText}>{label}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </Glass>
      </View>

      <TagBubbles counts={counts} offsetX={(width - 375) / 2} top={top} />

      <Pressable onPress={share} style={[styles.insight, { bottom: bottom + 112 }]} accessibilityRole="button">
        <Icon icon={messageSmile} color={colors.navy} />
        <Text style={styles.insightText}>{message}</Text>
      </Pressable>

      <View style={[styles.tab, { bottom: bottom + 24 }]}>
        <TabBar active="tracker" />
      </View>
      <Toast message={toast} onHidden={() => setToast(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  menuRow: { position: 'absolute', left: 24, right: 24 },
  segmentWrap: { position: 'absolute', left: 24, right: 24 },
  segment: { height: 48, flexDirection: 'row', padding: 4, gap: 8 },
  segmentItem: { flex: 1 },
  segmentFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 16, color: '#2d5cf2' },
  segmentTextActive: { color: colors.white },
  insight: { position: 'absolute', left: 24, right: 24, flexDirection: 'row', gap: 8 },
  insightText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.navy },
  tab: { position: 'absolute', left: 24, right: 24 },
});

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Glass } from '../components/Glass';
import { Icon } from '../components/Icon';
import { PostItSheet } from '../components/PostItSheet';
import { Screen, useDesignBottom, useDesignTop } from '../components/Screen';
import { TabBar } from '../components/TabBar';
import { calendar, logoMark, plusCircle } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function Home() {
  const top = useDesignTop();
  const bottom = useDesignBottom();
  const [postIt, setPostIt] = useState(false);

  return (
    <Screen background="home">
      <View style={[styles.logo, { top: top + 56 }]}>
        <Icon icon={logoMark} size={38} />
      </View>

      <View style={[styles.content, { top: top + 222 }]}>
        <View style={styles.heading}>
          <View style={styles.date}>
            <Icon icon={calendar} color={colors.navy} />
            <Text style={styles.dateText}>{today()}</Text>
          </View>
          <Text style={styles.title}>Cosa vuoi scrivere oggi?</Text>
        </View>

        <View style={styles.cards}>
          <Card label="Post-it" onPress={() => setPostIt(true)} />
          <Card label="Diario" />
        </View>
      </View>

      <View style={[styles.tab, { bottom: bottom + 24 }]}>
        <TabBar active="home" />
      </View>

      <PostItSheet visible={postIt} onClose={() => setPostIt(false)} onSave={() => setPostIt(false)} />
    </Screen>
  );
}

function Card({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      {({ pressed }) => (
        <Glass radius={30} style={[styles.card, pressed && styles.pressed]}>
          <Text style={styles.cardLabel}>{label}</Text>
          <Icon icon={plusCircle} color={colors.blue} />
        </Glass>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logo: { position: 'absolute', alignSelf: 'center' },
  content: { position: 'absolute', left: 24, right: 24, gap: 32 },
  heading: { gap: 16, alignItems: 'center' },
  date: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 21.86, color: colors.navy },
  title: { fontFamily: fonts.heavy, fontSize: 20, lineHeight: 27.32, color: colors.navyTitle, textAlign: 'center' },
  cards: { gap: 16 },
  card: {
    height: 127,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  pressed: { opacity: 0.8 },
  cardLabel: { fontFamily: fonts.heavy, fontSize: 18, lineHeight: 24, color: colors.navy },
  tab: { position: 'absolute', left: 24, right: 24 },
});

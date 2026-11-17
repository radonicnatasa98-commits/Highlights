import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Entry } from '../store/entries';
import { chevronRight, star06 } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';
import { Glass } from './Glass';
import { Icon } from './Icon';
import { TAGS } from './PostItSheet';
import { BRAND_GRADIENT } from './WeekStrip';

const MONTHS = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];

type Props = { entry: Entry | undefined; onPress: () => void };

// L'ultimo scritto di oggi come una citazione, oppure un invito a scrivere se oggi non c'è ancora niente.
export function TodayEntry({ entry, onPress }: Props) {
  const now = new Date();
  const kicker = `OGGI · ${now.getDate()} ${MONTHS[now.getMonth()]}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={entry ? 'Apri il calendario' : 'Scrivi un Post-it'}
    >
      {({ pressed }) => (
        <Glass radius={24} sheen fill="rgba(255,255,255,0.32)" style={[styles.card, pressed && styles.pressed]}>
          {entry ? (
            <View style={styles.row}>
              <Text style={styles.quote}>“</Text>
              <View style={styles.body}>
                <View style={styles.meta}>
                  <Text style={styles.kicker}>{kicker}</Text>
                  <View style={styles.type}>
                    <Text style={styles.typeText}>{entry.type === 'postit' ? 'Post-it' : 'Diario'}</Text>
                  </View>
                </View>
                <Text style={styles.text} numberOfLines={1}>
                  {entry.text}
                </Text>
                {entry.tags.length > 0 && (
                  <View style={styles.tags}>
                    {entry.tags.map((label) => {
                      const tag = TAGS.find((t) => t.label === label);
                      return (
                        <View key={label} style={styles.tag}>
                          <View style={[styles.tagDot, { backgroundColor: tag?.fg ?? colors.navy }]} />
                          <Text style={styles.tagText}>{label}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.emptyRow}>
              <View style={styles.glow}>
                <LinearGradient
                  colors={BRAND_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.badge}
                >
                  <Icon icon={star06} size={18} color="#ffffff" />
                </LinearGradient>
              </View>
              <View style={styles.body}>
                <Text style={styles.kicker}>{kicker}</Text>
                <Text style={styles.emptyTitle}>La cosa bella di oggi</Text>
              </View>
              <Icon icon={chevronRight} color={colors.navy} />
            </View>
          )}
        </Glass>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16, paddingVertical: 14 },
  pressed: { opacity: 0.85 },
  row: { flexDirection: 'row', gap: 8 },
  quote: { fontFamily: fonts.heavy, fontSize: 44, lineHeight: 44, height: 30, color: '#2d5cf2', marginTop: -2 },
  body: { flex: 1, gap: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { fontFamily: fonts.heavy, fontSize: 11, lineHeight: 14, letterSpacing: 1.2, color: 'rgba(18,37,91,0.55)' },
  type: {
    height: 20,
    paddingHorizontal: 8,
    borderRadius: 999,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  typeText: { fontFamily: fonts.heavy, fontSize: 11, lineHeight: 14, color: colors.navy },
  text: { fontFamily: fonts.heavy, fontSize: 18, lineHeight: 24, color: colors.navy },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  tag: {
    height: 22,
    borderRadius: 999,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagText: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14, color: colors.navy },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  glow: {
    borderRadius: 20,
    shadowColor: '#2d5cf2',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: fonts.heavy, fontSize: 16, lineHeight: 22, color: colors.navy },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Entry } from '../store/entries';
import { stickerSquare } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';
import { Glass } from './Glass';
import { Icon } from './Icon';
import { TAGS } from './PostItSheet';

const RAIL = { postit: '#89e4fa', diario: '#b7baed' };

type Props = { entry: Entry | undefined; onPress: () => void };

// L'ultimo scritto di oggi, oppure un invito a scrivere se oggi non c'è ancora niente.
export function TodayEntry({ entry, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={entry ? 'Apri il calendario' : 'Scrivi un Post-it'}
    >
      <Glass radius={20} style={styles.card}>
        {entry ? (
          <View style={styles.row}>
            <View style={[styles.rail, { backgroundColor: RAIL[entry.type] }]} />
            <View style={styles.body}>
              <View style={styles.title}>
                <Icon icon={stickerSquare} color={colors.navy} />
                <Text style={styles.kicker}>Il tuo scritto di oggi</Text>
              </View>
              <Text style={styles.text} numberOfLines={1}>
                {entry.text}
              </Text>
              {entry.tags.length > 0 && (
                <View style={styles.tags}>
                  {entry.tags.map((label) => {
                    const tag = TAGS.find((t) => t.label === label);
                    return (
                      <View key={label} style={[styles.tag, { backgroundColor: tag?.bg ?? '#ffffff' }]}>
                        <Text style={[styles.tagText, { color: tag?.fg ?? colors.navy }]}>{label}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Non hai ancora scritto oggi</Text>
            <Text style={styles.emptyText}>Bastano poche parole: tocca Post-it e annota una cosa bella.</Text>
          </View>
        )}
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16, paddingVertical: 14 },
  row: { flexDirection: 'row', gap: 10 },
  rail: { width: 4, borderRadius: 999 },
  body: { flex: 1, gap: 4 },
  title: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  kicker: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: 'rgba(18,37,91,0.7)' },
  text: { fontFamily: fonts.heavy, fontSize: 16, lineHeight: 22, color: colors.navy },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  tag: { height: 22, borderRadius: 999, paddingHorizontal: 8, justifyContent: 'center' },
  tagText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  empty: { gap: 2, alignItems: 'center' },
  emptyTitle: { fontFamily: fonts.heavy, fontSize: 14, lineHeight: 20, color: colors.navy },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(18,37,91,0.7)',
    textAlign: 'center',
  },
});

import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { EntryType } from '../store/entries';
import { bookOpen, dotsHorizontal, stickerSquare } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';
import { Glass } from './Glass';
import { Icon } from './Icon';

type Props = {
  type: EntryType;
  text: string;
  // Pallino di selezione a sinistra (lista "Seleziona il post-it o diario").
  radio?: 'on' | 'off';
  selected?: boolean;
  onPress?: () => void;
  onMore?: () => void;
  // Righe aggiuntive sotto il testo (per esempio data e ora del promemoria).
  children?: ReactNode;
  moreActive?: boolean;
};

// Componente "Box" dei frame Promemoria: tipo di scritto, testo su due righe e menu "…".
export function EntryBox({ type, text, radio, selected, onPress, onMore, children, moreActive }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={radio ? 'radio' : undefined}
      accessibilityState={radio ? { checked: radio === 'on' } : undefined}
    >
      <Glass
        radius={20}
        fill="rgba(255,255,255,0.2)"
        borderColor={selected ? '#2d5cf2' : undefined}
        borderWidth={selected ? 1 : 2}
        style={styles.box}
      >
        {radio && (
          <View style={styles.radioWrap}>
            <View style={[styles.radio, radio === 'on' && styles.radioOn]}>
              {radio === 'on' && <View style={styles.dot} />}
            </View>
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.title}>
            <Icon icon={type === 'postit' ? stickerSquare : bookOpen} size={16} color={colors.navy} />
            <Text style={styles.type}>{type === 'postit' ? 'Post-it' : 'Diario'}</Text>
          </View>
          <Text style={styles.text} numberOfLines={2}>
            {text}
          </Text>
          {children}
        </View>
        {onMore && (
          <Pressable
            onPress={onMore}
            hitSlop={10}
            accessibilityLabel="Altre azioni"
            style={[styles.more, moreActive && styles.moreActive]}
          >
            <Icon icon={dotsHorizontal} color={moreActive ? '#ffffff' : colors.navy} />
          </Pressable>
        )}
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: 16, padding: 12 },
  radioWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2d5cf2',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: 'rgba(45,92,242,0.6)' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2d5cf2' },
  body: { flex: 1, gap: 4 },
  title: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  type: { fontFamily: fonts.heavy, fontSize: 16, lineHeight: 20, color: colors.navy },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.navy },
  more: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  moreActive: { backgroundColor: '#165dfb' },
});

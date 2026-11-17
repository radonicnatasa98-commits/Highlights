import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme/tokens';
import { MenuButton } from './MenuButton';

type Props = { title?: string; left?: ReactNode };

// Intestazione comune delle sezioni della barra in basso: titolo (o logo) a sinistra, menu a destra.
export function TopBar({ title, left }: Props) {
  return (
    <View style={styles.bar}>
      {left ?? (
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      )}
      <MenuButton />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.heavy, fontSize: 24, lineHeight: 30, color: colors.navy },
});

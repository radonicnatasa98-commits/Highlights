import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme/tokens';
import { chevronLeft } from '../theme/icons';
import { Glass } from './Glass';
import { Icon } from './Icon';

type Props = { title: string; onBack?: () => void };

export function Header({ title, onBack }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} hitSlop={8} accessibilityRole="button" accessibilityLabel="Indietro">
        <Glass radius={20} fill="rgba(255,255,255,0.5)" style={styles.back}>
          <Icon icon={chevronLeft} color={colors.navy} />
        </Glass>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.back} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.heavy, fontSize: 16, lineHeight: 20, color: colors.navy },
});

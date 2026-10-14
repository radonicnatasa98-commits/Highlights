import { Pressable, StyleSheet, Text, View } from 'react-native';

import { appleLogo, googleLogo } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';
import { Icon } from './Icon';

type Props = { onGoogle?: () => void; onApple?: () => void };

export function SocialButtons({ onGoogle, onApple }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.or}>Or sign up with</Text>
      <View style={styles.buttons}>
        <Pressable onPress={onGoogle} style={({ pressed }) => [styles.btn, styles.google, pressed && styles.pressed]}>
          <Icon icon={googleLogo} />
          <Text style={[styles.label, styles.googleLabel]}>Continue with Google</Text>
        </Pressable>
        <Pressable onPress={onApple} style={({ pressed }) => [styles.btn, styles.apple, pressed && styles.pressed]}>
          <Icon icon={appleLogo} />
          <Text style={[styles.label, styles.appleLabel]}>Continue with Apple</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 24 },
  or: { fontFamily: fonts.dmLight, fontSize: 12, lineHeight: 15.6, color: colors.black, textAlign: 'center' },
  buttons: { gap: 8 },
  btn: {
    height: 46,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  google: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.googleBorder },
  apple: { backgroundColor: colors.black },
  pressed: { opacity: 0.85 },
  label: { fontSize: 18, lineHeight: 21 },
  googleLabel: { fontFamily: fonts.roboto, color: colors.googleText },
  appleLabel: { fontFamily: fonts.apple, fontWeight: '500', color: colors.white },
});

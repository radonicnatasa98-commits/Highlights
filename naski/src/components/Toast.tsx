import { useEffect } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { checkCircle } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';
import { Glass } from './Glass';
import { Icon } from './Icon';

type Props = { message: string | null; onHidden: () => void };

// Messaggio di conferma che scende dall'alto e sparisce da solo dopo 2 secondi.
export function Toast({ message, onHidden }: Props) {
  const insets = useSafeAreaInsets();
  const progress = useAnimatedNumber(0);
  const check = useAnimatedNumber(0);

  useEffect(() => {
    if (!message) return;
    progress.setValue(0);
    check.setValue(0);
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.spring(progress, { toValue: 1, damping: 14, stiffness: 160, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(150),
          Animated.spring(check, { toValue: 1, damping: 8, stiffness: 220, useNativeDriver: true }),
        ]),
      ]),
      Animated.delay(2000),
      Animated.timing(progress, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]);
    anim.start(({ finished }) => finished && onHidden());
    return () => anim.stop();
    // onHidden cambia a ogni render: l'animazione dipende solo dal messaggio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, progress, check]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          top: Math.max(insets.top, 12) + 8,
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }],
        },
      ]}
    >
      <Glass radius={999} fill="rgba(255,255,255,0.85)" style={styles.toast}>
        <Animated.View style={{ transform: [{ scale: check }] }}>
          <Icon icon={checkCircle} size={18} />
        </Animated.View>
        <Text style={styles.text}>{message}</Text>
      </Glass>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  text: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.navy },
});

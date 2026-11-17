import { useEffect } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { messageCheck } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';
import { Icon } from './Icon';
import { useDesignBottom } from './Screen';

type Props = { message: string | null; onHidden: () => void };

// Componente "toast" dei promemoria: sopra la barra in basso, bordo verde acqua, sparisce dopo 2,5 secondi.
export function BottomToast({ message, onHidden }: Props) {
  const bottom = useDesignBottom();
  const progress = useAnimatedNumber(0);

  useEffect(() => {
    if (!message) return;
    progress.setValue(0);
    const anim = Animated.sequence([
      Animated.spring(progress, { toValue: 1, damping: 14, stiffness: 170, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(progress, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]);
    anim.start(({ finished }) => finished && onHidden());
    return () => anim.stop();
    // onHidden cambia a ogni render: l'animazione dipende solo dal messaggio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, progress]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          bottom: bottom + 120,
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
        },
      ]}
    >
      <Icon icon={messageCheck} color="#48c1b5" />
      <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#48c1b5',
    backgroundColor: '#f6fff9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  text: { flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.navy },
});

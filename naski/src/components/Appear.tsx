import { ReactNode, useEffect } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = { order: number; style?: StyleProp<ViewStyle>; children: ReactNode };

// Entrata in sequenza: ogni elemento sale di 14px e compare, 70ms dopo il precedente.
export function Appear({ order, style, children }: Props) {
  const reduced = useReducedMotion();
  const progress = useAnimatedNumber(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: reduced ? 200 : 520,
      delay: reduced ? 0 : 80 + order * 70,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, order, reduced]);

  const translateY = reduced ? 0 : progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  return <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

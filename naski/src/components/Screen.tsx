import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useReducedMotion } from '../hooks/useReducedMotion';

const backgrounds = {
  onboarding: require('../../assets/images/bg-onboarding.jpg'),
  home: require('../../assets/images/bg-home.jpg'),
};

// Le schermate Figma sono 375×812 con una status bar di 44px: le posizioni verticali
// del design restano valide spostandole di quanto la status bar reale è più alta.
export function useDesignTop() {
  const insets = useSafeAreaInsets();
  return Math.max(0, insets.top - 44);
}

export function useDesignBottom() {
  const insets = useSafeAreaInsets();
  return Math.max(0, insets.bottom - 34);
}

type Props = {
  background?: keyof typeof backgrounds;
  children?: ReactNode;
  // Larghezza reale dello schermo dell'app (sul web può essere più stretta della finestra).
  onWidth?: (width: number) => void;
  // Sfondo che "respira": le sfumature si spostano lentissimamente (ciclo di 24 secondi).
  breathing?: boolean;
};

export function Screen({ background = 'onboarding', children, onWidth, breathing }: Props) {
  const reduced = useReducedMotion();
  const drift = useAnimatedNumber(0);
  const alive = breathing && !reduced;

  useEffect(() => {
    if (!alive) return;
    const ease = Easing.inOut(Easing.sin);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 12000, easing: ease, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 12000, easing: ease, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [alive, drift]);

  const motion = alive
    ? {
        transform: [
          { scale: drift.interpolate({ inputRange: [0, 1], outputRange: [1.08, 1.16] }) },
          { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-10, 12] }) },
          { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [8, -14] }) },
        ],
      }
    : null;

  return (
    <View style={styles.root} onLayout={onWidth && ((e) => onWidth(e.nativeEvent.layout.width))}>
      <StatusBar style="dark" />
      <Animated.View style={[StyleSheet.absoluteFill, motion]}>
        <Image source={backgrounds[background]} style={StyleSheet.absoluteFill} contentFit="cover" />
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#c6d7f6', overflow: 'hidden' },
});

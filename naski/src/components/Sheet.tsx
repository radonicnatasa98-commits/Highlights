import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect, useState } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { colors, fonts } from '../theme/tokens';
import { useDesignBottom } from './Screen';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  // Chiamato a chiusura finita, per azzerare il contenuto.
  onClosed?: () => void;
  children: ReactNode;
};

// Foglio dal basso dei frame HomePage_02 e Calendar_03/04: velo blu sfocato,
// intestazione sfumata con titolo e corpo bianco.
export function Sheet({ visible, title, onClose, onClosed, children }: Props) {
  const bottom = useDesignBottom();
  const [mounted, setMounted] = useState(visible);
  const progress = useAnimatedNumber(0);

  // Resta montato durante l'animazione di chiusura.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 320 : 240,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visible) {
        setMounted(false);
        onClosed?.();
      }
    });
    // onClosed può cambiare a ogni render: conta solo l'apertura/chiusura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, progress]);

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
        <BlurView intensity={8} tint="default" style={StyleSheet.absoluteFill} />
        <Pressable style={[StyleSheet.absoluteFill, styles.overlay]} onPress={onClose} accessibilityLabel="Chiudi" />
      </Animated.View>

      <KeyboardAvoidingView
        pointerEvents="box-none"
        style={styles.wrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [700, 0] }) }] },
          ]}
        >
          <LinearGradient
            colors={colors.sheetHeader}
            locations={[0, 0.5, 1]}
            start={{ x: -0.039, y: 0 }}
            end={{ x: 1.041, y: 1.167 }}
            style={styles.top}
          >
            <Text style={styles.title}>{title}</Text>
          </LinearGradient>
          <View style={[styles.body, { paddingBottom: 24 + bottom }]}>{children}</View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: 'rgba(22,93,251,0.4)' },
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  sheet: { height: 671 },
  top: {
    height: 66,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center',
    paddingTop: 29,
  },
  title: { fontFamily: fonts.heavy, fontSize: 16, lineHeight: 20, color: colors.inputText, textAlign: 'center' },
  body: { flex: 1, backgroundColor: colors.white, padding: 24, justifyContent: 'space-between' },
});

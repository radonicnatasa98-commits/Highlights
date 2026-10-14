import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
};

export function Screen({ background = 'onboarding', children, onWidth }: Props) {
  return (
    <View style={styles.root} onLayout={onWidth && ((e) => onWidth(e.nativeEvent.layout.width))}>
      <StatusBar style="dark" />
      <Image source={backgrounds[background]} style={StyleSheet.absoluteFill} contentFit="cover" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#c6d7f6', overflow: 'hidden' },
});

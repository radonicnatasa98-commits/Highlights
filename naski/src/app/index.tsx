import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Screen, useDesignBottom, useDesignTop } from '../components/Screen';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { logoMark, logoTagline, logoWordmark } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';

// Posizioni e dimensioni prese dai frame Onboarding_01–03 (375×812).
const PAGES = [
  {
    title: 'Scrivi un Post-it o un diario',
    body: 'Esprimi la tua gratitudine come preferisci:\nscrivi un post-it breve e spontaneo oppure un diario più profondo e riflessivo.',
    image: require('../../assets/images/pencil.png'),
    frame: { x: 76, y: 138, w: 223, h: 307 },
    fit: 'cover' as const,
    opacity: 1,
  },
  {
    title: 'Imposta il tuo promemoria giornaliero e futuro',
    body: 'Attiva il tuo Daily Ring: un promemoria gentile per non dimenticare di scrivere ogni giorno ciò per cui sei grato.',
    image: require('../../assets/images/bell.png'),
    frame: { x: 86, y: 164, w: 203, h: 250 },
    fit: 'cover' as const,
    opacity: 1,
  },
  {
    title: 'Tracker AI',
    body: 'Scopri il tuo percorso con il Tracker AI: analizza i tuoi pensieri e osserva come cresce la tua gratitudine nel tempo.',
    // Ritaglio dal render di Figma (la stella è ruotata e ha l'ombra sotto).
    image: require('../../assets/images/star.png'),
    frame: { x: 30, y: 125, w: 315, h: 370 },
    fit: 'fill' as const,
    opacity: 1,
  },
];

// Logo_01 → Logo_02 → Logo_03: il nome sparisce, poi il simbolo si ingrandisce
// fino a uscire dallo schermo e lascia spazio all'onboarding.
const LOGO_ICON = { x: 160, y: 329, size: 56 };
const ZOOM_SCALE = 48;

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const top = useDesignTop();
  const bottom = useDesignBottom();
  const offsetX = (width - 375) / 2;

  const [page, setPage] = useState(0);
  const [splashDone, setSplashDone] = useState(false);
  const scroller = useRef<ScrollView>(null);

  const words = useAnimatedNumber(1);
  const zoom = useAnimatedNumber(0);
  const content = useAnimatedNumber(0);

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(1200),
      Animated.timing(words, { toValue: 0, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(zoom, { toValue: 1, duration: 900, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(550),
          Animated.timing(content, { toValue: 1, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]),
    ]);
    anim.start(({ finished }) => finished && setSplashDone(true));
    return () => anim.stop();
  }, [words, zoom, content]);

  const goTo = (i: number) => {
    scroller.current?.scrollTo({ x: i * width, animated: true });
    setPage(i);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <Screen>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: content }]} pointerEvents={splashDone ? 'auto' : 'none'}>
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          scrollEventThrottle={16}
        >
          {PAGES.map((p, i) => (
            <Pressable key={p.title} style={{ width }} onPress={() => i < PAGES.length - 1 && goTo(i + 1)}>
              <Image
                source={p.image}
                contentFit={p.fit}
                style={{
                  position: 'absolute',
                  left: offsetX + p.frame.x,
                  top: top + p.frame.y,
                  width: p.frame.w,
                  height: p.frame.h,
                  opacity: p.opacity,
                }}
              />
              <View style={[styles.copy, { top: top + 499 }]}>
                <Text style={styles.title}>{p.title}</Text>
                <Text style={styles.body}>{p.body}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={[styles.stepper, { top: top + 68 }]} pointerEvents="none">
          {PAGES.map((p, i) =>
            i === page ? (
              <View key={p.title} style={[styles.step, styles.stepActive]} />
            ) : (
              <LinearGradient
                key={p.title}
                colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.55)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.step}
              />
            ),
          )}
        </View>

        <View style={[styles.buttons, { bottom: bottom + 32 }]}>
          <Button label="Create an account" onPress={() => router.push('/signup')} />
          <Button label="Log in" variant="outline" onPress={() => router.push('/login')} />
        </View>
      </Animated.View>

      {!splashDone && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View
            style={{
              position: 'absolute',
              left: offsetX + LOGO_ICON.x,
              top: top + LOGO_ICON.y,
              opacity: zoom.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
              transform: [{ scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1, ZOOM_SCALE] }) }],
            }}
          >
            <Icon icon={logoMark} />
          </Animated.View>
          <Animated.View style={{ position: 'absolute', left: offsetX + 76, top: top + 396, opacity: words }}>
            <Icon icon={logoWordmark} />
          </Animated.View>
          <Animated.View style={{ position: 'absolute', left: offsetX + 99, top: top + 475, opacity: words }}>
            <Icon icon={logoTagline} />
          </Animated.View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: { position: 'absolute', left: 24, right: 24, gap: 12 },
  title: { fontFamily: fonts.heavy, fontSize: 18, lineHeight: 24, color: colors.navy, textAlign: 'center' },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.navy, textAlign: 'center' },
  stepper: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', gap: 8, paddingVertical: 2 },
  step: { width: 20, height: 4, borderRadius: 2 },
  stepActive: { backgroundColor: colors.navy },
  buttons: { position: 'absolute', left: 24, right: 24, gap: 8 },
});

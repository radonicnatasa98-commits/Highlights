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
import { ArtKind, OnboardingArt } from '../components/OnboardingArt';
import { Screen, useDesignBottom, useDesignTop } from '../components/Screen';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { logoMark, logoTagline, logoWordmark } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';

// Posizioni e dimensioni prese dai frame Onboarding_01–03 (375×812).
const PAGES = [
  {
    title: 'Scrivi un Post-it o un diario',
    body: 'Esprimi la tua gratitudine come preferisci:\nscrivi un post-it breve e spontaneo oppure un diario più profondo e riflessivo.',
    kind: 'pencil' as ArtKind,
    image: require('../../assets/images/pencil.png'),
    frame: { x: 76, y: 138, w: 223, h: 307 },
    fit: 'cover' as const,
    shadow: undefined,
  },
  {
    title: 'Imposta il tuo promemoria giornaliero e futuro',
    body: 'Attiva il tuo Daily Ring: un promemoria gentile per non dimenticare di scrivere ogni giorno ciò per cui sei grato.',
    kind: 'bell' as ArtKind,
    image: require('../../assets/images/bell.png'),
    frame: { x: 86, y: 164, w: 203, h: 250 },
    fit: 'cover' as const,
    shadow: { cx: 187, cy: 438, w: 150 },
  },
  {
    title: 'Tracker AI',
    body: 'Scopri il tuo percorso con il Tracker AI: analizza i tuoi pensieri e osserva come cresce la tua gratitudine nel tempo.',
    // Ritaglio dal render di Figma (la stella è ruotata), separato dallo sfondo; l'ombra è disegnata a parte.
    kind: 'star' as ArtKind,
    image: require('../../assets/images/star.png'),
    frame: { x: 30, y: 125, w: 315, h: 370 },
    fit: 'fill' as const,
    shadow: { cx: 180, cy: 444, w: 190 },
  },
];

// Logo_01 → Logo_02 → Logo_03: il nome sparisce, poi il simbolo si ingrandisce
// fino a uscire dallo schermo e lascia spazio all'onboarding.
const LOGO_ICON = { x: 160, y: 329, size: 56 };
const ZOOM_SCALE = 48;

export default function Onboarding() {
  const window = useWindowDimensions();
  const [measured, setMeasured] = useState<number>();
  const width = measured ?? window.width;
  const top = useDesignTop();
  const bottom = useDesignBottom();
  const offsetX = (width - 375) / 2;

  const [page, setPage] = useState(0);
  const [splashDone, setSplashDone] = useState(false);
  const scroller = useRef<ScrollView>(null);

  const words = useAnimatedNumber(1);
  const zoom = useAnimatedNumber(0);
  const content = useAnimatedNumber(0);
  // Posizione dello scorrimento orizzontale, per l'effetto profondità tra le pagine.
  const scrollX = useAnimatedNumber(0);

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(1200),
      Animated.timing(words, { toValue: 0, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(zoom, { toValue: 1, duration: 900, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(550),
          Animated.timing(content, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
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
    <Screen onWidth={setMeasured}>
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: content }]}
        pointerEvents={splashDone ? 'auto' : 'none'}
      >
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          contentContainerStyle={styles.pages}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          // Animato in JS: con il driver nativo scrollTo non risponde sul web.
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
        >
          {PAGES.map((p, i) => {
            // Mentre la pagina esce, l'illustrazione scorre più lenta del testo, rimpicciolisce e sfuma.
            const range = [(i - 1) * width, i * width, (i + 1) * width];
            const depth = {
              opacity: scrollX.interpolate({ inputRange: range, outputRange: [0, 1, 0], extrapolate: 'clamp' }),
              transform: [
                {
                  translateX: scrollX.interpolate({
                    inputRange: range,
                    outputRange: [-width * 0.45, 0, width * 0.45],
                    extrapolate: 'clamp',
                  }),
                },
                { scale: scrollX.interpolate({ inputRange: range, outputRange: [0.8, 1, 0.8], extrapolate: 'clamp' }) },
              ],
            };
            return (
              <View key={p.title} style={{ width, height: '100%' }}>
                <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, depth]}>
                  <OnboardingArt
                    kind={p.kind}
                    image={p.image}
                    frame={p.frame}
                    fit={p.fit}
                    shadow={p.shadow}
                    left={offsetX}
                    top={top}
                  />
                </Animated.View>
                <View style={[styles.copy, { top: top + 499 }]}>
                  <Text style={styles.title}>{p.title}</Text>
                  <Text style={styles.body}>{p.body}</Text>
                </View>
                {/* Area toccabile sopra all'illustrazione: tap per andare alla pagina successiva. */}
                <Pressable
                  style={StyleSheet.absoluteFill}
                  onPress={() => i < PAGES.length - 1 && goTo(i + 1)}
                  accessibilityLabel="Pagina successiva"
                />
              </View>
            );
          })}
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
  pages: { height: '100%' },
  copy: { position: 'absolute', left: 24, right: 24, gap: 12 },
  title: { fontFamily: fonts.heavy, fontSize: 18, lineHeight: 24, color: colors.navy, textAlign: 'center' },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.navy, textAlign: 'center' },
  stepper: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', gap: 8, paddingVertical: 2 },
  step: { width: 20, height: 4, borderRadius: 2 },
  stepActive: { backgroundColor: colors.navy },
  buttons: { position: 'absolute', left: 24, right: 24, gap: 8 },
});

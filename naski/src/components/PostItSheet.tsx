import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { xClose } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { useDesignBottom } from './Screen';

export const POST_IT_MAX = 30;

export const TAGS = [
  { label: 'Famiglia', bg: '#f3eefd', fg: '#8252ed' },
  { label: 'Amicizia', bg: '#e8f9f1', fg: '#18c178' },
  { label: 'Lavoro e studio', bg: '#fff4e7', fg: '#ff850f' },
  { label: 'Salute e Benessere', bg: '#e4f2ff', fg: '#0a7afd' },
  { label: 'Tempo libero', bg: '#f5fee7', fg: '#334c06' },
  { label: 'Altro', bg: '#ffebeb', fg: '#ff3636' },
];

export type PostIt = { text: string; tags: string[] };

type Props = { visible: boolean; onClose: () => void; onSave: (postIt: PostIt) => void };

// HomePage_02 / HomePage_03: foglio "Post-it" con testo di massimo 30 caratteri e tag selezionabili.
export function PostItSheet({ visible, onClose, onSave }: Props) {
  const bottom = useDesignBottom();
  const [mounted, setMounted] = useState(visible);
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const progress = useAnimatedNumber(0);
  const input = useRef<TextInput>(null);

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
        setText('');
        setTags([]);
      }
    });
  }, [visible, progress]);

  if (!mounted) return null;

  const save = () => {
    if (!text.trim()) return input.current?.focus();
    onSave({ text: text.trim(), tags });
  };

  const toggle = (label: string) =>
    setTags((t) => (t.includes(label) ? t.filter((x) => x !== label) : [...t, label]));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
        <BlurView intensity={8} tint="default" style={StyleSheet.absoluteFill} />
        <Pressable style={[StyleSheet.absoluteFill, styles.overlay]} onPress={onClose} accessibilityLabel="Chiudi" />
      </Animated.View>

      <KeyboardAvoidingView
        pointerEvents="box-none"
        style={styles.sheetWrap}
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
            <Text style={styles.title}>Post-it</Text>
          </LinearGradient>

          <View style={[styles.body, { paddingBottom: 24 + bottom }]}>
            <TextInput
              ref={input}
              value={text}
              onChangeText={setText}
              maxLength={POST_IT_MAX}
              placeholder="Oggi sono grato per..."
              placeholderTextColor={colors.inputText}
              selectionColor={colors.inputText}
              style={styles.input}
              returnKeyType="done"
            />

            <View style={styles.footer}>
              <View style={styles.tagsBlock}>
                <Text style={styles.tagsLabel}>Aggiungi un tag:</Text>
                <View style={styles.tags}>
                  {TAGS.map((t) => {
                    const on = tags.includes(t.label);
                    return (
                      <Pressable
                        key={t.label}
                        onPress={() => toggle(t.label)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: on }}
                        style={[styles.tag, { backgroundColor: t.bg }, on && { borderColor: t.fg, gap: 4 }]}
                      >
                        <Text style={[styles.tagText, { color: t.fg }]}>{t.label}</Text>
                        {on && <Icon icon={xClose} color={t.fg} />}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <Button label="Salva" onPress={save} />
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: 'rgba(22,93,251,0.4)' },
  sheetWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  sheet: { height: 671 },
  top: {
    height: 66,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center',
    paddingTop: 29,
  },
  title: { fontFamily: fonts.heavy, fontSize: 16, lineHeight: 20, color: colors.inputText, textAlign: 'center' },
  body: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 24,
    justifyContent: 'space-between',
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    height: 22,
    color: colors.inputText,
    textAlign: 'center',
    padding: 0,
    outlineStyle: 'none',
  } as object,
  footer: { gap: 48 },
  tagsBlock: { gap: 16 },
  tagsLabel: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.inputText },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    height: 30,
    borderRadius: 999,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22 },
});

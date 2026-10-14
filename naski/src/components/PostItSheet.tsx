import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { xClose } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { Sheet } from './Sheet';

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
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const input = useRef<TextInput>(null);

  const save = () => {
    if (!text.trim()) return input.current?.focus();
    onSave({ text: text.trim(), tags });
  };

  const toggle = (label: string) =>
    setTags((t) => (t.includes(label) ? t.filter((x) => x !== label) : [...t, label]));

  return (
    <Sheet
      visible={visible}
      title="Post-it"
      onClose={onClose}
      onClosed={() => {
        setText('');
        setTags([]);
      }}
    >
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
    </Sheet>
  );
}

const styles = StyleSheet.create({
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

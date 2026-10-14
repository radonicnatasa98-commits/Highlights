import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Linking, Platform, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import type { Entry } from '../store/entries';
import { instagram, link, whatsapp } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { POST_IT_MAX } from './PostItSheet';
import { Sheet } from './Sheet';

export type EntrySheetMode = 'edit' | 'share';

type Props = {
  entry: Entry | null;
  mode: EntrySheetMode;
  onClose: () => void;
  onSave: (id: string, text: string) => void;
  onDelete: (id: string) => void;
};

function title(entry: Entry) {
  const [y, m, d] = entry.date.split('-');
  return `${entry.type === 'postit' ? 'Post-it' : 'Diario'} del ${d}/${m}/${y}`;
}

// Calendar_03 (modifica, con Elimina e Salva) e Calendar_04 (condivisione).
export function EntrySheet({ entry, mode, onClose, onSave, onDelete }: Props) {
  // Tiene l'ultimo scritto mostrato, così il foglio non si svuota mentre si chiude.
  const [shown, setShown] = useState(entry);
  const [text, setText] = useState(entry?.text ?? '');
  if (entry && entry !== shown) {
    setShown(entry);
    setText(entry.text);
  }

  return (
    <Sheet visible={!!entry} title={shown ? title(shown) : ''} onClose={onClose}>
      {mode === 'edit' ? (
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          maxLength={shown?.type === 'postit' ? POST_IT_MAX : undefined}
          selectionColor={colors.inputText}
          style={styles.input}
        />
      ) : (
        <Text style={styles.text}>{shown?.text}</Text>
      )}

      {mode === 'edit' ? (
        <View style={styles.buttons}>
          <Button
            label="Elimina"
            variant="outline"
            gilmer
            style={styles.flex}
            onPress={() => shown && onDelete(shown.id)}
          />
          <Button
            label="Salva"
            style={styles.flex}
            onPress={() => shown && onSave(shown.id, text.trim() || shown.text)}
          />
        </View>
      ) : (
        shown && <ShareRow text={shown.text} />
      )}
    </Sheet>
  );
}

function ShareRow({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const message = `Oggi sono grato per: ${text}`;

  const copy = async () => {
    await Clipboard.setStringAsync(message);
    setCopied(true);
  };
  const shareWithSystem = async () => {
    if (Platform.OS === 'web') return copy();
    await Share.share({ message });
  };
  const whatsappShare = async () => {
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    if (await Linking.canOpenURL(url)) return Linking.openURL(url);
    return Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  return (
    <View style={styles.share}>
      <Pressable style={styles.shareItem} onPress={copy} accessibilityRole="button">
        <View style={[styles.shareCircle, styles.linkCircle]}>
          <Icon icon={link} color={colors.navy} />
        </View>
        <Text style={styles.shareLabel}>{copied ? 'Copiato' : 'Copy link'}</Text>
      </Pressable>
      <Pressable style={styles.shareItem} onPress={whatsappShare} accessibilityRole="button">
        <LinearGradient colors={['#61fd7d', '#25cf43']} style={styles.shareCircle}>
          <Icon icon={whatsapp} />
        </LinearGradient>
        <Text style={styles.shareLabel}>Whatsapp</Text>
      </Pressable>
      <Pressable style={styles.shareItem} onPress={shareWithSystem} accessibilityRole="button">
        <View style={styles.shareCircle}>
          <View style={StyleSheet.absoluteFill}>
            <Svg width={32} height={32}>
              <Defs>
                <RadialGradient id="igA" cx="8.5" cy="34.5" r="34" gradientUnits="userSpaceOnUse">
                  <Stop offset="0" stopColor="#ffdd55" />
                  <Stop offset="0.1" stopColor="#ffdd55" />
                  <Stop offset="0.5" stopColor="#ff543e" />
                  <Stop offset="1" stopColor="#c837ab" />
                </RadialGradient>
                <RadialGradient id="igB" cx="-5" cy="2.5" r="22" gradientUnits="userSpaceOnUse">
                  <Stop offset="0" stopColor="#3771c8" />
                  <Stop offset="0.13" stopColor="#3771c8" />
                  <Stop offset="1" stopColor="#6600ff" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="16" cy="16" r="16" fill="url(#igA)" />
              <Circle cx="16" cy="16" r="16" fill="url(#igB)" />
            </Svg>
          </View>
          <Icon icon={instagram} />
        </View>
        <Text style={styles.shareLabel}>Instagram</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.inputText,
    textAlignVertical: 'top',
    padding: 0,
    marginBottom: 24,
    outlineStyle: 'none',
  } as object,
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.inputText },
  buttons: { flexDirection: 'row', gap: 16 },
  share: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  shareItem: { alignItems: 'center', gap: 4 },
  shareCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  linkCircle: { borderWidth: 1, borderColor: colors.navy },
  shareLabel: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.navy },
});

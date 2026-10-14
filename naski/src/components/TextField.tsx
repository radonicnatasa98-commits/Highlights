import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { alertTriangle, chevronDown, eyeOff, xCircle } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';
import { Glass } from './Glass';
import { Icon } from './Icon';

type Props = Omit<TextInputProps, 'style' | 'placeholder'> & {
  label: string;
  password?: boolean;
  dropdown?: boolean;
  error?: boolean;
};

// Campo di testo "vetro" con le varianti del file Figma:
// vuoto, attivo (bordo blu, etichetta flottante, pulsante per svuotare),
// compilato ed errore (bordo rosso, icona di avviso).
export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, password, dropdown, error, value, onChangeText, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const floating = focused || error;

  return (
    <View>
      <Glass
        radius={16}
        borderColor={error ? colors.error : focused ? colors.focus : undefined}
        borderWidth={error ? 1 : 2}
        style={styles.field}
      >
        <TextInput
          ref={ref}
          {...rest}
          value={value}
          onChangeText={onChangeText}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholder={floating ? undefined : label}
          placeholderTextColor="rgba(1,51,101,0.6)"
          secureTextEntry={password && hidden}
          selectionColor={colors.inputText}
          style={[styles.input, floating && styles.inputActive]}
        />
        <View style={styles.icons}>
          {error && <Icon icon={alertTriangle} />}
          {focused && !password && !dropdown && (
            <Pressable onPress={() => onChangeText?.('')} hitSlop={8} accessibilityLabel="Cancella">
              <Icon icon={xCircle} color={colors.inputText} />
            </Pressable>
          )}
          {password && (
            <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8} accessibilityLabel={hidden ? 'Mostra password' : 'Nascondi password'}>
              <Icon icon={eyeOff} color={colors.inputText} />
            </Pressable>
          )}
          {dropdown && !focused && <Icon icon={chevronDown} color={colors.navy} />}
        </View>
      </Glass>
      {floating && (
        <View pointerEvents="none" style={[styles.label, { backgroundColor: error ? colors.floatingLabelBgError : colors.floatingLabelBg }]}>
          <Text style={styles.labelText}>{label}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  field: { height: 48, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 16 },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.inputText,
    paddingVertical: 0,
    outlineStyle: 'none',
  } as object,
  inputActive: { fontSize: 16 },
  icons: { flexDirection: 'row', alignItems: 'center', gap: 20, marginLeft: 20 },
  label: { position: 'absolute', top: -7, left: 8, height: 16, paddingHorizontal: 8, justifyContent: 'center' },
  labelText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colors.inputText },
});

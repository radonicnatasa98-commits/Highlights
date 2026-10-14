import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { Icon } from '../components/Icon';
import { Screen, useDesignTop } from '../components/Screen';
import { SocialButtons } from '../components/SocialButtons';
import { TextField } from '../components/TextField';
import { checkCircle, xCircleSmall } from '../theme/icons';
import { colors, fonts } from '../theme/tokens';

const RULES = [
  { label: '8 characters', test: (p: string) => p.length >= 8 },
  { label: '1 number or special character', test: (p: string) => /[^A-Za-z]/.test(p) },
];

// Formatta la data mentre si scrive: 09011997 → 09/01/1997.
function formatBirthday(text: string) {
  const d = text.replace(/\D/g, '').slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join('/');
}

export default function SignUp() {
  const top = useDesignTop();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [birthday, setBirthday] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const firstRef = useRef<TextInput>(null);
  const lastRef = useRef<TextInput>(null);
  const birthdayRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const passed = RULES.map((r) => r.test(password));
  const passwordError = password.length > 0 && passed.includes(false);

  const submit = () => {
    const checks = [
      [first, firstRef],
      [last, lastRef],
      [birthday.length === 10, birthdayRef],
      [email.includes('@'), emailRef],
      [password && !passwordError, passwordRef],
    ] as const;
    const invalid = checks.find(([ok]) => !ok);
    if (invalid) return invalid[1].current?.focus();
    router.replace('/home');
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { paddingTop: top + 60 }]} keyboardShouldPersistTaps="handled">
          <Header title="Sign up" onBack={() => router.back()} />
          <View style={styles.form}>
            <View style={styles.fields}>
              <TextField ref={firstRef} label="First name*" value={first} onChangeText={setFirst} autoComplete="given-name" returnKeyType="next" onSubmitEditing={() => lastRef.current?.focus()} />
              <TextField ref={lastRef} label="Last name*" value={last} onChangeText={setLast} autoComplete="family-name" returnKeyType="next" onSubmitEditing={() => birthdayRef.current?.focus()} />
              <TextField
                ref={birthdayRef}
                label="Birthday (mm/dd/yyy)"
                dropdown
                value={birthday}
                onChangeText={(t) => setBirthday(formatBirthday(t))}
                keyboardType="number-pad"
                maxLength={10}
                onSubmitEditing={() => emailRef.current?.focus()}
              />
              <TextField
                ref={emailRef}
                label="Email*"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <View style={styles.passwordBlock}>
                <TextField
                  ref={passwordRef}
                  label={passwordError ? 'Password *' : 'Password*'}
                  password
                  error={passwordError}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={submit}
                />
                {passwordError && (
                  <View style={styles.rules}>
                    <Text style={[styles.ruleText, { color: colors.error }]}>The password must contain at least:</Text>
                    <View style={styles.ruleList}>
                      {RULES.map((r, i) => (
                        <View key={r.label} style={styles.rule}>
                          <Icon icon={passed[i] ? checkCircle : xCircleSmall} />
                          <Text style={[styles.ruleText, { color: passed[i] ? colors.success : colors.error }]}>{r.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
            <Button label="Sign Up" size="small" onPress={submit} />
          </View>
          <SocialButtons onGoogle={() => router.replace('/home')} onApple={() => router.replace('/home')} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 32, gap: 32 },
  form: { gap: 32, marginBottom: -8 },
  fields: { gap: 16 },
  passwordBlock: { gap: 4 },
  rules: { paddingHorizontal: 16, gap: 4 },
  ruleList: { gap: 8 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ruleText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
});

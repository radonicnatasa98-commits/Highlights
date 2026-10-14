import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { Screen, useDesignBottom, useDesignTop } from '../components/Screen';
import { TextField } from '../components/TextField';

export default function Login() {
  const top = useDesignTop();
  const bottom = useDesignBottom();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>(null);
  const ready = email.trim().length > 0 && password.length > 0;

  const submit = () => ready && router.replace('/home');

  return (
    <Screen>
      <KeyboardAvoidingView style={[styles.flex, { paddingTop: top + 60, paddingBottom: bottom + 95 }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.side}>
          <Header title="Login" onBack={() => router.back()} />
        </View>
        {/* In Login_01 il modulo è centrato verticalmente nell'area sotto l'intestazione. */}
        <View style={styles.center}>
          <View style={styles.form}>
            <View style={styles.fields}>
              <TextField
                label="Email*"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <TextField
                ref={passwordRef}
                label="Password*"
                password
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={submit}
              />
            </View>
            <Button label="Login" size="small" disabled={!ready} onPress={submit} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  side: { paddingHorizontal: 24 },
  center: { flex: 1, marginTop: 32, justifyContent: 'center', paddingHorizontal: 24 },
  form: { gap: 32 },
  fields: { gap: 16 },
});

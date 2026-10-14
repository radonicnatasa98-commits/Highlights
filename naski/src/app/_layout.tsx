import { DMSans_300Light } from '@expo-google-fonts/dm-sans';
import {
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_800ExtraBold,
} from '@expo-google-fonts/nunito-sans';
import { Roboto_500Medium } from '@expo-google-fonts/roboto';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { EntriesProvider } from '../store/entries';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    NunitoSans_800ExtraBold,
    DMSans_300Light,
    Roboto_500Medium,
  });

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <EntriesProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: '#c6d7f6' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="signup" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="home" options={{ gestureEnabled: false }} />
          <Stack.Screen name="calendar" options={{ gestureEnabled: false }} />
        </Stack>
      </EntriesProvider>
    </SafeAreaProvider>
  );
}

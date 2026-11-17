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
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { EntriesProvider } from '../store/entries';
import { RemindersProvider } from '../store/reminders';

// La schermata di avvio con il logo resta finché i font non sono pronti.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    NunitoSans_800ExtraBold,
    DMSans_300Light,
    Roboto_500Medium,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <EntriesProvider>
        <RemindersProvider>
          <Stack
            screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: '#c6d7f6' } }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="signup" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="home" options={{ gestureEnabled: false }} />
            <Stack.Screen name="calendar" options={{ gestureEnabled: false }} />
            <Stack.Screen name="tracker" options={{ gestureEnabled: false }} />
            <Stack.Screen name="reminders" options={{ gestureEnabled: false }} />
            <Stack.Screen name="reminders-choose" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="reminders-schedule" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </RemindersProvider>
      </EntriesProvider>
    </SafeAreaProvider>
  );
}

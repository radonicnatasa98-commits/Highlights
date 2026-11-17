import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const KEY = 'naski.loggedIn';

// Ricorda che l'utente ha già fatto l'accesso, così all'avvio si va dritti alla Home.
// Se la memoria del dispositivo non è disponibile, si riparte semplicemente dall'onboarding.
export async function isLoggedIn() {
  try {
    return (await AsyncStorage.getItem(KEY)) === '1';
  } catch {
    return false;
  }
}

export async function signIn() {
  try {
    await AsyncStorage.setItem(KEY, '1');
  } catch {}
  router.replace('/home');
}

// "Esci": dimentica l'accesso e torna all'onboarding.
export async function signOut() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
  router.replace('/');
}

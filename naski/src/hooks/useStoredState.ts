import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

// Come useState, ma il valore resta salvato sul dispositivo tra un avvio e l'altro.
// Finché non ha letto la memoria, `ready` è false e non sovrascrive niente.
export function useStoredState<T>(key: string, initial: () => T): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (raw != null) setValue(JSON.parse(raw) as T);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
  }, [key, value, ready]);

  return [value, setValue, ready];
}

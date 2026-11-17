import * as Notifications from 'expo-notifications';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import type { EntryType } from './entries';

export type Time = { hour: number; minute: number };

export type FutureReminder = {
  id: string;
  // Lo scritto da ricevere: copiato qui, così resta anche se nel frattempo cambia nel diario.
  type: EntryType;
  text: string;
  date: string; // AAAA-MM-GG
  time: Time;
  notificationId?: string;
};

type Store = {
  daily: { enabled: boolean; time: Time };
  setDaily: (enabled: boolean, time?: Time) => void;
  future: FutureReminder[];
  addFuture: (r: Omit<FutureReminder, 'id' | 'notificationId'>) => void;
  updateFuture: (id: string, date: string, time: Time) => void;
  removeFuture: (id: string) => void;
  // Messaggio di conferma da mostrare nella schermata Promemoria.
  notice: string | null;
  setNotice: (message: string | null) => void;
};

export function formatTime({ hour, minute }: Time) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

export function formatDate(key: string) {
  const [y, m, d] = key.split('-');
  return `${d}/${m}/${y}`;
}

// Le notifiche locali esistono solo sul telefono: nel browser i promemoria restano nell'interfaccia.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function allowed() {
  if (Platform.OS === 'web') return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

async function scheduleDaily(time: Time) {
  if (!(await allowed())) return undefined;
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Naski', body: 'Prenditi un momento per la gratitudine di oggi.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: time.hour, minute: time.minute },
  });
}

async function scheduleFuture(r: Omit<FutureReminder, 'id' | 'notificationId'>) {
  const [y, m, d] = r.date.split('-').map(Number);
  const when = new Date(y, m - 1, d, r.time.hour, r.time.minute);
  if (when.getTime() <= Date.now() || !(await allowed())) return undefined;
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Un messaggio dal passato', body: r.text },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
  });
}

function cancel(id?: string) {
  if (id && Platform.OS !== 'web') Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

const RemindersContext = createContext<Store | null>(null);

export function RemindersProvider({ children }: { children: ReactNode }) {
  const [daily, setDailyState] = useState({ enabled: false, time: { hour: 9, minute: 41 } as Time });
  const [dailyId, setDailyId] = useState<string>();
  const [future, setFuture] = useState<FutureReminder[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const store = useMemo<Store>(
    () => ({
      daily,
      setDaily: (enabled, time) => {
        const next = { enabled, time: time ?? daily.time };
        setDailyState(next);
        cancel(dailyId);
        setDailyId(undefined);
        if (enabled) scheduleDaily(next.time).then(setDailyId);
      },
      future,
      addFuture: (r) => {
        const id = String(Date.now());
        setFuture((list) => [...list, { ...r, id }]);
        scheduleFuture(r).then((notificationId) =>
          setFuture((list) => list.map((f) => (f.id === id ? { ...f, notificationId } : f))),
        );
      },
      updateFuture: (id, date, time) => {
        const old = future.find((f) => f.id === id);
        if (!old) return;
        cancel(old.notificationId);
        const next = { ...old, date, time, notificationId: undefined };
        setFuture((list) => list.map((f) => (f.id === id ? next : f)));
        scheduleFuture(next).then((notificationId) =>
          setFuture((list) => list.map((f) => (f.id === id ? { ...f, notificationId } : f))),
        );
      },
      removeFuture: (id) => {
        cancel(future.find((f) => f.id === id)?.notificationId);
        setFuture((list) => list.filter((f) => f.id !== id));
      },
      notice,
      setNotice,
    }),
    [daily, dailyId, future, notice],
  );

  return <RemindersContext.Provider value={store}>{children}</RemindersContext.Provider>;
}

export function useReminders() {
  const store = useContext(RemindersContext);
  if (!store) throw new Error('useReminders va usato dentro RemindersProvider');
  return store;
}

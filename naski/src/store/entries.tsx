import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useStoredState } from '../hooks/useStoredState';

export type EntryType = 'postit' | 'diario';

export type Entry = {
  id: string;
  type: EntryType;
  text: string;
  tags: string[];
  // Giorno a cui appartiene lo scritto, in formato AAAA-MM-GG.
  date: string;
};

export function dayKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Scritti di esempio per il prototipo, nei giorni prima di oggi, così il calendario mostra subito
// i puntini e il Tracker AI ha qualcosa da contare. Da togliere quando ci sarà un backend.
function exampleEntries(): Entry[] {
  const today = new Date();
  const daysAgo = (n: number) => dayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - n));
  const samples: (Omit<Entry, 'id' | 'date'> & { ago: number })[] = [
    { ago: 1, type: 'postit', text: 'Il caffè con mia sorella', tags: ['Famiglia'] },
    { ago: 2, type: 'postit', text: 'La cena con gli amici di sempre', tags: ['Amicizia', 'Famiglia'] },
    {
      ago: 3,
      type: 'diario',
      text: 'Oggi ho finito il progetto a cui lavoravo da settimane. Sono grata alla squadra che mi ha aiutata e a me stessa per non aver mollato.',
      tags: ['Lavoro e studio'],
    },
    { ago: 4, type: 'postit', text: 'Una lunga passeggiata al sole', tags: ['Salute e Benessere', 'Famiglia'] },
    { ago: 5, type: 'postit', text: 'Il messaggio di un vecchio amico', tags: ['Amicizia'] },
    {
      ago: 8,
      type: 'diario',
      text: 'Giornata lenta e tranquilla: ho letto, cucinato e chiamato la nonna.',
      tags: ['Tempo libero', 'Famiglia'],
    },
    { ago: 10, type: 'postit', text: 'Yoga al mattino', tags: ['Salute e Benessere'] },
    { ago: 12, type: 'postit', text: 'Un pomeriggio di pioggia e un buon libro', tags: ['Altro'] },
    { ago: 15, type: 'postit', text: 'Pranzo della domenica a casa dei miei', tags: ['Famiglia'] },
  ];
  return samples.map(({ ago, ...e }) => ({ ...e, id: `example-${ago}`, date: daysAgo(ago) }));
}

type Store = {
  entries: Entry[];
  add: (entry: Omit<Entry, 'id'>) => void;
  update: (id: string, text: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const EntriesContext = createContext<Store | null>(null);

// Gli scritti restano salvati sul dispositivo; al primo avvio ci sono quelli di esempio.
export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useStoredState<Entry[]>('naski.entries', exampleEntries);

  const store = useMemo<Store>(
    () => ({
      entries,
      add: (entry) => setEntries((list) => [...list, { ...entry, id: `${Date.now()}-${list.length}` }]),
      update: (id, text) => setEntries((list) => list.map((e) => (e.id === id ? { ...e, text } : e))),
      remove: (id) => setEntries((list) => list.filter((e) => e.id !== id)),
      clear: () => setEntries([]),
    }),
    [entries, setEntries],
  );

  return <EntriesContext.Provider value={store}>{children}</EntriesContext.Provider>;
}

export function useEntries() {
  const store = useContext(EntriesContext);
  if (!store) throw new Error('useEntries va usato dentro EntriesProvider');
  return store;
}

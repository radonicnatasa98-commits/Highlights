import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

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

// Scritti di esempio per il prototipo, nei giorni passati del mese corrente,
// così il calendario mostra subito i puntini. Da togliere quando ci sarà un backend.
function exampleEntries(): Entry[] {
  const today = new Date();
  const day = (n: number) => dayKey(new Date(today.getFullYear(), today.getMonth(), n));
  const samples: Omit<Entry, 'id' | 'date'>[] = [
    { type: 'postit', text: 'Il caffè con mia sorella', tags: ['Famiglia'] },
    { type: 'diario', text: 'Oggi ho finito il progetto a cui lavoravo da settimane. Sono grata alla squadra che mi ha aiutata e a me stessa per non aver mollato.', tags: ['Lavoro e studio'] },
    { type: 'postit', text: 'Una lunga passeggiata al sole', tags: ['Salute e Benessere'] },
    { type: 'postit', text: 'La cena con gli amici di sempre', tags: ['Amicizia'] },
    { type: 'diario', text: 'Giornata lenta e tranquilla: ho letto, cucinato e chiamato la nonna.', tags: ['Tempo libero', 'Famiglia'] },
  ];
  const days = [1, 2, 3, 6, 7].filter((n) => n < today.getDate());
  return days.map((n, i) => ({ ...samples[i], id: `example-${n}`, date: day(n) }));
}

type Store = {
  entries: Entry[];
  add: (entry: Omit<Entry, 'id'>) => void;
  update: (id: string, text: string) => void;
  remove: (id: string) => void;
};

const EntriesContext = createContext<Store | null>(null);

// Per ora gli scritti restano in memoria finché l'app è aperta.
export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>(exampleEntries);

  const store = useMemo<Store>(
    () => ({
      entries,
      add: (entry) => setEntries((list) => [...list, { ...entry, id: `${Date.now()}-${list.length}` }]),
      update: (id, text) => setEntries((list) => list.map((e) => (e.id === id ? { ...e, text } : e))),
      remove: (id) => setEntries((list) => list.filter((e) => e.id !== id)),
    }),
    [entries],
  );

  return <EntriesContext.Provider value={store}>{children}</EntriesContext.Provider>;
}

export function useEntries() {
  const store = useContext(EntriesContext);
  if (!store) throw new Error('useEntries va usato dentro EntriesProvider');
  return store;
}

# Naski

App per coltivare la gratitudine, costruita con Expo (React Native + Expo Router) a partire dal file Figma "🪷 Naski - Grateful App", pagina **✨ UI Flow**.

## Schermate pronte

| Flusso | Frame Figma | Route |
|---|---|---|
| Logo animato + Onboarding | Logo_01–03, Onboarding_01–03 | `/` |
| Creazione account | Sign up → Login_01–04 | `/signup` |
| Login | Login → Login_01 | `/login` |
| Home + Post-it | HomePage_01–03 | `/home` |
| Calendario | Calendar_01–04 | `/calendar` |
| Tracker AI | TrackerAI | `/tracker` |
| Promemoria | Promemoria_01–23 | `/reminders`, `/reminders-choose`, `/reminders-schedule` |

Collegamenti:
- il logo perde la scritta e si ingrandisce fino a uscire dallo schermo, poi compaiono le 3 schermate di onboarding (swipe o tap per avanzare);
- "Create an account" apre il Sign up, "Log in" apre il Login; completati, portano alla Home;
- in Home, "Post-it" apre il foglio per scrivere una riga (massimo 30 caratteri) e "Diario" quello per un pensiero lungo, senza limite; in entrambi si scelgono i tag e "Salva" registra lo scritto nel giorno di oggi;
- la seconda icona della barra in basso apre il Calendario: i giorni con un puntino hanno degli scritti, toccandone uno compaiono sotto; la matita apre la modifica (Elimina / Salva), la freccia apre la condivisione (copia, WhatsApp, Instagram); il "+" scrive un Post-it nel giorno selezionato;
- la terza icona apre il Tracker AI: una bolla per ogni tag usato negli ultimi 7 giorni o nel mese, più grande quanto più spesso l'hai scelto; toccando la frase in fondo la condividi;
- la quarta icona apre i Promemoria: l'interruttore attiva il promemoria giornaliero con la rotella dell'orario; "Crea nuovo promemoria" scrive una capsula per il futuro, "Scegli gratitudine già esistente" fa scegliere un Post-it o un Diario (con filtro per data); poi si scelgono data e ora e il promemoria compare in lista, dove si può modificare o eliminare. Sul telefono arrivano notifiche locali vere.

## Avvio

```bash
npm install
npx expo start
```

Poi apri l'app **Expo Go** sul telefono e inquadra il QR code. Con `npx expo start --web` la apri nel browser.

## Note

- Il font del design è Avenir: su iPhone è già installato; su Android e web viene usato Nunito Sans.
- Le icone in `src/theme/icons.ts` sono generate dai vettori del file Figma.
- Login, Google e Apple per ora non chiamano nessun servizio: portano direttamente alla Home.
- Scritti, promemoria e accesso restano salvati sul dispositivo (AsyncStorage). Al primo avvio ci sono alcuni scritti di esempio (`src/store/entries.tsx`).
- Il menu in alto a destra ha "Esci" (torna all'onboarding) ed "Elimina i miei dati" (con conferma).
- Icona, icona adattiva Android e schermata di avvio usano il simbolo Naski; identificativo `com.naski.app` per iOS e Android.

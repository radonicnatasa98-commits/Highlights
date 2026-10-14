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

Collegamenti:
- il logo perde la scritta e si ingrandisce fino a uscire dallo schermo, poi compaiono le 3 schermate di onboarding (swipe o tap per avanzare);
- "Create an account" apre il Sign up, "Log in" apre il Login; completati, portano alla Home;
- in Home, "Post-it" apre il foglio per scrivere (massimo 30 caratteri) e scegliere uno o più tag; "Salva" lo registra nel giorno di oggi;
- la seconda icona della barra in basso apre il Calendario: i giorni con un puntino hanno degli scritti, toccandone uno compaiono sotto; la matita apre la modifica (Elimina / Salva), la freccia apre la condivisione (copia, WhatsApp, Instagram); il "+" scrive un Post-it nel giorno selezionato.

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
- Gli scritti restano in memoria finché l'app è aperta; all'avvio ci sono alcuni scritti di esempio nei primi giorni del mese (`src/store/entries.tsx`).

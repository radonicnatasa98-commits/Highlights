import { Redirect } from 'expo-router';

// Un indirizzo sconosciuto (per esempio una pagina web ospitata in una sottocartella) riparte dall'inizio.
export default function NotFound() {
  return <Redirect href="/" />;
}

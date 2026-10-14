import { Platform } from 'react-native';

// Colori presi dagli stili del file Figma.
export const colors = {
  navy: '#12255b',
  navyTitle: '#192650',
  inputText: '#013365',
  blue: '#2c63f3',
  focus: '#165dfb',
  error: '#bb251a',
  success: '#18c178',
  white: '#ffffff',
  black: '#000000',
  googleBorder: '#7b7b7b',
  googleText: '#1f1f1f',
  sheetHeader: ['#cae8f7', '#b1ccf0', '#b7baed'] as const,
  floatingLabelBg: '#c3e3f4',
  floatingLabelBgError: '#deeff8',
};

const ios = Platform.OS === 'ios';

// Avenir è un font di sistema su iPhone; altrove si usa Nunito Sans, la stessa alternativa della pagina Highlights.
export const fonts = {
  regular: ios ? 'Avenir-Roman' : 'NunitoSans_400Regular',
  medium: ios ? 'Avenir-Medium' : 'NunitoSans_500Medium',
  heavy: ios ? 'Avenir-Heavy' : 'NunitoSans_800ExtraBold',
  // Gilmer (bottoni piccoli) non è disponibile come font libero.
  button: ios ? 'AvenirNext-DemiBold' : 'NunitoSans_600SemiBold',
  dmLight: 'DMSans_300Light',
  roboto: 'Roboto_500Medium',
  apple: ios ? 'System' : 'Roboto_500Medium',
};

export const DESIGN_WIDTH = 375;
export const DESIGN_HEIGHT = 812;

import { StyleProp, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { IconSvg } from '../theme/icons';

type Props = {
  icon: IconSvg;
  color?: string;
  // Lato del riquadro in cui l'icona viene scalata (default: dimensione originale in Figma).
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ icon, color, size, style }: Props) {
  const scale = size ? size / Math.max(icon.width, icon.height) : 1;
  // Il View contenitore tiene l'icona sopra i fondi disegnati in posizione assoluta (vale anche sul web).
  return (
    <View style={style}>
      <SvgXml xml={icon.xml} width={icon.width * scale} height={icon.height * scale} color={color} />
    </View>
  );
}

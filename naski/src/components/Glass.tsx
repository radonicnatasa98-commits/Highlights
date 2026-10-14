import { ReactNode, useId, useState } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type Props = {
  radius: number;
  // Bordo: gradiente bianco del design ("glass") oppure un colore pieno (focus/errore).
  borderColor?: string;
  borderWidth?: number;
  // Riempimento: gradiente bianco 50% del design, o un colore pieno.
  fill?: 'glass' | string;
  // Bordo "riflesso" interno, come nei bottoni e nella card del calendario.
  sheen?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  onLayout?: (width: number, height: number) => void;
};

// Superficie "vetro" del design: riempimento bianco sfumato e bordo esterno di 2px
// con gradiente bianco (stessi punti del gradiente in Figma).
export function Glass({
  radius,
  borderColor,
  borderWidth = 2,
  fill = 'glass',
  sheen,
  style,
  children,
  onLayout: onSize,
}: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const id = useId().replace(/:/g, '');
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
    onSize?.(width, height);
  };
  const { w, h } = size;
  const bw = borderWidth;

  return (
    // zIndex 0 crea un contesto di sovrapposizione: lo sfondo (-1) resta dietro ai figli anche sul web.
    <View style={[styles.stack, style]} onLayout={onLayout}>
      {w > 0 && (
        <View
          pointerEvents="none"
          style={[styles.behind, { left: -bw, top: -bw, width: w + bw * 2, height: h + bw * 2 }]}
        >
          <Svg width={w + bw * 2} height={h + bw * 2}>
            <Defs>
              <LinearGradient
                id={`f${id}`}
                gradientUnits="userSpaceOnUse"
                x1={bw + 0.5 * w}
                y1={bw}
                x2={bw + 0.475 * w}
                y2={bw + h}
              >
                <Stop offset={0} stopColor="#ffffff" stopOpacity={0.5} />
                <Stop offset={1} stopColor="#ffffff" stopOpacity={0} />
              </LinearGradient>
              {sheen ? (
                <LinearGradient
                  id={`s${id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={bw + 0.07 * w}
                  y1={bw}
                  x2={bw + 0.126 * w}
                  y2={bw + 1.279 * h}
                >
                  <Stop offset={0} stopColor="#ffffff" stopOpacity={0.4} />
                  <Stop offset={0.41} stopColor="#ffffff" stopOpacity={0} />
                  <Stop offset={0.57} stopColor="#ffffff" stopOpacity={0} />
                  <Stop offset={1} stopColor="#ffffff" stopOpacity={0.1} />
                </LinearGradient>
              ) : (
                <LinearGradient
                  id={`s${id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={bw + 0.2 * w}
                  y1={bw + 0.03 * h}
                  x2={bw + 0.875 * w}
                  y2={bw + 1.042 * h}
                >
                  <Stop offset={0} stopColor="#ffffff" stopOpacity={1} />
                  <Stop offset={0.54} stopColor="#ffffff" stopOpacity={0} />
                  <Stop offset={1} stopColor="#ffffff" stopOpacity={0.77} />
                </LinearGradient>
              )}
            </Defs>
            {fill !== 'none' && (
              <Rect x={bw} y={bw} width={w} height={h} rx={radius} fill={fill === 'glass' ? `url(#f${id})` : fill} />
            )}
            {/* Bordo esterno per le superfici vetro, interno per quelle con riflesso. */}
            <Rect
              x={sheen ? bw * 1.5 : bw / 2}
              y={sheen ? bw * 1.5 : bw / 2}
              width={sheen ? w - bw : w + bw}
              height={sheen ? h - bw : h + bw}
              rx={sheen ? radius - bw / 2 : radius + bw / 2}
              fill="none"
              stroke={borderColor ?? `url(#s${id})`}
              strokeWidth={bw}
            />
          </Svg>
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { zIndex: 0 },
  behind: { position: 'absolute', zIndex: -1 },
});

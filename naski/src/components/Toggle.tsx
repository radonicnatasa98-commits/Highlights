import { useEffect } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

type Props = { value: boolean; onChange: (value: boolean) => void; label: string };

// Toggle_Icon di Figma: 51×31, binario blu quando è acceso, pomello bianco da 27px.
export function Toggle({ value, onChange, label }: Props) {
  const on = useAnimatedNumber(value ? 1 : 0);

  useEffect(() => {
    Animated.spring(on, { toValue: value ? 1 : 0, damping: 15, stiffness: 260, useNativeDriver: false }).start();
  }, [value, on]);

  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      hitSlop={8}
    >
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: on.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(255,255,255,0.35)', '#2d5cf2'],
            }),
            borderColor: on.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255,255,255,0.9)', '#2d5cf2'] }),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.knob,
            { transform: [{ translateX: on.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 51, height: 31, borderRadius: 999, padding: 1, borderWidth: 1, justifyContent: 'center' },
  knob: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#12255b',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});

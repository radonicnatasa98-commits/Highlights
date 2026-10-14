import { useState } from 'react';
import { Animated } from 'react-native';

// Come useAnimatedValue di React Native, che però non esiste in react-native-web.
export function useAnimatedNumber(initial: number) {
  const [value] = useState(() => new Animated.Value(initial));
  return value;
}

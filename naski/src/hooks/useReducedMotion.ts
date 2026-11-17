import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// true quando nelle impostazioni del telefono è attivo "Riduci movimento".
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

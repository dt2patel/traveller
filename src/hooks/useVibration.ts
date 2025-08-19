
import { useCallback } from 'react';

export const useVibration = () => {
  const vibrate = useCallback((pattern: VibratePattern = 200) => {
    if (typeof window !== 'undefined' && 'vibrate' in window.navigator) {
      try {
        window.navigator.vibrate(pattern);
      } catch (e) {
        console.warn("Vibration failed", e);
      }
    }
  }, []);

  return vibrate;
};

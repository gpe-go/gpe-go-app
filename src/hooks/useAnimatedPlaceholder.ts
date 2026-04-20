import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

/**
 * Cycles through `count` hint indices with a smooth fade-out / fade-in transition.
 *
 * Usage:
 *   const hints = useMemo(() => [t('cat_hoteles'), t('cat_restaurantes')], [t]);
 *   const { index, opacity } = useAnimatedPlaceholder(hints.length);
 *   // then render an Animated.Text with opacity and hints[index]
 */
export function useAnimatedPlaceholder(count: number, intervalMs = 2800) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count <= 1) return;

    const timer = setInterval(() => {
      // Fade out current hint
      Animated.timing(opacity, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start(() => {
        // Advance to next hint
        setIndex(prev => (prev + 1) % count);
        // Fade in new hint
        Animated.timing(opacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }).start();
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [count, intervalMs, opacity]);

  return { index, opacity };
}

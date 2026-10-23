import { useEffect, type PropsWithChildren } from 'react';
import { usePathname } from 'expo-router';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

export default function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(1);
  useEffect(() => {
    if (reducedMotion) { progress.value = 1; return; }
    progress.value = 0;
    progress.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System });
  }, [pathname, progress, reducedMotion]);
  const style = useAnimatedStyle(() => ({ opacity: progress.value, transform: [{ translateY: (1 - progress.value) * 10 }] }));
  // Animate the existing slot, preserving screen state and scroll positions.
  return <Animated.View style={[{ flex: 1 }, style]}>{children}</Animated.View>;
}

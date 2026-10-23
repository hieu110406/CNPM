import { forwardRef, useState, type ComponentRef } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const MotionPressable = Animated.createAnimatedComponent(Pressable);

// Keep Pressable's event, accessibility, style callback and ref contracts for TabTrigger.
export default forwardRef<ComponentRef<typeof Pressable>, PressableProps & { motion?: boolean }>(function AnimatedPressable(
  { style, onPressIn, onPressOut, onHoverIn, onHoverOut, disabled, motion = true, ...props }, ref,
) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function animate(value: number) {
    scale.value = withTiming(value, { duration: value < 1 ? 90 : 170, reduceMotion: ReduceMotion.System });
  }

  return <MotionPressable {...props} ref={ref} disabled={disabled}
    style={[typeof style === 'function' ? style({ pressed, hovered }) : style, motion && animatedStyle]}
    onHoverIn={event => { setHovered(true); onHoverIn?.(event); }}
    onHoverOut={event => { setHovered(false); onHoverOut?.(event); }}
    onPressIn={event => {
      setPressed(true);
      if (motion && !disabled) animate(0.97);
      onPressIn?.(event);
    }}
    onPressOut={event => {
      setPressed(false);
      if (motion) animate(1);
      onPressOut?.(event);
    }} />;
});

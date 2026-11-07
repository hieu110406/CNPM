
import {
    forwardRef,
    useState,
    type ComponentRef,
} from 'react';

import {
    Pressable,
    type PressableProps,
} from 'react-native';

import Animated, {
    ReduceMotion,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const MotionPressable =
    Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = PressableProps & {
    motion?: boolean;
};

const AnimatedPressable = forwardRef<
    ComponentRef<typeof Pressable>,
    AnimatedPressableProps
>(function AnimatedPressable(
    {
        style,
        onPressIn,
        onPressOut,
        onHoverIn,
        onHoverOut,
        disabled,
        motion = true,
        ...props
    },
    ref
) {
    const [pressed, setPressed] = useState(false);
    const [hovered, setHovered] = useState(false);

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const animate = (value: number) => {
        scale.value = withTiming(value, {
            duration: value < 1 ? 90 : 170,
            reduceMotion: ReduceMotion.System,
        });
    };

    // Dùng biến riêng để tương thích kiểu
    // Pressable của React Native và Expo Web.
    const pressableState = {
        pressed,
        hovered,
    };

    const resolvedStyle =
        typeof style === 'function'
            ? style(pressableState)
            : style;

    return (
        <MotionPressable
            {...props}
            ref={ref}
            disabled={disabled}
            style={[
                resolvedStyle,
                motion && animatedStyle,
            ]}
            onHoverIn={(event) => {
                setHovered(true);
                onHoverIn?.(event);
            }}
            onHoverOut={(event) => {
                setHovered(false);
                onHoverOut?.(event);
            }}
            onPressIn={(event) => {
                setPressed(true);

                if (motion && !disabled) {
                    animate(0.97);
                }

                onPressIn?.(event);
            }}
            onPressOut={(event) => {
                setPressed(false);

                if (motion) {
                    animate(1);
                }

                onPressOut?.(event);
            }}
        />
    );
});

export default AnimatedPressable;

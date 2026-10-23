import { FadeIn, FadeInDown, FadeOut, LinearTransition, ReduceMotion } from 'react-native-reanimated';

export const fadeIn = FadeIn.duration(180).reduceMotion(ReduceMotion.System);
export const slideIn = FadeInDown.duration(240).reduceMotion(ReduceMotion.System);
export const fadeOut = FadeOut.duration(120).reduceMotion(ReduceMotion.System);
export const smoothLayout = LinearTransition.duration(240).reduceMotion(ReduceMotion.System);

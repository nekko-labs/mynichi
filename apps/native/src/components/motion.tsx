import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { motion } from '../theme/contract.css';

// The one place motion is defined. Screens ask for a named transition instead
// of hand-rolling durations, so everything moves like the same paper: a short
// fade with a slight rise, never a bounce (TASKS.md, Design System > Motion).
//
// Reanimated is the RN primitive here, so it stays wrapped in components/ per
// the RSD-first convention; screens keep using html.* inside.

type Kind = 'rise' | 'fade';
type Speed = 'fast' | 'base' | 'slow';

type Props = {
  children: ReactNode;
  /** rise: fade with a small upward travel. fade: opacity only. */
  kind?: Kind;
  speed?: Speed;
  /** Index in a list; staggers siblings so a group reveals as one gesture. */
  index?: number;
  style?: ViewStyle;
};

const DURATION: Record<Speed, number> = {
  fast: motion.fast,
  base: motion.base,
  slow: motion.slow
};

// Layout animations are skipped when the platform asks for reduced motion,
// which Reanimated handles for us on native. On web the entering animation is
// still cheap (transform + opacity only).
export function Enter({ children, kind = 'rise', speed = 'base', index = 0, style }: Props) {
  const duration = DURATION[speed];
  const delay = Math.min(index, 6) * motion.stagger;
  const entering =
    kind === 'rise'
      ? FadeInDown.duration(duration).delay(delay)
      : FadeIn.duration(duration).delay(delay);

  return (
    <Animated.View entering={entering} exiting={FadeOut.duration(motion.fast)} style={style}>
      {children}
    </Animated.View>
  );
}


import type { Transition, Variants } from "motion/react";

export const EASE_DEFAULT: Transition["ease"] = [0.22, 1, 0.36, 1];

export const DURATION = {
  micro: 0.2,
  enter: 0.5,
  page: 0.3,
} as const;

export const REDUCED_MOTION_DURATION = 0.12;

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const revealReducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.enter, ease: EASE_DEFAULT },
  },
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.micro, ease: EASE_DEFAULT } },
};

export const menuDropdownVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.micro, ease: EASE_DEFAULT },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: DURATION.micro, ease: EASE_DEFAULT },
  },
};

export const mobilePanelVariants: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: { type: "spring", stiffness: 320, damping: 34 },
  },
  exit: {
    x: "-100%",
    transition: { type: "spring", stiffness: 320, damping: 34 },
  },
};

export const drawerSpring: Transition = { type: "spring", stiffness: 320, damping: 34 };

export const cartLineVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: DURATION.micro, ease: EASE_DEFAULT } },
  exit: { opacity: 0, x: 24, transition: { duration: DURATION.micro, ease: EASE_DEFAULT } },
};

export const cartLineReducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: REDUCED_MOTION_DURATION } },
  exit: { opacity: 0, transition: { duration: REDUCED_MOTION_DURATION } },
};

export const badgePopVariants: Variants = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 500, damping: 20 } },
};

export const cardHoverVariants: Variants = {
  rest: { y: 0 },
  hover: { y: -4, transition: { duration: DURATION.micro, ease: EASE_DEFAULT } },
};

export const cardImageHoverVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.04, transition: { duration: DURATION.enter, ease: EASE_DEFAULT } },
};

export const categoryHoverVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: { duration: DURATION.enter, ease: EASE_DEFAULT } },
};

export const valueSwapVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.micro, ease: EASE_DEFAULT } },
};

export const valueSwapReducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: REDUCED_MOTION_DURATION } },
};

export const lineGrowXVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.9, ease: EASE_DEFAULT } },
};

export const lineGrowYVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.9, ease: EASE_DEFAULT } },
};

export const cardActionVariants: Variants = {
  rest: { opacity: 0, y: 12 },
  hover: { opacity: 1, y: 0, transition: { duration: DURATION.micro, ease: EASE_DEFAULT } },
};

const noopHoverVariants: Variants = { rest: {}, hover: {} };

const reducedActionVariants: Variants = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: REDUCED_MOTION_DURATION } },
};

export function getCardMotion(reduceMotion: boolean): {
  card: Variants;
  image: Variants;
  action: Variants;
} {
  return reduceMotion
    ? { card: noopHoverVariants, image: noopHoverVariants, action: reducedActionVariants }
    : { card: cardHoverVariants, image: cardImageHoverVariants, action: cardActionVariants };
}

export const heroSlideVariants: Variants = {
  hidden: { opacity: 0, transition: { duration: DURATION.enter, ease: EASE_DEFAULT } },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATION.enter,
      ease: EASE_DEFAULT,
      staggerChildren: 0.09,
      delayChildren: 0.12,
    },
  },
};

export const heroSlideReducedVariants: Variants = {
  hidden: { opacity: 0, transition: { duration: REDUCED_MOTION_DURATION } },
  visible: { opacity: 1, transition: { duration: REDUCED_MOTION_DURATION } },
};

export const heroLineVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.enter, ease: EASE_DEFAULT } },
};

export const heroLineReducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: REDUCED_MOTION_DURATION } },
};

export const heroImageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE_DEFAULT } },
};

export const pageTransitionVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.page, ease: EASE_DEFAULT },
  },
  exit: { opacity: 0, y: 8, transition: { duration: DURATION.page, ease: EASE_DEFAULT } },
};

export const floatingButtonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 1.5, type: "spring", stiffness: 260, damping: 20 },
  },
};

export const springShort: Transition = { type: "spring", stiffness: 420, damping: 30 };

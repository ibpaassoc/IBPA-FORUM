export const PUBLIC_MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const PUBLIC_MOTION_DURATION = {
  fast: 0.18,
  base: 0.32,
  slow: 0.46,
} as const;

// ─── Reusable Variants ───────────────────────────────────────────────────────

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: PUBLIC_MOTION_DURATION.base, ease: PUBLIC_MOTION_EASE },
  },
};

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: PUBLIC_MOTION_DURATION.base, ease: PUBLIC_MOTION_EASE },
  },
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: PUBLIC_MOTION_DURATION.base, ease: PUBLIC_MOTION_EASE },
  },
};

export const staggerContainerVariants = {
  hidden: {},
  visible: (stagger = 0.07) => ({
    transition: { staggerChildren: stagger, delayChildren: 0 },
  }),
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: PUBLIC_MOTION_DURATION.base, ease: PUBLIC_MOTION_EASE },
  },
};

// ─── Hero entrance (animate on mount, not whileInView) ───────────────────────

export function heroEntrance(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: PUBLIC_MOTION_DURATION.slow, ease: PUBLIC_MOTION_EASE, delay },
  } as const;
}

import type { Transition, Variants } from "framer-motion";

// Every timing the ticket modal uses lives here, so the dialog entrance, the
// package switch and the CSS reveals stay in step with one another. The
// duration numbers mirror the `.ticket-reveal` / `.ticket-attendee-grid` rules
// in app/globals.css — change both together.

/** Matches --motion-editorial in globals.css. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_IN: [number, number, number, number] = [0.4, 0, 1, 1];

/** The dialog itself: weighty enough to read as a panel, no overshoot wobble. */
export const dialogSpring: Transition = { type: "spring", stiffness: 240, damping: 28, mass: 0.9 };

/** The highlight that slides between package cards. */
export const selectionSpring: Transition = { type: "spring", stiffness: 430, damping: 38, mass: 0.9 };

/** Small controls: radio dots, check marks, hover lifts. */
export const controlSpring: Transition = { type: "spring", stiffness: 520, damping: 30, mass: 0.6 };

/** Text that swaps in place — prices, status lines, button labels. */
export const swapTransition: Transition = { duration: 0.22, ease: EASE_OUT };

/** Enter/exit pair for a value crossfading inside a fixed slot. */
export const swapVariants: Variants = {
  hidden: { opacity: 0, y: 7 },
  visible: { opacity: 1, y: 0, transition: swapTransition },
  exit: { opacity: 0, y: -7, transition: { duration: 0.14, ease: EASE_IN } },
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.28, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE_IN } },
};

export const dialogVariants: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...dialogSpring, delayChildren: 0.05, staggerChildren: 0.05 },
  },
  // Leaving is deliberately faster than arriving: a dialog that lingers on the
  // way out feels unresponsive.
  exit: { opacity: 0, y: 12, scale: 0.985, transition: { duration: 0.18, ease: EASE_IN } },
};

/** The generic "rise into place" used by every block inside the dialog. */
export const riseVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE_OUT } },
};

/**
 * The form and its two columns are staggered separately. Without a variants
 * object on the column wrappers the stagger only reaches the columns
 * themselves, and every section inside a column arrives at the same instant.
 */
export const formVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: 0.12, staggerChildren: 0.05 } },
};

export const columnVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

"use client";

import { Children, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { PUBLIC_MOTION_DURATION, PUBLIC_MOTION_EASE } from "./motion-tokens";

type StaggerContainerProps = {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
};

export default function StaggerContainer({
  children,
  className,
  itemClassName,
  stagger = 0.055,
  delay = 0,
  once = true,
}: StaggerContainerProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: PUBLIC_MOTION_DURATION.base,
        ease: PUBLIC_MOTION_EASE,
      },
    },
  };

  return (
    <motion.div
      className={clsx(className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.1 }}
    >
      {Children.map(children, (child, index) => (
        <motion.div key={index} className={itemClassName} variants={itemVariants} style={{ willChange: "opacity, transform" }}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

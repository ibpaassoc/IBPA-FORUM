"use client";

import type { ComponentProps } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { PUBLIC_MOTION_DURATION, PUBLIC_MOTION_EASE } from "./motion-tokens";

type AnimatedImageProps = Omit<ComponentProps<typeof Image>, "className"> & {
  className?: string;
  containerClassName?: string;
  zoomScale?: number;
};

export default function AnimatedImage({
  src,
  alt,
  className,
  containerClassName,
  zoomScale = 1.04,
  ...imageProps
}: AnimatedImageProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className={clsx("relative overflow-hidden", containerClassName)}>
        <Image
          {...imageProps}
          src={src}
          alt={alt}
          className={clsx("object-cover", className)}
        />
      </div>
    );
  }

  return (
    <motion.div
      className={clsx("relative overflow-hidden", containerClassName)}
      whileHover={{ scale: zoomScale }}
      transition={{ duration: PUBLIC_MOTION_DURATION.slow, ease: PUBLIC_MOTION_EASE }}
    >
      <Image
        {...imageProps}
        src={src}
        alt={alt}
        className={clsx("object-cover", className)}
      />
    </motion.div>
  );
}

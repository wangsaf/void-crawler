"use client";

import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  glow?: "blue" | "purple" | "green" | "gold" | "pink";
}

export function AnimatedText({
  text,
  className = "",
  delay = 0,
  stagger,
  glow,
}: AnimatedTextProps) {
  const glowClass = glow ? `glow-${glow}` : "";

  return (
    <motion.span
      className={`inline-block ${glowClass} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      {text}
    </motion.span>
  );
}

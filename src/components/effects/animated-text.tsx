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
  stagger = 0.03,
  glow,
}: AnimatedTextProps) {
  const glowClass = glow ? `glow-${glow}` : "";

  return (
    <motion.span
      className={`inline-block ${glowClass} ${className}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { type: "spring", damping: 12, stiffness: 200 },
            },
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

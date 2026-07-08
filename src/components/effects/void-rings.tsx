"use client";

import { motion } from "framer-motion";

interface VoidRingsProps {
  color?: string;
  count?: number;
  className?: string;
}

export function VoidRings({
  color = "#b000ff",
  count = 5,
  className = "",
}: VoidRingsProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            border: `1px solid ${color}`,
            opacity: 0,
          }}
          initial={{
            width: 40,
            height: 40,
            opacity: 0,
            x: "-50%",
            y: "-50%",
          }}
          animate={{
            width: [40, 600],
            height: [40, 600],
            opacity: [0.4, 0],
            x: "-50%",
            y: "-50%",
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * (4 / count),
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

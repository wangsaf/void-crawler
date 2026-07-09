"use client";

import { motion } from "framer-motion";

export function BackButton({ label = "← BACK" }: { label?: string }) {
  return (
    <motion.a
      href="/"
      className="inline-flex items-center gap-2 void-btn"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: -2 }}
    >
      {label}
    </motion.a>
  );
}

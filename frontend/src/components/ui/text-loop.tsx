"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function TextLoop({
  children,
  className,
}: {
  children: React.ReactNode[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % children.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [children.length]);

  return (
    <div className={`relative inline-block ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {children[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

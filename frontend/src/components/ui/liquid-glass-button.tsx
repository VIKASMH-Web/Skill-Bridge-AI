"use client";

import { motion } from "framer-motion";

export function LiquidGlassButton({
  children,
  onClick,
  className,
  disabled
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02, y: -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={disabled ? undefined : onClick}
      className={`
        relative px-10 py-5 flex items-center justify-center overflow-hidden rounded-[1.2rem] font-black text-xl
        bg-[#111827] text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]
        transition-all duration-300
        hover:bg-black hover:shadow-[0_25px_50px_-12px_rgba(250,204,21,0.25)]
        ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FACC15]/20 to-transparent skew-x-12 translate-x-[-150%] hover:animate-shimmer" />
      <span className="relative z-10 flex items-center gap-3">{children}</span>
    </motion.button>
  );
}

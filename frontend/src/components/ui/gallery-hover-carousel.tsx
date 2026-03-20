"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function GalleryHoverCarousel({
  items,
}: {
  items: { title: string; image: string; description: string }[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex gap-4 h-[400px]">
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="relative overflow-hidden rounded-2xl cursor-pointer"
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}
          animate={{
            flex: hoveredIndex === null ? 1 : hoveredIndex === index ? 4 : 0.8,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ backgroundImage: `url(${item.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 pointer-events-none" 
               style={{ opacity: hoveredIndex === index ? 0.3 : 0.6 }} />
          
          <div className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none">
            <h3 className="text-white text-xl font-bold mb-2 z-10">{item.title}</h3>
            <AnimatePresence>
              {hoveredIndex === index && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-white/90 text-sm max-w-sm z-10"
                >
                  {item.description}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

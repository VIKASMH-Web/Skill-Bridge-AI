"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SkillNode } from "./skill-node";

interface RoadmapPathProps {
  roadmap: any[];
  parallelTracks: any[];
  selectedSkill: any;
  onSelectSkill: (skill: any) => void;
}

export function RoadmapPath({ roadmap, parallelTracks, selectedSkill, onSelectSkill }: RoadmapPathProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodesRendered, setNodesRendered] = useState(false);

  useEffect(() => {
    setTimeout(() => setNodesRendered(true), 100);
  }, [roadmap]);

  if (!roadmap || roadmap.length === 0) return null;

  return (
    <div className="w-full flex justify-center py-20 px-4 overflow-x-hidden relative zigzag-path" ref={containerRef}>
      
      {/* Perspective Drawing Center Line */}
      <motion.div
        className="absolute w-[1.5px] bg-[#E5E7EB] left-1/2 -ml-[0.75px] z-0 rounded-full"
        initial={{ height: 0, top: 120 }}
        animate={{ height: "calc(100% - 240px)" }}
        transition={{ duration: 1.2, ease: "circOut" }}
      />

      <div className="flex flex-col items-center justify-center gap-20 relative w-full max-w-3xl px-8 z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-[12px] uppercase font-black tracking-[0.2em] text-[#6B7280]">Interactive Road</span>
          <h2 className="text-5xl font-extrabold text-[#111827] mt-2 tracking-tight">
            Knowledge <span className="text-[#FACC15]">Traversal</span>
          </h2>
        </motion.div>

        {parallelTracks.map((group, gi) => {
          const groupItems = group.skills
            .map((id: string) => roadmap.find((r) => r.skill_id === id))
            .filter(Boolean);

          if (groupItems.length === 0) return null;

          return (
            <motion.div
              key={`group-${gi}`}
              className="flex justify-center w-full relative group perspective-500"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.12, duration: 0.7, type: "spring", bounce: 0.2 }}
            >
              <div className="flex gap-16 md:gap-24 relative items-center justify-center">
                {groupItems.map((item: any) => (
                  <SkillNode 
                    key={item.skill_id} 
                    item={item} 
                    isSelected={selectedSkill?.skill_id === item.skill_id}
                    onClick={onSelectSkill}
                  />
                ))}
              </div>

              {group.can_parallel && groupItems.length > 1 && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] text-[#6B7280] uppercase font-bold tracking-widest bg-white border border-[#E5E7EB] px-4 py-1 rounded-full shadow-sm">
                  Concurrent Track
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

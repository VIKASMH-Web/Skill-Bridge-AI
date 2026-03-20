"use client";

import { motion } from "framer-motion";
import { Lock, Check, Zap, Target } from "lucide-react";

export function SkillNode({ item, index, isSelected, onClick }: any) {
  const { skill_name, status, is_target, is_prerequisite } = item;
  
  const getStyles = () => {
    switch(status) {
      case 'active': 
        return {
          wrapper: 'bg-white border-[#FACC15] ring-4 ring-[#FACC15]/20 shadow-[0_0_30px_rgba(250,204,21,0.35)] scale-110 z-20',
          icon: 'text-[#FACC15]',
          text: 'text-[#111827] font-bold',
          badge: 'bg-[#FACC15] text-[#111827]'
        };
      case 'completed': 
        return {
          wrapper: 'bg-[#F3F4F6] border-[#E5E7EB] opacity-60 grayscale',
          icon: 'text-[#6B7280]',
          text: 'text-[#6B7280]',
          badge: 'bg-[#E5E7EB] text-[#6B7280]'
        };
      case 'available': 
        return {
          wrapper: 'bg-white border-[#E5E7EB] shadow-md hover:border-[#FACC15]/50 group-hover:shadow-[0_4px_20px_rgba(250,204,21,0.1)]',
          icon: 'text-[#1F2937]',
          text: 'text-[#111827] font-medium',
          badge: 'bg-[#F3F4F6] text-[#4B5563]'
        };
      default: // locked
        return {
          wrapper: 'bg-[#FAFAFA] border-[#F1F5F9] opacity-30 cursor-not-allowed filter contrast-50',
          icon: 'text-[#94A3B8]',
          text: 'text-[#94A3B8]',
          badge: 'bg-[#F1F5F9] text-[#94A3B8]'
        };
    }
  };

  const styles = getStyles();
  const Icon = status === 'completed' ? Check : status === 'locked' ? Lock : is_target ? Target : Zap;

  return (
    <div className="relative group w-56 flex flex-col items-center zigzag-node z-10">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: status === 'active' ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        whileHover={status !== 'locked' ? { scale: 1.08, y: -6, boxShadow: "0 10px 30px rgba(250,204,21,0.2)" } : {}}
        whileTap={status !== 'locked' ? { scale: 0.94 } : {}}
        onClick={() => status !== 'locked' && onClick(item)}
        className={`
          flex items-center justify-center
          relative w-24 h-24 rounded-full border-[1.5px] transition-colors duration-300
          ${styles.wrapper} ${status !== 'locked' ? 'cursor-pointer' : ''}
          ${isSelected ? 'ring-2 ring-[#FACC15] ring-offset-4 ring-offset-[#FAFAFA]' : ''}
        `}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
        <div className="absolute inset-0 rounded-full border-[1.5px] border-white/50 pointer-events-none" />
        
        <Icon className={`w-9 h-9 relative z-10 ${styles.icon}`} strokeWidth={status === 'active' ? 2.5 : 1.5} />
        
        {/* Node Order Badge */}
        <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black tracking-tight ${styles.badge} shadow-sm border border-white`}>
          {item.order}
        </div>
      </motion.div>
      
      {/* Node Label Below */}
      <div className="mt-5 flex flex-col items-center gap-1.5 align-middle text-center max-w-[140px]">
        <h4 className={`text-[14px] leading-tight tracking-[0.01em] ${styles.text}`}>
          {skill_name}
        </h4>
        
        <div className="flex gap-2 justify-center flex-wrap pt-1">
          {is_target && (
            <span className="text-[10px] uppercase tracking-wider bg-[#FACC15]/10 text-[#854D0E] px-2.5 py-0.5 rounded-full font-bold border border-[#FACC15]/20">
              Target
            </span>
          )}
          {is_prerequisite && !is_target && (
            <span className="text-[10px] uppercase tracking-wider bg-[#F3F4F6] text-[#4B5563] px-2.5 py-0.5 rounded-full font-bold border border-[#E5E7EB]">
              Prereq
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

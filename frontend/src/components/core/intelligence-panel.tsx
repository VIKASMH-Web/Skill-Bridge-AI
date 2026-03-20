"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Clock, BookOpen, Target, Sparkles, ArrowRight } from "lucide-react";

export function IntelligencePanel({ data, selectedSkill, onComplete }: { data: any, selectedSkill: any, onComplete?: (id: string) => void }) {
  if (!data) return null;

  const { summary, gap_analysis, known_skills } = data;

  return (
    <div className="w-full h-full bg-[#FFFFFF] border-l border-[#E5E7EB] p-10 flex flex-col gap-12 text-[#111827] z-50 overflow-y-auto scroll-smooth shadow-[-10px_0_40px_rgba(0,0,0,0.02)]">
      
      {/* Technical Process Visualization */}
      <div className="flex flex-col gap-6 p-6 bg-[#FAFAFA] border border-[#E5E7EB] rounded-[2rem]">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">
          <Sparkles className="w-4 h-4" /> Technical Execution Pipeline
        </div>
        <div className="flex flex-col gap-5">
           <div className="relative pl-6 border-l-2 border-[#E5E7EB]">
              <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-[#FACC15]" />
              <div className="text-[11px] font-black uppercase text-[#111827] mb-1">Layer I: Ingestion Layer</div>
              <div className="text-[10px] text-[#6B7280] font-medium leading-relaxed">spaCy NLP + IRT Skill Assessment</div>
           </div>
           <div className="relative pl-6 border-l-2 border-[#E5E7EB]">
              <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-[#111827]" />
              <div className="text-[11px] font-black uppercase text-[#111827] mb-1">Layer II: Mapping Engine</div>
              <div className="text-[10px] text-[#6B7280] font-medium leading-relaxed">DAG Dependency Resolution + Topological Sequencing</div>
           </div>
           <div className="relative pl-6 border-l-2 border-dashed border-[#E5E7EB]">
              <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-[#FACC15] animate-pulse" />
              <div className="text-[11px] font-black uppercase text-[#111827] mb-1">Layer III: Adjustment Loop</div>
              <div className="text-[10px] text-[#6B7280] font-medium leading-relaxed">Real-time Velocity & Struggle Detection</div>
           </div>
        </div>
      </div>
      {/* Node Context Selection Card */}
      {selectedSkill && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white border border-[#E5E7EB] rounded-[2rem] p-8 shadow-2xl shadow-black/[0.03] flex-shrink-0"
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FACC15]/10 blur-3xl pointer-events-none rounded-full" />
          
          <div className="flex justify-between items-start mb-6 w-full">
            <h2 className="text-3xl font-black text-[#111827] tracking-tight leading-[0.9]">
              {selectedSkill.skill_name}
            </h2>
            <div className="bg-[#FACC15]/10 text-[#854D0E] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#FACC15]/20 flex-shrink-0">
              Priority: {selectedSkill.priority_score > 0.7 ? 'High' : selectedSkill.priority_score > 0.4 ? 'Medium' : 'Low'}
            </div>
          </div>
          
          <p className="text-[15px] text-[#4B5563] leading-relaxed mb-8 font-medium">
            {selectedSkill.description}
          </p>
          
          {selectedSkill.course && (
            <div className="bg-[#FAFAFA] rounded-[1.5rem] p-7 mb-8 border border-[#F3F4F6] w-full">
              <div className="flex items-center gap-2 mb-4 text-[#854D0E] text-[10px] uppercase font-black tracking-widest opacity-70">
                <BookOpen className="w-4 h-4" /> Recommended Syllabus
              </div>
              <div className="text-[#111827] font-black text-xl leading-tight mb-2 truncate-2-lines">{selectedSkill.course.title}</div>
              <div className="text-[#6B7280] text-[13px] mb-8 flex gap-5 items-center">
                <span className="flex items-center gap-1.5 font-bold">{selectedSkill.course.provider}</span>
                <div className="h-1 w-1 rounded-full bg-[#E5E7EB]" />
                <span className="flex items-center gap-1.5 font-bold"><Clock className="w-3.5 h-3.5" /> {selectedSkill.course.duration_hours}h</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {selectedSkill.course.url && (
                  <a href={selectedSkill.course.url} target="_blank" rel="noopener noreferrer" 
                    className="w-full flex items-center justify-center py-4 rounded-xl bg-[#111827] hover:bg-black text-white font-black transition-all shadow-xl shadow-black/10 text-[13px] tracking-tight active:scale-[0.98]">
                     Start Intensive Module <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                )}
                
                {selectedSkill.status !== 'completed' && onComplete && (
                  <button 
                    onClick={() => onComplete(selectedSkill.skill_id)}
                    className="w-full flex items-center justify-center py-4 rounded-xl bg-[#FACC15] hover:bg-[#FACC15]/90 text-[#111827] font-black transition-all shadow-xl shadow-[#FACC15]/10 text-[13px] tracking-tight active:scale-[0.98] group"
                  >
                    <CheckCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> Mark Complete
                  </button>
                )}
              </div>
            </div>
          )}

          {selectedSkill.reasoning && (
            <div className="space-y-4 pt-4 border-t border-[#F3F4F6]">
              <div className="text-[10px] uppercase font-black tracking-widest text-[#9CA3AF] flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Skill Analysis
              </div>
              <div className="flex flex-col gap-2.5">
                {selectedSkill.reasoning.jd_reference && (
                  <div className="flex items-start gap-4 bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
                    <Target className="w-4 h-4 text-[#FACC15] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[#854D0E] font-black block text-[9px] uppercase tracking-widest mb-0.5">Role Requirement</span>
                      <span className="text-[#111827] text-xs font-bold leading-tight block">{selectedSkill.reasoning.jd_reference}</span>
                    </div>
                  </div>
                )}
                {selectedSkill.reasoning.resume_gap && (
                  <div className="flex items-start gap-4 bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[#991B1B] font-black block text-[9px] uppercase tracking-widest mb-0.5">Resume Gap</span>
                      <span className="text-[#111827] text-xs font-bold leading-tight block">{selectedSkill.reasoning.resume_gap}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-4 rounded-2xl bg-[#FACC15]/5 border border-[#FACC15]/20">
                <p className="text-[#854D0E] text-[13px] font-bold leading-relaxed italic">
                  "{selectedSkill.reasoning.why_needed}"
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Traversal Summary Section */}
      <div className="flex flex-col gap-10 pb-32">
          <h3 className="text-xl font-black mb-7 flex items-center gap-3 tracking-tighter text-[#111827] uppercase">
            Learning Path Analysis
          </h3>

          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[1.8rem] p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-5xl font-black text-[#111827] mb-1 leading-none tracking-tighter">
                {summary.match_percentage}<span className="text-[#E5E7EB] ml-0.5 text-2xl font-normal">%</span>
              </div>
              <div className="text-[10px] text-[#9CA3AF] uppercase tracking-widest font-black mt-2">Skill Match Score</div>
              <div className="w-full h-2 bg-[#F3F4F6] rounded-full mt-5 overflow-hidden">
                <motion.div 
                  className="h-full bg-[#111827]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${summary.match_percentage}%` }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
            
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[1.8rem] p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-5xl font-black text-[#111827] mb-1 leading-none tracking-tighter">{summary.total_skills_to_learn}</div>
              <div className="text-[10px] text-[#9CA3AF] uppercase tracking-widest font-black mt-2">Required Modules</div>
              <div className="text-[12px] text-[#111827] mt-5 font-bold flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                 Skill Gaps
              </div>
          </div>
        </div>

         {gap_analysis?.length > 0 && (
          <div>
             <h4 className="text-[10px] uppercase font-black tracking-[0.2em] mb-6 text-[#9CA3AF]">
              Prioritized Gaps
            </h4>
            <div className="flex flex-col gap-3">
              {gap_analysis.slice(0, 5).map((gap: any) => (
                <div key={gap.skill_id} className="group bg-white border border-[#E5E7EB] rounded-[1.2rem] p-5 text-sm flex justify-between items-center text-[#111827] hover:border-[#111827] transition-all hover:bg-[#FAFAFA] cursor-default">
                  <span className="font-black text-[15px]">{gap.skill_name}</span>
                  <span className="text-[9px] uppercase font-black tracking-widest text-[#B45309] bg-[#FACC15]/15 px-3 py-1.5 rounded-full border border-[#FACC15]/20">Missing</span>
                </div>
              ))}
            </div>
          </div>
        )}

         {known_skills?.length > 0 && (
          <div>
            <h4 className="text-[10px] uppercase font-black tracking-[0.2em] mb-6 text-[#9CA3AF]">
              Matched Skills
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {known_skills.map((skill: any) => (
                <span key={skill.skill_id} className="bg-white text-[#111827] text-[11px] font-black px-5 py-2.5 rounded-full border border-[#E5E7EB] shadow-sm hover:border-[#111827] transition-all cursor-default">
                  {skill.skill_name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

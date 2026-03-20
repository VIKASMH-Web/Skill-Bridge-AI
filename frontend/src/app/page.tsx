"use client";

import { useState, useEffect } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TextLoop } from "@/components/ui/text-loop";
import { InputExperience } from "@/components/core/input-experience";
import { RoadmapPath } from "@/components/core/roadmap-path";
import { IntelligencePanel } from "@/components/core/intelligence-panel";
import { analyzeText, analyzeUpload } from "@/lib/api";
import { ArrowLeft, Sparkles, Navigation2, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [showApp, setShowApp] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Auto-select first active skill when data arrives
  useEffect(() => {
    if (data?.roadmap) {
      const active = data.roadmap.find((r: any) => r.status === 'active') || data.roadmap[0];
      setSelectedSkill(active);
    }
  }, [data]);

  const handleAnalyze = async (inputConfig: { resumeText: string; jdText: string; resumeFile: File | null; jdFile: File | null }) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    setSelectedSkill(null);

    const hasFile = inputConfig.resumeFile || inputConfig.jdFile;

    try {
      let result;
      if (hasFile) {
        result = await analyzeUpload(
          inputConfig.resumeFile, 
          inputConfig.jdFile, 
          inputConfig.resumeText || null, 
          inputConfig.jdText || null
        );
      } else {
        result = await analyzeText(inputConfig.resumeText, inputConfig.jdText);
      }

      if (result?.success && result?.data) {
        setData(result.data);
        setShowApp(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(result?.detail || "Failed to analyze path.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSkill = (item: any) => {
    setSelectedSkill(item);
  };

  const handleCompleteSkill = (skillId: string) => {
    if (!data || !data.roadmap) return;

    const newRoadmap = [...data.roadmap];
    const currentIndex = newRoadmap.findIndex(r => r.skill_id === skillId);
    
    if (currentIndex !== -1) {
      // Mark current as completed
      newRoadmap[currentIndex] = { ...newRoadmap[currentIndex], status: "completed" };
      
      // Find next locked or available node and make it active
      const nextIndex = currentIndex + 1;
      let nextSkill = null;
      if (nextIndex < newRoadmap.length) {
        newRoadmap[nextIndex] = { ...newRoadmap[nextIndex], status: "active" };
        nextSkill = newRoadmap[nextIndex];
      }

      setData({ ...data, roadmap: newRoadmap });
      
      // Trigger toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);

      // Smoothly switch selected skill to next one if available
      if (nextSkill) {
        setTimeout(() => setSelectedSkill(nextSkill), 400); // Wait for transition
      }
    }
  };

  const resetTarget = () => {
    setShowApp(false);
    setData(null);
  };

  if (showApp && data) {
    return (
      <div className="flex h-screen bg-[#FAFAFA] overflow-hidden font-sans">
        {/* Main Canvas: Roadmap View */}
        <div className="flex-1 overflow-y-auto relative no-scrollbar pb-40">
          
          {/* Dashboard Header */}
          <header className="sticky top-0 z-[60] p-7 md:p-10 flex justify-between items-center bg-white/70 backdrop-blur-3xl border-b border-[#E5E7EB]">
            <div className="flex items-center gap-6">
              <button onClick={resetTarget} className="p-3 rounded-full hover:bg-[#F3F4F6] transition-all text-[#111827]">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="h-6 w-[1.5px] bg-[#E5E7EB]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">
                  {data.summary.user_classification} Classification
                </span>
                <span className="text-xl font-black text-[#111827]">{data.summary.target_role || "Skill Analysis"}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex bg-[#FACC15]/10 border border-[#FACC15]/30 px-5 py-2 rounded-full items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#854D0E]" />
                <span className="text-[11px] font-black uppercase text-[#854D0E] tracking-widest">
                  Skill Analysis Active
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center text-white text-[12px] font-black">
                AI
              </div>
            </div>
          </header>

          <RoadmapPath 
            roadmap={data.roadmap} 
            parallelTracks={data.parallel_tracks} 
            selectedSkill={selectedSkill}
            onSelectSkill={handleSelectSkill}
          />
        </div>

        {/* Intelligence Side Column */}
        <div className="w-[450px] flex-shrink-0 h-full border-l border-[#E5E7EB] bg-white shadow-2xl z-[70] relative hidden lg:block">
          <IntelligencePanel data={data} selectedSkill={selectedSkill} onComplete={handleCompleteSkill} />
        </div>

        {/* Live Adaptation Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-[#111827] text-white px-6 py-4 rounded-2xl flex items-center gap-4 shadow-[0_20px_40px_-15px_rgba(250,204,21,0.3)] border border-[#FACC15]/20"
            >
              <div className="w-8 h-8 rounded-full bg-[#FACC15] flex items-center justify-center text-[#854D0E] animate-pulse">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-black tracking-[0.2em] text-[#FACC15]">Live Adaptation</div>
                <div className="text-sm font-bold mt-0.5">Path updated based on your performance.</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <AuroraBackground showRadialGradient className="!h-auto min-h-screen">
        
        {/* Premium Brand Header */}
        <nav className="absolute top-0 w-full p-10 flex justify-between items-center z-50">
          <div className="text-[#111827] font-black text-2xl tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 rounded-[0.8rem] bg-[#111827] text-white flex items-center justify-center shadow-2xl shadow-black/20">
              <Navigation2 className="w-5 h-5 fill-white rotate-45" />
            </div>
            SkillBridge<span className="text-[#FACC15]">AI</span>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/50 backdrop-blur-xl border border-[#E5E7EB] px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.25em] text-[#111827] shadow-sm">
               Skills Gap Analysis
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20 flex flex-col items-center justify-center pt-56 pb-24 px-6 text-center"
        >
          <div className="mb-8 px-6 py-2 rounded-full border border-[#FACC15]/20 bg-[#FACC15]/5 text-[10px] font-black tracking-[0.3em] text-[#854D0E] uppercase shadow-sm flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 fill-[#FACC15]" /> Professional Skill Mapping
          </div>
          
          <h1 className="text-7xl md:text-[9rem] font-black text-[#111827] tracking-tight mb-8 mt-4 leading-[0.85] font-plus-jakarta italic-no">
            Bridge Your Path <br />
            <span className="text-[#FACC15] drop-shadow-[0_0_50px_rgba(250,204,21,0.4)] relative">
              <TextLoop>
                <span>To Seniority.</span>
                <span>To Mastery.</span>
                <span>To Leadership.</span>
                <span>To Engineering.</span>
              </TextLoop>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[#6B7280] max-w-2xl mt-8 mb-24 leading-relaxed font-semibold tracking-tight">
            Our <span className="text-[#111827] font-black underline decoration-[#FACC15] decoration-4 underline-offset-8">Algorithmic Engine</span> determines the optimal learning path using role-based benchmarks and career progression metrics.
          </p>

          <div className="w-full max-w-4xl relative">
            <div className="absolute inset-0 bg-[#FACC15]/10 blur-[100px] rounded-full -z-10 group-hover:bg-[#FACC15]/20 transition-all" />
            <InputExperience onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-12 bg-white border border-red-200 text-red-600 px-10 py-6 rounded-[2rem] flex items-center gap-5 w-full max-w-4xl shadow-2xl shadow-red-500/5 mx-auto"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 stroke-[#EF4444]" />
                </div>
                <div className="text-left font-bold text-[15px] tracking-tight flex-1">
                  <span className="uppercase tracking-[0.2em] text-[10px] block text-[#EF4444] opacity-70 mb-1 font-black">Optimization Denied</span>
                  <p className="text-[#111827]">
                    {typeof error === 'object' ? JSON.stringify(error) : error}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Features Preview */}
        <section className="relative z-20 w-full max-w-7xl mx-auto px-6 pb-40">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 px-4">
            <div className="text-left">
              <h2 className="text-4xl font-black text-[#111827] tracking-tight mb-4 leading-tight font-plus-jakarta italic-no uppercase">
                Adaptive Intelligence <br /> Architecture.
              </h2>
              <p className="text-[#6B7280] max-w-md font-medium">
                Our three-layer engine continuously evolves to ensure your learning path is never static.
              </p>
            </div>
            <div className="flex bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-[#FACC15] flex items-center justify-center text-white">
                 <Sparkles className="w-6 h-6 stroke-[#854D0E]" />
               </div>
               <div>
                  <div className="text-[11px] font-black uppercase text-[#6B7280] tracking-widest mb-0.5">Engine Status</div>
                  <div className="text-sm font-black text-[#111827]">Fully Synchronized</div>
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Layer 1: Ingestion */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-white border border-[#E5E7EB] rounded-[2.5rem] p-8 shadow-xl shadow-black/5 flex flex-col gap-6 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FACC15]/10 flex items-center justify-center text-[#854D0E] group-hover:bg-[#FACC15] group-hover:text-black transition-all">
                <Navigation2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FACC15]">Layer I</span>
                <h3 className="text-2xl font-black text-[#111827] mt-1 mb-3">Ingestion Layer</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed font-medium">
                  Constructs a high-fidelity representation of your capabilities using spaCy NLP and Adaptive Diagnostic Assessments (IRT).
                </p>
              </div>
              <ul className="space-y-3 mt-4">
                <li className="flex items-center gap-3 text-[13px] font-bold text-[#374151]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" /> Resume & JD Parsing
                </li>
                <li className="flex items-center gap-3 text-[13px] font-bold text-[#374151]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" /> IRT Skill Assessment
                </li>
                <li className="flex items-center gap-3 text-[13px] font-bold text-[#374151]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" /> Skill Graph Construction
                </li>
              </ul>
            </motion.div>

            {/* Layer 2: Mapping */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-white border border-[#E5E7EB] rounded-[2.5rem] p-8 shadow-xl shadow-black/5 flex flex-col gap-6 group scale-105 ring-4 ring-[#FACC15]/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#111827] flex items-center justify-center text-white transition-all">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FACC15]">Layer II</span>
                <h3 className="text-2xl font-black text-[#111827] mt-1 mb-3">Mapping Engine</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed font-medium">
                  The core intelligence layer using Directed Acyclic Graphs (DAG) to resolve dependencies and sequence your optimized path.
                </p>
              </div>
              <ul className="space-y-3 mt-4">
                <li className="flex items-center gap-3 text-[13px] font-bold text-[#374151]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" /> Competency Modeling
                </li>
                <li className="flex items-center gap-3 text-[13px] font-bold text-[#374151]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" /> Dependency Resolution
                </li>
                <li className="flex items-center gap-3 text-[13px] font-bold text-[#374151]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" /> Topological Sequencing
                </li>
              </ul>
            </motion.div>

            {/* Layer 3: Adjustment */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-white border border-[#E5E7EB] rounded-[2.5rem] p-8 shadow-xl shadow-black/5 flex flex-col gap-6 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FACC15]/10 flex items-center justify-center text-[#854D0E] group-hover:bg-[#FACC15] group-hover:text-black transition-all">
                <ArrowRight className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FACC15]">Layer III</span>
                <h3 className="text-2xl font-black text-[#111827] mt-1 mb-3">Adjustment Loop</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed font-medium">
                  Detects velocity and struggle in real-time, triggering "Remediation Bridges" or skipping redundant content dynamically.
                </p>
              </div>
              <ul className="space-y-3 mt-4">
                <li className="flex items-center gap-3 text-[13px] font-bold text-[#374151]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" /> Velocity Tracking
                </li>
                <li className="flex items-center gap-3 text-[13px] font-bold text-[#374151]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" /> Struggle Detection
                </li>
                <li className="flex items-center gap-3 text-[13px] font-bold text-[#374151]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" /> Path Recalculation
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="mt-20 p-10 bg-[#111827] rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
            <div className="text-left max-w-xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FACC15] mb-4">Core Philosophy</h4>
              <p className="text-3xl font-black text-white leading-tight">
                From One-size-fits-all <br /> To <span className="text-[#FACC15]">Self-Correcting Trajectories.</span>
              </p>
            </div>
            <div className="flex flex-col gap-4 text-white/60 text-sm font-medium">
              <div className="flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#FACC15]" />
                 Personalized Roadmaps
              </div>
              <div className="flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#FACC15]" />
                 Dynamic Progression
              </div>
              <div className="flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#FACC15]" />
                 Transparent Logic
              </div>
            </div>
          </div>
        </section>

      </AuroraBackground>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { motion } from "framer-motion";

interface InputExperienceProps {
  onAnalyze: (data: { resumeText: string; jdText: string; resumeFile: File | null; jdFile: File | null }) => void;
  isLoading: boolean;
}

export function InputExperience({ onAnalyze, isLoading }: InputExperienceProps) {
  const [resumeMode, setResumeMode] = useState<"text" | "upload">("upload");
  const [jdMode, setJdMode] = useState<"text" | "upload">("text");
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);

  const resumeRef = useRef<HTMLInputElement>(null);
  const jdRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent, type: "resume" | "jd") => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (type === "resume") {
      setResumeFile(file);
      setResumeMode("upload");
    } else {
      setJdFile(file);
      setJdMode("upload");
    }
  };

  const prevent = (e: React.DragEvent) => e.preventDefault();

  const handleAnalyzeClick = () => {
    onAnalyze({ resumeText, jdText, resumeFile, jdFile });
  };

  const isReady = (resumeFile || resumeText.length > 20) && (jdFile || jdText.length > 20);

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border border-[#E5E7EB] rounded-[3.5rem] p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.06)] relative z-10 text-[#111827]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-16">
        
        {/* Resume Box */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between pb-6 border-b-[2px] border-[#F3F4F6]">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FACC15] mb-1">Source Node</span>
              <h3 className="text-2xl font-black flex items-center gap-3 text-[#111827]">
                Experience Graph
              </h3>
            </div>
            <div className="flex bg-[#F9FAFB] p-1.5 rounded-2xl shadow-inner border border-[#E5E7EB]">
              {["upload", "text"].map((mode) => (
                <button 
                  key={mode}
                  onClick={() => setResumeMode(mode as any)}
                  className={`py-2 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${resumeMode === mode ? 'bg-[#111827] text-white shadow-xl' : 'text-[#9CA3AF] hover:text-[#111827]'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
          <div 
            className={`min-h-[300px] rounded-[3rem] border-[3px] border-dashed transition-all flex flex-col items-center justify-center p-10 relative overflow-hidden group ${
              resumeMode === 'upload' ? 'border-[#E5E7EB] bg-[#FAFAFA] hover:border-[#FACC15] hover:bg-white hover:shadow-2xl hover:shadow-[#FACC15]/10 cursor-pointer' : 'border-transparent bg-[#FAFAFA]'
            }`}
            onClick={() => resumeMode === 'upload' && resumeRef.current?.click()}
            onDrop={(e) => resumeMode === 'upload' && handleDrop(e, 'resume')}
            onDragOver={prevent}
          >
            {resumeMode === "text" ? (
              <textarea 
                placeholder="Paste the raw output of your career history..."
                className="w-full h-full min-h-[220px] bg-transparent resize-none outline-none text-[#111827] placeholder:text-[#9CA3AF] text-[16px] leading-relaxed font-semibold"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            ) : resumeFile ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                <div className="w-24 h-24 rounded-[2rem] bg-[#FACC15] flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_-10px_rgba(250,204,21,0.5)]">
                  <CheckCircle2 className="w-12 h-12 text-black" strokeWidth={3} />
                </div>
                <p className="font-black text-2xl truncate max-w-[280px] text-[#111827]">{resumeFile.name}</p>
                <p className="text-[10px] text-[#9CA3AF] mt-3 font-black uppercase tracking-[0.3em]">Node Synchronized</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                  className="mt-10 text-[10px] font-black uppercase tracking-[0.25em] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827] py-4 px-10 rounded-2xl transition-all"
                >
                  Eject Component
                </button>
              </motion.div>
            ) : (
              <div className="text-center transition-all group-hover:scale-110">
                <div className="w-20 h-20 rounded-[1.8rem] bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:border-[#FACC15] group-hover:shadow-lg transition-all">
                  <UploadCloud className="w-10 h-10 text-[#E5E7EB] group-hover:text-[#FACC15] transition-colors" strokeWidth={1.5} />
                </div>
                <p className="font-black text-[#111827] text-xl mb-1">Push Resume Path</p>
                <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest">PDF / TXT Node</p>
              </div>
            )}
            <input type="file" className="hidden" ref={resumeRef} accept=".pdf,.txt" onChange={(e) => {
              if (e.target.files?.[0]) setResumeFile(e.target.files[0]);
            }} />
          </div>
        </div>

        {/* JD Box */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between pb-6 border-b-[2px] border-[#F3F4F6]">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FACC15] mb-1">Target Market</span>
              <h3 className="text-2xl font-black flex items-center gap-3 text-[#111827]">
                 Requirement Logic
              </h3>
            </div>
            <div className="flex bg-[#F9FAFB] p-1.5 rounded-2xl shadow-inner border border-[#E5E7EB]">
              {["upload", "text"].map((mode) => (
                <button 
                  key={mode}
                  onClick={() => setJdMode(mode as any)}
                  className={`py-2 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${jdMode === mode ? 'bg-[#111827] text-white shadow-xl' : 'text-[#9CA3AF] hover:text-[#111827]'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
          <div 
            className={`min-h-[300px] rounded-[3rem] border-[3px] border-dashed transition-all flex flex-col items-center justify-center p-10 relative overflow-hidden group ${
              jdMode === 'upload' ? 'border-[#E5E7EB] bg-[#FAFAFA] hover:border-[#FACC15] hover:bg-white hover:shadow-2xl hover:shadow-[#FACC15]/10 cursor-pointer' : 'border-transparent bg-[#FAFAFA]'
            }`}
            onClick={() => jdMode === 'upload' && jdRef.current?.click()}
            onDrop={(e) => jdMode === 'upload' && handleDrop(e, 'jd')}
            onDragOver={prevent}
          >
            {jdMode === "text" ? (
              <textarea 
                placeholder="Paste the target role description/parameters..."
                className="w-full h-full min-h-[220px] bg-transparent resize-none outline-none text-[#111827] placeholder:text-[#9CA3AF] text-[16px] leading-relaxed font-semibold"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            ) : jdFile ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                <div className="w-24 h-24 rounded-[2rem] bg-[#FACC15] flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_-10px_rgba(250,204,21,0.5)]">
                  <CheckCircle2 className="w-12 h-12 text-black" strokeWidth={3} />
                </div>
                <p className="font-black text-2xl truncate max-w-[280px] text-[#111827]">{jdFile.name}</p>
                <p className="text-[10px] text-[#9CA3AF] mt-3 font-black uppercase tracking-[0.3em]">Requirement Locked</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setJdFile(null); }}
                  className="mt-10 text-[10px] font-black uppercase tracking-[0.25em] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827] py-4 px-10 rounded-2xl transition-all"
                >
                  Eject Component
                </button>
              </motion.div>
            ) : (
              <div className="text-center transition-all group-hover:scale-110">
                <div className="w-20 h-20 rounded-[1.8rem] bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:border-[#FACC15] group-hover:shadow-lg transition-all">
                  <UploadCloud className="w-10 h-10 text-[#E5E7EB] group-hover:text-[#FACC15] transition-colors" strokeWidth={1.5} />
                </div>
                <p className="font-black text-[#111827] text-xl mb-1">Import Job Logic</p>
                <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest">PDF / LinkedIn</p>
              </div>
            )}
            <input type="file" className="hidden" ref={jdRef} accept=".pdf,.txt" onChange={(e) => {
              if (e.target.files?.[0]) setJdFile(e.target.files[0]);
            }} />
          </div>
        </div>

      </div>

      <div className="flex justify-center mt-6 relative">
        <motion.button 
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          disabled={!isReady || isLoading} 
          onClick={handleAnalyzeClick}
          className={`w-full max-w-xl py-8 text-2xl font-black rounded-[2rem] tracking-tighter transition-all flex items-center justify-center gap-6 shadow-2xl ${
            !isReady ? 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed' : 'bg-[#111827] text-white hover:bg-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-6">
              <span className="flex gap-2.5">
                {[0, 150, 300].map((delay) => (
                  <motion.span 
                    key={delay}
                    animate={{ y: [0, -10, 0], backgroundColor: ["#6B7280", "#FACC15", "#6B7280"] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: delay/1000 }}
                    className="w-3 h-3 rounded-full"
                  />
                ))}
              </span>
              RECONSTRUCTING GRAPH...
            </span>
          ) : (
            <>
              INITIATE TRAVERSAL
              <ArrowRight className={`w-8 h-8 transition-transform ${isReady ? 'translate-x-0' : 'opacity-0'}`} strokeWidth={3} />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

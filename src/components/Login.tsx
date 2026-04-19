import React, { useState } from 'react';
import { School, GraduationCap, Eye, User, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type UserType = "fresher" | "student" | "visitor";

interface LoginProps {
  onLogin: (name: string, role: UserType, collegeId?: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserType>("student");
  const [collegeId, setCollegeId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (role === "student" && !collegeId.trim()) {
      setError("College ID is required for students");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          role, 
          collegeId: role === "student" ? collegeId : undefined 
        })
      });
    } catch (err) {
      console.error("Failed to log login data", err);
      // We still allow them to proceed even if logging fails
    }
    setIsSubmitting(false);

    setError("");
    onLogin(name, role, role === "student" ? collegeId : undefined);
  };

  return (
    <div className="flex h-screen app-bg text-[#35614C] font-sans items-center justify-center p-4 overflow-hidden relative">
      {/* Liquid Refraction Orbs */}
      <div className="absolute top-[5%] right-[15%] w-[400px] h-[400px] bg-[#34d399] rounded-full blur-[120px] pointer-events-none opacity-[0.15]" />
      <div className="absolute bottom-[10%] left-[15%] w-[500px] h-[500px] bg-[#38bdf8] rounded-full blur-[140px] pointer-events-none opacity-[0.15]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel rounded-[24px] p-8 relative z-10"
      >
        <div className="flex items-center justify-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-[#F5FFF1] rounded-[20px] border border-[#FFFFFF66] flex items-center justify-center text-[#3CB371]">
            <School size={32} />
          </div>
        </div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-2xl font-bold text-[#1F332B] mb-2 tracking-tight">Welcome to CampusGuide</h1>
          <p className="text-[#35614C] text-sm">Your intelligent AI assistant for Techno NJR</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-[#ADCAB8] uppercase tracking-widest mb-2 px-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={16} className="text-[#ADCAB8]" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full input-glass rounded-2xl pl-11 pr-4 py-3 text-sm text-[#1F332B] placeholder:text-[#ADCAB8] outline-none focus:ring-2 focus:ring-[#22C55E] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#ADCAB8] uppercase tracking-widest mb-2 px-1">
              I am a...
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["fresher", "student", "visitor"] as UserType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRole(type)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 border btn-glow",
                    role === type 
                      ? "bg-[#DFF5E14F] text-[#3CB371] rounded-[20px] glass-panel border border-[#FFFFFF66]" 
                      : "text-[#89A698] hover:text-[#1F332B] hover:bg-[rgba(255,255,255,0.4)] rounded-[20px] border border-transparent"
                  )}
                >
                  {type === "fresher" && <GraduationCap size={20} className="mb-2" />}
                  {type === "student" && <School size={20} className="mb-2" />}
                  {type === "visitor" && <Eye size={20} className="mb-2" />}
                  <span className="text-[11px] font-semibold capitalize tracking-wide">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {role === "student" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-xs font-bold text-[#ADCAB8] uppercase tracking-widest mt-2 mb-2 px-1">
                College ID
              </label>
              <input
                type="text"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                placeholder="e.g. TEC2024CS001"
                className="w-full input-glass rounded-2xl px-4 py-3 text-sm text-[#1F332B] placeholder:text-[#ADCAB8] outline-none focus:ring-2 focus:ring-[#22C55E] transition-all"
              />
            </motion.div>
          )}

          {error && (
            <p className="text-red-500 text-xs font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white py-3.5 rounded-2xl font-semibold transition-all shadow-[0_4px_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 border border-transparent"
          >
            <span>{isSubmitting ? "Proceeding..." : "Proceed to Guide"}</span>
            <Sparkles size={16} className="opacity-70 group-hover:opacity-100 group-hover:animate-pulse" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

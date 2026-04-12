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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (role === "student" && !collegeId.trim()) {
      setError("College ID is required for students");
      return;
    }
    
    setError("");
    onLogin(name, role, role === "student" ? collegeId : undefined);
  };

  return (
    <div className="flex h-screen app-bg text-[#E5E7EB] font-sans items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-[20%] right-[20%] w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[20%] w-96 h-96 bg-[#60A5FA]/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel card-shadow rounded-[24px] p-8 relative z-10 border border-white/[0.08]"
      >
        <div className="flex items-center justify-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-[#3B82F6] rounded-[24px] flex items-center justify-center text-white central-glow">
            <School size={32} />
          </div>
        </div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-2xl font-bold text-[#E5E7EB] mb-2 tracking-tight">Welcome to CampusGuide</h1>
          <p className="text-[#9CA3AF] text-sm">Your intelligent AI assistant for Techno NJR</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-2 px-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={16} className="text-[#6B7280]" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full input-glass rounded-xl pl-11 pr-4 py-3 text-sm text-[#E5E7EB] placeholder:text-[#6B7280] outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all border border-transparent focus:border-[#3B82F6]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-2 px-1">
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
                      ? "bg-[#3B82F6]/10 text-[#60A5FA] border-[#60A5FA]/30 shadow-md" 
                      : "text-[#9CA3AF] hover:text-[#E5E7EB] bg-white/[0.02] border-transparent hover:bg-white/[0.05]"
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
              <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mt-2 mb-2 px-1">
                College ID
              </label>
              <input
                type="text"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                placeholder="e.g. TEC2024CS001"
                className="w-full input-glass rounded-xl px-4 py-3 text-sm text-[#E5E7EB] placeholder:text-[#6B7280] outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all border border-transparent focus:border-[#3B82F6]/30"
              />
            </motion.div>
          )}

          {error && (
            <p className="text-red-400 text-xs font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#1F2937] hover:bg-[#3B82F6] text-white py-3.5 rounded-xl font-semibold transition-all btn-glow border border-[#374151] hover:border-[#60A5FA]/50 group flex items-center justify-center gap-2 mt-4"
          >
            <span>Proceed to Guide</span>
            <Sparkles size={16} className="opacity-70 group-hover:opacity-100 group-hover:animate-pulse" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

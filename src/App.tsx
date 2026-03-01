import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  User, 
  Bot, 
  MapPin, 
  Calendar, 
  Users, 
  Info, 
  ChevronRight,
  GraduationCap,
  School,
  Eye,
  MessageSquare
} from "lucide-react";
import { generateCampusResponse, ChatMessage } from "./services/geminiService";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type UserType = "fresher" | "student" | "visitor";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "model", text: "Hello! I'm CampusGuide AI. How can I help you with admissions or navigating Techno NJR today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>("student");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    const response = await generateCampusResponse(userMessage, messages, userType);
    
    setMessages(prev => [...prev, { role: "model", text: response }]);
    setIsLoading(false);
  };

  const suggestions = [
    { icon: <MapPin size={16} />, text: "Where is the placement cell?" },
    { icon: <Info size={16} />, text: "What documents are required for admission?" },
    { icon: <Calendar size={16} />, text: "What is the fee structure for CSE?" },
    { icon: <Users size={16} />, text: "How can I contact the admission office?" },
  ];

  return (
    <div className="flex h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-black/5 flex flex-col hidden md:flex">
        <div className="p-6 border-bottom border-black/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <School size={20} />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">CampusGuide AI</h1>
          </div>
          <p className="text-xs text-black/40 font-medium uppercase tracking-wider">Techno NJR Assistant</p>
        </div>

        <nav className="flex-1 p-4 space-y-6">
          <div>
            <label className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-3 block px-2">I am a...</label>
            <div className="space-y-1">
              {(["fresher", "student", "visitor"] as UserType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setUserType(type)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                    userType === type 
                      ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200" 
                      : "text-black/60 hover:bg-black/5"
                  )}
                >
                  {type === "fresher" && <GraduationCap size={18} />}
                  {type === "student" && <School size={18} />}
                  {type === "visitor" && <Eye size={18} />}
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-3 block px-2">Quick Access</label>
            <div className="space-y-1">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s.text)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-black/50 hover:bg-black/5 hover:text-black transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    {s.icon}
                    <span>{s.text}</span>
                  </div>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-black/5">
          <div className="bg-black/5 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black/40">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">Guest User</p>
              <p className="text-[10px] text-black/40 truncate capitalize">{userType} Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-white md:bg-transparent">
        {/* Header (Mobile) */}
        <header className="md:hidden p-4 bg-white border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <School size={18} />
            </div>
            <span className="font-semibold">CampusGuide</span>
          </div>
          <select 
            value={userType} 
            onChange={(e) => setUserType(e.target.value as UserType)}
            className="text-xs bg-black/5 border-none rounded-lg px-2 py-1 outline-none"
          >
            <option value="fresher">Fresher</option>
            <option value="student">Student</option>
            <option value="visitor">Visitor</option>
          </select>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center",
                    msg.role === "user" ? "bg-black text-white" : "bg-emerald-600 text-white"
                  )}>
                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-black text-white rounded-tr-none" 
                      : "bg-white border border-black/5 shadow-sm rounded-tl-none"
                  )}>
                    <div className="markdown-body prose prose-sm max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-black/5 shadow-sm rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                  <div className="w-1 h-1 bg-black/20 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-black/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 bg-black/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-8 pt-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-600/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative flex items-center gap-2 bg-white border border-black/10 rounded-2xl p-2 shadow-lg focus-within:border-emerald-500/50 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Ask anything about Techno NJR as a ${userType}...`}
                  className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm placeholder:text-black/30"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-600/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center mt-4 text-black/30 font-medium uppercase tracking-widest">
              CampusGuide AI can make mistakes. Check official sources for critical info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

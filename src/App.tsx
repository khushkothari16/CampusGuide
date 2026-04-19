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
  Paperclip,
  X
} from "lucide-react";
import { generateCampusResponse, ChatMessage } from "./services/geminiService";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Login from "./components/Login";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest User");
  const [collegeId, setCollegeId] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage = input.trim();
    const imageToSend = selectedImage;
    
    setInput("");
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    const displayMessage = userMessage || "Sent an image";
    setMessages(prev => [...prev, { role: "user", text: displayMessage }]);
    setIsLoading(true);

    const response = await generateCampusResponse(userMessage, messages, userType, imageToSend || undefined);
    
    setMessages(prev => [...prev, { role: "model", text: response }]);
    setIsLoading(false);
  };

  const suggestions = [
    { icon: <MapPin size={16} />, text: "Where is the placement cell?" },
    { icon: <Info size={16} />, text: "What documents are required for admission?" },
    { icon: <Calendar size={16} />, text: "What is the fee structure for CSE?" },
    { icon: <Users size={16} />, text: "How can I contact the admission office?" },
  ];

  if (!isLoggedIn) {
    return (
      <Login 
        onLogin={(name, role, selectedCollegeId) => {
          setUserName(name);
          setUserType(role);
          setCollegeId(selectedCollegeId);
          setIsLoggedIn(true);
        }} 
      />
    );
  }

  return (
    <div className="flex h-screen app-bg text-[#35614C] font-sans selection:bg-[#DFF5E1] selection:text-[#1F332B] transition-colors duration-300 relative">
      {/* Liquid Refraction Orbs */}
      <div className="absolute top-[15%] right-[10%] w-[500px] h-[500px] bg-[#34d399] rounded-full blur-[140px] pointer-events-none opacity-[0.15]" />
      <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] bg-[#38bdf8] rounded-full blur-[150px] pointer-events-none opacity-[0.12]" />
      <div className="absolute top-[35%] left-[40%] w-[400px] h-[400px] bg-[#818cf8] rounded-full blur-[120px] pointer-events-none opacity-[0.15]" />

      {/* Sidebar */}
      <aside className="w-64 sidebar-bg flex flex-col hidden md:flex z-10 glass-panel border border-[#FFFFFF66] border-y-0 border-l-0">
        <div className="p-8 border-b border-[#FFFFFF66]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#F5FFF1] border border-[#FFFFFF66] rounded-[20px] flex items-center justify-center text-[#3CB371]">
              <School size={20} />
            </div>
            <h1 className="font-semibold text-lg tracking-tight text-[#1F332B]">CampusGuide</h1>
          </div>
          <p className="text-xs text-[#ADCAB8] font-medium uppercase tracking-wider mt-2">Techno NJR</p>
        </div>

        <nav className="flex-1 p-6 space-y-8 relative z-10">
          <div>
            <label className="text-xs font-bold text-[#ADCAB8] uppercase tracking-widest mb-4 block px-2">I am a...</label>
            <div className="space-y-2">
              {(["fresher", "student", "visitor"] as UserType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setUserType(type)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-[20px] transition-all duration-300 text-sm font-medium border",
                    userType === type 
                      ? "bg-[#DFF5E14F] text-[#3CB371] border-[#FFFFFF66] shadow-[0_4px_10px_rgba(0,0,0,0.05)]" 
                      : "text-[#89A698] hover:text-[#1F332B] hover:bg-[rgba(255,255,255,0.4)] border-transparent"
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
            <label className="text-xs font-bold text-[#ADCAB8] uppercase tracking-widest mb-4 block px-2">Quick Access</label>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s.text)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-transparent rounded-[20px] text-xs text-[#89A698] hover:text-[#1F332B] hover:bg-[rgba(255,255,255,0.4)] btn-glow group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#3CB371] transition-colors">{s.icon}</span>
                    <span className="truncate max-w-[120px] text-left">{s.text}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#22C55E]" />
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-6 mt-auto border-t border-[#FFFFFF66] space-y-4">
          <div className="glass-panel rounded-[24px] p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[20px] bg-white/60 border border-[#FFFFFF66] flex items-center justify-center text-[#3CB371]">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1F332B] truncate">{userName}</p>
              <p className="text-[11px] text-[#ADCAB8] truncate capitalize">{userType} Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
        {/* Header (Mobile) */}
        <header className="md:hidden p-4 glass-panel border-b border-[#FFFFFF66] border-t-0 border-x-0 flex items-center justify-between sticky top-0 z-20 rounded-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/60 rounded-[16px] flex items-center justify-center text-[#3CB371] glass-panel border border-[#FFFFFF66]">
              <School size={16} />
            </div>
            <span className="font-semibold text-[#1F332B]">CampusGuide</span>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={userType} 
              onChange={(e) => setUserType(e.target.value as UserType)}
              className="text-xs glass-panel rounded-[20px] px-3 py-1.5 outline-none text-[#1F332B] cursor-pointer"
            >
              <option value="fresher" className="bg-white">Fresher</option>
              <option value="student" className="bg-white">Student</option>
              <option value="visitor" className="bg-white">Visitor</option>
            </select>
          </div>
        </header>

        {/* Floating Bubble Header (Desktop) */}
        <div className="hidden md:flex justify-center pt-8 absolute top-0 w-full z-10 pointer-events-none">
          <div className="glass-panel rounded-[20px] px-6 py-2.5 pointer-events-auto border border-[#FFFFFF66]">
             <p className="text-xs font-medium text-[#ADCAB8] flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-pulse"></span>
               Connected to <span className="font-bold text-[#1F332B]">Campus Brain</span>
             </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 md:pt-28 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-8">
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
                    "w-10 h-10 rounded-[20px] flex-shrink-0 flex items-center justify-center z-10 glass-panel border border-[#FFFFFF66]",
                    msg.role === "user" ? "text-white bg-[#22C55E]" : "text-[#3CB371] bg-white/60"
                  )}>
                    {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] px-6 py-4 text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-[#DFF5E14F] text-[#1F332B] rounded-[24px] rounded-tr-[8px] glass-panel shadow-sm border border-[#FFFFFF66]" 
                      : "glass-panel rounded-[24px] rounded-tl-[8px]"
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
                <div className="w-10 h-10 rounded-[20px] glass-panel text-[#3CB371] border border-[#FFFFFF66] flex items-center justify-center bg-white/60">
                  <Bot size={18} />
                </div>
                <div className="glass-panel rounded-[24px] rounded-tl-[8px] px-6 py-4 flex items-center gap-2 max-w-[100px]">
                  <div className="w-2 h-2 bg-[#22C55E] rounded-[20px] animate-bounce" />
                  <div className="w-2 h-2 bg-[#22C55E] rounded-[20px] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-[#22C55E] rounded-[20px] animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-8 pt-0 pb-6 md:pb-10 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              {selectedImage && (
                <div className="mb-4 relative inline-block">
                  <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-[20px] glass-panel shadow-lg" />
                  <button 
                    onClick={() => {
                      setSelectedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -top-3 -right-3 bg-white text-[#ADCAB8] rounded-[20px] p-1.5 glass-panel border border-[#FFFFFF66] hover:text-red-400 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="relative flex items-center gap-2 input-glass rounded-[24px] p-2 pl-4 focus-within:ring-2 focus-within:ring-[#22C55E] transition-all">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 text-[#ADCAB8] hover:text-[#22C55E] rounded-[20px] flex items-center justify-center transition-all btn-glow border border-transparent"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Search or ask anything...`}
                  className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-[15px] placeholder:text-[#ADCAB8] text-[#1F332B] w-full"
                />
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  className="w-12 h-12 bg-[#22C55E] text-white rounded-[20px] flex items-center justify-center hover:bg-[#16A34A] border border-transparent disabled:opacity-40 disabled:hover:bg-[#22C55E] transition-all shadow-[0_4px_15px_rgba(34,197,94,0.3)] shrink-0 btn-glow"
                >
                  <Send size={18} className="ml-1" />
                </button>
              </div>
            </div>
            <p className="text-xs text-center mt-6 text-[#89A698] font-medium tracking-wide">
              CampusGuide AI can make mistakes. Check official sources for critical info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

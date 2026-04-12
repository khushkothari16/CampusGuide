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
    <div className="flex h-screen app-bg text-[#E5E7EB] font-sans selection:bg-[#3B82F6]/30 selection:text-white transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 sidebar-bg flex flex-col hidden md:flex shadow-2xl z-10">
        <div className="p-8 border-b border-white/[0.08]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#3B82F6] rounded-[16px] flex items-center justify-center text-white central-glow">
              <School size={20} />
            </div>
            <h1 className="font-semibold text-lg tracking-tight text-[#E5E7EB]">CampusGuide AI</h1>
          </div>
          <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider mt-2">Techno NJR Assistant</p>
        </div>

        <nav className="flex-1 p-6 space-y-8">
          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-4 block px-2">I am a...</label>
            <div className="space-y-2">
              {(["fresher", "student", "visitor"] as UserType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setUserType(type)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all duration-300 text-sm font-medium border border-transparent",
                    userType === type 
                      ? "bg-white/[0.05] text-[#60A5FA] border-[#60A5FA]/30 shadow-sm" 
                      : "text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-white/[0.02]"
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
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-4 block px-2">Quick Access</label>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s.text)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-transparent rounded-[16px] text-xs text-[#9CA3AF] hover:text-[#60A5FA] btn-glow group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#6B7280] group-hover:text-[#60A5FA] transition-colors">{s.icon}</span>
                    <span className="truncate max-w-[120px] text-left">{s.text}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-6 mt-auto border-t border-white/[0.08] space-y-4">
          <div className="glass-panel rounded-[16px] p-4 flex items-center gap-3 shadow-sm border border-[#374151]">
            <div className="w-10 h-10 rounded-[12px] bg-[#1F2937] flex items-center justify-center text-[#E5E7EB] border border-[#374151]">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#E5E7EB] truncate">{userName}</p>
              <p className="text-[11px] text-[#9CA3AF] truncate capitalize">{userType} Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
        {/* Header (Mobile) */}
        <header className="md:hidden p-4 glass-panel border-b border-white/[0.08] flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-[12px] flex items-center justify-center text-white central-glow">
              <School size={16} />
            </div>
            <span className="font-semibold text-[#E5E7EB]">CampusGuide</span>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={userType} 
              onChange={(e) => setUserType(e.target.value as UserType)}
              className="text-xs bg-[#1F2937] border border-[#374151] rounded-full px-3 py-1.5 outline-none text-[#E5E7EB] cursor-pointer"
            >
              <option value="fresher">Fresher</option>
              <option value="student">Student</option>
              <option value="visitor">Visitor</option>
            </select>
          </div>
        </header>

        {/* Floating Bubble Header (Desktop) */}
        <div className="hidden md:flex justify-center pt-8 absolute top-0 w-full z-10 pointer-events-none">
          <div className="glass-panel shadow-md rounded-full px-6 py-2.5 pointer-events-auto border-[#374151]">
             <p className="text-xs font-medium text-[#9CA3AF] flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-[#60A5FA] central-glow animate-pulse"></span>
               Connected to <span className="font-bold text-[#E5E7EB]">Campus Brain</span>
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
                    "w-10 h-10 rounded-[16px] flex-shrink-0 flex items-center justify-center shadow-sm z-10",
                    msg.role === "user" ? "bg-[#3B82F6] text-white central-glow" : "glass-panel text-[#60A5FA] border-[#374151]"
                  )}>
                    {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] px-6 py-4 rounded-[20px] text-sm leading-relaxed card-shadow backdrop-blur-sm",
                    msg.role === "user" 
                      ? "bg-[#3B82F6] text-white rounded-tr-none border border-[#60A5FA]/30" 
                      : "glass-panel rounded-tl-none border-[#374151]"
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
                <div className="w-10 h-10 rounded-[16px] glass-panel border border-[#374151] text-[#60A5FA] flex items-center justify-center shadow-sm">
                  <Bot size={18} />
                </div>
                <div className="glass-panel border-[#374151] shadow-sm rounded-[20px] rounded-tl-none px-6 py-4 flex items-center gap-2 max-w-[100px]">
                  <div className="w-2 h-2 bg-[#60A5FA] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#60A5FA] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-[#60A5FA] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-8 pt-0 pb-6 md:pb-10">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              {selectedImage && (
                <div className="mb-4 relative inline-block">
                  <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-[16px] border border-[#374151] shadow-lg" />
                  <button 
                    onClick={() => {
                      setSelectedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -top-3 -right-3 bg-[#1F2937] text-white rounded-full p-1.5 border border-[#374151] shadow-md hover:text-[#60A5FA] transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="absolute inset-0 bg-[#3B82F6]/5 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative flex items-center gap-2 input-glass rounded-full p-2 pl-4 focus-within:ring-2 focus-within:ring-[#3B82F6]/50 focus-within:border-[#3B82F6]/50 transition-all">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 text-[#9CA3AF] hover:text-[#60A5FA] rounded-full flex items-center justify-center transition-all btn-glow border border-transparent"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Ask anything about Techno NJR as a ${userType}...`}
                  className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-[15px] placeholder:text-[#6B7280] text-[#E5E7EB] w-full"
                />
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  className="w-12 h-12 bg-[#1F2937] text-[#E5E7EB] border border-[#374151] rounded-full flex items-center justify-center hover:bg-[#3B82F6] hover:text-white disabled:opacity-40 disabled:hover:bg-[#1F2937] disabled:hover:text-[#E5E7EB] disabled:hover:border-[#374151] disabled:border-transparent transition-all shadow-md shrink-0 btn-glow"
                >
                  <Send size={18} className="ml-1" />
                </button>
              </div>
            </div>
            <p className="text-xs text-center mt-6 text-[#6B7280] font-medium tracking-wide">
              CampusGuide AI can make mistakes. Check official sources for critical info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

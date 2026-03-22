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
  MessageSquare,
  Paperclip,
  X,
  Moon,
  Sun
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Apply dark mode to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
    
    // Optimistic UI update
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

  return (
    <div className="flex h-screen bg-surface text-text-main font-sans selection:bg-accent/20 selection:text-primary transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-black/5 dark:border-white/5 flex flex-col hidden md:flex shadow-md z-10 transition-colors duration-300">
        <div className="p-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-primary rounded-2xl flex items-center justify-center text-surface shadow-lg shadow-primary/20">
              <School size={20} />
            </div>
            <h1 className="font-semibold text-lg tracking-tight text-text-main">CampusGuide AI</h1>
          </div>
          <p className="text-xs text-text-main/70 font-medium uppercase tracking-wider">Techno NJR Assistant</p>
        </div>

        <nav className="flex-1 p-4 space-y-6">
          <div>
            <label className="text-[10px] font-bold text-text-main/50 uppercase tracking-widest mb-3 block px-2">I am a...</label>
            <div className="space-y-1">
              {(["fresher", "student", "visitor"] as UserType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setUserType(type)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 text-sm font-medium btn-glow",
                    userType === type 
                      ? "bg-primary/10 text-primary ring-1 ring-primary/30 shadow-sm" 
                      : "text-text-main/80 hover:bg-text-main/5"
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
            <label className="text-[10px] font-bold text-text-main/50 uppercase tracking-widest mb-3 block px-2">Quick Access</label>
            <div className="space-y-1">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s.text)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs text-text-main/70 hover:bg-text-main/5 hover:text-text-main transition-colors group btn-glow"
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

        <div className="p-4 mt-auto border-t border-black/5 dark:border-white/5 space-y-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl bg-text-main/5 hover:bg-text-main/10 transition-colors text-sm font-medium text-text-main border border-text-main/10 shadow-sm btn-glow"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
              <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
            </div>
            <div className={cn(
              "w-8 h-4 rounded-full relative transition-colors",
              isDarkMode ? "bg-primary btn-glow" : "bg-text-main/20"
            )}>
              <div className={cn(
                "absolute top-0.5 w-3 h-3 rounded-full bg-surface transition-all shadow-sm",
                isDarkMode ? "left-4.5" : "left-0.5"
              )} />
            </div>
          </button>
          <div className="glass-panel border border-black/5 dark:border-white/5 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-2xl bg-text-main/5 flex items-center justify-center text-text-main/80 border border-black/5 dark:border-white/5">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-main truncate">Guest User</p>
              <p className="text-[10px] text-text-main/60 truncate capitalize">{userType} Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-transparent">
        {/* Header (Mobile) */}
        <header className="md:hidden p-4 glass-panel border-b border-black/5 dark:border-white/5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-2xl flex items-center justify-center text-surface shadow-md">
              <School size={18} />
            </div>
            <span className="font-semibold text-text-main">CampusGuide</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-text-main/80 hover:text-primary btn-glow rounded-2xl p-1"
            >
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <select 
              value={userType} 
              onChange={(e) => setUserType(e.target.value as UserType)}
              className="text-xs bg-text-main/5 border border-text-main/10 rounded-2xl px-2 py-1 outline-none text-text-main cursor-pointer glass-panel"
            >
              <option value="fresher">Fresher</option>
              <option value="student">Student</option>
              <option value="visitor">Visitor</option>
            </select>
          </div>
        </header>

        {/* Floating Bubble Header (Desktop) */}
        <div className="hidden md:flex justify-center pt-6 absolute top-0 w-full z-10 pointer-events-none">
          <div className="glass-panel border border-black/5 dark:border-white/5 shadow-md rounded-2xl px-6 py-2 pointer-events-auto">
             <p className="text-xs font-medium text-text-main/80 flex items-center gap-2">
               <Bot size={14} className="text-accent" />
               Connected to <span className="font-bold text-text-main">Campus Brain</span>
             </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:pt-24 scroll-smooth">
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
                    "w-8 h-8 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm",
                    msg.role === "user" ? "bg-primary text-surface" : "glass-panel text-primary border border-black/5 dark:border-white/5"
                  )}>
                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-primary text-surface rounded-tr-none shadow-sm" 
                      : "glass-panel border border-black/5 dark:border-white/5 shadow-sm rounded-tl-none text-text-main"
                  )}>
                    <div className="markdown-body prose prose-sm dark:prose-invert max-w-none">
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
                <div className="w-8 h-8 rounded-2xl glass-panel border border-black/5 dark:border-white/5 text-primary flex items-center justify-center shadow-sm">
                  <Bot size={16} />
                </div>
                <div className="glass-panel border border-black/5 dark:border-white/5 shadow-sm rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-text-main/40 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-text-main/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-text-main/40 rounded-full animate-bounce [animation-delay:0.4s]" />
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
              {selectedImage && (
                <div className="mb-2 relative inline-block">
                  <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-black/10 shadow-sm" />
                  <button 
                    onClick={() => {
                      setSelectedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <div className="absolute inset-0 bg-accent/5 blur-2xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative flex items-center gap-2 glass-panel border border-black/10 dark:border-white/10 rounded-2xl p-2 shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 text-text-main/60 hover:bg-text-main/10 hover:text-primary rounded-2xl flex items-center justify-center transition-all btn-glow"
                >
                  <Paperclip size={18} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Ask anything about Techno NJR as a ${userType}...`}
                  className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-sm placeholder:text-text-main/50 text-text-main w-full"
                />
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  className="w-10 h-10 bg-primary text-surface rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-primary/40 disabled:opacity-50 transition-all shadow-md shrink-0 btn-glow"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-center mt-4 text-text-main/50 font-medium uppercase tracking-widest">
              CampusGuide AI can make mistakes. Check official sources for critical info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

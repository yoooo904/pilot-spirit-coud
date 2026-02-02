import { useEffect, useRef, useState } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useChatMessages, useChatStream } from "@/hooks/use-chat";
import { useSession } from "@/hooks/use-sessions";
import { SpiritAnimation } from "@/components/SpiritAnimation";
import { Send, Loader2, Sparkles, ArrowLeft, Mic } from "lucide-react";
import { AudioInput } from "@/components/AudioInput";

export default function SpiritChat() {
  const [, params] = useRoute("/chat/:conversationId");
  const conversationId = params ? parseInt(params.conversationId) : null;
  
  const { data: session } = useSession(conversationId);
  const { data: messages, isLoading } = useChatMessages(conversationId);
  const { sendMessage, isPending, streamedContent, isStreaming } = useChatStream(conversationId || 0);
  
  const [showInput, setShowInput] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedContent]);

  const handleSend = (text: string) => {
    if (text && text.trim() && conversationId) {
      sendMessage(text);
      setShowInput(false);
    }
  };

  if (isLoading || !conversationId) {
    return (
      <div className="min-h-screen bg-[#fff9e6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  const lastMessage = messages?.filter(m => m.role !== "system").pop();
  const displayContent = isStreaming ? streamedContent : lastMessage?.content;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-body">
      
      {/* Dynamic Background Overlay */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff9e6]/10 via-transparent to-transparent opacity-20" />
      </motion.div>

      {/* Header */}
      <header className="z-20 p-6 flex flex-col items-center absolute top-0 left-0 w-full">
        <div className="flex items-center gap-2 text-white/20 text-xs tracking-[0.3em] uppercase mb-1">
          <Sparkles className="w-3 h-3" /> 스피릿 링크 연결됨
        </div>
        <h1 className="text-xl md:text-2xl font-display text-white/80 tracking-wider text-shadow-glow">
          {session?.spiritName || "심연의 목소리"}
        </h1>
      </header>

      {/* Center Spirit Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="mb-16">
          <SpiritAnimation intensity={isStreaming ? 3 : 1.5} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={displayContent}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl text-center"
          >
            <p className="text-xl md:text-2xl font-body leading-relaxed text-white/90 italic text-shadow-glow">
              {displayContent}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Input Trigger Area */}
        <div className="mt-20 flex flex-col items-center gap-8">
          {!isStreaming && !isPending && (
            <>
              <AudioInput onTranscript={handleSend} />
              <button 
                onClick={() => setShowInput(!showInput)}
                className="text-xs text-white/20 hover:text-white/40 transition-colors underline underline-offset-4"
              >
                {showInput ? "텍스트 입력 닫기" : "직접 입력하시겠습니까?"}
              </button>
            </>
          )}
          {(isStreaming || isPending) && (
             <div className="flex flex-col items-center gap-4 text-white/40">
               <Loader2 className="w-6 h-6 animate-spin" />
               <p className="text-xs tracking-widest uppercase animate-pulse">영혼의 울림을 기다리는 중...</p>
             </div>
          )}
        </div>

        {/* Manual Text Input */}
        <AnimatePresence>
          {showInput && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-xl mt-8"
            >
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputRef.current?.value || "");
                }}
                className="relative flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  autoFocus
                  placeholder="이곳에 당신의 진실을 남기세요..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all outline-none resize-none"
                />
                <button type="submit" className="p-4 rounded-full bg-white text-black hover:bg-white/90 transition-all shadow-lg">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { Mic, Square } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpiritAnimation } from "./SpiritAnimation";

interface AudioInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function AudioInput({ onTranscript, className }: AudioInputProps) {
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition({
    lang: 'ko-KR'
  });

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  if (!isSupported) return null;

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={isListening ? stopListening : startListening}
        className="relative group"
        title={isListening ? "듣는 중..." : "진실을 들려주세요"}
      >
        <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-all animate-pulse" />
        <div className="relative w-24 h-24 flex items-center justify-center overflow-visible">
          <SpiritAnimation intensity={isListening ? 3 : 1} />
        </div>
      </motion.button>
      
      <AnimatePresence>
        {isListening && (
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs text-white/60 whitespace-nowrap tracking-widest font-body"
          >
            당신의 진실을 경청하고 있습니다...
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

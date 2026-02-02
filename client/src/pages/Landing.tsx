import { motion } from "framer-motion";
import { SpiritAnimation } from "@/components/SpiritAnimation";
import { useCreateSession } from "@/hooks/use-sessions";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const createSession = useCreateSession();

  const handleStart = async () => {
    try {
      const session = await createSession.mutateAsync();
      setLocation(`/session/${session.id}`);
    } catch (error) {
      console.error(error);
      // In a real app, show toast error
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0)_70%)]" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="z-10 flex flex-col items-center gap-12 max-w-lg w-full text-center"
      >
        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-display text-white tracking-widest text-shadow-glow"
        >
          SPIRIT CLOUD
        </motion.h1>

        {/* Animation */}
        <div className="my-8">
          <SpiritAnimation />
        </div>

        {/* Subtitle/Prompt */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.5 }}
          className="text-muted-foreground font-body text-xl"
        >
          당신의 진실을 가만히 들려주세요.<br />그 울림이 다시 말을 걸어올 때까지.
        </motion.p>

        {/* Start (Automatic trigger or subtle link) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="mt-8"
        >
          <button
            onClick={handleStart}
            disabled={createSession.isPending}
            className="text-white/20 hover:text-white/60 transition-all font-body tracking-[0.2em] text-sm flex flex-col items-center gap-4 group"
          >
            {createSession.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="w-px h-12 bg-white/10 group-hover:bg-white/30 transition-all" />
                나직이 시작하기
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

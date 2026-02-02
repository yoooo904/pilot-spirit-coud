import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, useUpdateSession, useGenerateSpirit } from "@/hooks/use-sessions";
import { AudioInput } from "@/components/AudioInput";
import { SpiritAnimation } from "@/components/SpiritAnimation";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

const QUESTIONS = [
  {
    id: "question1",
    text: "아무리 멀리 떠나온 것 같아도, 문득 뒤돌아보면 늘 그 자리를 맴돌게 만드는 당신의 '미련'이나 '포기할 수 없는 무언가'는 무엇인가요?",
    short: "미련"
  },
  {
    id: "question2",
    text: "당신이 지금 가장 간절히 바라는 것은 무엇인가요? 그것을 가졌을 때, 당신의 마음은 비로소 어디에 닿게 될까요?",
    short: "갈망"
  },
  {
    id: "question3",
    text: "사람들에게 조금 과장해서라도 보여주고 싶은 멋진 모습과, 사실은 스스로도 외면하고 싶어 숨겨둔 당신의 진실은 무엇인가요?",
    short: "가면과 진실"
  },
  {
    id: "question4",
    text: "당신이 이 세상에 존재한다는 것이, 당신에게는 어떤 의미가 되나요? 당신에게 이 세상은 어떻게 정의되나요?",
    short: "존재"
  }
];

export default function Questionnaire() {
  const [, params] = useRoute("/session/:id");
  const sessionId = params ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
  
  const { data: session, isLoading } = useSession(sessionId);
  const updateSession = useUpdateSession();
  const generateSpirit = useGenerateSpirit();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [showTextOption, setShowTextOption] = useState(false);

  // Background intensity and visual progress
  const intensity = 1 + step * 0.5;
  const backgroundOpacity = step * 0.15;

  // Sync session data to local state only once or when session changes significantly
  useEffect(() => {
    if (session && Object.keys(answers).length === 0) {
      setAnswers({
        question1: session.question1 || "",
        question2: session.question2 || "",
        question3: session.question3 || "",
        question4: session.question4 || "",
      });
    }
    
    // Independent redirect logic
    if (session?.isComplete && session?.conversationId) {
      setLocation(`/chat/${session.conversationId}`);
    }
  }, [session, setLocation]);

  const currentQuestion = QUESTIONS[step];
  const currentAnswer = answers[currentQuestion.id] || "";

  const handleNext = async () => {
    if (!sessionId) return;
    
    // Save current answer
    await updateSession.mutateAsync({
      id: sessionId,
      data: { [currentQuestion.id]: currentAnswer }
    });

    if (step < QUESTIONS.length - 1) {
      setStep(prev => prev + 1);
      setShowTextOption(false);
    } else {
      // Final step -> Generate Spirit
      await generateSpirit.mutateAsync(sessionId);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
      setShowTextOption(false);
    }
  };

  const isGenerating = generateSpirit.isPending;

  if (isLoading || !session) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white/50">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-body">
      {/* Dynamic Background Landscape */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: backgroundOpacity }}
        transition={{ duration: 2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-20" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/10 to-transparent opacity-30" />
      </motion.div>

      {/* Pulsing Spirit Core - Maintains throughout and evolves */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
        <SpiritAnimation intensity={intensity} />
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-20">
        <motion.div 
          className="h-full bg-white/30"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full z-10 relative">
        
        {/* Generating State Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center"
            >
              <div className="scale-150 mb-12">
                <SpiritAnimation intensity={4} />
              </div>
              <h2 className="text-3xl font-display tracking-widest text-white/90 animate-pulse">
                영혼을 불러내는 중...
              </h2>
              <p className="mt-4 text-white/40 font-body italic">
                당신의 진실을 문장으로 엮고 있습니다
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="w-full flex flex-col gap-12 items-center"
          >
            {/* Question Area */}
            <div className="text-center space-y-6 max-w-2xl">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-display tracking-[0.4em] text-white/20 uppercase"
              >
                깊은 내면의 질문 {step + 1} / {QUESTIONS.length}
              </motion.span>
              <h2 className="text-2xl md:text-3xl font-body leading-relaxed text-white/90 text-shadow-glow">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Voice Input (The Core Interaction) */}
            <div className="flex flex-col items-center gap-8">
              <AudioInput 
                onTranscript={(text) => {
                  setAnswers(prev => {
                    const current = prev[currentQuestion.id] || "";
                    // Only append if not already present at the end
                    if (current.trim().endsWith(text.trim())) return prev;
                    return { 
                      ...prev, 
                      [currentQuestion.id]: current ? `${current} ${text}` : text 
                    };
                  });
                }} 
              />
              <p className="text-sm text-white/40 font-body tracking-wider">
                오브제를 한 번 눌러 시작하고, 다시 눌러 답변을 마쳐주세요
              </p>
            </div>

            {/* Answer Preview & Text Option Toggle */}
            <div className="w-full max-w-xl flex flex-col gap-4">
              {currentAnswer && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg text-center"
                >
                  <p className="text-lg text-white/70 italic leading-relaxed">
                    "{currentAnswer}"
                  </p>
                </motion.div>
              )}

              <button 
                onClick={() => setShowTextOption(!showTextOption)}
                className="text-xs text-white/20 hover:text-white/40 transition-colors underline underline-offset-4"
              >
                {showTextOption ? "텍스트 입력 닫기" : "직접 입력하시겠습니까?"}
              </button>

              <AnimatePresence>
                {showTextOption && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => {
                        setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }));
                      }}
                      placeholder="이곳에 당신의 진실을 남기세요..."
                      className="w-full bg-white/5 border border-white/10 focus:border-white/30 p-4 min-h-[120px] text-lg font-body text-white/80 placeholder:text-white/10 outline-none resize-none transition-all rounded-lg mt-2"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between w-full max-w-2xl mt-16 pb-12">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full font-display text-xs tracking-widest transition-all
              ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-white/30 hover:text-white hover:bg-white/5'}
            `}
          >
            <ArrowLeft className="w-4 h-4" /> 뒤로
          </button>

          <button
            onClick={handleNext}
            disabled={!currentAnswer.trim() || updateSession.isPending}
            className="
              flex items-center gap-3 px-10 py-3 rounded-full 
              bg-white text-black font-display text-xs tracking-widest font-semibold
              hover:bg-white/90 disabled:opacity-20 disabled:cursor-not-allowed
              transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)]
              hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]
            "
          >
            {updateSession.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              step === QUESTIONS.length - 1 ? "영혼 소환" : "다음 질문"
            )}
            {!updateSession.isPending && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

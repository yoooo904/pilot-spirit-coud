import { useState, useEffect, useCallback } from 'react';

// Define types for the Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: (event: any) => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

export function useSpeechRecognition({ lang = 'en-US' }: { lang?: string } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true; 
        recognitionInstance.interimResults = false; 
        recognitionInstance.lang = lang;

        recognitionInstance.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript;
            }
          }
          if (currentTranscript && currentTranscript.trim()) {
            setTranscript(currentTranscript.trim());
          }
        };

        recognitionInstance.onend = () => {
          // Manual control only: isListening is managed by start/stop functions
        };

        setRecognition(recognitionInstance);
      } else {
        setError("Browser does not support Speech Recognition");
      }
    }
  }, [lang]); // lang 변경 시 초기화

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript(''); // 시작 시 기존 텍스트 초기화
      setError(null);
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    isSupported: !!recognition
  };
}

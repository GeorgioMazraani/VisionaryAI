import { useState, useEffect, useCallback } from 'react';

// Interface for browser speech recognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Get the appropriate speech recognition constructor
const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Initialize recognition instance
  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      setError(new Error('Speech recognition is not supported in this browser'));
      return;
    }

    const recognitionInstance = new SpeechRecognitionAPI() as SpeechRecognition;
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          // For interim results
          setTranscript(transcript);
        }
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        // Ignore "no speech" errors as they're common
        return;
      }
      setError(new Error(`Speech recognition error: ${event.error}`));
    };

    recognitionInstance.onend = () => {
      // Only set isListening to false if we're not in a restart scenario
      if (isListening) {
        // Restart recognition if it ends unexpectedly
        recognitionInstance.start();
      }
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    
    if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        // Handle the case where it's already started
        if (err instanceof Error && err.message.includes('already started')) {
          // It's already running, that's fine
        } else {
          setError(err instanceof Error ? err : new Error('Failed to start speech recognition'));
        }
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    error
  };
};
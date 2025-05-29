import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAppearanceStore } from '../store/appearanceStore';

interface VoiceRecognitionProps {
  isActive: boolean;
  onTranscription: (text: string) => void;
}

export const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
  isActive,
  onTranscription
}) => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const { theme } = useAppearanceStore();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const { 
    startListening, 
    stopListening, 
    transcript: currentTranscript, 
    isListening: recognitionActive,
    error
  } = useSpeechRecognition();

  useEffect(() => {
    if (isActive && !isListening) {
      startListening();
      setIsListening(true);
    } else if (!isActive && isListening) {
      stopListening();
      setIsListening(false);
      
      // Send final transcript if there's content
      if (transcript.trim()) {
        onTranscription(transcript);
        setTranscript('');
      }
    }
  }, [isActive, isListening, startListening, stopListening]);

  useEffect(() => {
    if (currentTranscript) {
      setTranscript(currentTranscript);
    }
  }, [currentTranscript]);

  // Handle final result
  useEffect(() => {
    const handleFinalTranscript = () => {
      if (!isActive || !transcript.trim()) return;
      
      onTranscription(transcript);
      setTranscript('');
    };

    // Set a "quiet" timeout to detect when the user stops talking
    const quietTimeout = setTimeout(() => {
      if (transcript === currentTranscript && transcript.trim()) {
        handleFinalTranscript();
      }
    }, 1500); // 1.5 second of quiet to consider the phrase complete

    return () => clearTimeout(quietTimeout);
  }, [transcript, currentTranscript, isActive, onTranscription]);

  return (
    <div className={`mt-4 p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
      {error ? (
        <div className="text-red-400 text-sm p-2">
          <p>Error: {error.message}</p>
          <p className="mt-2">
            Speech recognition may not be supported in this browser.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className={`min-h-16 p-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
            {transcript ? (
              <p className={isDark ? 'text-white' : 'text-gray-900'}>{transcript}</p>
            ) : (
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                {isActive 
                  ? "I'm listening... speak now"
                  : "Click the microphone button to start speaking"}
              </p>
            )}
          </div>
          
          {isActive && (
            <div className="absolute right-3 bottom-3 flex">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"
                    style={{ 
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: '0.8s'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
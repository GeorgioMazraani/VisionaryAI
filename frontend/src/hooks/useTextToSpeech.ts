import { useState, useCallback } from 'react';
import { useVoiceStore } from '../store/voiceStore';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { selectedVoice } = useVoiceStore();
  
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setError(new Error('Text-to-speech is not supported in this browser'));
      return;
    }
    
    // Cancel any ongoing speech
    stopSpeaking();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Only set voice if selectedVoice is valid and available in the system
    if (selectedVoice && voices.includes(selectedVoice)) {
      utterance.voice = selectedVoice;
    } else {
      // Fall back to default English female voice if available
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && voice.name.includes('Female')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      // If no preferred voice is found, the browser will use its default voice
    }
    
    // Set properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Set events
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      setError(new Error(`Speech synthesis error: ${event.error}`));
      setIsSpeaking(false);
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  }, [selectedVoice]);
  
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);
  
  return {
    speak,
    stopSpeaking,
    isSpeaking,
    error
  };
};
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

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();

  console.log("🔈 Selected Voice from Store:", selectedVoice);
  console.log("🗣️ Available voices:", voices);

  if (selectedVoice && voices.find(v => v.voiceURI === selectedVoice.voiceURI)) {
    utterance.voice = selectedVoice;
  } else {
    const fallback = voices.find(voice =>
      voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
    );
    if (fallback) {
      utterance.voice = fallback;
      console.log("⚠️ Using fallback voice:", fallback);
    } else {
      console.warn("⚠️ No fallback voice found.");
    }
  }

  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  utterance.onstart = () => setIsSpeaking(true);
  utterance.onend = () => setIsSpeaking(false);
  utterance.onerror = (event) => {
    setError(new Error(`Speech synthesis error: ${event.error}`));
    setIsSpeaking(false);
  };

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
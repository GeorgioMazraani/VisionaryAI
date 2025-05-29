import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VoiceState {
  selectedVoice: SpeechSynthesisVoice | null;
  setVoice: (voice: SpeechSynthesisVoice) => void;
}

export const useVoiceStore = create<VoiceState>()(
  persist(
    (set) => ({
      selectedVoice: null,
      setVoice: (voice) => set({ selectedVoice: voice }),
    }),
    {
      name: 'voice-storage',
    }
  )
);
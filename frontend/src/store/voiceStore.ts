// store/voiceStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VoiceState {
  selectedVoice: SpeechSynthesisVoice | null;
  ttsEnabled: boolean;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  toggleTTS: () => void;
}

export const useVoiceStore = create<VoiceState>()(
  persist(
    (set, get) => ({
      selectedVoice: null,
      ttsEnabled: true,
      setVoice: (voice) => set({ selectedVoice: voice }),
      toggleTTS: () => {
        const current = get().ttsEnabled;
        set({ ttsEnabled: !current });
      },
    }),
    {
      name: 'voice-storage',
    }
  )
);

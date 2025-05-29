import React, { useEffect, useState } from 'react';
import { useVoiceStore } from '../../store/voiceStore';
import { Volume2 } from 'lucide-react';
import { useAppearanceStore } from '../../store/appearanceStore';

export const VoiceSettings: React.FC = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { selectedVoice, setVoice } = useVoiceStore();
  const [previewText] = useState("Hello! This is how I will sound.");
  const [isPlaying, setIsPlaying] = useState(false);
  const { theme } = useAppearanceStore();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const playPreview = (voice: SpeechSynthesisVoice) => {
    window.speechSynthesis.cancel();
    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(previewText);
    utterance.voice = voice;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Voice Settings</h3>
      
      <div className="space-y-4">
        {voices.map((voice) => (
          <div
            key={voice.voiceURI}
            className={`p-4 rounded-lg transition-all cursor-pointer ${
              selectedVoice?.voiceURI === voice.voiceURI
                ? isDark 
                  ? 'bg-blue-600/20 border border-blue-500/30'
                  : 'bg-blue-50 border border-blue-200'
                : isDark
                  ? 'bg-gray-700/50 border border-gray-600/30 hover:bg-gray-600/50'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
            }`}
            onClick={() => setVoice(voice)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{voice.name}</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{voice.lang}</p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playPreview(voice);
                }}
                className={`p-2 rounded-lg transition-all ${
                  isPlaying 
                    ? 'bg-blue-500 text-white' 
                    : isDark
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
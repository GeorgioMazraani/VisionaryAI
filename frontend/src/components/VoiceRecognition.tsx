/* ──────────────────────────────────────────────────────────
   VoiceRecognition.tsx – duplicate-proof ASR, clean toggles
   ------------------------------------------------------------------ */

import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAppearanceStore }   from '../store/appearanceStore';

interface VoiceRecognitionProps {
  isActive: boolean;
  onDraft: (txt: string) => void;   // live running text
  onFinal: (txt: string) => void;   // NEW words only
  initialText: string;              // what’s already in the input box
}

export const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
  isActive,
  onDraft,
  onFinal,
  initialText,
}) => {
  const { startListening, stopListening, transcript, error } =
    useSpeechRecognition();

  /* theme */
  const isDark =
    useAppearanceStore.getState().theme === 'dark' ||
    (useAppearanceStore.getState().theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  /* session state */
  const [listening, setListening]     = useState(false);
  const [finalText, setFinalText]     = useState('');
  const [lastTranscript, setLastTr]   = useState('');
  const timerRef = useRef<number>();

  /* ------------------------------------------------------------ helpers */

  /** difference vs last committed transcript */
  const diffFromLast = () => {
    if (!transcript) return '';
    const cur  = transcript.trim();
    const base = lastTranscript.trim();
    return cur.startsWith(base) ? cur.slice(base.length).trim() : cur;
  };

  /** true if chunk would duplicate words already at the end */
  const wouldRepeat = (chunk: string) => {
    const normChunk = chunk.trim().toLowerCase();
    const normFinal = finalText.trim().toLowerCase();
    return normChunk.length > 0 && normFinal.endsWith(normChunk);
  };

  /* ------------------------------------------------------------ UI draft */
  const fullDraft = `${finalText} ${diffFromLast()}`.trim();

  /* ------------------------------------------------------------ mic life-cycle */

  useEffect(() => {
    if (isActive && !listening) {
      startListening();
      setListening(true);
      setFinalText(initialText.trim());
      setLastTr(initialText.trim());
      clearTimeout(timerRef.current);
    }

    if (!isActive && listening) {
      stopListening();
      setListening(false);
      clearTimeout(timerRef.current);

      const chunk = diffFromLast();
      if (chunk && !wouldRepeat(chunk)) {
        const newFull = `${finalText} ${chunk}`.trim();
        setFinalText(newFull);
        setLastTr(transcript.trim());
        onFinal(chunk);
      }

      /* visual reset */
      setFinalText('');
      setLastTr('');
    }
  }, [isActive, listening, startListening, stopListening, transcript, initialText, onFinal]);

  /* ------------------------------------------------------------ interim + silence */

  useEffect(() => {
    if (!listening) return;

    const chunk = diffFromLast();
    onDraft(`${finalText} ${chunk}`.trim());

    clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (chunk && !wouldRepeat(chunk)) {
        const newFull = `${finalText} ${chunk}`.trim();
        setFinalText(newFull);
        setLastTr(transcript.trim());
        onFinal(chunk);
      }
    }, 1500);
  }, [transcript, finalText, listening, onDraft, onFinal]);

  /* ------------------------------------------------------------ render */

  return (
    <div className={`mt-4 p-4 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      {error ? (
        <div className="text-red-400 text-sm">
          <p>Error: {error.message}</p>
          <p>Speech recognition may not be supported in this browser.</p>
        </div>
      ) : (
        <div className="relative">
          <div className={`min-h-16 p-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
            {fullDraft || (
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                {isActive ? "I'm listening… speak now" : ''}
              </span>
            )}
          </div>

          {isActive && (
            <div className="absolute right-3 bottom-3 flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.8s' }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

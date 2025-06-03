/* ──────────────────────────────────────────────────────────
   AIAssistant.tsx – camera · voice · chat
   (now resets state between mic sessions)
   ------------------------------------------------------------------ */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Camera, Mic, MessageSquarePlus } from 'lucide-react';

import { WebcamComponent } from './WebcamComponent';
import { VoiceRecognition } from './VoiceRecognition';
import { ChatInterface } from './ChatInterface';
import { Controls } from './Controls';

import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useOpenAI } from '../hooks/useOpenAI';

import { useVoiceStore } from '../store/voiceStore';
import { useChatStore } from '../store/chatStore';
import { Message } from '../types';

/* ────────────────────────────────────────────────────────── */

export const AIAssistant: React.FC = () => {
  /* global stores */
  const { ttsEnabled, toggleTTS } = useVoiceStore();
  const createConversation = useChatStore(s => s.createNewConversation);
  const conversations = useChatStore(s => s.conversations);

  /* UI state */
  const [apiKey] = useState('');  // supply yours
  const [isCameraActive, setCamera] = useState(false);
  const [isMicActive, setMic] = useState(false);
  const [isProcessing, setProc] = useState(false);

  /* chat state */
  const [messages, setMsgs] = useState<Message[]>([]);
  const [imageData, setImage] = useState<string | null>(null);

  /* speech-to-input helpers */
  const [inputValue, setInput] = useState('');
  const [speechBase, setBase] = useState('');
  const [lastFinal, setLastFn] = useState('');

  /* TTS */
  const { speak, stopSpeaking } = useTextToSpeech();

  /* OpenAI (stub) */
  const { sendMessage: callOpenAI } = useOpenAI(apiKey);

  /* auto-kill TTS when disabled */
  useEffect(() => { if (!ttsEnabled) stopSpeaking(); }, [ttsEnabled, stopSpeaking]);

  /* reset guards when mic toggles OFF */
  useEffect(() => {
    if (!isMicActive) {
      setBase('');
      setLastFn('');
    } else {
      setBase(inputValue); // capture current text when mic turns ON
    }
  }, [isMicActive]);          /* eslint-disable-line react-hooks/exhaustive-deps */

  /* append new message */
  const push = (m: Message) => setMsgs(p => [...p, m]);

  /* send message to OpenAI */
  const handleNewMessage = async (text: string, img?: string | null) => {
    const clean = text.trim();
    if (!clean) return;

    push({ role: 'user', content: clean, timestamp: new Date().toISOString(), image: img ?? imageData });
    setProc(true);

    try {
      const reply = await callOpenAI(clean, img ?? imageData);
      if (reply) {
        push({ role: 'assistant', content: reply, timestamp: new Date().toISOString() });
        if (ttsEnabled) { stopSpeaking(); speak(reply); }
      }
    } finally {
      setProc(false);
      setImage(null);
      setInput('');
      setBase('');
      setLastFn('');
    }
  };

  /* landing screen */
  if (conversations.length === 0) return <Landing createConversation={createConversation} />;

  /* layout */
  return (
    <div className="flex flex-col md:flex-row gap-8 h-full p-4">
      {/* LEFT */}
      <motion.div className="w-full md:w-1/2 flex flex-col gap-8"
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <WebcamComponent
          isActive={isCameraActive}
          onImageCapture={setImage}
          captureInterval={10_000}
          triggerCapture={isMicActive}
        />
        <Controls
          isCameraActive={isCameraActive}
          isMicActive={isMicActive}
          isTtsEnabled={ttsEnabled}
          isProcessing={isProcessing}
          onToggleCamera={() => setCamera(p => !p)}
          onToggleMic={() => setMic(p => !p)}
          onToggleTts={() => { if (ttsEnabled) stopSpeaking(); toggleTTS(); }}
        />
      </motion.div>

      {/* RIGHT */}
      <motion.div className="w-full md:w-1/2 flex flex-col h-full"
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <ChatInterface inputValue={inputValue} setInputValue={setInput} />

        <VoiceRecognition
          isActive={isMicActive && !isProcessing}
          initialText={inputValue}
          onDraft={setInput}
          onFinal={chunk => {
            const trimmed = chunk.trim();
            if (!trimmed) return;
            if (inputValue.trim().toLowerCase().endsWith(trimmed.toLowerCase())) return; // duplicate guard
            setInput(prev => `${prev.trim()} ${trimmed}`.trim());
          }}
        />
      </motion.div>
    </div>
  );
};


/* ──────────────────────────────────────────────────────────
   Landing helper
   ------------------------------------------------------------------ */
const Landing: React.FC<{ createConversation: () => void }> = ({
  createConversation,
}) => (
  <div className="flex items-center justify-center h-full">
    <motion.div
      className="max-w-2xl w-full p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Brain className="w-16 h-16 mx-auto mb-4 text-blue-500" />
        <h1 className="text-3xl font-bold text-white mb-1">
          Welcome to AI Assistant
        </h1>
        <p className="text-gray-400">
          Your intelligent companion for voice&nbsp;and&nbsp;vision interactions
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <FeatureCard icon={Camera} title="Visual Understanding" />
        <FeatureCard icon={Mic} title="Voice Interaction" />
        <FeatureCard icon={MessageSquarePlus} title="Smart Chat" />
      </motion.div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={createConversation}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium
                     hover:bg-blue-700 transition-all hover:shadow-lg
                     hover:shadow-blue-500/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Your First Chat
        </motion.button>
      </motion.div>
    </motion.div>
  </div>
);

/* small info-card used on the landing screen */
const FeatureCard: React.FC<{
  icon: React.ComponentType<{ className: string }>;
  title: string;
}> = ({ icon: Icon, title }) => (
  <div className="p-4 rounded-xl bg-gray-700/30 border border-gray-600/30">
    <Icon className="w-8 h-8 text-blue-400 mb-2" />
    <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-400" />
  </div>
);

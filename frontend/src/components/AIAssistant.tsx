/* ──────────────────────────────────────────────────────────
   AIAssistant.tsx  – one-stop container for camera, voice & chat
   ------------------------------------------------------------------ */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Camera,
  Mic,
  MessageSquarePlus
} from 'lucide-react';

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
  /* ------------------------------------------------------------------
       Global stores
  ------------------------------------------------------------------ */
  const { ttsEnabled, toggleTTS } = useVoiceStore();
  const createConversation = useChatStore(s => s.createNewConversation);
  const conversations = useChatStore(s => s.conversations);

  /* ------------------------------------------------------------------
       Local UI state
  ------------------------------------------------------------------ */
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [imageData, setImageData] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  /* ------------------------------------------------------------------
       Speech synthesis
  ------------------------------------------------------------------ */
  const { speak, stopSpeaking, isSpeaking } = useTextToSpeech();

  /* ------------------------------------------------------------------
       OpenAI chat
  ------------------------------------------------------------------ */
  const { sendMessage: callOpenAI, isLoading } = useOpenAI(apiKey);

  /* Speak the very first assistant message (welcome) */
  useEffect(() => {
    if (
      ttsEnabled &&
      messages.length === 1 &&
      messages[0].role === 'assistant'
    ) {
      speak(messages[0].content);
    }
  }, [messages, ttsEnabled, speak]);

  /* Instantly stop audio when user disables TTS */
  useEffect(() => {
    if (!ttsEnabled) stopSpeaking();
  }, [ttsEnabled, stopSpeaking]);

  /* ------------------------------------------------------------------
       Helpers
  ------------------------------------------------------------------ */
  const appendMessage = (msg: Message) =>
    setMessages(prev => [...prev, msg]);

  const handleNewMessage = async (
    text: string,
    uploadedImg: string | null = null
  ) => {
    /* user → UI */
    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      image: uploadedImg || imageData
    };
    appendMessage(userMsg);

    /* call backend */
    setIsProcessing(true);
    try {
      const reply = await callOpenAI(text, uploadedImg || imageData);
      if (reply) {
        const aiMsg: Message = {
          role: 'assistant',
          content: reply,
          timestamp: new Date().toISOString()
        };
        appendMessage(aiMsg);

        if (ttsEnabled) {
          stopSpeaking();       // interrupt any prior speech
          speak(reply);
        }
      }
    } catch (err) {
      console.error('AI error:', err);
      appendMessage({
        role: 'assistant',
        content: '⚠️ Sorry, something went wrong.',
        timestamp: new Date().toISOString(),
        isError: true
      });
    } finally {
      setIsProcessing(false);
      setImageData(null);
    }
  };

  /* ------------------------------------------------------------------
       Control toggles
  ------------------------------------------------------------------ */
  const toggleCamera = () => {
    setIsCameraActive(prev => !prev);
    if (isCameraActive) setImageData(null); // turning OFF
  };

  const toggleMic = () => setIsMicActive(prev => !prev);

  const handleToggleTts = () => {
    /* if turning OFF → cut speech immediately */
    if (ttsEnabled) stopSpeaking();
    toggleTTS();
  };

  const clearChat = () => {
    stopSpeaking();
    setMessages([
      {
        role: 'assistant',
        content: 'Chat history cleared. How can I help you?',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  /* ------------------------------------------------------------------
       Landing page (no conversations yet)
  ------------------------------------------------------------------ */
  if (conversations.length === 0) {
    return (
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
              Your intelligent companion for voice&nbsp;and&nbsp;vision
              interactions
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
            <FeatureCard
              icon={MessageSquarePlus}
              title="Smart Chat"
            />
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
  }

  /* ------------------------------------------------------------------
       Main assistant layout
  ------------------------------------------------------------------ */
  return (
    <div className="flex flex-col md:flex-row gap-8 h-full p-4">
      {/* LEFT  ─────────────────────────────────────────────── */}
      <motion.div
        className="w-full md:w-1/2 flex flex-col gap-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <WebcamComponent
          isActive={isCameraActive}
          onImageCapture={setImageData}
          captureInterval={10_000}
          triggerCapture={isMicActive}
        />

        <Controls
          isCameraActive={isCameraActive}
          isMicActive={isMicActive}
          isTtsEnabled={ttsEnabled}
          isProcessing={isProcessing || isLoading}
          onToggleCamera={toggleCamera}
          onToggleMic={toggleMic}
          onToggleTts={handleToggleTts}
        />
      </motion.div>

      {/* RIGHT ─────────────────────────────────────────────── */}
      <motion.div
        className="w-full md:w-1/2 flex flex-col h-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <ChatInterface
          messages={messages}
          isSpeaking={isSpeaking}
          currentImage={imageData}
          onSendMessage={handleNewMessage}
          inputValue={inputValue}
          setInputValue={setInputValue}
        />



        <VoiceRecognition
          isActive={isMicActive && !isProcessing}
          onDraft={setInputValue}                // ✅ live update input field
          onFinal={(text) => setInputValue(text)} // ✅ final transcript fills box, no auto-send
        />



      </motion.div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   Small helper for landing-page icons
------------------------------------------------------------------ */
interface CardProps {
  icon: React.ComponentType<{ className: string }>;
  title: string;
}
const FeatureCard: React.FC<CardProps> = ({ icon: Icon, title }) => (
  <div className="p-4 rounded-xl bg-gray-700/30 border border-gray-600/30">
    <Icon className="w-8 h-8 text-blue-400 mb-2" />
    <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-400">
      {/* lorem-lite description just to fill space */}
    </p>
  </div>
);

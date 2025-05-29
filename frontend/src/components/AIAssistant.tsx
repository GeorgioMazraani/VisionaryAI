import React, { useState, useEffect } from 'react';
import { WebcamComponent } from './WebcamComponent';
import { VoiceRecognition } from './VoiceRecognition';
import { ChatInterface } from './ChatInterface';
import { Controls } from './Controls';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useOpenAI } from '../hooks/useOpenAI';
import { Message } from '../types';
import { motion } from 'framer-motion';
import { MessageSquarePlus, Brain, Camera, Mic } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export const AIAssistant: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [imageData, setImageData] = useState<string | null>(null);
  const createNewConversation = useChatStore(state => state.createNewConversation);
  const conversations = useChatStore(state => state.conversations);

  const { speak, stopSpeaking, isSpeaking } = useTextToSpeech();
  const { sendMessage, isLoading } = useOpenAI(apiKey);

  useEffect(() => {
    if (isTtsEnabled && messages.length === 1 && messages[0].role === 'assistant') {
      speak(messages[0].content);
    }
  }, []);

  const handleNewMessage = async (text: string, uploadedImage: string | null = null) => {
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      image: uploadedImage || imageData
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await sendMessage(text, uploadedImage || imageData);
      
      if (response) {
        const aiMessage: Message = {
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        if (isTtsEnabled) {
          speak(response);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setImageData(null);
    }
  };

  const handleImageCapture = (imageDataUrl: string) => {
    setImageData(imageDataUrl);
  };

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    setIsConfigured(true);
  };

  const toggleCamera = () => {
    setIsCameraActive(prev => !prev);
    if (isCameraActive) {
      setImageData(null);
    }
  };

  const toggleMic = () => {
    setIsMicActive(prev => !prev);
  };

  const toggleTts = () => {
    setIsTtsEnabled(prev => !prev);
    if (isSpeaking) {
      stopSpeaking();
    }
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

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div 
          className="max-w-2xl w-full p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Brain className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to AI Assistant</h1>
            <p className="text-gray-400">Your intelligent companion for voice and vision interactions</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-4 rounded-xl bg-gray-700/30 border border-gray-600/30">
              <Camera className="w-8 h-8 text-blue-400 mb-2" />
              <h3 className="text-lg font-semibold text-white mb-1">Visual Understanding</h3>
              <p className="text-sm text-gray-400">Interact with images and get intelligent visual responses</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-700/30 border border-gray-600/30">
              <Mic className="w-8 h-8 text-blue-400 mb-2" />
              <h3 className="text-lg font-semibold text-white mb-1">Voice Interaction</h3>
              <p className="text-sm text-gray-400">Natural conversations with voice input and output</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-700/30 border border-gray-600/30">
              <MessageSquarePlus className="w-8 h-8 text-blue-400 mb-2" />
              <h3 className="text-lg font-semibold text-white mb-1">Smart Chat</h3>
              <p className="text-sm text-gray-400">Contextual responses and intelligent conversations</p>
            </div>
          </motion.div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={createNewConversation}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/20"
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

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full p-4">
      <motion.div 
        className="w-full md:w-1/2 flex flex-col gap-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <WebcamComponent 
          isActive={isCameraActive}
          onImageCapture={handleImageCapture}
          captureInterval={10000}
          triggerCapture={isMicActive}
        />
        
        <Controls 
          isCameraActive={isCameraActive}
          isMicActive={isMicActive}
          isTtsEnabled={isTtsEnabled}
          isConfigured={isConfigured}
          isProcessing={isProcessing || isLoading}
          onToggleCamera={toggleCamera}
          onToggleMic={toggleMic}
          onToggleTts={toggleTts}
          onClearChat={clearChat}
          onApiKeySubmit={handleApiKeySubmit}
        />
      </motion.div>
      
      <motion.div 
        className="w-full md:w-1/2 flex flex-col h-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <ChatInterface 
          messages={messages} 
          isSpeaking={isSpeaking}
          currentImage={imageData}
          onSendMessage={handleNewMessage}
        />
        
        <VoiceRecognition 
          isActive={isMicActive && !isProcessing}
          onTranscription={handleNewMessage}
        />
      </motion.div>
    </div>
  );
};
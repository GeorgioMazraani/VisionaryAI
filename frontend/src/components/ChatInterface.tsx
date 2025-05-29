import React, { useRef, useEffect, useState, FormEvent } from 'react';
import { Message } from '../types';
import { ImageUpload } from './ImageUpload';
import { useAppearanceStore } from '../store/appearanceStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  messages: Message[];
  isSpeaking: boolean;
  currentImage: string | null;
  onSendMessage: (text: string, image?: string | null) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isSpeaking,
  currentImage,
  onSendMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { fontSize, messageDensity, theme } = useAppearanceStore();
  
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputText.trim() || uploadedImage) {
      onSendMessage(inputText.trim(), uploadedImage);
      setInputText('');
      setUploadedImage(null);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col animate-fadeIn">
      <motion.div 
        className={`flex-1 overflow-y-auto p-4 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} rounded-xl`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`space-y-${messageDensity === 'compact' ? '2' : messageDensity === 'spacious' ? '6' : '4'}`}>
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div 
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: index * 0.1 
                }}
              >
                <motion.div 
                  className={`max-w-[85%] rounded-2xl p-3 transition-all hover:shadow-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : message.isError 
                        ? 'bg-red-600/20 text-red-500 rounded-tl-none' 
                        : isDark
                          ? 'bg-gray-700 text-white rounded-tl-none'
                          : 'bg-gray-100 text-gray-900 rounded-tl-none'
                  } ${isSpeaking && index === messages.length - 1 && message.role === 'assistant' ? 'border-2 border-blue-400 animate-pulse' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className={`space-y-2 ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
                    {message.role === 'user' && message.image && (
                      <motion.div 
                        className="mb-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <img 
                          src={message.image} 
                          alt="Uploaded" 
                          className="rounded-lg max-h-40 w-auto" 
                        />
                      </motion.div>
                    )}
                    <p>{message.content}</p>
                    <div className={`text-right text-xs ${message.role === 'user' ? 'opacity-70' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {isSpeaking && index === messages.length - 1 && message.role === 'assistant' && (
                        <motion.span 
                          className="ml-2"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          🔊
                        </motion.span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {currentImage && (
            <motion.div 
              className="flex justify-end"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <div className={`${isDark ? 'bg-blue-600/20' : 'bg-blue-100'} rounded-2xl p-3 max-w-[85%]`}>
                <img 
                  src={currentImage} 
                  alt="Current capture" 
                  className="rounded-lg max-h-40 w-auto" 
                />
                <p className={`text-sm text-center mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Current camera view
                </p>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </motion.div>

      <motion.form 
        onSubmit={handleSubmit} 
        className={`mt-4 p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <div className="flex flex-col gap-3">
          <ImageUpload
            onImageSelect={(dataUrl) => setUploadedImage(dataUrl)}
            selectedImage={uploadedImage}
            onClear={() => setUploadedImage(null)}
          />
          
          <div className="flex gap-2">
            <motion.input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className={`flex-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:shadow-lg ${
                fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'
              }`}
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            />
            <motion.button
              type="submit"
              disabled={!inputText.trim() && !uploadedImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Send
            </motion.button>
          </div>
        </div>
      </motion.form>
    </div>
  );
};
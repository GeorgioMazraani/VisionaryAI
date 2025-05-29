import React, { useState } from 'react';
import { Camera, Mic, Volume2, Settings, Trash2 } from 'lucide-react';
import { ApiKeyModal } from './ApiKeyModal';
import { motion } from 'framer-motion';

interface ControlsProps {
  isCameraActive: boolean;
  isMicActive: boolean;
  isTtsEnabled: boolean;
  isConfigured: boolean;
  isProcessing: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onToggleTts: () => void;
  onClearChat: () => void;
  onApiKeySubmit: (apiKey: string) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isCameraActive,
  isMicActive,
  isTtsEnabled,
  isConfigured,
  isProcessing,
  onToggleCamera,
  onToggleMic,
  onToggleTts,
  onClearChat,
  onApiKeySubmit
}) => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(!isConfigured);

  const handleApiKeySubmit = (apiKey: string) => {
    onApiKeySubmit(apiKey);
    setIsApiKeyModalOpen(false);
  };

  const controls = [
    {
      icon: Camera,
      label: 'Camera',
      active: isCameraActive,
      onClick: onToggleCamera,
      disabled: isProcessing
    },
    {
      icon: Mic,
      label: 'Microphone',
      active: isMicActive,
      onClick: onToggleMic,
      disabled: isProcessing || !isConfigured
    },
    {
      icon: Volume2,
      label: 'Voice',
      active: isTtsEnabled,
      onClick: onToggleTts,
      disabled: isProcessing || !isConfigured
    },
    {
      icon: Settings,
      label: 'API Key',
      onClick: () => setIsApiKeyModalOpen(true),
      disabled: false
    },
    {
      icon: Trash2,
      label: 'Clear',
      onClick: onClearChat,
      disabled: isProcessing || !isConfigured
    }
  ];

  return (
    <>
      <motion.div 
        className="flex flex-wrap items-center justify-center gap-3 p-4 bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {controls.map((control, index) => (
          <motion.button
            key={control.label}
            onClick={control.onClick}
            disabled={control.disabled}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
              control.active 
                ? 'bg-blue-600 text-white shadow-glow' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px]`}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 17,
              delay: index * 0.1 
            }}
          >
            <control.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{control.label}</span>
          </motion.button>
        ))}

        {isProcessing && (
          <motion.div 
            className="ml-2 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
            <span className="text-sm text-gray-300">Processing...</span>
          </motion.div>
        )}
      </motion.div>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => isConfigured && setIsApiKeyModalOpen(false)}
        onSubmit={handleApiKeySubmit}
      />
    </>
  );
};
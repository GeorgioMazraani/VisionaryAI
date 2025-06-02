import React from 'react';
import { Camera, Mic, Volume2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ControlsProps {
  /* status flags */
  isCameraActive: boolean;
  isMicActive:    boolean;
  isTtsEnabled:   boolean;
  isProcessing:   boolean;

  /* callbacks */
  onToggleCamera: () => void;
  onToggleMic:    () => void;
  onToggleTts:    () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isCameraActive,
  isMicActive,
  isTtsEnabled,
  isProcessing,
  onToggleCamera,
  onToggleMic,
  onToggleTts,
}) => {
  /* button definitions */
  const controls = [
    {
      icon: Camera,
      label: 'Camera',
      active: isCameraActive,
      onClick: onToggleCamera,
      disabled: isProcessing,
    },
    {
      icon: Mic,
      label: 'Microphone',
      active: isMicActive,
      onClick: onToggleMic,
      disabled: isProcessing,
    },
    {
      icon: Volume2,
      label: 'Voice',
      active: isTtsEnabled,
      onClick: onToggleTts,
      disabled: isProcessing,
    }
  ];

  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-3 p-4
                 bg-gray-800/70 backdrop-blur-sm rounded-xl
                 border border-gray-700/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {controls.map((ctl, idx) => (
        <motion.button
          key={ctl.label}
          onClick={ctl.onClick}
          disabled={ctl.disabled}
          className={`flex flex-col items-center justify-center p-3 rounded-xl
                      transition-all min-w-[70px]
            ${ctl.active
              ? 'bg-blue-600 text-white shadow-glow'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'}
            disabled:opacity-50 disabled:cursor-not-allowed`}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17, delay: idx * 0.1 }}
        >
          <ctl.icon className="w-5 h-5 mb-1" />
          <span className="text-xs">{ctl.label}</span>
        </motion.button>
      ))}

      {/* spinner while processing */}
      {isProcessing && (
        <motion.div
          className="ml-2 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-4 h-4 rounded-full border-2 border-blue-500
                          border-t-transparent animate-spin" />
          <span className="text-sm text-gray-300">Processing…</span>
        </motion.div>
      )}
    </motion.div>
  );
};

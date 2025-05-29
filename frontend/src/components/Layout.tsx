import React, { useState } from 'react';
import { Menu, Plus, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useChatStore } from '../store/chatStore';
import { ConversationList } from './Chat/ConversationList';
import { UserProfile } from './User/UserProfile';
import { Settings } from './Settings/Settings';
import { useAppearanceStore } from '../store/appearanceStore';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showSettings, setShowSettings] = useState(false);
  const createNewConversation = useChatStore(state => state.createNewConversation);
  const theme = useAppearanceStore(state => state.theme);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className={`flex h-screen ${isDark ? 'bg-[#0f172a]' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <motion.div 
        className={`hidden md:flex w-[260px] ${isDark ? 'bg-[#1e293b]' : 'bg-white'} flex-col border-r ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}
        initial={{ x: -260, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* New Chat Button */}
        <div className="p-4">
          <motion.button
            onClick={createNewConversation}
            className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all hover:shadow-lg"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            New Chat
          </motion.button>
        </div>

        {/* Conversations List */}
        <div className={`flex-1 overflow-y-auto border-y ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
          <ConversationList />
        </div>

        {/* User Profile Section */}
        <UserProfile onSettingsClick={() => setShowSettings(true)} />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className={`flex-1 overflow-hidden relative ${
          isDark 
            ? 'bg-gradient-to-b from-[#0f172a] to-[#1e293b]' 
            : 'bg-gradient-to-b from-gray-100 to-white'
        }`}>
          <motion.div 
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};
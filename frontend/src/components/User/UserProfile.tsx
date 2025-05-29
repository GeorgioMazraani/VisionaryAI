import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { useAppearanceStore } from '../../store/appearanceStore';

interface UserProfileProps {
  onSettingsClick: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onSettingsClick }) => {
  const { signOut } = useAuth();
  const user = useAuthStore(state => state.user);
  const { theme } = useAppearanceStore();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (!user) return null;

  // Get username part of email (before @)
  const username = user.email.split('@')[0];
  const domain = user.email.split('@')[1];

  return (
    <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white font-medium">
            {username[0].toUpperCase()}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
            {username}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>
            @{domain}
          </p>
        </div>

        <button
          onClick={onSettingsClick}
          className={`p-2 ${
            isDark 
              ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          } rounded-lg transition-colors`}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          onClick={signOut}
          className={`p-2 ${
            isDark 
              ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          } rounded-lg transition-colors`}
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
import React from 'react';
import { useAppearanceStore } from '../../store/appearanceStore';

export const AppearanceSettings: React.FC = () => {
  const { theme, fontSize, messageDensity, setTheme, setFontSize, setMessageDensity } = useAppearanceStore();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Appearance Settings</h3>
      
      <div className="space-y-4">
        <div className="animate-slideUp" style={{ animationDelay: '100ms' }}>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Theme
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className={`w-full px-4 py-2 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:border-blue-500/50`}
          >
            <option value="system">System Default</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div className="animate-slideUp" style={{ animationDelay: '200ms' }}>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Font Size
          </label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as any)}
            className={`w-full px-4 py-2 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:border-blue-500/50`}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="animate-slideUp" style={{ animationDelay: '300ms' }}>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Message Density
          </label>
          <select
            value={messageDensity}
            onChange={(e) => setMessageDensity(e.target.value as any)}
            className={`w-full px-4 py-2 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:border-blue-500/50`}
          >
            <option value="compact">Compact</option>
            <option value="comfortable">Comfortable</option>
            <option value="spacious">Spacious</option>
          </select>
        </div>

        <div className="pt-4 animate-slideUp" style={{ animationDelay: '400ms' }}>
          <div className={`p-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-lg`}>
            <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Preview</h4>
            <div className={`
              rounded-lg p-4 ${isDark ? 'bg-gray-800/50' : 'bg-white'}
              ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'}
              ${messageDensity === 'compact' ? 'space-y-2' : messageDensity === 'spacious' ? 'space-y-6' : 'space-y-4'}
            `}>
              <p className={isDark ? 'text-white' : 'text-gray-900'}>This is how your messages will look.</p>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Adjust the settings above to customize the appearance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
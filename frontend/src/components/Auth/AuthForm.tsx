import React, { useState } from 'react';
import { AnimatedBackground } from '../ThreeJS/AnimatedBackground';
import { Github, Mail, ArrowRight, Sparkles, Moon, Sun, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppearanceStore } from '../../store/appearanceStore';
import { useAuth } from '../../hooks/useAuth';

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, signInWithGoogle, signInWithGithub, loading, error } = useAuth();
  const { theme, setTheme } = useAppearanceStore();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const socialButtons = [
    {
      name: 'Google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
      onClick: signInWithGoogle,
      className: isDark 
        ? 'bg-[#1e293b] hover:bg-[#334155]'
        : 'bg-white hover:bg-gray-50',
      textClass: isDark ? 'text-white' : 'text-gray-700',
      borderClass: isDark ? 'border-gray-600' : 'border-gray-200',
    },
    {
      name: 'GitHub',
      icon: <Github className="w-5 h-5" />,
      onClick: signInWithGithub,
      className: isDark 
        ? 'bg-[#1e293b] hover:bg-[#334155]'
        : 'bg-white hover:bg-gray-50',
      textClass: isDark ? 'text-white' : 'text-gray-700',
      borderClass: isDark ? 'border-gray-600' : 'border-gray-200',
    },
  ];

  return (
    <div className={`relative min-h-screen flex items-center justify-center ${isDark ? 'bg-[#020c1b]' : 'bg-gray-50'} p-4`}>
      <AnimatedBackground />
      
      <motion.div 
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${
          isDark 
            ? 'from-[#1e293b] to-[#334155]' 
            : 'from-white to-gray-100'
        } rounded-2xl blur-xl opacity-20 animate-pulse`} />
        
        <div className={`relative ${
          isDark 
            ? 'bg-[#0f172a]/50' 
            : 'bg-white/70'
        } backdrop-blur-xl rounded-2xl border ${
          isDark 
            ? 'border-[#1e293b]/30' 
            : 'border-gray-200'
        } overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1e293b]/5 to-[#334155]/5" />
          
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-8">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="w-8 h-8 text-[#60a5fa]" />
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#60a5fa] to-[#93c5fd]">
                  {isLogin ? 'Welcome Back' : 'Join Us'}
                </h2>
              </motion.div>

              <motion.button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>
            </div>

            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {socialButtons.map((button, index) => (
                <motion.button
                  key={button.name}
                  onClick={button.onClick}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-medium transition-all ${button.className} border ${button.borderClass} shadow-sm hover:shadow-md disabled:opacity-50 group`}
                  disabled={loading}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {button.icon}
                  <span className={button.textClass}>Continue with {button.name}</span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${button.textClass} group-hover:translate-x-1`} />
                </motion.button>
              ))}
            </motion.div>

            <motion.div 
              className="relative my-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? 'border-[#1e293b]/30' : 'border-gray-200'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${isDark ? 'bg-[#0f172a]/50 text-gray-400' : 'bg-white text-gray-500'} backdrop-blur-sm`}>
                  or continue with email
                </span>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.form 
                key={isLogin ? 'login' : 'signup'}
                onSubmit={handleSubmit} 
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 ${
                      isDark 
                        ? 'bg-[#1e293b]/50 border-[#334155]/50 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#60a5fa]/50 transition-all duration-300 hover:border-[#60a5fa]/50 placeholder-gray-500`}
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-3 ${
                        isDark 
                          ? 'bg-[#1e293b]/50 border-[#334155]/50 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#60a5fa]/50 transition-all duration-300 hover:border-[#60a5fa]/50 placeholder-gray-500 pr-12`}
                      placeholder="••••••••"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`p-1.5 rounded-lg ${
                          isDark 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        } transition-all`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={showPassword ? 'hide' : 'show'}
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.15 }}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </motion.div>
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    className="rounded-lg bg-red-500/10 border border-red-500/20 p-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 ${
                    isDark
                      ? 'bg-gradient-to-r from-[#1e293b] to-[#334155] text-white hover:shadow-[0_0_30px_rgba(30,41,59,0.5)]'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
                  } rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </motion.button>

                <motion.p 
                  className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-6`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="font-medium text-[#60a5fa] hover:text-[#93c5fd] transition-colors hover:underline focus:outline-none"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </motion.p>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { AIAssistant } from './components/AIAssistant';
import { AuthForm } from './components/Auth/AuthForm';
import { useAuthStore } from './store/authStore';
import { useAppearanceStore } from './store/appearanceStore';
import { connectSocket } from './utils/socket';

function App() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const theme = useAppearanceStore((s) => s.theme);

  useEffect(() => {
    const isDark = theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme]);

  useEffect(() => {
    if (token) {
      console.log("🔌 Connecting socket with token...");
      connectSocket(token);
    }
  }, [token]);

  if (!user) return <AuthForm />;

  return (
    <Layout>
      <AIAssistant />
    </Layout>
  );
}

export default App;

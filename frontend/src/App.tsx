import React from 'react';
import { Layout } from './components/Layout';
import { AIAssistant } from './components/AIAssistant';
import { AuthForm } from './components/Auth/AuthForm';
import { useAuthStore } from './store/authStore';
import { useAppearanceStore } from './store/appearanceStore';

function App() {
  const user = useAuthStore(state => state.user);
  const theme = useAppearanceStore(state => state.theme);

  // Apply theme class to html element
  React.useEffect(() => {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme]);

  if (!user) {
    return <AuthForm />;
  }

  return (
    <Layout>
      <AIAssistant />
    </Layout>
  );
}

export default App;
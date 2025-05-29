import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register, logout } = useAuthStore();

  const handleAuthError = (error: any) => {
    setError(error?.message || 'An error occurred during authentication');
    setLoading(false);
  };

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [login]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await register(email, password);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [register]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate OAuth delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser = {
        id: crypto.randomUUID(),
        email: 'demo@gmail.com'
      };
      await login(mockUser.email, 'password');
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [login]);

  const signInWithGithub = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate OAuth delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser = {
        id: crypto.randomUUID(),
        email: 'demo@github.com'
      };
      await login(mockUser.email, 'password');
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [login]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      logout();
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  return {
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    loading,
    error,
  };
};
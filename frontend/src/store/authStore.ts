import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email: string, password: string) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In a real app, validate against a backend
        const storedUser = localStorage.getItem(`user_${email}`);
        if (!storedUser) {
          throw new Error('User not found');
        }
        
        const user = JSON.parse(storedUser);
        if (user.password !== password) {
          throw new Error('Invalid password');
        }
        
        const { password: _, ...userWithoutPassword } = user;
        set({ user: userWithoutPassword });
      },
      register: async (email: string, password: string) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if user exists
        if (localStorage.getItem(`user_${email}`)) {
          throw new Error('User already exists');
        }
        
        // Create new user
        const newUser = {
          id: crypto.randomUUID(),
          email,
          password
        };
        
        localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
        
        const { password: _, ...userWithoutPassword } = newUser;
        set({ user: userWithoutPassword });
      },
      logout: () => {
        set({ user: null });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
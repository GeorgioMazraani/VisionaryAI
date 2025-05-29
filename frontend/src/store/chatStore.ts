import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message } from '../types';
import { useAuthStore } from './authStore';

interface Conversation {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
}

interface ChatState {
  messages: Message[];
  conversations: Conversation[];
  currentConversationId: string | null;
  addMessage: (message: Message) => void;
  loadConversation: (id: string) => void;
  createNewConversation: () => void;
  loadConversations: () => void;
  deleteConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      conversations: [],
      currentConversationId: null,

      addMessage: (message) => {
        const { currentConversationId } = get();
        if (!currentConversationId) return;

        set((state) => {
          const updatedMessages = [...state.messages, message];
          localStorage.setItem(`messages_${currentConversationId}`, JSON.stringify(updatedMessages));
          return { messages: updatedMessages };
        });
      },

      loadConversation: (id) => {
        const messages = JSON.parse(localStorage.getItem(`messages_${id}`) || '[]');
        set({ messages, currentConversationId: id });
      },

      createNewConversation: () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const newConversation = {
          id: crypto.randomUUID(),
          title: 'New Chat',
          userId: user.id,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: newConversation.id,
          messages: []
        }));
      },

      loadConversations: () => {
        const user = useAuthStore.getState().user;
        if (!user) {
          set({ conversations: [] });
          return;
        }

        const conversations = get().conversations.filter(conv => conv.userId === user.id);
        set({ conversations });
      },

      deleteConversation: (id) => {
        set((state) => {
          const newConversations = state.conversations.filter(conv => conv.id !== id);
          localStorage.removeItem(`messages_${id}`);
          
          // If the deleted conversation was the current one, select the first available or null
          const newCurrentId = state.currentConversationId === id
            ? newConversations[0]?.id || null
            : state.currentConversationId;
          
          return {
            conversations: newConversations,
            currentConversationId: newCurrentId,
            messages: newCurrentId ? JSON.parse(localStorage.getItem(`messages_${newCurrentId}`) || '[]') : []
          };
        });
      },

      updateConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map(conv =>
            conv.id === id ? { ...conv, title } : conv
          )
        }));
      }
    }),
    {
      name: 'chat-storage'
    }
  )
);
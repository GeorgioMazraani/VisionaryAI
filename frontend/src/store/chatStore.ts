/**
 * chatStore.ts  – Zustand + persist, fully backend-driven.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import ConversationService, { Conversation } from "../services/ConversationService";
import { Message } from "../types";
import { useAuthStore } from "./authStore";
import http from "../utils/http-common";
import { getTokenBearer } from "../utils/utils";

/* ───── MESSAGE SERVICE ───── */
const MessageService = {
  async send(conversationId: string, payload: Omit<Message, "id" | "created_at">) {
    const { data } = await http.post<Message>(
      "/messages",
      { conversation_id: conversationId, ...payload },
      { headers: { Authorization: getTokenBearer() } }
    );
    return data;
  },
  async list(conversationId: string) {
    const { data } = await http.get<Message[]>(
      `/conversations/${conversationId}`,
      { headers: { Authorization: getTokenBearer() } }
    );
    return data;
  },
};
/* ─────────────────────────── */

interface ChatState {
  messages: Message[];
  conversations: Conversation[];
  currentConversationId: string | null;

  /* actions */
  addMessage(payload: Omit<Message, "id" | "created_at">): Promise<void>;
  loadConversation(id: string): Promise<void>;
  createNewConversation(): Promise<void>;
  reloadConversations(): Promise<void>;
  deleteConversation(id: string): Promise<void>;
  updateConversationTitle(id: string, title: string): Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      conversations: [],
      currentConversationId: null,

      /* ───── MESSAGE ───── */
      addMessage: async (payload) => {
        const id = get().currentConversationId;
        if (!id) return;
        const saved = await MessageService.send(id, payload);
        set((s) => ({ messages: [...s.messages, saved] }));
      },

      /* ───── CONVERSATIONS ───── */
      reloadConversations: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        const list = await ConversationService.list({ user_id: user.id });
        set({ conversations: list });
      },

      loadConversation: async (id) => {
        /* ① mark this conversation as current */
        set({ currentConversationId: id, messages: [] });

        /* ② pull its messages from backend */
        const msgs = await MessageService.list(id);
        set({ messages: msgs });
      },



      createNewConversation: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        await ConversationService.start({ user_id: user.id, title: "New Chat" });
        await get().reloadConversations();
      },

      deleteConversation: async (id) => {
        await ConversationService.remove(id);
        await get().reloadConversations();

        set((s) => {
          const stillExists = s.conversations.find((c) => c.id === id);
          if (!stillExists && s.currentConversationId === id) {
            return { currentConversationId: s.conversations[0]?.id || null, messages: [] };
          }
          return {};
        });
      },

      updateConversationTitle: async (id, title) => {
        await ConversationService.patchTitle(id, title);
        await get().reloadConversations();
      },
    }),
    {
      name: "chat-storage",
      partialize: (s) => ({
        conversations: s.conversations,
        currentConversationId: s.currentConversationId,
      }),
    }
  )
);

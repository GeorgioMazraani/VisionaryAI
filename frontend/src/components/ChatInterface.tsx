/* ──────────────────────────────────────────────────────────
   ChatInterface.tsx  (stable hooks, real-time)
   ------------------------------------------------------------------ */

import React, {
  useRef,
  useEffect,
  useState,
  FormEvent,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import MessageService, {
  Message,
  CreateMessageInput,
} from '../services/MessageService';

import { getSocket }          from '../utils/socket';
import { useSocketStore }     from '../store/socketStore';
import { useChatStore }       from '../store/chatStore';
import { useAuthStore }       from '../store/authStore';
import { useAppearanceStore } from '../store/appearanceStore';

import { ImageUpload } from './ImageUpload';

/* helper ▸ dataURL → File */
const dataURLtoFile = (dataUrl: string, filename = 'upload.png'): File => {
  const [meta, b64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] ?? 'image/png';
  const bin  = atob(b64);
  const u8   = Uint8Array.from(bin, ch => ch.charCodeAt(0));
  return new File([u8], filename, { type: mime });
};

export const ChatInterface: React.FC = () => {
  /* ───────── global stores ───────── */
  const { currentConversationId, reloadConversations } = useChatStore();
  const user                   = useAuthStore((s) => s.user);
  const socketReady            = useSocketStore((s) => s.socketReady);
  const { fontSize, theme }    = useAppearanceStore();

  /* ───────── local state ───────── */
  const [messages, setMessages]       = useState<Message[]>([]);
  const [inputText, setInputText]     = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  /* ───────── refs ───────── */
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef      = useRef<ReturnType<typeof getSocket>>();

  /* ───────── derived ───────── */
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  /* 1️⃣ assign socket once ready */
  useEffect(() => {
    if (socketReady && !socketRef.current) {
      socketRef.current = getSocket();
      console.log('✅ socket assigned', socketRef.current.id);
    }
  }, [socketReady]);

  /* 2️⃣ join / leave room when conversation changes */
  useEffect(() => {
    if (!socketReady) return;          // guard inside hook body (✅ OK)
    const socket = socketRef.current;
    if (!socket) return;

    // clean slate
    socket.off('newMessage');
    socket.off('messageEdited');
    socket.off('messageRemoved');

    if (!currentConversationId) {
      setMessages([]);
      return;
    }

    socket.emit('joinConversation', { conversationId: currentConversationId });

    MessageService.list(currentConversationId).then(setMessages);

    socket.on('newMessage', (msg: Message) => {
      if (msg.conversation_id !== Number(currentConversationId)) return;
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('messageEdited', ({ messageId, content }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, message_text: content } : m)),
      );
    });

    socket.on('messageRemoved', ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    return () => {
      socket.emit('leaveConversation', { conversationId: currentConversationId });
      socket.off('newMessage');
      socket.off('messageEdited');
      socket.off('messageRemoved');
    };
  }, [socketReady, currentConversationId]);

  /* 3️⃣ autoscroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* 4️⃣ send message helper */
  const sendMessage = useCallback(
    async (text: string, imageDataUrl?: string | null) => {
      if (!user || !currentConversationId) return;

      const socket = socketRef.current;
      const base: Omit<CreateMessageInput, 'conversation_id' | 'sender'> = {};

      if (text)         base.message_text = text;
      if (imageDataUrl) base.file         = dataURLtoFile(imageDataUrl);

      const payload: CreateMessageInput = {
        conversation_id: Number(currentConversationId),
        sender: 'user',
        ...base,
      };

      if (socket?.connected) {
        socket.emit('sendMessage', {
          conversationId: payload.conversation_id,
          text: payload.message_text ?? null,
        });
      } else {
        const saved = await MessageService.send(payload);
        setMessages((prev) => [...prev, saved]);
        reloadConversations();
      }
    },
    [user, currentConversationId, reloadConversations],
  );

  /* 5️⃣ form submit */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !uploadedImage) return;
    sendMessage(inputText.trim(), uploadedImage);
    setInputText('');
    setUploadedImage(null);
  };

  /* ───────── conditional UIs (no early hook returns) ───────── */
  let body: React.ReactNode;

  if (!socketReady) {
    body = (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Connecting…
      </div>
    );
  } else if (!currentConversationId) {
    body = (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select or start a conversation
      </div>
    );
  } else {
    /* helpers */
    const bubbleCls = (mine: boolean) =>
      `max-w-[85%] rounded-2xl p-3 transition shadow ${
        mine
          ? 'bg-blue-600 text-white rounded-tr-none'
          : isDark
          ? 'bg-gray-700 text-white rounded-tl-none'
          : 'bg-gray-100 text-gray-900 rounded-tl-none'
      }`;

    body = (
      <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
        {/* messages list */}
        <motion.div
          className={`flex-1 overflow-y-auto p-4 ${
            isDark ? 'bg-gray-800/50' : 'bg-white/50'
          } rounded-xl`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence mode="popLayout">
            {messages.map((m, i) => (
              <motion.div
                key={m.id}
                className={`flex ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className={bubbleCls(m.sender === 'user')}>
                  {m.message_type === 'image' ? (
                    <img
                      src={m.message_text}
                      alt="sent"
                      className="rounded-lg max-h-40 mb-2"
                    />
                  ) : (
                    <p
                      className={
                        fontSize === 'small'
                          ? 'text-sm'
                          : fontSize === 'large'
                          ? 'text-lg'
                          : 'text-base'
                      }
                    >
                      {m.message_text}
                    </p>
                  )}
                  <div
                    className={`text-[10px] text-right ${
                      m.sender === 'user'
                        ? 'opacity-70'
                        : isDark
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    }`}
                  >
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </motion.div>

        {/* composer */}
        <motion.form
          onSubmit={handleSubmit}
          className={`mt-4 p-4 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } rounded-xl shadow-lg`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <ImageUpload
            onImageSelect={setUploadedImage}
            selectedImage={uploadedImage}
            onClear={() => setUploadedImage(null)}
          />

          <div className="flex gap-2 mt-3">
            <input
              className={`flex-1 rounded-lg px-4 py-2 focus:outline-none ${
                isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}
              placeholder="Type a message…"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !uploadedImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </motion.form>
      </div>
    );
  }

  /* ───── final render (single return) ───── */
  return <>{body}</>;
};

/* ──────────────────────────────────────────────────────────
   ChatInterface.tsx – ChatGPT-like flow + Copy + TTS
   ------------------------------------------------------------------ */

import React, {
  useRef,
  useEffect,
  useState,
  FormEvent,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import copy from 'copy-to-clipboard';

/* stores / hooks */
import { getSocket } from '../utils/socket';
import MessageService, {
  Message,
  CreateMessageInput,
} from '../services/MessageService';
import { useSocketStore } from '../store/socketStore';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useAppearanceStore } from '../store/appearanceStore';
import { useVoiceStore } from '../store/voiceStore';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

import { ImageUpload } from './ImageUpload';

/* ──────────────────────────────────────────────────────────
   Helpers
   ------------------------------------------------------------------ */
const dataURLtoFile = (dataUrl: string, filename = 'upload.png'): File => {
  const [meta, b64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] ?? 'image/png';
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return new File([bytes], filename, { type: mime });
};

/* Code block with copy button */
const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const child = children as React.ReactElement;
  const raw = child?.props?.children ?? '';
  const language = /language-(\w+)/.exec(child?.props?.className || '')?.[1] ?? 'text';

  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    copy(String(raw));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group my-4">
      <button
        onClick={onCopy}
        className="absolute top-2 right-2 z-10 rounded bg-gray-700 text-xs
                   px-2 py-0.5 text-white opacity-0 transition
                   group-hover:opacity-100"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag="div"
        customStyle={{ borderRadius: '0.5rem', fontSize: '.8rem', margin: 0 }}
        wrapLongLines
      >
        {String(raw)}
      </SyntaxHighlighter>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   Component
   ------------------------------------------------------------------ */
export const ChatInterface: React.FC = () => {
  /* global stores */
  const { currentConversationId, reloadConversations } = useChatStore();
  const socketReady = useSocketStore(s => s.socketReady);
  const user = useAuthStore(s => s.user);
  const { fontSize, theme } = useAppearanceStore();
  const { ttsEnabled } = useVoiceStore();          // ← toggle from settings

  /* TTS hook */
  const { speak, stopSpeaking } = useTextToSpeech();

  /* local state */
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  /* refs */
  const socketRef = useRef<ReturnType<typeof getSocket>>();
  const bottomRef = useRef<HTMLDivElement>(null);

  /* derived */
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  /* ───────── attach socket once ready */
  useEffect(() => {
    if (socketReady && !socketRef.current) socketRef.current = getSocket();
  }, [socketReady]);

  useEffect(() => {
    if (!ttsEnabled) stopSpeaking();
  }, [ttsEnabled, stopSpeaking]);
  /* ───────── join / leave conversation room */
  useEffect(() => {
    if (!socketReady) return;
    const socket = socketRef.current;
    if (!socket) return;

    socket.off('newMessage').off('messageEdited').off('messageRemoved');

    if (!currentConversationId) { setMessages([]); return; }

    socket.emit('joinConversation', { conversationId: currentConversationId });
    MessageService.list(currentConversationId).then(setMessages);

    socket.on('newMessage', (msg: Message) => {
      if (msg.conversation_id !== Number(currentConversationId)) return;

      setMessages(prev => [...prev, msg]);

      if (msg.sender === 'ai') {
        setAiThinking(false);
        console.log(ttsEnabled)
        if (ttsEnabled) {
          console.log("🧠 AI Message Received:", msg.message_text);
          stopSpeaking();
          speak(msg.message_text);
        }
      }
    });


    socket.on('messageEdited', ({ messageId, content }) =>
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, message_text: content } : m)),
      ),
    );

    socket.on('messageRemoved', ({ messageId }) =>
      setMessages(prev => prev.filter(m => m.id !== messageId)),
    );

    return () => socket.emit('leaveConversation', { conversationId: currentConversationId });
  }, [socketReady, currentConversationId, speak, stopSpeaking, ttsEnabled]);

  /* autoscroll */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); },
    [messages, aiThinking]);

  /* ───────── send helper */
  const sendMessage = useCallback(
    async (text: string, image?: string | null) => {
      if (!user || !currentConversationId) return;
      const socket = socketRef.current;

      const base: Omit<CreateMessageInput, 'conversation_id' | 'sender'> = {};
      if (text) base.message_text = text;
      if (image) base.file = dataURLtoFile(image);

      const payload: CreateMessageInput = {
        conversation_id: Number(currentConversationId),
        sender: 'user',
        ...base,
      };

      setAiThinking(true);
      stopSpeaking();  // stop TTS while the user is composing new prompt

      if (socket?.connected) {
        socket.emit('sendMessage', {
          conversationId: payload.conversation_id,
          text: payload.message_text ?? null,
        });
      } else {
        const saved = await MessageService.send(payload);
        setMessages(p => [...p, saved]);
        reloadConversations();
      }
    },
    [user, currentConversationId, reloadConversations, stopSpeaking],
  );

  /* form submit */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (aiThinking) return;
    if (!inputText.trim() && !uploadedImage) return;
    sendMessage(inputText.trim(), uploadedImage);
    setInputText('');
    setUploadedImage(null);
  };

  /* guards */
  if (!socketReady) return <Center>Connecting…</Center>;
  if (!currentConversationId) return <Center>Select or start a chat</Center>;

  /* bubble util */
  const bubble = (mine = false) =>
    `max-w-[85%] rounded-2xl p-3 shadow ${mine
      ? 'bg-blue-600 text-white rounded-tr-none'
      : isDark
        ? 'bg-gray-700 text-white rounded-tl-none'
        : 'bg-gray-100 text-gray-900 rounded-tl-none'
    }`;

  /* ───────── render */
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* messages */}
      <motion.div
        className={`flex-1 overflow-y-auto p-4 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'
          } rounded-xl`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((m, idx) => (
            <motion.div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <div className={bubble(m.sender === 'user')}>
                {/* text / image */}
                {m.message_type === 'image' ? (
                  <img src={m.message_text} alt="" className="rounded-lg max-h-40 mb-2" />
                ) : (
                  <div
                    className={`prose dark:prose-invert break-words max-w-none ${fontSize === 'small'
                      ? 'text-sm'
                      : fontSize === 'large'
                        ? 'text-lg'
                        : 'text-base'
                      }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        code({ inline, className, children }) {
                          if (inline) {
                            return (
                              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                                {children}
                              </code>
                            );
                          }
                          return <>{children}</>; // handled in <pre>
                        },
                        pre: CodeBlock,
                      }}
                    >
                      {m.message_text}
                    </ReactMarkdown>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right ${m.sender === 'user'
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

          {/* typing dots */}
          {aiThinking && (
            <motion.div
              key="typing"
              className="flex justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={bubble(false) + ' flex gap-1'}>
                <span className="animate-pulse">•</span>
                <span className="animate-pulse delay-150">•</span>
                <span className="animate-pulse delay-300">•</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </motion.div>

      {/* composer */}
      <motion.form
        onSubmit={handleSubmit}
        className={`mt-4 p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      >
        <ImageUpload
          onImageSelect={setUploadedImage}
          selectedImage={uploadedImage}
          onClear={() => setUploadedImage(null)}
          disabled={aiThinking}
        />

        <div className="flex gap-2 mt-3">
          <input
            disabled={aiThinking}
            className={`flex-1 rounded-lg px-4 py-2 focus:outline-none ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              } ${aiThinking ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder={aiThinking ? 'Waiting for assistant…' : 'Type a message…'}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />

          <button
            type="submit"
            disabled={aiThinking || (!inputText.trim() && !uploadedImage)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </motion.form>
    </div>
  );
};

/* Utility for empty states */
function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center text-gray-400">
      {children}
    </div>
  );
}

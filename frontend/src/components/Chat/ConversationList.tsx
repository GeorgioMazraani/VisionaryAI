/* ConversationList.tsx – stable hooks */

import React, { useEffect, useState } from "react";
import { MessageSquare, Trash2, Edit2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useChatStore }   from "../../store/chatStore";
import { useSocketStore } from "../../store/socketStore";
import { getSocket }      from "../../utils/socket";

export const ConversationList: React.FC = () => {
  const {
    conversations,
    currentConversationId,
    loadConversation,
    deleteConversation,
    updateConversationTitle,
    reloadConversations,
  } = useChatStore();

  const socketReady = useSocketStore((s) => s.socketReady);

  /* local UI */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  /* live refresh */
  useEffect(() => {
    if (!socketReady) return;
    const socket = getSocket();
    const refresh = () => reloadConversations();

    socket.on("conversationCreated", refresh);
    socket.on("conversationUpdated", refresh);
    socket.on("conversationRemoved", refresh);

    return () => {
      socket.off("conversationCreated", refresh);
      socket.off("conversationUpdated", refresh);
      socket.off("conversationRemoved", refresh);
    };
  }, [socketReady, reloadConversations]);

  /* handlers */
  const handleEdit   = (id: string, title = "") => { setEditingId(id); setEditTitle(title); };
  const handleSave   = (id: string) => { if (editTitle.trim()) updateConversationTitle(id, editTitle.trim()); setEditingId(null); };
  const handleCancel = () => setEditingId(null);
  const handleDelete = (id: string) => window.confirm("Delete conversation?") && deleteConversation(id);
  const handleKey    = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") handleSave(id);
    if (e.key === "Escape") handleCancel();
  };

  const list = Array.isArray(conversations) ? conversations : [];

  /* render */
  return (
    <motion.div className="space-y-1 p-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AnimatePresence mode="popLayout">
        {list.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl hover:shadow-md ${
              currentConversationId === c.id
                ? "bg-blue-600/20 text-white shadow-lg ring-1 ring-blue-500/30"
                : "text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />

            {editingId === c.id ? (
              <div className="flex-1 flex items-center gap-1">
                <div className="flex-1 relative">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => handleKey(e, c.id)}
                    className="w-full bg-gray-700/50 text-white px-3 py-1.5 rounded-lg focus:outline-none"
                    placeholder="Enter chat name…"
                    autoFocus
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button onClick={() => handleSave(c.id)}   className="p-1 rounded-md text-green-400 hover:text-green-300 hover:bg-green-400/10"><Check className="w-4 h-4" /></button>
                    <button onClick={handleCancel}             className="p-1 rounded-md text-red-400 hover:text-red-300 hover:bg-red-400/10"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => loadConversation(c.id)}
                  className="flex-1 text-left truncate py-0.5 hover:text-white"
                >
                  {c.title || "New Chat"}
                </button>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => handleEdit(c.id, c.title || "")} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600/50"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(c.id)}               className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {!list.length && (
        <motion.div className="text-center py-8 text-gray-400" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-lg mb-2">No conversations yet</p>
          <p className="text-sm">Start a new chat to begin</p>
        </motion.div>
      )}
    </motion.div>
  );
};

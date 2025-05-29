import React, { useState } from 'react';
import { MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { motion, AnimatePresence } from 'framer-motion';

export const ConversationList: React.FC = () => {
  const { conversations, currentConversationId, loadConversation, deleteConversation, updateConversationTitle } = useChatStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSave = (id: string) => {
    if (editTitle.trim()) {
      updateConversationTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSave(id);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <motion.div 
      className="space-y-1 p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        {conversations.map((conv) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all hover:shadow-md ${
              currentConversationId === conv.id
                ? 'bg-blue-600/20 text-white shadow-lg ring-1 ring-blue-500/30'
                : 'text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            
            {editingId === conv.id ? (
              <motion.div 
                className="flex-1 flex items-center gap-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <motion.div 
                  className="flex-1 relative"
                  initial={{ width: "100%" }}
                  animate={{ width: "100%" }}
                >
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, conv.id)}
                    className="w-full bg-gray-700/50 text-white px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400"
                    placeholder="Enter chat name..."
                    autoFocus
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <motion.button
                      onClick={() => handleSave(conv.id)}
                      className="p-1 rounded-md text-green-400 hover:text-green-300 hover:bg-green-400/10 transition-colors"
                      title="Save"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={handleCancel}
                      className="p-1 rounded-md text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                      title="Cancel"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <>
                <motion.button
                  onClick={() => loadConversation(conv.id)}
                  className="flex-1 text-left truncate py-0.5 hover:text-white transition-colors"
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {conv.title}
                </motion.button>
                
                <motion.div 
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                >
                  <motion.button
                    onClick={() => handleEdit(conv.id, conv.title)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600/50 transition-colors"
                    title="Edit chat name"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(conv.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    title="Delete chat"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {conversations.length === 0 && (
        <motion.div 
          className="text-center py-8 text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg mb-2">No conversations yet</p>
          <p className="text-sm">Start a new chat to begin</p>
        </motion.div>
      )}
    </motion.div>
  );
};
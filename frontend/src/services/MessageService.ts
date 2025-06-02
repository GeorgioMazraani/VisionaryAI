import http from "../utils/http-common";
import { getTokenBearer } from "../utils/utils";

// Types
export interface Message {
  id: number;
  conversation_id: number;
  sender: "user" | "ai";
  type: "text" | "image" | "voice";
  content: string;
  created_at: string;
}

export interface CreateMessageInput {
  conversation_id: number;
  sender: "user" | "ai";
  message_text?: string;
  file?: File;
}

// ───── SEND MESSAGE ─────
const send = async (data: CreateMessageInput): Promise<Message> => {
  const formData = new FormData();
  formData.append("conversation_id", data.conversation_id.toString());
  formData.append("sender", data.sender);
  if (data.message_text) formData.append("message_text", data.message_text);
  if (data.file) formData.append("file", data.file);

  const res = await http.post<Message>("/messages", formData, {
    headers: {
      Authorization: getTokenBearer(),
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// ───── LIST MESSAGES ─────
// ───── LIST MESSAGES ─────
const list = async (conversationId: string): Promise<Message[]> => {
  const res = await http.get<Message[]>(`/messages`, {
    params: { conversation_id: conversationId },          // ✅ query param
    headers: { Authorization: getTokenBearer() },
  });
  return res.data;
};


// ───── DELETE MESSAGE ─────
const remove = async (id: number) => {
  return http.delete(`/messages/${id}`, {
    headers: { Authorization: getTokenBearer() },
  });
};

// ───── SINGLE GET (optional) ─────
const get = async (id: number): Promise<Message> => {
  const res = await http.get<Message>(`/messages/${id}`, {
    headers: { Authorization: getTokenBearer() },
  });
  return res.data;
};

// Export all
const MessageService = {
  send,
  list,
  remove,
  get,
};

export default MessageService;

/**
 * ConversationService.ts
 *
 * All authenticated API calls for /conversations
 */
import http from "../utils/http-common";
import { getTokenBearer } from "../utils/utils";

/* ───── TYPES ───── */
export interface Conversation {
  id: string;            // ← use string everywhere for consistency
  user_id: number;
  title: string;
  started_at: string;
  ended_at?: string | null;
}

export interface StartConversationPayload {
  user_id: number;
  title?: string;        // optional – will default to “New Chat” in DB
}

export interface ListConversationsParams {
  user_id?: number;
  active?: boolean;
  limit?: number;
  offset?: number;
}

const authHeader = () => ({ headers: { Authorization: getTokenBearer() } });

/* ───── ENDPOINTS ───── */
const start = (payload: StartConversationPayload) =>
  http
    .post<Conversation>("/conversations", payload, authHeader())
    .then((r) => r.data);

const get = (id: string) =>
  http.get<Conversation>(`/conversations/${id}`, authHeader()).then((r) => r.data);

const list = async (params: ListConversationsParams = {}) => {
  const qs = new URLSearchParams();
  if (params.user_id !== undefined) qs.append("user_id", String(params.user_id));
  if (params.active !== undefined) qs.append("active", String(params.active));
  if (params.limit !== undefined) qs.append("limit", String(params.limit));
  if (params.offset !== undefined) qs.append("offset", String(params.offset));

  const { data } = await http.get<{ count: number; rows: Conversation[] }>(
    `/conversations${qs.toString() ? `?${qs.toString()}` : ""}`,
    authHeader()
  );

  return data.rows; // ← always return pure array
};

const patchTitle = (id: string, title: string) =>
  http
    .patch<Conversation>(`/conversations/${id}`, { title }, authHeader())
    .then((r) => r.data);

const end = (id: string) =>
  http
    .patch<Conversation>(`/conversations/${id}/end`, null, authHeader())
    .then((r) => r.data);

const remove = (id: string) =>
  http.delete(`/conversations/${id}`, authHeader()).then(() => ({ success: true }));

export default { start, get, list, patchTitle, end, remove };

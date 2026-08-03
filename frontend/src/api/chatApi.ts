import API from "./axios";
import type { User } from "../types/user";
import type { Attachment, ChatMessage, Conversation } from "../types/chat";

/**
 * Normalize backend attachment data into `Attachment[]`. The backend stores
 * message attachments as plain URL strings (string[]) while the frontend type
 * uses `{ url, filename?, size?, mimeType? }` objects — this bridges both.
 */
export const normalizeAttachments = (attachments?: any): Attachment[] => {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .map((a) => {
      if (typeof a === "string") return { url: a };
      return {
        url: a?.url || "",
        filename: a?.filename,
        size: a?.size,
        mimeType: a?.mimeType,
        public_id: a?.public_id,
      };
    })
    .filter((a) => Boolean(a.url));
};

/**
 * Normalize a raw message document (backend/socket) into a `ChatMessage`.
 * Maps `_id` → `id` and converts attachments to `Attachment[]`.
 */
export const normalizeMessage = (m: any): ChatMessage => ({
  id: m?.id || m?._id || `msg_${Math.random().toString(36).slice(2)}`,
  conversationId: m?.conversationId,
  senderId: m?.senderId,
  receiverId: m?.receiverId,
  text: m?.text,
  attachments: normalizeAttachments(m?.attachments),
  status: m?.status || "sent",
  edited: m?.edited,
  deleted: m?.deleted,
  createdAt: m?.createdAt || new Date().toISOString(),
});

/**
 * Build a working URL for a backend attachment path. The backend stores local
 * files as `/uploads/...` and remote (Cloudinary) URLs as absolute http(s)
 * strings — this helper handles both.
 */
export const resolveAttachmentUrl = (url?: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base =
    import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:5000";
  return `${base}${url}`;
};

// GET /api/users/search?q=<query>
export const searchUsers = async (query: string): Promise<User[]> => {
  const res = await API.get(`/users/search?q=${encodeURIComponent(query)}`);
  return res.data?.users ?? [];
};

// GET /api/conversations
export const getConversations = async (): Promise<Conversation[]> => {
  const res = await API.get("/conversations");
  return Array.isArray(res.data) ? res.data : [];
};

// POST /api/conversations  { receiverId }
// If a conversation already exists, it is returned; otherwise it is created.
export const createOrGetConversation = async (
  receiverId: string
): Promise<Conversation> => {
  const res = await API.post("/conversations", { receiverId });
  return res.data;
};

// GET /api/messages/:conversationId
export const getMessages = (conversationId: string) =>
  API.get(`/messages/${conversationId}`);

// POST /api/messages
export const sendMessage = (data: {
  conversationId: string;
  receiverId?: string;
  text: string;
}) => API.post("/messages", data);

/**
 * POST /api/messages/upload
 * Upload a single chat file (multipart/form-data). Returns an Attachment.
 */
export const uploadMessageAttachment = async (
  file: File
): Promise<Attachment> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await API.post("/messages/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data?.attachment;
};


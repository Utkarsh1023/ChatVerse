import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import VideoCallModal from "../VideoCallModel";
import RightSidebarDrawer from "./RightSidebarDrawer";
import { IoIosSend } from "react-icons/io";
import {
  HiOutlineArrowLeft,
  HiOutlineFaceSmile,
  HiOutlineMicrophone,
  HiOutlinePaperClip,
  HiOutlineEllipsisVertical,
  HiOutlinePhone,
  HiOutlineVideoCamera,
  HiOutlineXMark,
  HiOutlineDocumentText,
  HiOutlinePhoto,
  HiOutlineFilm,
  HiOutlineMusicalNote,
} from "react-icons/hi2";

import EmojiPicker from "../chat/EmojiPicker";
import MessageBubble from "../chat/MessageBubble";

import type { Attachment, ChatMessage } from "../../types/chat";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import { useSocketContext } from "../../context/SocketContext";
import {
  getMessages,
  uploadMessageAttachment,
  resolveAttachmentUrl,
  normalizeMessage,
  normalizeAttachments,
} from "../../api/chatApi";
import type { ReceiveMessagePayload } from "../../socket/socketTypes";

const MAX_ATTACHMENTS = 10;

/** Map a MIME type to a small icon + label for the attachment chip/bubble. */
const getFileKind = (mimeType?: string): { icon: any; label: string } => {
  const m = (mimeType || "").toLowerCase();
  if (m.startsWith("image/")) return { icon: HiOutlinePhoto, label: "Image" };
  if (m.startsWith("video/")) return { icon: HiOutlineFilm, label: "Video" };
  if (m.startsWith("audio/")) return { icon: HiOutlineMusicalNote, label: "Audio" };
  if (m.includes("pdf")) return { icon: HiOutlineDocumentText, label: "PDF" };
  return { icon: HiOutlineDocumentText, label: "File" };
};

/** Format bytes into a human-readable size string. */
const formatFileSize = (bytes?: number): string => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** True when an attachment URL points at a renderable image. */
const isImageMime = (mimeType?: string, url?: string): boolean => {
  if (mimeType && mimeType.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|avif|heic|heif)$/i.test(url || "");
};

type Peer = {
  _id: string;
  name: string;
  username?: string;
  avatar: string;
  online: boolean;
  isOnline: boolean;
  lastSeen?: string;
  bio?: string;
};

type ChatWindowProps = {
  activeConversationId: string | null;
  activePeerId: string;
  peer?: Peer;
  onBack: ()=>void;
};

const FALLBACK_PEER: Peer = {
  _id: "",
  name: "Select a conversation",
  avatar: "",
  online: false,
  isOnline: false,
};

// Formats an ISO date into a friendly "last seen" string.
const formatLastSeen = (iso?: string): string => {
  if (!iso) return "";
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "last seen just now";
  if (diffMin < 60) return `last seen ${diffMin}m ago`;
  if (diffHr < 24) return `last seen ${diffHr}h ago`;
  if (diffDay < 7) return `last seen ${diffDay}d ago`;
  return `last seen ${date.toLocaleDateString()}`;
};

export default function ChatWindow({
  activeConversationId,
  activePeerId,
  peer,
  onBack,
}: ChatWindowProps) {
  const { user } = useAuth();
  const safePeer = peer ?? FALLBACK_PEER;

const { emitSendMessage, emitTyping, emitStopTyping, emitMessageDelivered, emitMessageSeen, emitMessagesSeen, emitDeleteMessage } = useSocket();
  const { socket } = useSocketContext();

  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [openCall, setOpenCall] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimer = useRef<number | null>(null);
  const lastTypingAt = useRef<number>(0);

  const toggleSidebar = () => setRightSidebarOpen((v) => !v);
  const closeSidebar = () => setRightSidebarOpen(false);

  // Fetch messages from backend when the active conversation changes
  useEffect(() => {
    if (!activeConversationId || !user?.id) return;

    const fetchMessages = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await getMessages(activeConversationId);
        const raw = res.data?.messages || [];
        setMessages(raw.map(normalizeMessage));
      } catch (err: any) {
        console.error("Failed to fetch messages:", err?.response?.data?.message || err?.message || err);
        setFetchError("Failed to load messages");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [activeConversationId, user?.id]);

  // Mark all peer messages in this conversation as "seen" as soon as the
  // conversation is opened (bulk WhatsApp-style read receipt). This fires
  // once per conversation open and is idempotent server-side.
  useEffect(() => {
    if (!activeConversationId || !user?.id || !socket) return;
    emitMessagesSeen({ conversationId: activeConversationId });
  }, [activeConversationId, user?.id, socket, emitMessagesSeen]);

  // Focus the message input whenever the active conversation changes
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    return () => clearTimeout(timer);
  }, [activeConversationId]);

  useEffect(() => {
    if (!socket || !user?.id) return;

    socket.emit("join");
  }, [socket, user?.id]);

  // Listen for incoming real-time messages via socket
  useEffect(() => {
    if (!socket || !activePeerId) return;

    const handleReceiveMessage = (payload: ReceiveMessagePayload) => {
      // Only append if the message belongs to this conversation
      const isCurrentChat =
        (payload.senderId === activePeerId && payload.receiverId === user?.id) ||
        (payload.senderId === user?.id && payload.receiverId === activePeerId);

      if (!isCurrentChat) return;

      // Check for duplicate (prevent double append from optimistic + socket)
      setMessages((prev) => {
        const exists = prev.some(
          (m) => m.id === payload.id || (m.id.startsWith("c_") && payload.clientMessageId && m.id === payload.clientMessageId)
        );
        if (exists) return prev;

        const newMsg = normalizeMessage(payload);
        const realId = newMsg.id;

        // Notify the sender that this message was delivered to this client.
        emitMessageDelivered({
          receiverId: payload.senderId,
          messageId: realId,
        });

        // Chat is open & the message is on screen, so it is "seen" too.
        emitMessageSeen({
          receiverId: payload.senderId,
          messageId: realId,
        });

        return [...prev, newMsg];
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, activePeerId, user?.id]);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = () => {
      setIsTyping(true);
    };

    const handleStopTyping = () => {
      setIsTyping(false);
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket]);

  useEffect(() => {
    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("messageDelivered", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId && m.status !== "seen"
            ? { ...m, status: "delivered" }
            : m
        )
      );
    });

    socket.on("messageSeen", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, status: "seen" }
            : m
        )
      );
    });

socket.on("messagesSeen", ({ messageIds }) => {
      if (!messageIds || messageIds.length === 0) return;
      const idSet = new Set(messageIds);
      setMessages((prev) =>
        prev.map((m) =>
          idSet.has(m.id)
            ? { ...m, status: "seen" }
            : m
        )
      );
    });

    socket.on("messageDeleted", ({ messageId }) => {
      if (!messageId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, deleted: true, text: "", attachments: [] }
            : m
        )
      );
    });

    return () => {
      socket.off("messageDelivered");
      socket.off("messageSeen");
      socket.off("messagesSeen");
      socket.off("messageDeleted");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("userOnline", ({ userId }: { userId: string }) => {
      console.log(userId, "online");
    });

    socket.on("userOffline", ({ userId }: { userId: string }) => {
      console.log(userId, "offline");
    });

    return () => {
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [socket]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Typing indicator (client -> server) throttled

  const persistScroll = (fn: () => void) => {
    const el = messagesRef.current;
    if (!el) return fn();
    const prevTop = el.scrollTop;
    fn();
    requestAnimationFrame(() => {
      el.scrollTop = prevTop;
    });
  };

  useEffect(() => {
    if (!rightSidebarOpen) return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [rightSidebarOpen]);

  const actions = [
    {
      icon: HiOutlineVideoCamera,
      label: "Video Call",
      onClick: () => setOpenCall(true),
    },
  ];

  const onChangeText = (v: string) => {
    setText(v);

    // typing emit with throttle
    const now = Date.now();
    const minInterval = 900;

    if (!user?.id) return;

    if (now - lastTypingAt.current > minInterval) {
      lastTypingAt.current = now;
      emitTyping(activePeerId);
    }

    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      emitStopTyping(activePeerId);
    }, 1200);
  };

  const onEmojiSelect = (emoji: string) => {
    setShowEmoji(false);
    onChangeText(text + emoji);
  };

  // Open the hidden file picker when the paperclip is clicked.
  const onPaperclipClick = () => {
    fileInputRef.current?.click();
  };

  // Upload the selected files and add the returned attachment descriptors.
  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Reset so selecting the same file again re-triggers onChange.
    e.target.value = "";

    if (files.length === 0) return;

    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      setUploadError(`You can attach at most ${MAX_ATTACHMENTS} files.`);
      return;
    }

    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      setUploadError(`Only the first ${remaining} file(s) were added (max ${MAX_ATTACHMENTS}).`);
    }

    setUploading(true);
    setUploadError(null);

    try {
      const uploaded: Attachment[] = [];
      for (const file of toUpload) {
        const attachment = await uploadMessageAttachment(file);
        if (attachment) uploaded.push(attachment);
      }
      if (uploaded.length > 0) {
        setAttachments((prev) => [...prev, ...uploaded]);
      }
    } catch (err: any) {
      console.error("Failed to upload attachment:", err);
      setUploadError(
        err?.response?.data?.message || err?.message || "Failed to upload file(s)."
      );
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const send = () => {
    if (!user?.id) return;
    const trimmed = text.trim();
    const hasAttachments = attachments.length > 0;
    if (!trimmed && !hasAttachments) return;

    const clientMessageId = `c_${Date.now()}`;

    // optimistic UI
    const optimistic: ChatMessage = {
      id: clientMessageId,
      senderId: user.id,
      receiverId: activePeerId,
      conversationId: activeConversationId || undefined,
      text: trimmed || "",
      attachments: hasAttachments ? attachments : undefined,
      createdAt: new Date().toISOString(),
      status: "sent",
      edited: false,
      deleted: false,
    };

    persistScroll(() => {
      setMessages((prev) => [...prev, optimistic]);
    });

    setText("");
    setShowEmoji(false);
    setAttachments([]);
    setUploadError(null);

    emitSendMessage(
      {
        senderId: user.id,
        receiverId: activePeerId,
        text: trimmed || "",
        attachments: hasAttachments ? attachments : undefined,
        clientMessageId,
      },
      (res: any) => {
        if (!res?.ok) {
          // Rollback optimistic message on failure
          setMessages((prev) => prev.filter((m) => m.id !== clientMessageId));
          console.error("Failed to send message:", res?.error || "Unknown error");
          return;
        }
        // Replace clientMessageId with real server messageId if available
        if (res.messageId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === clientMessageId ? { ...m, id: res.messageId, status: "sent" } : m
            )
          );
        }
      }
    );
  };

  // Header status line: online / typing / last seen
  const statusLine = useMemo(() => {
    if (!activeConversationId) return "";
    if (safePeer.online) return "● Online";
    if (isTyping) return `${safePeer.name} is typing...`;
    const lastSeen = formatLastSeen(safePeer.lastSeen);
    return lastSeen || "Last seen...";
  }, [activeConversationId, safePeer.online, safePeer.name, safePeer.lastSeen, isTyping]);
  
  return (
    <div
      className="flex h-full flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="mr-2 rounded-full p-2 hover:bg-white/10 lg:hidden"
            >
              <HiOutlineArrowLeft className="text-2xl text-white" />
            </button>

            <img
              src={safePeer.avatar}
              alt="Profile"
              className="h-12 w-12 rounded-full"
            />

            <div>
              <h2 className="font-bold text-white">{safePeer.name}</h2>
              <p
                className={
                  "text-sm " +
                  (safePeer.online ? "text-green-400" : "text-slate-400")
                }
              >
                {statusLine}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {actions.map(({ icon: Icon, label, onClick }, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                className={`flex items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 text-green-400 transition-all duration-300 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,.35)] ${
                  label ? "h-11 px-4" : "h-11 w-11"
                }`}
                type="button"
              >
                <Icon className="text-xl" />
                {label && <span className="whitespace-nowrap text-sm font-medium">{label}</span>}
              </motion.button>
            ))}

            <motion.button
              onClick={() => persistScroll(() => toggleSidebar())}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className={
                "flex h-11 w-11 items-center justify-center rounded-xl text-white transition " +
                (rightSidebarOpen
                  ? "bg-violet-600 shadow-[0_0_20px_rgba(139,92,246,.45)]"
                  : "bg-white/5 hover:bg-violet-600")
              }
              type="button"
            >
              <HiOutlineEllipsisVertical className="text-xl" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="flex-1 space-y-5 overflow-y-auto p-6"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-pulse text-slate-400">Loading messages...</div>
          </div>
        ) : fetchError ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-red-400">{fetchError}</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-slate-400">No messages yet. Start a conversation!</div>
          </div>
        ) : (
messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isMe={m.senderId === user?.id}
              onSeen={() => {
                // Only mark the peer's messages as seen — never our own.
                if (m.senderId !== activePeerId) return;
                emitMessageSeen({
                  receiverId: activePeerId,
                  messageId: m.id,
                });
              }}
              onDelete={(messageId) => {
                emitDeleteMessage({
                  messageId,
                  conversationId: activeConversationId || undefined,
                });
              }}
            />
          ))
        )}

        {isTyping && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="w-fit rounded-full bg-white/5 px-5 py-3 text-slate-300"
          >
            {`${safePeer.name} is typing...`}
          </motion.div>
        )}
      </div>

{/* Input */}
      <div className="border-t border-white/10 p-2">
        <div className="relative">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md,.json,.zip,.rar"
            onChange={onFilesSelected}
            className="hidden"
          />

          {/* Attachment preview chips */}
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 px-1">
              {attachments.map((att, i) => {
                const { icon: FileIcon, label } = getFileKind(att.mimeType);
                const isImg = isImageMime(att.mimeType, att.url);
                return (
                  <div
                    key={i}
                    className="group relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300"
                  >
                    {isImg ? (
                      <img
                        src={resolveAttachmentUrl(att.url)}
                        alt={att.filename || "attachment"}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                    ) : (
                      <FileIcon size={16} className="shrink-0 text-cyan-400" />
                    )}
                    <span className="max-w-[120px] truncate text-xs">
                      {att.filename || label}
                    </span>
                    <span className="hidden text-[10px] text-slate-500 group-hover:inline">
                      {formatFileSize(att.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"
                    >
                      <HiOutlineXMark size={12} />
                    </button>
                  </div>
                );
              })}
              {uploading && (
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-cyan-400" />
                  Uploading...
                </div>
              )}
            </div>
          )}

          {uploadError && (
            <div className="mb-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400">
              {uploadError}
            </div>
          )}

          <div className="relative flex items-center gap-3 rounded-2xl bg-slate-800 p-1">
            <button
              type="button"
              className="text-slate-400 hover:text-white"
              onClick={() => setShowEmoji((v) => !v)}
            >
              <HiOutlineFaceSmile size={24} />
            </button>

            <button
              type="button"
              className="relative text-slate-400 hover:text-white"
              onClick={onPaperclipClick}
              disabled={uploading}
            >
              <HiOutlinePaperClip size={24} />
              {attachments.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                  {attachments.length}
                </span>
              )}
            </button>

            <input
              ref={inputRef}
              value={text}
              onChange={(e) => onChangeText(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              className="flex-1 bg-transparent text-white outline-none placeholder:text-slate-400"
            />

            <button type="button" className="text-slate-400 hover:text-white">
              <HiOutlineMicrophone size={24} />
            </button>

            <motion.button
              type="button"
              onClick={send}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 ${!text.trim() && attachments.length === 0 && "cursor-not-allowed opacity-50"}`}
            >
              <IoIosSend size={24} className="rotate-45 text-white" />
            </motion.button>

            {showEmoji && <EmojiPicker onSelect={onEmojiSelect} />}
          </div>
        </div>
      </div>

      <VideoCallModal open={openCall} onClose={() => setOpenCall(false)} />
      <RightSidebarDrawer 
        open={rightSidebarOpen} 
        onClose={closeSidebar} 
        user={{ ...safePeer, username: safePeer.username ?? safePeer.name ?? "" }}
      />
    </div>
  );
}


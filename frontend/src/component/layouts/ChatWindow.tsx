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
} from "react-icons/hi2";

import EmojiPicker from "../chat/EmojiPicker";
import MessageBubble from "../chat/MessageBubble";

import type { ChatMessage } from "../../types/chat";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import { useSocketContext } from "../../context/SocketContext";
import { getMessages } from "../../api/chatApi";

type ChatWindowProps = {
  activePeerId: string;
};

export default function ChatWindow({ activePeerId }: ChatWindowProps) {
  console.log("ChatWindow activePeerId:", activePeerId);
  const { user } = useAuth();

  const { emitSendMessage, emitTyping, emitStopTyping, emitMessageDelivered, emitMessageSeen } = useSocket();
  const { socket } = useSocketContext();

  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [openCall, setOpenCall] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const messagesRef = useRef<HTMLDivElement | null>(null);

  const toggleSidebar = () => setRightSidebarOpen((v) => !v);
  const closeSidebar = () => setRightSidebarOpen(false);

  // Fetch messages from backend when activePeerId changes
  useEffect(() => {
    if (!activePeerId || !user?.id) return;

    const fetchMessages = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await getMessages(activePeerId);
        setMessages(res.data.messages || []);
      } catch (err: any) {
        console.error("Failed to fetch messages:", err?.response?.data?.message || err?.message || err);
        setFetchError("Failed to load messages");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [activePeerId, user?.id]);

  // Listen for incoming real-time messages via socket
  useEffect(() => {
    if (!socket || !activePeerId) return;

    const handleReceiveMessage = (payload: any) => {
      // Only append if the message belongs to this conversation
      if (payload.senderId !== activePeerId && payload.receiverId !== user?.id) return;
      if (payload.receiverId !== activePeerId && payload.senderId !== user?.id) return;

      // Check for duplicate (prevent double append from optimistic + socket)
      setMessages((prev) => {
        const exists = prev.some(
          (m) => m.id === payload.id || (m.id.startsWith("c_") && payload.clientMessageId && m.id === payload.clientMessageId)
        );
        if (exists) return prev;

        const newMsg: ChatMessage = {
          id: payload.id || `socket_${Date.now()}`,
          senderId: payload.senderId,
          receiverId: payload.receiverId,
          conversationId: payload.conversationId,
          text: payload.text,
          attachments: payload.attachments,
          status: payload.status || "sent",
          createdAt: payload.createdAt || new Date().toISOString(),
        };

        return [...prev, newMsg];
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, activePeerId, user?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Typing indicator (client -> server) throttled
  const typingTimer = useRef<number | null>(null);
  const lastTypingAt = useRef<number>(0);

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
      icon: HiOutlinePhone,
      label: "Voice Call",
      onClick: () => console.log("Voice Call"),
    },
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
      setIsTyping(true);
    }

    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      emitStopTyping(activePeerId);
      setIsTyping(false);
    }, 1200);
  };

  const onEmojiSelect = (emoji: string) => {
    setShowEmoji(false);
    onChangeText(text + emoji);
  };

  const send = () => {
    if (!user?.id) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    const clientMessageId = `c_${Date.now()}`;

    // optimistic UI
    const optimistic: ChatMessage = {
      id: clientMessageId,
      senderId: user.id,
      receiverId: activePeerId,
      text: trimmed,
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

    emitSendMessage(
      {
        senderId: user.id,
        receiverId: activePeerId,
        text: trimmed,
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
              m.id === clientMessageId ? { ...m, id: res.messageId } : m
            )
          );
        }
      }
    );
  };

  return (
    <div
      className="flex-1 rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl flex flex-col overflow-hidden h-full"
    >
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white transition-all duration-300 hover:bg-violet-600 hover:scale-105"
            >
              <HiOutlineArrowLeft className="text-xl" />
            </Link>

            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="Profile"
              className="h-12 w-12 rounded-full"
            />

            <div>
              <h2 className="font-bold text-white">Prachi Dubey</h2>
              <p className="text-sm text-green-400">● Online</p>
            </div>
          </div>

          <div className="flex gap-3">
            {actions.map(({ icon: Icon, label, onClick }, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                className={`flex items-center justify-center gap-2 rounded-xl bg-green-500/5 border border-green-500/20 text-green-400 transition-all duration-300 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,.35)] ${
                  label ? "h-11 px-4" : "h-11 w-11"
                }`}
                type="button"
              >
                <Icon className="text-xl" />
                {label && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
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
        className="flex-1 overflow-y-auto p-6 space-y-5"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400 animate-pulse">Loading messages...</div>
          </div>
        ) : fetchError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-400">{fetchError}</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400">No messages yet. Start a conversation!</div>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isMe={m.senderId === user?.id}
              onSeen={() => {
                emitMessageSeen({ receiverId: activePeerId, messageId: m.id, clientMessageId: m.id });
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
            {"Prachi is typing..."}
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-2">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-800 p-1 relative">
          <button
            type="button"
            className="text-slate-400 hover:text-white"
            onClick={() => setShowEmoji((v) => !v)}
          >
            <HiOutlineFaceSmile size={24} />
          </button>

          <button type="button" className="text-slate-400 hover:text-white">
            <HiOutlinePaperClip size={24} />
          </button>

          <input
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-400"
          />

          <button type="button" className="text-slate-400 hover:text-white">
            <HiOutlineMicrophone size={24} />
          </button>

          <motion.button
            type="button"
            onClick={send}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500"
          >
            <IoIosSend size={24} className="text-white rotate-45" />
          </motion.button>

          {showEmoji && <EmojiPicker onSelect={onEmojiSelect} />}
        </div>
      </div>

      <VideoCallModal open={openCall} onClose={() => setOpenCall(false)} />
      <RightSidebarDrawer open={rightSidebarOpen} onClose={closeSidebar} />
    </div>
  );
}


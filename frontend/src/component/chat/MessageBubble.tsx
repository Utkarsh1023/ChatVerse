import React, { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../../types/chat";
import { resolveAttachmentUrl } from "../../api/chatApi";

/** True when the MIME type / URL points at a renderable image. */
const isImage = (mimeType?: string, url?: string): boolean => {
  if (mimeType && mimeType.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|avif|heic|heif)$/i.test(url || "");
};

/** True when the MIME type / URL points at a playable video. */
const isVideo = (mimeType?: string, url?: string): boolean => {
  if (mimeType && mimeType.startsWith("video/")) return true;
  return /\.(mp4|webm|mov|mkv)$/i.test(url || "");
};

/** Pick an emoji-ish icon label for non-image attachments. */
const fileLabel = (mimeType?: string, url?: string): string => {
  const u = (url || "").toLowerCase();
  if (/\.pdf$/i.test(u)) return "📄 PDF";
  if (/\.(doc|docx)$/i.test(u)) return "📝 Doc";
  if (/\.(xls|xlsx|csv)$/i.test(u)) return "📊 Sheet";
  if (/\.(ppt|pptx)$/i.test(u)) return "📽️ Slides";
  if (/\.(zip|rar|7z)$/i.test(u)) return "🗜️ Archive";
  if (/\.(mp3|wav|ogg|m4a|aac)$/i.test(u)) return "🎵 Audio";
  if (mimeType?.startsWith("video/")) return "🎬 Video";
  if (mimeType?.startsWith("audio/")) return "🎵 Audio";
  return "📎 File";
};

/** Format bytes into a human-readable size string. */
const formatSize = (bytes?: number): string => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function MessageBubble({
  message,
  isMe,
  onSeen,
  onDelete,
}: {
  message: ChatMessage;
  isMe: boolean;
  onSeen?: (messageId?: string) => void;
  onDelete?: (messageId: string) => void;
}) {
  const status = message.status;
  const attachments = message.attachments ?? [];
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const seenSent = useRef(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Mark received messages as "seen" once they become visible on screen
  // (WhatsApp-style read receipts). Only fires once per message.
  useEffect(() => {
    if (isMe || !onSeen || seenSent.current) return;
    if (status === "seen") {
      seenSent.current = true;
      return;
    }

    const node = bubbleRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !seenSent.current) {
            seenSent.current = true;
            onSeen(message.id);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isMe, onSeen, message.id, status]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showDeleteMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowDeleteMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDeleteMenu]);

  const handleTouchStart = () => {
    longPressTimer.current = window.setTimeout(() => {
      if (isMe) {
        setShowDeleteMenu(true);
      }
    }, 600); // 600ms long-press to trigger
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseDown = () => {
    handleTouchStart();
  };

  const handleMouseUp = () => {
    handleTouchEnd();
  };

  const handleDelete = () => {
    setShowDeleteMenu(false);
    onDelete?.(message.id);
  };

  // If the message is deleted, show a simplified "This message was deleted" placeholder
  if (message.deleted) {
    return (
      <div className={"flex " + (isMe ? "justify-end" : "justify-start")}>
        <div
          className={
            "max-w-md rounded-3xl px-5 py-3 italic opacity-60 " +
            (isMe
              ? "bg-gradient-to-r from-violet-600/40 to-cyan-500/40 text-white/60"
              : "bg-white/5 text-white/60")
          }
        >
          <p className="text-sm">This message was deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={bubbleRef}
      className={"flex relative " + (isMe ? "justify-end" : "justify-start")}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div
        className={
          "max-w-md rounded-3xl px-5 py-3 " +
          (isMe
            ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
            : "bg-white/5 text-white")
        }
      >
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-col gap-2">
            {attachments.map((att, i) => {
              const src = resolveAttachmentUrl(att.url);
              const filename = att.filename || fileLabel(att.mimeType, att.url);

              if (isImage(att.mimeType, att.url)) {
                return (
                  <a
                    key={i}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-2xl"
                  >
                    <img
                      src={src}
                      alt={filename}
                      className="max-h-72 w-full object-cover"
                      loading="lazy"
                    />
                  </a>
                );
              }

              if (isVideo(att.mimeType, att.url)) {
                return (
                  <video
                    key={i}
                    src={src}
                    controls
                    preload="metadata"
                    className="max-h-72 w-full rounded-2xl"
                  />
                );
              }

              // Generic file / audio chip
              return (
                <a
                  key={i}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={att.filename || true}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                >
                  <span className="text-2xl">
                    {fileLabel(att.mimeType, att.url)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {att.filename || "Download file"}
                    </span>
                    {att.size ? (
                      <span className="text-xs opacity-70">
                        {formatSize(att.size)}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs opacity-80">↧</span>
                </a>
              );
            })}
          </div>
        )}

        {message.text && (
          <p className="mt-1 whitespace-pre-wrap">{message.text}</p>
        )}

        <div className="mt-2 flex items-center justify-end gap-2">
          <span className="text-xs opacity-70">
            {message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>

{isMe && status && (
            <span
              className={
                "text-xs " +
                (status === "seen"
                  ? "text-cyan-300"
                  : "text-white/90 opacity-90")
              }
              title={
                status === "sent"
                  ? "Sent"
                  : status === "delivered"
                    ? "Delivered"
                    : "Seen"
              }
            >
              {status === "sent" ? "✓" : "✓✓"}
            </span>
          )}
        </div>
      </div>

      {/* Delete menu popup on long-press */}
      {showDeleteMenu && isMe && (
        <div
          ref={menuRef}
          className="absolute bottom-0 z-50 rounded-2xl border border-red-500/20 bg-slate-800 px-4 py-3 shadow-2xl backdrop-blur-xl"
          style={isMe ? { right: 0 } : { left: 0 }}
        >
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-red-400 transition hover:text-red-300"
          >
            🗑️ Delete Message
          </button>
        </div>
      )}
    </div>
  );
}

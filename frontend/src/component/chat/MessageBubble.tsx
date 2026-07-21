import React from "react";
import type { ChatMessage } from "../../types/chat";

export default function MessageBubble({
  message,
  isMe,
  onSeen,
}: {
  message: ChatMessage;
  isMe: boolean;
  onSeen?: (messageId?: string) => void;
}) {
  const status = message.status;

  return (
    <div
      className={
        "flex " +
        (isMe ? "justify-end" : "justify-start")
      }
    >
      <div
        className={
          "max-w-md rounded-3xl px-5 py-3 " +
          (isMe
            ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
            : "bg-white/5 text-white")
        }
      >
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}

        <div className="mt-2 flex items-center justify-end gap-2">
          <span className="text-xs opacity-70">{message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>

          {isMe && status && (
            <span className="text-xs opacity-90">
              {status === "sent" ? "✓" : status === "delivered" ? "✓✓" : "Seen"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


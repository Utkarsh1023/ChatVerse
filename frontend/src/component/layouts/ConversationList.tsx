import { motion } from "framer-motion";
import { HiCheckBadge } from "react-icons/hi2";
import type { Conversation } from "../../types/chat";

export type ConversationListItem = {
  id: string;
  participantId: string;
  title: string;
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
  online?: boolean;
  avatar?: string;
  isVerified?: boolean;
};

export type ConversationListProps = {
  conversations: Conversation[];
  loading: boolean;
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
};

// Maps the backend conversation shape `{ _id, lastMessage, user }` into the
// display fields used by the conversation list UI.
export const toListItem = (c: Conversation): ConversationListItem => {
  const lastMessageText = c.lastMessage?.text || "";
  const time = c.lastMessage?.createdAt
    ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : c.updatedAt
      ? new Date(c.updatedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return {
    id: c._id,
    participantId: c.user?._id || "",
    title: c.user?.name || "Unknown User",
    avatar: c.user?.avatar || "",
    online: Boolean(c.user?.isOnline),
    isVerified: Boolean(c.user?.isVerified),
    lastMessage: lastMessageText,
    time,
  };
};

export default function ConversationList({
  conversations,
  loading,
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const list = conversations.map(toListItem);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-cyan-400" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-300">
            No conversations yet
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Start a new chat using the + button or search above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0 lg:space-y-2">
      {list.map((chat) => (
        <motion.div
          key={chat.id}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={
            "cursor-pointer border p-4 py-5 transition-all duration-300 lg:max-2 lg:mb-2 lg:rounded-2xl lg:border hover:bg-white/10 " +
            (chat.id === activeConversationId
              ? " bg-white/10 lg:border-violet-500/40"
              : "bg-transparent lg:border-transparent")
          }
          onClick={() => onSelectConversation(chat.id)}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={chat.avatar}
                alt={chat.title}
                className="h-16 w-16  rounded-full object-cover ring-2 ring-white/10"
              />

              {chat.online && (
                <span className="
                absolute
                bottom-1
                right-1
                h-4
                w-4
                rounded-full
                border-2
                border-slate-900
                bg-green-500
                shadow-lg
                shadow-green-500/50
                " />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 rounded-full">
                <h3 className="flex items-center gap-1.5 truncate text-base font-semibold text-white">
                  <span className="truncate">{chat.title}</span>
                  {chat.isVerified && (
                    <HiCheckBadge className="shrink-0 text-sm text-cyan-400" />
                  )}
                </h3>
                <span className="shrink-0 text-xs text-slate-400">
                  {chat.time}
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="truncate text-[15px] text-slate-400">
                  {chat.lastMessage}
                </p>

                {(chat.unreadCount ?? 0) > 0 && (
                  <span className="
                  flex
                  h-7
                  min-w-[28px]
                  items-center
                  justify-center
                  rounded-full
                  bg-cyan-500
                  px-2
                  text-xs
                  font-bold
                  text-white
                  ">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
          {chat.id === activeConversationId && (
            <span className="absolute left-0 top-1/2 h-10 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400 lg:hidden" />
          )}
        </motion.div>
        
      ))}
    </div>
  );
}


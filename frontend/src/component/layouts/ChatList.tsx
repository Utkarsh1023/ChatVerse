import { motion } from "framer-motion";
import { HiOutlinePlus } from "react-icons/hi2";
import type { Conversation } from "../../types/chat";
import type { User } from "../../types/user";
import SearchBar from "./SearchBar";
import ConversationList from "./ConversationList";

export type ChatListProps = {
  conversations: Conversation[];
  loading: boolean;
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onStartConversation: (user: User) => Promise<Conversation> | Conversation;
};

export default function ChatList({
  conversations,
  loading,
  activeConversationId,
  onSelectConversation,
  onStartConversation,
}: ChatListProps) {
  const handleSelectUser = async (user: User) => {
    try {
      await onStartConversation(user);
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  };

  return (
    <div
  className="
    flex
    h-full
    w-full
    flex-col
    overflow-hidden
    bg-slate-900
    lg:w-[360px]
    lg:rounded-3xl
    lg:border
    lg:border-white/10
    lg:bg-slate-900/70
    lg:backdrop-blur-xl
  "
>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/95 px-5 py-4 backdrop-blur-xl">
  <div className="mb-4 flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-white">
        Messages
      </h1>

      <p className="text-sm text-slate-400">
        {conversations.length} conversations
      </p>
    </div>

    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
    >
      <HiOutlinePlus size={22} />
    </motion.button>
  </div>

  <SearchBar onSelectUser={handleSelectUser} />
</div>

      {/* Chats */}
      <div className="mt-2 flex-1 overflow-y-auto px-2 pb-24 lg:px-3 lg:pb-4">
        <ConversationList
          conversations={conversations}
          loading={loading}
          activeConversationId={activeConversationId}
          onSelectConversation={onSelectConversation}
        />
      </div>
    </div>
  );
}


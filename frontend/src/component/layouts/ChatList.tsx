import { motion } from "framer-motion";
import React from "react";
import { HiOutlineMagnifyingGlass, HiOutlinePlus } from "react-icons/hi2";

export type ConversationListItem = {
  id: string; // conversation id
  participantId: string; // receiver id
  title: string;
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
  online?: boolean;
  avatar?: string;
};

// Step: UI scaffolding. Replace with REST/DB conversation list in later steps.
const seedConversations: ConversationListItem[] = [
  {
    id: "c1",
    participantId: "user2",
    title: "Nikki Singh",
    lastMessage: "Jessie sent a new design...",
    time: "2m",
    unreadCount: 3,
    online: true,
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: "c2",
    participantId: "user3",
    title: "Prachi Dubey",
    lastMessage: "Let's meet tomorrow.",
    time: "5m",
    unreadCount: 0,
    online: true,
    avatar: "https://i.pravatar.cc/150?img=12",
  },
];

export type ChatListProps = {
  onSelectConversation: (participantId: string) => void;
};

export default function ChatList({ onSelectConversation }: ChatListProps) {
  return (

    <div
      className={
        "w-[360px] rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl flex flex-col overflow-hidden h-full"
      }
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex gap-3">
          {/* Search */}
          <div className="flex-1 rounded-2xl bg-slate-800/80 flex items-center px-4">
            <HiOutlineMagnifyingGlass className="text-slate-400 text-xl" />

            <input
              placeholder="Search chats..."
              className="w-full bg-transparent px-3 py-3 outline-none text-white placeholder:text-slate-400"
            />
          </div>

          {/* New Chat */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="h-12 w-12 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white flex items-center justify-center"
            type="button"
            onClick={() => {
              // TODO: open conversation creation modal
              console.log("New chat");
            }}
          >
            <HiOutlinePlus size={24} />
          </motion.button>
        </div>
      </div>

      <div>
        <h2 className="ml-3 mb-5 text-2xl font-bold text-white">Messages</h2>
      </div>

      {/* Chats */}
      <div className="flex-1 px-3 pb-4 overflow-y-auto">
        {seedConversations.map((chat) => (
          <motion.div
            key={chat.id}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="mb-0.5 cursor-pointer border border-transparent bg-white/5 p-4 hover:border-violet-500/40 hover:bg-white/10"
            onClick={() => {
              // Open the selected conversation in the ChatWindow
              onSelectConversation(chat.participantId);
            }}

          >
            <div className="flex">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={chat.avatar}
                  alt=""
                  className="h-14 w-14 rounded-full object-cover"
                />

                {chat.online && (
                  <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-slate-900" />
                )}
              </div>

              {/* Content */}
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-white">{chat.title}</h3>
                  <span className="text-xs text-slate-400">{chat.time}</span>
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm text-slate-400 truncate">
                    {chat.lastMessage}
                  </p>

                  <div className="flex items-center gap-2">
                    {(chat.unreadCount ?? 0) > 0 && (
                      <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-violet-600 px-2 text-xs font-semibold text-white">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


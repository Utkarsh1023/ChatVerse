import { useCallback, useEffect, useMemo, useState, } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import CreatePostModal from "../CreatePostModel";
import CreateSearchModal from "../CreateSearchModal";
import { getConversations, createOrGetConversation } from "../../services/chatService";
import type { Conversation } from "../../types/chat";
import type { User } from "../../types/user";
import MobileBottomNav from "./MobileBottomNav";
import { motion } from "framer-motion";
export default function DashboardLayout() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [searchParams] = useSearchParams();
  const [openSearch, setOpenSearch] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        if (!mounted) return;

        const list = Array.isArray(data) ? data : [];
        setConversations(list);

        // Prefer the conversation id from the URL query (?conversation=<id>),
        // e.g. when navigating from a profile "Message" button. Fall back to
        // the first conversation if none is requested or it is not found.
        const requestedId = searchParams.get("conversation");
        const target =
          list.find((c) => c._id === requestedId) || list[0] || null;

        if (target) {
          setActiveConversationId(target._id);
          // On small screens, open the chat window directly.
          if (window.innerWidth < 1024) {
            setShowChat(true);
          }
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchConversations();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c._id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  // `activePeerId` is the other user's id — used for sending messages via socket.
  const activePeerId = activeConversation?.user?._id || "";

  // Derive the full peer object so ChatWindow never receives `undefined`.
  const activeUser = activeConversation?.user as (User & { bio?: string }) | undefined;
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const peer = {
    _id: activeUser?._id || "",
    name: activeUser?.name || "Select a conversation",
    username: activeUser?.username || "",
    avatar: activeUser?.avatar || "",
    online: Boolean(activeUser?.isOnline),
    isOnline: Boolean(activeUser?.isOnline),
    lastSeen: activeUser?.lastSeen,
    bio: activeUser?.bio || "",
  };

  const user = { username: "" };
  const handleSelectConversation = useCallback((conversationId: string) => {
  setActiveConversationId(conversationId);

  if (window.innerWidth < 1024) {
    setShowChat(true);
  }
}, []);
  /**
   * Called when a user is picked from the search dropdown.
   * POST /api/conversations returns the existing conversation (or creates a new
   * one), adds it to the top of the list (no duplicates), and selects it.
   */
  const handleStartConversation = useCallback(
    async (user: User): Promise<Conversation> => {
      const conversation = await createOrGetConversation(user._id);
      
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conversation._id);
        return exists ? prev : [conversation, ...prev];
      });

      setActiveConversationId(conversation._id);
      if (window.innerWidth < 1024) {
        setShowChat(true);
      }
      return conversation;
    },
    []
  );
  
  return (
<div className="h-screen bg-slate-950 p-2">
  <div className="mx-auto h-full max-w-full overflow-hidden pb-16 lg:pb-0">
        <div className="flex h-full overflow-hidden rounded-none bg-slate-900 lg:gap-2 lg:rounded-3xl lg:bg-slate-900/70 lg:backdrop-blur-xl">
          {/* Sidebar (always visible) */}
          <div className="hidden shrink-0 lg:block">
            <Sidebar 
              username={user.username}
              onOpenCreatePost={() => setCreatePostOpen(true)}
              onOpenSearch={() => setOpenSearch(true)}
              
            />
          </div>

          {/* Chat panels */}
          <div className="flex  min-w-0 flex-1 overflow-hidden">
            {/* Chat List (hide on small screens) */}
            <div className={`${showChat ? "hidden lg:block" : "block"} w-full h-full  lg:w-[350px] xl:w-[370px] lg:shrink-0`}>
              <ChatList
                conversations={conversations}
                loading={loading}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onStartConversation={handleStartConversation}
              />
            </div>

            {/* Chat Window (flexes) */}
            <motion.div
              initial={{ x: 50 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.25 }}
              className={`${showChat ? "flex" : "hidden"} min-w-0 flex-1 overflow-hidden lg:flex`}
            >
              <ChatWindow
                activeConversationId={activeConversationId}
                activePeerId={activePeerId}
                peer={peer}
                onBack={() => setShowChat(false)}
              />
            </motion.div>

            {/* Right sidebar now controlled by ChatWindow ellipsis button */}
            <div className="hidden shrink-0 xl:block" />
          </div>
        </div>
        <CreatePostModal
      open={createPostOpen}
      onClose={() => setCreatePostOpen(false)}
    />
      </div>
      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-50
          border-t
          border-white/10
          bg-slate-900/95
          backdrop-blur-2xl
          lg:hidden
          pb-[env(safe-area-inset-bottom)]
        "
      >
        <MobileBottomNav
        onOpenSearch={() => setOpenSearch(true)}
          onOpenCreatePost={() => setCreatePostOpen(true)}
        />
      </div>
      <CreateSearchModal
                open={openSearch}
                onClose={() => setOpenSearch(false)}
            />
    </div>
  );
}


import { motion } from "framer-motion";
import {useState, useEffect} from "react";
import Sidebar from "../layouts/Sidebar";

import StatsCards from "./StatsCards";
import FriendsToolbar from "./FriendsToolbar";
import FriendsGrid from "./FriendsGrid";
import FriendRequests from "./FriendRequests";
import Suggestions from "./Suggestions";
import api from "../../api/axios";
import { searchUsers, getSuggestions } from "../../services/userService";
import { User } from "../../types/user";
import MobileBottomNav from "../layouts/MobileBottomNav";
import CreatePostModal from "../CreatePostModel";

export default function ConnectionsPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
    const user = { username: "" };
  const [openCreatePost, setOpenCreatePost] = useState(false);
  useEffect(() => {
  const timer = setTimeout(async () => {
    try {
      setLoading(true);

      if (search.trim()) {
        const data = await searchUsers(search);
        setUsers(data);
      } else {
        const data = await getSuggestions();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, 400);

  return () => clearTimeout(timer);
}, [search]);

  return (
    <div className="min-h-screen bg-slate-950 p-2">
      <div className="mx-auto h-[calc(100vh-24px)] max-w-full overflow-hidden">
        <div className="flex h-full gap-2 overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl">
          {/* Sidebar */}
          <div className="hidden shrink-0 lg:block">
            <Sidebar 
              username={user.username}
              onOpenCreatePost={() => setOpenCreatePost(true)}
            />
          </div>
          <main className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-1">
              {/* Hero */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-8
                  backdrop-blur-xl
                "
              >
                {/* Glow */}
                <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-violet-600/20 blur-[120px]" />
                <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Friend Dashboard
                        </h1>
                        <p className="mt-2 text-slate-400">
                            Connect, chat and grow your network.
                        </p>
                    </div>
                    <FriendsToolbar
                        search={search}
                        setSearch={setSearch}
                    />
                </div>

            </div>
              </motion.section>
              {/* Main Grid */}
              <div className="grid gap-8 xl:grid-cols-[2fr_380px]">
                <div className="space-y-4">
                  <StatsCards />
                  
                  <FriendsGrid 
                    friends={users}
                    loading={loading}
                    search={search}
                    setSearch={setSearch}
                  />
                </div>
                {/* Right Sidebar */}
                <div className="space-y-2">
                  <FriendRequests />
                  <Suggestions />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <MobileBottomNav onOpenCreatePost={() => setOpenCreatePost(true)} />
        <CreatePostModal
        open={openCreatePost}
        onClose={() => setOpenCreatePost(false)}
      />
    </div>
  );
}
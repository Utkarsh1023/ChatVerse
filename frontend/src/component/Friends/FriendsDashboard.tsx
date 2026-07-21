import { motion } from "framer-motion";
import {
  HiOutlineUserPlus,
} from "react-icons/hi2";

import Sidebar from "../layouts/Sidebar";

import StatsCards from "./StatsCards";
import FriendsToolbar from "./FriendsToolbar";
import FriendsGrid from "./FriendsGrid";
import FriendRequests from "./FriendRequests";
import Suggestions from "./Suggestions";

export default function ConnectionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-2">
      <div className="mx-auto h-[calc(100vh-24px)] max-w-full overflow-hidden">
        <div className="flex h-full gap-2 overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl">
          {/* Sidebar */}
          <div className="hidden shrink-0 lg:block">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-1">
              {/* Hero */}
              <motion.section
                initial={{ opacity: 0, y: 25 }}
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
                <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-[120px]" />
                <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white lg:text-4xl">
                      Friends Dashboard
                    </h1>
                    <p className="mt-2 max-w-3xl text-slate-400 leading-7">
                      Connect with developers, manage your friends,
                      accept requests and grow your professional
                      network.
                    </p>
                  </div>
                </div>
              </motion.section>
              {/* Main Grid */}
              <div className="grid gap-8 xl:grid-cols-[2fr_380px]">
                <div className="space-y-4">
                  <StatsCards />
                  <FriendsToolbar />
                  <FriendsGrid />
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
    </div>
  );
}
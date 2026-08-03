import { motion } from "framer-motion";
import { HiOutlineUsers } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import Tabs from "./Tabs";
import type { ConnectionsTab } from "./useConnectionsData";

interface ConnectionsHeaderProps {
  activeTab: ConnectionsTab;
  onTabChange: (tab: ConnectionsTab) => void;
  countFor: (tab: ConnectionsTab) => number;
  online: number;
  totalConnections: number;
  onRefresh: () => void;
  refreshing: boolean;
}

export default function ConnectionsHeader({
  activeTab,
  onTabChange,
  countFor,
  online,
  totalConnections,
  onRefresh,
  refreshing,
}: ConnectionsHeaderProps) {
  const { user } = useAuth();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-8"
    >
      {/* Glows */}
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-600/30">
              <HiOutlineUsers className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Connections
              </h1>
              <p className="text-sm text-slate-400">
                {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : ""} —
                Connect, chat and grow your network.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-md text-slate-400">
            <span className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-2">
              <HiOutlineUsers className="text-violet-300" />
              {totalConnections} total connections
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {online} online now
            </span>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 transition hover:bg-violet-600 hover:text-white disabled:opacity-60"
            >
              {refreshing ? "Syncing..." : "⟳ Refresh"}
            </button>
          </div>
        </div>

        
      </div>
      <div className="my-6 h-px w-full bg-white/5" />
      <Tabs active={activeTab} onChange={onTabChange} countFor={countFor} />
    </motion.section>
  );
}

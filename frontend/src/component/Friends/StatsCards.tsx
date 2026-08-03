import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  HiOutlineUsers,
  HiOutlineUserPlus,
  HiOutlineStar,
  HiOutlineUserGroup,
  HiOutlineSignal,
} from "react-icons/hi2";
import { getFriendsDashboard, DashboardStats } from "../../services/friendService";

const EMPTY_STATS: DashboardStats = {
  friends: 0,
  followers: 0,
  following: 0,
  requests: 0,
  online: 0,
};

const defaultStats = [
  {
    key: "friends" as const,
    title: "Friends",
    icon: HiOutlineUsers,
    color: "from-violet-500 to-fuchsia-500",
    bg: "from-violet-500/15 to-fuchsia-500/15",
    iconColor: "text-violet-400",
  },
  {
    key: "followers" as const,
    title: "Followers",
    icon: HiOutlineUserGroup,
    color: "from-sky-500 to-cyan-500",
    bg: "from-sky-500/15 to-cyan-500/15",
    iconColor: "text-sky-400",
  },
  {
    key: "following" as const,
    title: "Following",
    icon: HiOutlineStar,
    color: "from-amber-500 to-orange-500",
    bg: "from-amber-500/15 to-orange-500/15",
    iconColor: "text-amber-400",
  },
  {
    key: "requests" as const,
    title: "Requests",
    icon: HiOutlineUserPlus,
    color: "from-cyan-500 to-sky-500",
    bg: "from-cyan-500/15 to-sky-500/15",
    iconColor: "text-cyan-400",
  },

];

export default function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getFriendsDashboard(1, 1);
        if (active) setStats(data?.stats ?? EMPTY_STATS);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
        if (active) setError("Could not load stats");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      {defaultStats.map((item, index) => {
        const Icon = item.icon;
        const value = loading ? 0 : stats[item.key];

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{
              y: -8,
              scale: 1.02,
            }}
            className="
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-6
              backdrop-blur-xl
              transition-all
              duration-300
              hover:border-violet-500/40
              hover:shadow-2xl
              hover:shadow-violet-500/10
            "
          >
            {/* Glow */}
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-2 text-4xl font-bold text-white">
                  {loading || error ? (
                    <span className="text-slate-500">
                      {error ? "—" : "..."}
                    </span>
                  ) : (
                    <CountUp
                      end={value}
                      duration={1.5}
                    />
                  )}
                </h2>
              </div>

              <div
                className={`
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  ${item.bg}
                `}
              >
                <Icon
                  className={`text-3xl ${item.iconColor}`}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

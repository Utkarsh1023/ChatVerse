import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  HiOutlineUsers,
  HiOutlineUserPlus,
  HiOutlineStar,
} from "react-icons/hi2";

const stats = [
  {
    title: "Friends",
    value: 248,
    icon: HiOutlineUsers,
    color: "from-violet-500 to-fuchsia-500",
    bg: "from-violet-500/15 to-fuchsia-500/15",
    iconColor: "text-violet-400",
  },
  {
    title: "Requests",
    value: 12,
    icon: HiOutlineUserPlus,
    color: "from-cyan-500 to-sky-500",
    bg: "from-cyan-500/15 to-sky-500/15",
    iconColor: "text-cyan-400",
  },
  {
    title: "Following",
    value: 186,
    icon: HiOutlineStar,
    color: "from-amber-500 to-orange-500",
    bg: "from-amber-500/15 to-orange-500/15",
    iconColor: "text-amber-400",
  },
];

export default function StatsCards() {
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((item, index) => {
        const Icon = item.icon;

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
                  <CountUp
                    end={item.value}
                    duration={2}
                  />
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
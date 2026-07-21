import { motion } from "framer-motion";
import {
  HiOutlineBell,
  HiOutlineHeart,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserPlus,
} from "react-icons/hi2";

const stats = [
  {
    title: "Notifications",
    value: "124",
    change: "+18%",
    icon: HiOutlineBell,
    color: "from-violet-500/20 to-fuchsia-500/20",
    iconColor: "text-violet-400",
  },
  {
    title: "Likes",
    value: "58",
    change: "+11%",
    icon: HiOutlineHeart,
    color: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400",
  },
  {
    title: "Comments",
    value: "36",
    change: "+7%",
    icon: HiOutlineChatBubbleLeftRight,
    color: "from-cyan-500/20 to-sky-500/20",
    iconColor: "text-cyan-400",
  },
  {
    title: "Requests",
    value: "12",
    change: "+4%",
    icon: HiOutlineUserPlus,
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
  },
];

export default function NotificationStats() {
  return (
    <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -6 }}
            className="
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-6
              transition-all
              duration-300
              hover:border-violet-500/40
              hover:bg-white/[0.06]
              hover:shadow-xl
              hover:shadow-violet-500/10
            "
          >
            {/* Glow */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl opacity-0 transition duration-300 group-hover:opacity-100" />

            <div className="relative z-10 flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {item.value}
                </h2>

                <span
                  className={`
                    mt-3
                    inline-flex
                    rounded-full
                    px-2
                    py-1
                    text-xs
                    font-medium

                    ${
                      item.change.startsWith("+")
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }
                  `}
                >
                  {item.change} today
                </span>

              </div>

              <div
                className={`
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  ${item.color}
                `}
              >
                <Icon
                  className={`text-2xl ${item.iconColor}`}
                />
              </div>

            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
import { motion } from "framer-motion";
import {
  FiMessageCircle,
  FiUsers,
  FiGrid,
  FiFolder,
} from "react-icons/fi";

const stats = [
  {
    title: "Friends",
    value: "248",
    icon: FiUsers,
    color: "from-sky-500 to-cyan-500",
    glow: "hover:shadow-cyan-500/30",
  },
  {
    title: "Followers",
    value: "18",
    icon: FiGrid,
    color: "from-emerald-500 to-green-500",
    glow: "hover:shadow-green-500/30",
  },
  {
    title: "Post",
    value: "521",
    icon: FiFolder,
    color: "from-orange-500 to-red-500",
    glow: "hover:shadow-orange-500/30",
  },
];

export default function ProfileStats() {
  return (
    <div className="mt-2 ">
  <div className="grid min-w-max grid-flow-col auto-cols-[240px] gap-5 xl:grid-flow-row xl:grid-cols-3 xl:auto-cols-auto">
    {stats.map((item, index) => {
      const Icon = item.icon;

      return (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.1,
            duration: 0.45,
          }}
          whileHover={{
            scale: 1.03,
          }}
          className="
            group
            relative
            overflow-hidden
            rounded-3xl
            border
            border-slate-700
            bg-[#0F172A]
            p-6
            backdrop-blur-3xl
            shadow-[0_0_30px_rgba(168,85,247,.12)]
            transition-all
            duration-300
            hover:-translate-y-2
            hover:border-fuchsia-500/30
            hover:shadow-[0_0_30px_rgba(168,85,247,.18)]
          "
        >
          {/* Glow */}
          <div
            className={`
              absolute
              -right-10
              -top-10
              h-32
              w-32
              rounded-full
              bg-gradient-to-r
              ${item.color}
              opacity-10
              blur-3xl
              transition
              duration-300
              group-hover:opacity-30
            `}
          />

          {/* Icon */}
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-4">
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
                  text-white
                  shadow-lg
                  transition-transform
                  duration-300
                  group-hover:scale-110
                `}
              >
                <Icon size={26} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-1 text-3xl font-bold tracking-tight text-white">
                  {item.value}
                </h2>
              </div>
            </div>

            
          </div>
        </motion.div>
      );
    })}
  </div>
</div>
  );
}
import { motion } from "framer-motion";
import {
  HiOutlineUserPlus,
} from "react-icons/hi2";
import { HiOutlineBadgeCheck } from "react-icons/hi";

const suggestions = [
  {
    id: 1,
    name: "Riya Gupta",
    username: "@riya",
    avatar: "https://i.pravatar.cc/150?img=47",
    role: "Frontend Developer",
    mutual: 12,
    verified: true,
    online: true,
  },
  {
    id: 2,
    name: "Aman Verma",
    username: "@aman",
    avatar: "https://i.pravatar.cc/150?img=55",
    role: "UI / UX Designer",
    mutual: 7,
    verified: false,
    online: false,
  },
  {
    id: 3,
    name: "Ananya Singh",
    username: "@ananya",
    avatar: "https://i.pravatar.cc/150?img=25",
    role: "Backend Developer",
    mutual: 19,
    verified: true,
    online: true,
  },
  {
    id: 4,
    name: "Rahul Kumar",
    username: "@rahul",
    avatar: "https://i.pravatar.cc/150?img=14",
    role: "MERN Developer",
    mutual: 5,
    verified: false,
    online: true,
  },
];

export default function Suggestions() {
  return (
    <motion.section
      initial={{ opacity: 0, x: 25 }}
      animate={{ opacity: 1, x: 0 }}
      className="
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        backdrop-blur-xl
      "
    >
      {/* Header */}

      <div className="border-b border-white/10 p-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-bold text-white">
              People You May Know
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Expand your developer network
            </p>

          </div>

          <button
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-3
              py-2
              text-xs
              text-slate-300
              transition
              hover:bg-violet-600
              hover:text-white
            "
          >
            View All
          </button>

        </div>

      </div>

      {/* Users */}

      <div className="divide-y divide-white/10">

        {suggestions.map((user, index) => (

          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: index * 0.08,
            }}
            whileHover={{
              backgroundColor: "rgba(255,255,255,.03)",
            }}
            className="flex gap-4 p-5"
          >

            {/* Avatar */}

            <div className="relative">

              <img
                src={user.avatar}
                alt={user.name}
                className="
                  h-14
                  w-14
                  rounded-full
                  border-2
                  border-violet-500/20
                "
              />

              <span
                className={`
                  absolute
                  bottom-0
                  right-0
                  h-4
                  w-4
                  rounded-full
                  border-2
                  border-[#0B1120]
                  ${
                    user.online
                      ? "bg-emerald-400"
                      : "bg-slate-500"
                  }
                `}
              />

            </div>

            {/* Content */}

            <div className="min-w-0 flex-1">

              <div className="flex items-center gap-2">

                <h3 className="truncate font-semibold text-white">
                  {user.name}
                </h3>

                {user.verified && (
                  <HiOutlineBadgeCheck className="text-cyan-400" />
                )}

              </div>

              <p className="text-sm text-violet-300">
                {user.username}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {user.role}
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: .95 }}
                className="
                  mt-4
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-violet-600
                  to-cyan-500
                  py-2.5
                  font-medium
                  text-white
                "
              >
                <HiOutlineUserPlus />

                Add Friend

              </motion.button>

            </div>

          </motion.div>

        ))}

      </div>

    </motion.section>
  );
}
import { motion } from "framer-motion";
import {
  HiOutlineUserPlus,
  HiOutlineCheck,
  HiOutlineXMark,
} from "react-icons/hi2";

const requests = [
  {
    id: 1,
    name: "Aditi Sharma",
    username: "@aditi",
    avatar: "https://i.pravatar.cc/150?img=21",
    mutual: 18,
  },
  {
    id: 2,
    name: "Aryan Singh",
    username: "@aryan",
    avatar: "https://i.pravatar.cc/150?img=31",
    mutual: 9,
  },
  {
    id: 3,
    name: "Rohit Kumar",
    username: "@rohit",
    avatar: "https://i.pravatar.cc/150?img=56",
    mutual: 23,
  },
];

export default function FriendRequests() {
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

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-cyan-500/20
                to-violet-500/20
              "
            >
              <HiOutlineUserPlus className="text-2xl text-cyan-400" />
            </div>

            <div>

              <h2 className="font-bold text-white">
                Friend Requests
              </h2>

              <p className="text-sm text-slate-400">
                {requests.length} Pending
              </p>

            </div>

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

      {/* Requests */}

      <div className="divide-y divide-white/10">

        {requests.map((user, index) => (

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
            className="p-5"
          >
            <div className="flex items-center gap-4">

              {/* Avatar */}

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

              {/* Info */}

              <div className="min-w-0 flex-1">

                <h3 className="truncate font-semibold text-white">
                  {user.name}
                </h3>

                <p className="text-sm text-violet-300">
                  {user.username}
                </p>


              </div>

            </div>

            {/* Buttons */}

            <div className="mt-4 grid grid-cols-2 gap-3">

              <motion.button
                whileTap={{ scale: 0.95 }}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-emerald-500
                  py-2.5
                  font-medium
                  text-white
                  transition
                  hover:bg-emerald-600
                "
              >
                <HiOutlineCheck />

                Accept

              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  py-2.5
                  text-white
                  transition
                  hover:bg-red-500
                "
              >
                <HiOutlineXMark />

                Decline

              </motion.button>

            </div>

          </motion.div>

        ))}

      </div>

    </motion.section>
  );
}
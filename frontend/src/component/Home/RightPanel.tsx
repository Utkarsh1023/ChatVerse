import { motion } from "framer-motion";
import {Link} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  HiOutlineUserPlus,
  HiOutlineFire,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";

const suggestions = [
  {
    id: 1,
    name: "Prachi Dubey",
    username: "@prachi",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    username: "@rahul",
    avatar: "https://i.pravatar.cc/150?img=15",
  },
  {
    id: 3,
    name: "Ananya",
    username: "@ananya",
    avatar: "https://i.pravatar.cc/150?img=25",
  },
];

const trends = [
  "#ReactJS",
  "#TailwindCSS",
  "#MERN",
  "#OpenAI",
  "#FullStack",
];

const onlineUsers = [
  {
    id: 1,
    name: "Aman",
    avatar: "https://i.pravatar.cc/150?img=50",
  },
  {
    id: 2,
    name: "Riya",
    avatar: "https://i.pravatar.cc/150?img=44",
  },
  {
    id: 3,
    name: "Nikhil",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
];

export default function RightPanel() {
  const {user} =useAuth();
  const avatarSrc = user?.avatar || "";
  const displayName = user?.fullName || "";
  const userName = user?.username || "";
  return (
    <aside className="w-[340px] border-l border-white/10 bg-slate-900/60 backdrop-blur-xl">
      <div className="h-screen overflow-y-auto hide-scrollbar p-2 space-y-4">

        {/* Profile */}
        <Link to={`/dashboard/profile/${userName}`}>
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div className="flex items-center gap-1">
            <img
              src={avatarSrc}
              className="h-14 w-14 rounded-full"
            />

            <div>
              <h3 className="ml-2 font-semibold text-white">
                {displayName}
              </h3>
              
              <p className="ml-2 text-sm text-slate-400">
                @{userName}
              </p>
            </div>
          </div>
        </motion.div>
        </Link>

        {/* Suggestions */}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">

          <div className="mb-5 flex items-center gap-2">
            <HiOutlineUserPlus className="text-cyan-400 text-xl" />
            <h3 className="font-semibold text-white">
              Suggested Friends
            </h3>
          </div>

          <div className="space-y-4">

            {suggestions.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">

                  <img
                    src={user.avatar}
                    className="h-11 w-11 rounded-full"
                  />

                  <div>

                    <p className="text-sm font-semibold text-white">
                      {user.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {user.username}
                    </p>

                  </div>

                </div>

                <button
                  className="
                  rounded-xl
                  bg-violet-600
                  px-3
                  py-2
                  text-xs
                  text-white
                  hover:bg-violet-500
                  "
                >
                  Follow
                </button>

              </motion.div>
            ))}

          </div>

        </div>
        {/* Online Friends */}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">

          <div className="mb-5 flex items-center gap-2">

            <HiOutlineChatBubbleLeftRight className="text-green-400 text-xl" />

            <h3 className="font-semibold text-white">
              Online Friends
            </h3>

          </div>

          <div className="space-y-4">

            {onlineUsers.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ x: 5 }}
                className="flex items-center gap-3"
              >
                <div className="relative">

                  <img
                    src={user.avatar}
                    className="h-11 w-11 rounded-full"
                  />

                  <span
                    className="
                    absolute
                    bottom-0
                    right-0
                    h-3
                    w-3
                    rounded-full
                    border-2
                    border-slate-900
                    bg-green-500
                    "
                  />

                </div>

                <span className="text-sm text-white">
                  {user.name}
                </span>

              </motion.div>
            ))}

          </div>

        </div>
        {/* Trending */}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">

          <div className="mb-5 flex items-center gap-2">

            <HiOutlineFire className="text-orange-400 text-xl" />

            <h3 className="font-semibold text-white">
              Trending
            </h3>

          </div>

          <div className="space-y-3">

            {trends.map((item) => (
              <button
                key={item}
                className="
                block
                w-full
                rounded-xl
                bg-white/5
                px-4
                py-3
                text-left
                text-sm
                text-slate-300
                hover:bg-violet-600
                hover:text-white
                transition
                "
              >
                {item}
              </button>
            ))}

          </div>

        </div>

      </div>
    </aside>
  );
}
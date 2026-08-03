import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineUsers,
  HiOutlineArrowRight,
  HiOutlineFaceSmile,
} from "react-icons/hi2";

import { useMemo } from "react";
import FriendCard from "./FriendCard";
import { User } from "../../types/user";

interface FriendsGridProps {
  friends: User[];
  loading: boolean;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}


export default function FriendsGrid({
  friends,
  loading,
  search,
  setSearch,
}: FriendsGridProps) {
  // Belt & suspenders: never render the logged-in user's card. The backend
  // already excludes them, but this guards against stale payloads.
  const visibleFriends = useMemo(
    () => friends.filter((u) => u.relationship !== "self"),
    [friends]
  );
  return (
    <section className="space-y-6">

      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-5">

        <div className="flex items-center gap-4">

          <div
            className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-violet-600/20
            to-cyan-500/20
          "
          >
            <HiOutlineUsers className="text-2xl text-violet-400" />
          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">
              {search ? "Search Results" : "Suggested Users"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {visibleFriends.length} {search ? "users found" : "suggestions"}
            </p>

          </div>

        </div>
        {search && (
        <motion.button
          onClick={() => setSearch("")}
          whileHover={{
            x: 4,
          }}
          className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-white/10
          bg-white/5
          px-5
          py-3
          text-sm
          text-slate-300
          transition
          hover:bg-violet-600
          hover:text-white
        "
        >
          View Suggestions

          <HiOutlineArrowRight />
        </motion.button>
        )}
      </div>

      {/* Loading */}

      {loading && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="
              h-[360px]
              animate-pulse
              rounded-3xl
              bg-white/5
            "
            />
          ))}

        </div>
      )}

      {/* Empty */}

      {!loading && visibleFriends.length === 0 && (

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="
          flex
          flex-col
          items-center
          justify-center
          rounded-3xl
          border
          border-dashed
          border-white/10
          bg-white/[0.03]
          py-24
        "
        >

          <HiOutlineFaceSmile className="text-6xl text-slate-500" />

          <h3 className="mt-6 text-2xl font-semibold text-white">
            No Users Found
          </h3>

          <p className="mt-2 max-w-sm text-center text-slate-400">
            Connect with developers and build your network.
          </p>

          <button
            className="
            mt-8
            rounded-xl
            bg-gradient-to-r
            from-violet-600
            to-cyan-500
            px-6
            py-3
            font-medium
            text-white
          "
          >
            Find Friends
          </button>

        </motion.div>

      )}

      {/* Grid */}

      {!loading && visibleFriends.length > 0 && (

        <motion.div
          layout
          className="
          grid
          gap-6
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-2
          2xl:grid-cols-3
        "
        >

          <AnimatePresence>

            {visibleFriends.map((friend, index) => (

              <motion.div
                key={friend._id}
                layout
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: .9,
                }}
                transition={{
                  delay: index * .05,
                }}
              >

                <FriendCard
                  user={friend}
                  username={friend.username}
                />

              </motion.div>

            ))}

          </AnimatePresence>

        </motion.div>

      )}

    </section>
  );
}
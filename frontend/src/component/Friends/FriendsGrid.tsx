import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineUsers,
  HiOutlineArrowRight,
  HiOutlineFaceSmile,
} from "react-icons/hi2";

import FriendCard from "./FriendCard";

const friends = [
  {
    id: 1,
    name: "Prachi Dubey",
    username: "prachi",
    avatar: "https://i.pravatar.cc/300?img=32",
    bio: "Full Stack Developer | React | MERN",
    location: "Ranchi",
    mutual: 18,
    online: true,
  },
  {
    id: 2,
    name: "Rahul Sharma",
    username: "rahul",
    avatar: "https://i.pravatar.cc/300?img=15",
    bio: "Frontend Developer",
    location: "Delhi",
    mutual: 11,
    online: false,
  },
  {
    id: 3,
    name: "Ananya Singh",
    username: "ananya",
    avatar: "https://i.pravatar.cc/300?img=25",
    bio: "UI/UX Designer",
    location: "Bangalore",
    mutual: 8,
    online: true,
  },
  {
    id: 4,
    name: "Aman Kumar",
    username: "aman",
    avatar: "https://i.pravatar.cc/300?img=52",
    bio: "Software Engineer",
    location: "Patna",
    mutual: 16,
    online: true,
  },
  {
    id: 5,
    name: "Riya Gupta",
    username: "riya",
    avatar: "https://i.pravatar.cc/300?img=47",
    bio: "Flutter Developer",
    location: "Noida",
    mutual: 6,
    online: false,
  },
  {
    id: 6,
    name: "Nikhil Raj",
    username: "nikhil",
    avatar: "https://i.pravatar.cc/300?img=11",
    bio: "Backend Developer",
    location: "Mumbai",
    mutual: 13,
    online: true,
  },
  {
    id: 7,
    name: "Sneha Verma",
    username: "sneha",
    avatar: "https://i.pravatar.cc/300?img=44",
    bio: "Cloud Engineer",
    location: "Pune",
    mutual: 9,
    online: false,
  },
  {
    id: 8,
    name: "Akash Patel",
    username: "akash",
    avatar: "https://i.pravatar.cc/300?img=67",
    bio: "DevOps Engineer",
    location: "Ahmedabad",
    mutual: 21,
    online: true,
  },
];

export default function FriendsGrid() {
  const loading = false;

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
              Your Friends
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {friends.length} friends connected with you
            </p>

          </div>

        </div>

        <motion.button
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
          View All

          <HiOutlineArrowRight />
        </motion.button>

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

      {!loading && friends.length === 0 && (

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
            No Friends Yet
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

      {!loading && friends.length > 0 && (

        <motion.div
          layout
          className="
          grid
          gap-6
          sm:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-4
        "
        >

          <AnimatePresence>

            {friends.map((friend, index) => (

              <motion.div
                key={friend.id}
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
                  {...friend}
                />

              </motion.div>

            ))}

          </AnimatePresence>

        </motion.div>

      )}

    </section>
  );
}
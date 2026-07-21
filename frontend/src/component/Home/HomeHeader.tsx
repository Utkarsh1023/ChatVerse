import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineBell,
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";
interface HomeHeaderProps {
  onCreatePost: () => void;
}

export default function HomeHeader({
  onCreatePost,
}: HomeHeaderProps) {
  const { user } = useAuth();
  const avatarSrc = user?.avatar || "";
  return (
    <header
      className="
        sticky
        top-0
        z-30
        border-b
        border-white/10
        bg-slate-950/70
        backdrop-blur-xl
      "
    >
      <div className="flex items-center justify-between px-8 py-5">

        {/* Left */}
        <div className="flex items-center gap-8">

          {/* Logo */}
          <Link to="/dashboard">
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="
              cursor-pointer
              bg-gradient-to-r
              from-violet-500
              to-cyan-400
              bg-clip-text
              text-3xl
              font-black
              text-transparent
            "
          >
            ChatVerse
          </motion.h1>
          </Link>
          {/* Search */}
          <motion.div
            whileFocus={{ scale: 1.02 }}
            className="
              hidden
              md:flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-white/5
              px-4
              py-3
              w-[360px]
              transition
              hover:border-violet-500/40
            "
          >
            <HiOutlineMagnifyingGlass
              className="text-xl text-slate-400"
            />

            <input
              placeholder="Search people, posts..."
              className="
                w-full
                bg-transparent
                text-white
                outline-none
                placeholder:text-slate-500
              "
            />
          </motion.div>

        </div>

        {/* Right */}
        <div className="flex items-center gap-4">

          {/* Create Post */}
          <motion.button
  onClick={onCreatePost}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="
    hidden
    lg:flex
    items-center
    gap-2
    rounded-xl
    bg-gradient-to-r
    from-violet-600
    to-cyan-500
    px-5
    py-3
    text-sm
    font-semibold
    text-white
  "
>
            <HiOutlinePlus className="text-lg" />
            Create
          </motion.button>

          {/* Notifications */}
          <Link to="./notifications">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: .95 }}
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              border
              border-white/10
              bg-white/5
              text-white
              hover:border-violet-500/40
              hover:bg-violet-600
              transition
            "
          >
            <HiOutlineBell className="text-xl" />
          </motion.button>
          </Link>

          {/* Messages */}
          <Link to="./chats">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: .95 }}
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              border
              border-white/10
              bg-white/5
              text-white
              hover:border-violet-500/40
              hover:bg-violet-600
              transition
            "
          >
            <HiOutlineChatBubbleLeftRight className="text-xl" />
          </motion.button>
          </Link>

          {/* Avatar */}
          <Link to="/profile">
          <motion.img
            whileHover={{ scale: 1.08 }}
            src={avatarSrc}
            alt="User"
            className="
              h-12
              w-12
              cursor-pointer
              rounded-full
              border-2
              border-violet-500
              object-cover
            "
          />
          </Link>

        </div>

      </div>
    </header>
  );
}
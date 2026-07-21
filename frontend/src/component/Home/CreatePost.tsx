import { motion } from "framer-motion";
import {
  HiOutlinePhoto,
  HiOutlineVideoCamera,
  HiOutlineFaceSmile,
} from "react-icons/hi2";

export default function CreatePost() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        mb-6
        rounded-3xl
        border
        border-white/10
        bg-slate-900/70
        p-5
        backdrop-blur-xl
      "
    >
      {/* Top */}
      <div className="flex items-start gap-4">

        <img
          src="https://i.pravatar.cc/150?img=12"
          alt="User"
          className="h-12 w-12 rounded-full object-cover"
        />

        <div className="flex-1">

          <textarea
            rows={3}
            placeholder="What's on your mind, Utkarsh?"
            className="
              w-full
              resize-none
              rounded-2xl
              bg-white/5
              px-5
              py-4
              text-white
              outline-none
              placeholder:text-slate-500
              focus:ring-2
              focus:ring-violet-500/40
            "
          />

        </div>

      </div>

      {/* Divider */}

      <div className="my-5 border-t border-white/10" />

      {/* Bottom */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          {[
            {
              icon: HiOutlinePhoto,
              title: "Photo",
              color: "text-emerald-400",
            },
            {
              icon: HiOutlineVideoCamera,
              title: "Video",
              color: "text-red-400",
            },
            {
              icon: HiOutlineFaceSmile,
              title: "Thought",
              color: "text-yellow-400",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <motion.button
                key={item.title}
                whileHover={{ y: -2 }}
                whileTap={{ scale: .95 }}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-3
                  transition
                  hover:bg-white/10
                "
              >
                <Icon className={`text-xl ${item.color}`} />

                <span className="hidden lg:block text-sm text-slate-300">
                  {item.title}
                </span>

              </motion.button>
            );
          })}

        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: .95 }}
          className="
            rounded-xl
            bg-gradient-to-r
            from-violet-600
            to-cyan-500
            px-8
            py-3
            font-semibold
            text-white
            shadow-lg
          "
        >
          Post
        </motion.button>

      </div>

    </motion.div>
  );
}
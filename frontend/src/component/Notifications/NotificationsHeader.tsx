import { motion } from "framer-motion";
import {Link} from "react-router-dom";
import {
  HiOutlineBell,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle,
  HiOutlineAdjustmentsHorizontal,HiOutlineArrowLeft
} from "react-icons/hi2";
import { markAllNotificationsRead } from "../../api/notifications";
export default function NotificationsHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-8 py-6">

        {/* Left */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">

          <Link
                to="/dashboard"
                className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-white/5
                text-white
                transition-all
                duration-300
                hover:bg-violet-600
                hover:scale-105
                "
            >
                <HiOutlineArrowLeft className="text-xl" />
            </Link>
            
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white"
          >
            Notifications
          </motion.h1>

          <p className="mt-2 text-sm text-slate-400">
            Stay updated with likes, comments and friend requests.
          </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">

          {/* Search */}
          {/* <motion.div
            whileHover={{ scale: 1.02 }}
            className="
              hidden
              lg:flex
              w-[340px]
              items-center
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-white/5
              px-4
              py-3
              transition
              hover:border-violet-500/40
            "
          >
            <HiOutlineMagnifyingGlass className="text-xl text-slate-400" />

            <input
              type="text"
              placeholder="Search notifications..."
              className="
                w-full
                bg-transparent
                text-white
                outline-none
                placeholder:text-slate-500
              "
            />
          </motion.div> */}

          {/* Mark All Read */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              await markAllNotificationsRead();
            }}
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              bg-gradient-to-r
              from-emerald-500
              to-green-500
              px-5
              py-3
              text-sm
              font-medium
              text-white
              shadow-lg
              shadow-emerald-500/20
            "
          >
            <HiOutlineCheckCircle className="text-lg" />

            <span className="hidden xl:block">
              Mark all as read
            </span>
          </motion.button>

        </div>
      </div>

      {/* Notification Summary */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="font-semibold text-white">
        Friend Requests
      </h2>

      <p className="text-sm text-slate-400">
        3 pending requests
      </p>
    </div>

    <button className="text-sky-400 hover:text-sky-300">
      View All
    </button>
  </div>
</div>
    </header>
  );
}
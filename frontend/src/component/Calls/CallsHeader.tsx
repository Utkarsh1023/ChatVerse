import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiOutlinePhone,
  HiOutlineVideoCamera,
  HiOutlineMagnifyingGlass,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowLeft,HiOutlineBars3 
} from "react-icons/hi2";

export default function CallsHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="flex flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        {/* Left Section */}
        <div>
          <div className="flex items-center gap-3">
            
            <Link
              to="/dashboard"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white transition-all duration-300 hover:scale-105 hover:bg-violet-600"
            >
              <HiOutlineArrowLeft className="text-xl" />
            </Link>

            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-white sm:text-3xl"
            >
              Calls
            </motion.h1>
          </div>

          <p className="mt-3 max-w-xl text-sm text-slate-400">
            Manage voice calls, & video meeting.
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="hidden lg:flex w-72 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-violet-500/40"
          >
            <HiOutlineMagnifyingGlass className="text-xl text-slate-400" />

            <input
              type="text"
              placeholder="Search calls..."
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />
          </motion.div>

          {/* Voice Call */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 text-sm font-medium text-white shadow-lg shadow-emerald-500/20"
          >
            <HiOutlinePhone className="text-lg" />
            <span className="hidden sm:block">New Call</span>
          </motion.button>

          {/* Meeting */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 text-sm font-medium text-white shadow-lg shadow-violet-500/20"
          >
            <HiOutlineVideoCamera className="text-lg" />
            <span className="hidden sm:block">Meeting</span>
          </motion.button>

          {/* Filter */}
          <motion.button
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-violet-500/40 hover:bg-violet-600"
          >
            <HiOutlineAdjustmentsHorizontal className="text-lg" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
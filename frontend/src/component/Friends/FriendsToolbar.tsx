import { motion } from "framer-motion";
import { useState } from "react";
import {
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiFunnel,
} from "react-icons/hi2";

const filters = [
  "All",
  "Online",
  "Recently Added",
  "Following",
];

export default function FriendsToolbar() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        flex
        flex-col
        gap-5
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        p-5
        backdrop-blur-xl
        lg:flex-row
        lg:items-center
        lg:justify-between
      "
    >
      {/* Search */}

      <div className="relative flex-1">

        <HiMagnifyingGlass
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-xl
            text-slate-500
          "
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search friends..."
          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-black/20
            py-3
            pl-12
            pr-4
            text-white
            placeholder:text-slate-500
            outline-none
            transition
            focus:border-violet-500
            focus:ring-2
            focus:ring-violet-500/20
          "
        />

      </div>

      
        {/* Sort */}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: .95 }}
          className="
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-white/10
            bg-white/5
            px-4
            py-2
            text-slate-300
            transition
            hover:bg-violet-600
            hover:text-white
          "
        >
          <HiMagnifyingGlass />

          Search Friend
        </motion.button>
    

    </motion.section>
  );
}
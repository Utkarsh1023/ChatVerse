import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiEdit2,
  FiShare2,
  FiCheckCircle,
  FiSettings,
  FiCamera,
} from "react-icons/fi";
import {
  HiOutlineArrowLeft,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { MdCake } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";

export default function ProfileHeader() {
  const { user } = useAuth();

  const displayName = user?.fullName || "";
  const username = user?.username || "";
  const location = user?.country || "";
  const bio = user?.bio || "";
  const avatarSrc = user?.avatar || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-900 shadow-[0_0_50px_rgba(168,85,247,.15)]"
    >
      {/* ================= COVER ================= */}

      <div className="relative h-64 overflow-hidden">

        {/* <img
          src="/images/cover.jpg"
          alt=""
          className="h-full w-full object-cover"
        /> */}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-black/30" />

        <div className="absolute -left-20 top-10 h-60 w-60 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />

        {/* Back */}

        <Link
          to="/dashboard"
          className="absolute left-6 top-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl transition hover:scale-105 hover:bg-violet-600"
        >
          <HiOutlineArrowLeft className="text-xl text-white" />
        </Link>

        {/* Change Cover */}

        <button className="absolute bottom-5 right-5 flex items-center gap-2 rounded-xl border border-white/20 bg-black/40 px-4 py-2 text-white backdrop-blur-xl transition hover:bg-fuchsia-600">
          <FiCamera />
          Cover
        </button>
      </div>

      {/* ================= PROFILE ================= */}

      <div className="relative px-8 pb-8">

        {/* Avatar */}

        <motion.div
          initial={{ scale: .85 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 170,
          }}
          className="-mt-20"
        >
          <div className="relative inline-block">

            {/* Animated Border */}

            <div className="rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 p-1 shadow-[0_0_35px_rgba(168,85,247,.45)]">

              <img
                src={avatarSrc}
                alt=""
                className="h-40 w-40 rounded-full border-4 border-slate-900 object-cover"
              />
            </div>

            {/* Online */}

            {/* <span className="absolute bottom-5 right-5 h-6 w-6 rounded-full border-4 border-slate-900 bg-emerald-500" /> */}

            {/* Camera */}

            {/* <button className="absolute bottom-2 left-28 flex h-11 w-11 items-center justify-center rounded-full bg-fuchsia-600 text-white shadow-lg transition hover:scale-105">
              <FiCamera />
            </button> */}
          </div>
        </motion.div>

        {/* ================= CONTENT ================= */}

        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <h1 className="text-4xl font-bold tracking-tight text-white">
                {displayName || "Your Name"}
              </h1>

              <FiCheckCircle className="text-2xl text-sky-500 drop-shadow-[0_0_8px_rgba(59,130,246,.8)]" />

            </div>

            <p className="mt-2 text-lg font-medium text-fuchsia-400">
              @{username || "username"}
            </p>

            <div className="mt-5 items-center gap-10 text-slate-400">

              <div className="flex items-center gap-2">
                <MdCake className="text-lg text-pink-400" />
                {bio}
              </div>

              <div className="flex items-center gap-2">
                <HiOutlineLocationMarker className="text-lg text-cyan-400" />
                {location}
              </div>

              {/* <div className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-sm text-fuchsia-300">
                B.Tech • IIIT Ranchi
              </div> */}

            </div>

            {/* Stats */}

            <div className="mt-6 flex flex-wrap gap-6">

              {[
                ["Friends", "326"],
                ["Followers", "2.8K"],
                ["Following", "18"],
                ["Posts", "45"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-800/60 px-5 py-3 backdrop-blur-xl"
                >
                  <h3 className="text-xl font-bold text-white">
                    {value}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {label}
                  </p>
                </div>
              ))}

            </div>

          </div>

          {/* ================= ACTIONS ================= */}

          <div className="flex flex-wrap gap-3">
            <Link to="/settings">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: .95 }}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-[0_0_25px_rgba(168,85,247,.4)]"
            >
              <FiEdit2 />
              Edit Profile
            </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: .95 }}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800 px-6 py-3 text-slate-200 transition hover:border-fuchsia-500 hover:bg-slate-700"
            >
              <FiShare2 />
              Share
            </motion.button>

            <Link to="/settings">

              <motion.button
                whileHover={{ scale: 1.05, rotate: 20 }}
                whileTap={{ scale: .95 }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-800 text-slate-300 transition hover:bg-gradient-to-r hover:from-fuchsia-600 hover:to-cyan-500 hover:text-white"
              >
                <FiSettings size={22} />
              </motion.button>

            </Link>

          </div>

        </div>
      </div>
    </motion.div>
  );
}
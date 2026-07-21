import { motion } from "framer-motion";
import {
  HiOutlineExclamationTriangle,
  HiOutlineTrash,
  HiOutlinePauseCircle,
  HiOutlineArrowDownTray,
  HiOutlineSparkles,
  HiOutlineShieldExclamation,
} from "react-icons/hi2";

export default function DangerZone() {
  const actions = [
    {
      title: "Export Data",
      description:
        "Download a copy of your chats, media, and account information.",
      icon: <HiOutlineArrowDownTray size={28} />,
      button: "Export Data",
      color:
        "from-cyan-500 to-blue-600",
      border:
        "border-cyan-500/30",
      bg:
        "bg-cyan-500/10",
      btn:
        "from-cyan-500 to-blue-600",
    },
    {
      title: "Deactivate Account",
      description:
        "Temporarily disable your account. You can reactivate it anytime by signing in again.",
      icon: <HiOutlinePauseCircle size={28} />,
      button: "Deactivate",
      color:
        "from-orange-500 to-red-500",
      border:
        "border-orange-500/30",
      bg:
        "bg-orange-500/10",
      btn:
        "from-orange-500 to-red-600",
    },
    {
      title: "Delete Account",
      description:
        "Permanently delete your account, messages, media, and all associated data. This action cannot be undone.",
      icon: <HiOutlineTrash size={28} />,
      button: "Delete Forever",
      color:
        "from-red-500 to-rose-700",
      border:
        "border-red-500/40",
      bg:
        "bg-red-500/10",
      btn:
        "from-red-500 to-rose-700",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
className="h-full rounded-2xl border border-slate-700 bg-slate-800 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:bg-slate-900 hover:shadow-[0_0_20px_rgba(168,85,247,.15)]"    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-red-500/10 p-4">
          <HiOutlineShieldExclamation
            size={34}
            className="text-red-400"
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white">
            Danger Zone
          </h2>

          <p className="mt-1 text-slate-400">
            Sensitive actions that may permanently affect your account.
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="mt-6 flex items-start gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 backdrop-blur-xl"
      >
        <HiOutlineExclamationTriangle
          size={28}
          className="mt-1 text-red-400"
        />

        <div>
          <h3 className="text-lg font-semibold text-red-300">
            Proceed Carefully
          </h3>

          <p className="mt-2 text-sm leading-7 text-slate-300">
            Some actions below are irreversible. Please make sure you
            understand the consequences before continuing.
          </p>
        </div>
      </motion.div>

      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {actions.map((item) => (
          <motion.div
            key={item.title}
            whileHover={{
              y: -8,
              scale: 1.02,
            }}
            transition={{ duration: 0.25 }}
            className={`
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              ${item.border}
              bg-slate-800/80
              p-6
              backdrop-blur-xl
              transition-all
              duration-300
              hover:shadow-[0_0_30px_rgba(239,68,68,.15)]
            `}
          >
            {/* Glow */}
            <div
              className={`absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${item.color} opacity-10 blur-3xl transition group-hover:opacity-25`}
            />

            {/* Icon */}
            <div className="mb-6 flex items-center gap-4">
              <div>
                {/* Icon + Title */}
                <div className="flex items-center gap-4">
                  <div
                    className={`
                      flex
                      h-16
                      w-16
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-gradient-to-br
                      ${item.color}
                      text-white
                      shadow-lg
                    `}
                  >
                    {item.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    {item.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="mt-5 leading-7 text-slate-400">
                  {item.description}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`
                mt-6
                w-full
                rounded-2xl
                bg-gradient-to-r
                ${item.btn}
                py-3
                font-semibold
                text-white
                shadow-lg
              `}
            >
              {item.button}
            </motion.button>

          </motion.div>
        ))}
      </div>

    </motion.div>
  );
}
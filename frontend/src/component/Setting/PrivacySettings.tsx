import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
} from "react-icons/hi2";

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onChange}
    className={`relative h-8 w-16 rounded-full transition ${
      checked
        ? "bg-gradient-to-r from-fuchsia-500 to-cyan-500"
        : "bg-slate-600"
    }`}
  >
    <motion.div
      animate={{ x: checked ? 32 : 4 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
        className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,.35)]"    />
  </motion.button>
);

const Card = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <motion.div
    whileHover={{ y: -3 }}
    className="rounded-3xl border border-slate-700 bg-[#0F172A] p-8 backdrop-blur-2xl shadow-[0_0_40px_rgba(168,85,247,.15)]"
  >
    <h3 className="text-lg font-semibold text-white">
      {title}
    </h3>

    <p className="mt-1 text-sm text-gray-400">
      {subtitle}
    </p>

    <div className="mt-5">{children}</div>
  </motion.div>
);

export default function PrivacySettings() {
  const [messagePermission, setMessagePermission] =
    useState("Everyone");

  const [profilePermission, setProfilePermission] =
    useState("Everyone");

  const [onlineStatus, setOnlineStatus] = useState(true);

  const [lastSeen, setLastSeen] = useState(true);

  const blockedUsers = [
    {
      id: 1,
      name: "Rahul Sharma",
    },
    {
      id: 2,
      name: "Alex Johnson",
    },
    {
      id: 3,
      name: "Emily Davis",
    },
  ];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-slate-700 bg-slate-800 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:bg-slate-900 hover:shadow-[0_0_20px_rgba(168,85,247,.15)]"
    >
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/10 p-3">
          <HiOutlineShieldCheck
            className="text-fuchsia-400"
            size={30}
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white">
            Privacy Settings
          </h2>

          <p className="text-slate-400">
            Control who can interact with you.
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Who can message */}

        <Card
  title="Who can message me"
  subtitle="Control who is allowed to start a conversation with you."
>
  <div className="space-y-3">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
      <HiOutlineChatBubbleLeftRight className="text-fuchsia-400" />
      Message Permissions
    </label>

    <select
      value={messagePermission}
      onChange={(e) => setMessagePermission(e.target.value)}
      className="
        w-full
        rounded-2xl
        border
        border-slate-700
        bg-slate-900
        px-5
        py-3
        text-white
        outline-none
        transition-all
        duration-300
        hover:border-fuchsia-500/30
        focus:border-fuchsia-500
        focus:ring-4
        focus:ring-fuchsia-500/20
      "
    >
      <option>Everyone</option>
      <option>Friends</option>
      <option>Nobody</option>
    </select>
  </div>
</Card>

<Card
  title="Who can see my profile"
  subtitle="Choose who can access your public profile."
>
  <div className="space-y-3">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
      <HiOutlineEye className="text-cyan-400" />
      Profile Visibility
    </label>

    <select
      value={profilePermission}
      onChange={(e) => setProfilePermission(e.target.value)}
      className="
        w-full
        rounded-2xl
        border
        border-slate-700
        bg-slate-900
        px-5
        py-3
        text-white
        outline-none
        transition-all
        duration-300
        hover:border-cyan-500/30
        focus:border-cyan-500
        focus:ring-4
        focus:ring-cyan-500/20
      "
    >
      <option>Everyone</option>
      <option>Contacts</option>
      <option>Nobody</option>
    </select>
  </div>
</Card>

        {/* Toggles */}

        <Card
          title="Show Online Status"
          subtitle="Display your online presence."
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiOutlineEye
                className="text-fuchsia-400"
                size={22}
              />
              <span className="text-white">
                Online Status
              </span>
            </div>

            <Toggle
              checked={onlineStatus}
              onChange={() =>
                setOnlineStatus(!onlineStatus)
              }
            />
          </div>
        </Card>

        <Card
          title="Show Last Seen"
          subtitle="Let others know when you were last active."
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiOutlineClock
                className="text-fuchsia-400"
                size={22}
              />

              <span className="text-white">
                Last Seen
              </span>
            </div>

            <Toggle
              checked={lastSeen}
              onChange={() => setLastSeen(!lastSeen)}
            />
          </div>
        </Card>

        {/* Blocked Users */}

        <div className="lg:col-span-2">
        <Card
          title="Blocked Users"
          subtitle="Manage blocked accounts."
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {blockedUsers.map((user) => (
                <motion.div
                  key={user.id}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-slate-700 bg-slate-900 p-5 transition-all hover:border-fuchsia-500/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 font-bold text-white">
                      {user.name.charAt(0)}
                    </div>

                    <div>
                      <h4 className="font-semibold text-white">
                        {user.name}
                      </h4>

                      <p className="text-sm text-slate-400">
                        Blocked Account
                      </p>
                    </div>
                  </div>

                  <button className="mt-5 w-full rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-red-400 transition hover:bg-red-500/20">
                    Unblock
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      </div>

      {/* Footer */}

      <div className="mt-6 flex w-full items-center justify-center gap-3">
  <motion.button
    whileHover={{
      scale: 1.03,
      boxShadow: "0 0 30px rgba(168,85,247,.45)",
    }}
    whileTap={{ scale: 0.98 }}
    className="
      flex-1
      rounded-2xl
      bg-gradient-to-r
      from-fuchsia-600
      to-cyan-500
      px-4
      py-3
      text-sm
      font-semibold
      text-white
      shadow-lg
      transition-all
      duration-300
      hover:shadow-[0_0_25px_rgba(168,85,247,.45)]
      sm:flex-none
      sm:px-8
      sm:text-base
    "
  >
    Save Privacy
  </motion.button>

  <motion.button
    whileHover={{
      scale: 1.03,
      boxShadow: "0 0 20px rgba(71,85,105,.35)",
    }}
    whileTap={{ scale: 0.98 }}
    className="
      flex-1
      rounded-2xl
      border
      border-slate-700
      bg-slate-800
      px-4
      py-3
      text-sm
      font-semibold
      text-slate-300
      transition-all
      duration-300
      hover:border-slate-600
      hover:bg-slate-700
      hover:text-white
      sm:flex-none
      sm:px-8
      sm:text-base
    "
  >
    Reset
  </motion.button>
</div>
    </motion.div>
  );
}
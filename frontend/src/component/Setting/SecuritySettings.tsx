import { useState } from "react";
import { motion,} from "framer-motion";
import {
  HiOutlineLockClosed,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineComputerDesktop,
  HiOutlineDevicePhoneMobile,
  HiOutlineClock,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onChange}
      className={`relative h-8 w-16 rounded-full transition ${
        checked
          ? "bg-gradient-to-r from-fuchsia-500 to-cyan-500"
          : "bg-slate-700"
      }`}
    >
      <motion.div
        animate={{ x: checked ? 32 : 4 }}
        transition={{
          type: "spring",
          stiffness: 450,
          damping: 28,
        }}
        className="absolute top-1 h-6 w-6 text-white rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,.35)]"
      />
    </motion.button>
  );
}

export default function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(true);

  const activeSessions = [
    {
      device: "Windows PC",
      browser: "Chrome",
      location: "Ranchi, India",
      current: true,
    },
    {
      device: "MacBook Pro",
      browser: "Safari",
      location: "Delhi, India",
      current: false,
    },
  ];

  const devices = [
    {
      name: "iPhone 15 Pro",
      status: "Trusted",
      icon: <HiOutlineDevicePhoneMobile size={24} />,
    },
    {
      name: "Windows Desktop",
      status: "Trusted",
      icon: <HiOutlineComputerDesktop size={24} />,
    },
  ];

  const loginHistory = [
    {
      time: "Today • 10:35 AM",
      device: "Chrome on Windows",
      status: "Success",
    },
    {
      time: "Yesterday • 09:12 PM",
      device: "Safari on macOS",
      status: "Success",
    },
    {
      time: "2 Days Ago • 08:01 PM",
      device: "Firefox on Linux",
      status: "Success",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
className="rounded-2xl border border-slate-700 bg-slate-800 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:bg-slate-900 hover:shadow-[0_0_20px_rgba(168,85,247,.15)]"    >
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/10 p-3">
          <HiOutlineLockClosed
            size={30}
            className="text-fuchsia-400"
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white">
            Security
          </h2>

          <p className="text-slate-400">
            Keep your account safe and secure.
          </p>
        </div>
      </div>

      {/* Change Password */}

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex items-center gap-3">
          <HiOutlineKey className="text-fuchsia-400" size={24} />
          <h3 className="text-xl font-semibold text-white">
            Change Password
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="password"
            placeholder="Current Password"
            className="rounded-xl border border-white/10 bg-black/20 px-5 py-3 text-white outline-none focus:border-fuchsia-500"
          />

          <input
            type="password"
            placeholder="New Password"
            className="rounded-xl border border-white/10 bg-black/20 px-5 py-3 text-white outline-none focus:border-fuchsia-500"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="rounded-xl border border-white/10 bg-black/20 px-5 py-3 text-white outline-none focus:border-fuchsia-500 "
          />
        </div>

        <button className="mt-6 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-6 py-3 font-semibold text-white">
          Update Password
        </button>
      </div>

      {/* Two Factor */}

      <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800 p-6 transition-all duration-300 hover:border-fuchsia-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,.15)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <HiOutlineShieldCheck
              size={26}
              className="text-green-400"
            />

            <div>
              <h3 className="font-semibold text-white">
                Two Factor Authentication
              </h3>

              <p className="text-sm text-gray-400">
                Add an extra layer of security.
              </p>
            </div>
          </div>

          <Toggle
            checked={twoFactor}
            onChange={() => setTwoFactor(!twoFactor)}
          />
        </div>
      </div>

      {/* Active Sessions */}

      <div className="mt-4 grid gap-6 xl:grid-cols-2">

  {/* ================= Active Sessions ================= */}

  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
    <h3 className="mb-6 text-xl font-semibold text-white">
      Active Sessions
    </h3>

    <div className="space-y-4">
      {activeSessions.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -3 }}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 transition-all duration-300 hover:border-fuchsia-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,.15)]"
        >
          <div>
            <h4 className="font-semibold text-white">
              {item.device}
            </h4>

            <p className="mt-1 text-sm text-slate-400">
              {item.browser} • {item.location}
            </p>
          </div>

          {item.current ? (
            <span className="rounded-lg border border-slate-700 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-400">
              Current
            </span>
          ) : (
            <button className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20">
              Logout
            </button>
          )}
        </motion.div>
      ))}
    </div>
  </div>

  {/* ================= Trusted Devices ================= */}

  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
    <h3 className="mb-6 text-xl font-semibold text-white">
      Trusted Devices
    </h3>

    <div className="space-y-4">
      {devices.map((device, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -3 }}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 transition-all duration-300 hover:border-fuchsia-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,.15)]"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/10 p-3 text-fuchsia-400">
              {device.icon}
            </div>

            <div>
              <h4 className="font-semibold text-white">
                {device.name}
              </h4>

              <p className="mt-1 text-sm text-emerald-400">
                {device.status}
              </p>
            </div>
          </div>

          <button className="rounded-lg border border-slate-700 bg-gradient-to-r from-red-500 to-red-500 px-4 py-2 text-sm text-slate-100 transition hover:border-fuchsia-500/30 hover:text-white">
            Remove
          </button>
        </motion.div>
      ))}
    </div>
  </div>

</div>

      {/* Login History */}

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">
          Login History
        </h3>

        <div className="space-y-5">
          {loginHistory.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 5 }}
              className="flex items-center gap-4"
            >
              <div className="rounded-full bg-fuchsia-500/20 p-3">
                <HiOutlineClock className="text-fuchsia-400" />
              </div>

              <div>
                <h4 className="font-semibold text-white">
                  {item.device}
                </h4>

                <p className="text-sm text-gray-400">
                  {item.time}
                </p>
              </div>

              <span className="ml-auto text-green-400">
                {item.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}

      <div className="mt-4 flex w-full items-center justify-center gap-3">
  <motion.button
    whileHover={{
      scale: 1.03,
      boxShadow: "0 0 30px rgba(239,68,68,.35)",
    }}
    whileTap={{ scale: 0.98 }}
    className="
      flex
      flex-1
      items-center
      justify-center
      gap-2
      rounded-2xl
      bg-gradient-to-r
      from-red-500
      to-red-700
      px-4
      py-3
      text-sm
      font-semibold
      text-white
      shadow-lg
      transition-all
      duration-300
      hover:shadow-[0_0_30px_rgba(239,68,68,.35)]
      sm:flex-none
      sm:px-8
      sm:text-base
    "
  >
    <HiOutlineArrowRightOnRectangle size={20} />
    <span className="hidden sm:inline">Logout All Devices</span>
    <span className="sm:hidden">Logout</span>
  </motion.button>

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
    Save Settings
  </motion.button>
</div>
    </motion.div>
  );
}
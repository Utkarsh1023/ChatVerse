import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineComputerDesktop,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";
import { AiOutlineFontSize } from "react-icons/ai"
export default function AppearanceSettings() {
  const [theme, setTheme] = useState("dark");
  const [accent, setAccent] = useState("purple");
  const [bubble, setBubble] = useState("rounded");
  const [fontSize, setFontSize] = useState("medium");

  const themes = [
    {
      id: "light",
      name: "Light",
      icon: <HiOutlineSun size={22} />,
    },
    {
      id: "dark",
      name: "Dark",
      icon: <HiOutlineMoon size={22} />,
    },
    {
      id: "system",
      name: "System",
      icon: <HiOutlineComputerDesktop size={22} />,
    },
  ];

  const colors = [
    {
      id: "purple",
      name: "Purple",
      className: "from-fuchsia-500 to-violet-500",
    },
    {
      id: "blue",
      name: "Blue",
      className: "from-cyan-500 to-blue-600",
    },
    {
      id: "green",
      name: "Green",
      className: "from-green-400 to-emerald-600",
    },
    {
      id: "pink",
      name: "Pink",
      className: "from-pink-500 to-rose-500",
    },
    {
      id: "red",
      name: "Red",
      className: "from-red-500 to-red-400",
    },
    {
      id: "orange",
      name: "Orange",
      className: "from-orange-500 to-amber-500",
    },
    {
      id: "yellow",
      name: "Yellow",
      className: "from-yellow-500 to-amber-500",
    },
    {
      id: "black",
      name: "Black",
      className: "from-gray-900 to-gray-800",
    },
    {
      id: "white",
      name: "White",
      className: "from-gray-300 to-gray-500",
    },
    {
      id: "violet",
      name: "Violet",
      className: "from-violet-500 to-purple-500",
    },
  ];

  const bubbleStyles = ["Rounded", "Modern", "Classic"];
  const fontSizes = ["Small", "Medium", "Large"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
className="rounded-2xl border border-slate-700 bg-slate-800 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:bg-slate-900 hover:shadow-[0_0_20px_rgba(168,85,247,.15)]"    >
      <h2 className="text-3xl font-bold text-slate-100">
        Appearance
      </h2>

      <p className="mt-2 text-slate-400">
        Personalize your chat experience.
      </p>

      {/* Theme */}

      <section className="mt-10">
        <h3 className="mb-5 text-lg font-semibold text-slate-200">
          Theme
        </h3>

        <div className="grid gap-5 md:grid-cols-3">
          {themes.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(item.id)}
              className={`rounded-2xl border p-6 transition-all duration-300

              ${
                theme === item.id
                  ? "border-fuchsia-500 bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/10 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                  : "border-slate-700 bg-slate-800 hover:border-fuchsia-500/30 hover:bg-slate-700"
              }`}
            >
              <div className="mb-4 flex justify-center text-fuchsia-400">
                {item.icon}
              </div>

              <h4 className="font-semibold text-white">
                {item.name}
              </h4>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Accent */}

      <section className="mt-12">
        <h3 className="mb-5 text-lg font-semibold text-slate-200">
          Accent Color
        </h3>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-10">
          {colors.map((color) => (
            <motion.button
              key={color.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAccent(color.id)}
              className={`rounded-2xl border p-5 transition-all duration-300

              ${
                accent === color.id
                  ? "border-fuchsia-500 bg-slate-800 shadow-[0_0_20px_rgba(168,85,247,.2)]"
                  : "border-slate-700 bg-slate-800 hover:border-slate-600"
              }`}
            >
              <div
                className={`h-14 rounded-xl bg-gradient-to-r ${color.className}`}
              />

              <p className="mt-3 font-medium text-white">
                {color.name}
              </p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Bubble */}
      <div className=" mt-6 grid grid-cols-1 gap-8 xl:grid-cols-2">
      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
        <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold text-white">
          <HiOutlineChatBubbleLeftRight className="text-fuchsia-400" />
          Chat Bubble Style
        </h3>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {bubbleStyles.map((style) => (
            <motion.button
              key={style}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setBubble(style.toLowerCase())}
              className={`rounded-2xl border p-5 transition-all duration-300 ${
                bubble === style.toLowerCase()
                  ? "border-fuchsia-500 bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/10 shadow-[0_0_20px_rgba(168,85,247,.2)]"
                  : "border-slate-700 bg-slate-800 hover:border-slate-600"
              }`}
            >
              <div className="flex flex-col items-center">
                {/* Bubble Preview */}
                <div
                  className={`h-5 w-14 bg-gradient-to-r from-fuchsia-500 to-cyan-400 ${
                    style === "Rounded"
                      ? "rounded-full"
                      : style === "Modern"
                      ? "rounded-lg"
                      : "rounded-md"
                  }`}
                />

                <span className="mt-4 font-bold text-white">
                  {style}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Font */}

      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
        <h3 className="mb-5 flex items-center gap-3 text-xl font-semibold text-white">
          <AiOutlineFontSize className="text-fuchsia-400" />
          Font Size
        </h3>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {fontSizes.map((size) => (
            <motion.button
              key={size}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFontSize(size.toLowerCase())}
              className={`rounded-2xl border p-5 transition-all duration-300

              ${
                fontSize === size.toLowerCase()
                  ? "border-fuchsia-500 bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/10 shadow-[0_0_20px_rgba(168,85,247,.2)]"
                  : "border-slate-700 bg-slate-800 hover:border-slate-600"
              }`}
            >
              <span
                className={`font-bold text-white

                ${
                  size === "Small"
                    ? "text-sm"
                    : size === "Medium"
                    ? "text-lg"
                    : "text-2xl"
                }`}
              >
                Aa
              </span>

              <p className="mt-3 text-slate-400">
                {size}
              </p>
            </motion.button>
          ))}
        </div>
      </section>
      </div>
      {/* Buttons */}

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
    Save Preferences
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
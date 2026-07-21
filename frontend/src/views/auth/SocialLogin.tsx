import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FiGithub } from "react-icons/fi";

export default function SocialLogin() {
  return (
    <div className="mt-4">
      {/* Divider */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-700" />

        <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
          OR CONTINUE WITH
        </span>

        <div className="h-px flex-1 bg-slate-700" />
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Google */}
        <motion.button
          className="
group
flex
items-center
justify-center
gap-3
rounded-2xl
border
border-slate-700
bg-slate-800
py-3
font-medium
text-slate-300
transition-all
duration-300

md:hover:-translate-y-1
md:hover:scale-[1.02]
md:hover:border-red-500/40
md:hover:bg-slate-700
md:hover:text-white
md:hover:shadow-[0_0_25px_rgba(234,67,53,.35)]
"
        >
          <FcGoogle
            size={22}
            className="transition-transform duration-300 md:group-hover:scale-110 "
          />

          Google
        </motion.button>

        {/* GitHub */}
        <motion.button
          whileHover={{
            scale: 1.03,
            y: -2,
          }}
          whileTap={{ scale: 0.97 }}
          className="
            group
            flex
            items-center
            justify-center
            gap-3
            rounded-2xl
            border
            border-slate-700
            bg-slate-800
            py-3
            font-medium
            text-slate-300
            transition-all
            duration-300
            hover:border-slate-500
            hover:bg-black
            hover:text-white
            hover:shadow-[0_0_25px_rgba(255,255,255,.12)]
          "
        >
          <FiGithub
            size={21}
            className="transition-transform duration-300 group-hover:scale-110"
          />

          GitHub
        </motion.button>
      </div>
    </div>
  );
}
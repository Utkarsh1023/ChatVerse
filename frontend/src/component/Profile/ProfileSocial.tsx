import { motion } from "framer-motion";
import {
  FiGithub,
  FiLinkedin,
  FiGlobe,
  FiMail,
} from "react-icons/fi";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";

const socials = [
  {
    title: "GitHub",
    username: "@utkarsh",
    icon: FiGithub,
    href: "https://github.com/utkarsh20",
    bg: "hover:bg-gradient-to-r hover:from-gray-900 hover:to-black",
    text: "group-hover:text-white",
    glow: "hover:shadow-[0_0_35px_rgba(24,23,23,.45)]",
  },
  {
    title: "LinkedIn",
    username: "Utkarsh Anand",
    icon: FiLinkedin,
    href: "https://linkedin.com",
    bg: "hover:bg-gradient-to-r hover:from-[#0077B5] hover:to-sky-500",
    text: "group-hover:text-white",
    glow: "hover:shadow-[0_0_35px_rgba(0,119,181,.45)]",
  },
  {
    title: "Twitter",
    username: "@utkarsh",
    icon: FaXTwitter,
    href: "https://twitter.com",
    bg: "hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-400",
    text: "group-hover:text-white",
    glow: "hover:shadow-[0_0_35px_rgba(24,23,23,.45)]",
  },
  {
    title: "Portfolio",
    username: "utkarsh.dev",
    icon: FiGlobe,
    href: "#",
    bg: "hover:bg-gradient-to-r hover:from-violet-600 hover:to-purple-600",
    text: "group-hover:text-white",
    glow: "hover:shadow-[0_0_35px_rgba(124,58,237,.45)]",
  },
  {
    title: "Discord",
    username: "utkarsh#2040",
    icon: FaDiscord,
    href: "#",
    bg: "hover:bg-gradient-to-r hover:from-[#5865F2] hover:to-indigo-500",
    text: "group-hover:text-white",
    glow: "hover:shadow-[0_0_35px_rgba(88,101,242,.45)]",
  },
  {
    title: "Email",
    username: "utkarsh@gmail.com",
    icon: FiMail,
    href: "mailto:utkarsh@gmail.com",
    bg: "hover:bg-gradient-to-r hover:from-red-500 hover:to-red-400",
    text: "group-hover:text-white",
    glow: "hover:shadow-[0_0_35px_rgba(239,68,68,.45)]",
  },
];

export default function ProfileSocial() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mt-2 rounded-[32px] border border-slate-700 bg-[#0F172A] p-8 backdrop-blur-3xl shadow-[0_0_35px_rgba(168,85,247,.12)]"
    >
      <h2 className="mb-4 text-2xl font-bold text-slate-100">
        Social Profiles
      </h2>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
        {socials.map((social, index) => {
          const Icon = social.icon;

          return (
            <motion.a
              key={social.title}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.08,
              }}
              whileHover={{
                y: -6,
                scale: 1.03,
              }}
              className={`
                group
                flex
                items-center
                gap-5
                rounded-3xl
                border
                border-slate-700
                bg-slate-800
                p-5
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-fuchsia-500/30
                hover:text-white
                ${social.bg}
                ${social.glow}
              `}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 transition-all duration-300 group-hover:bg-white/10">
                <Icon
                  size={28}
                  className={`text-slate-300 transition-all duration-300 ${social.text}`}
                />
              </div>

              <div>
                <h3
                  className={`font-semibold text-slate-100 transition-all duration-300 ${social.text}`}
                >
                  {social.title}
                </h3>

                <p
                  className={`text-sm text-slate-400 transition-all duration-300 ${social.text}`}
                >
                  {social.username}
                </p>
              </div>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}
import { motion } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiCalendar,
  FiBriefcase,
} from "react-icons/fi";

const info = [
  {
    icon: FiMail,
    title: "Email",
    value: "utkarsh@example.com",
    color: "text-red-500",
  },
  {
    icon: FiPhone,
    title: "Phone",
    value: "+91 9876543210",
    color: "text-green-500",
  },
  {
    icon: FiMapPin,
    title: "Location",
    value: "Ranchi, Jharkhand, India",
    color: "text-pink-500",
  },
  {
    icon: FiGlobe,
    title: "Website",
    value: "www.utkarsh.dev",
    color: "text-sky-500",
  },
  {
    icon: FiBriefcase,
    title: "Occupation",
    value: "Full Stack Developer",
    color: "text-violet-500",
  },
  {
    icon: FiCalendar,
    title: "Joined",
    value: "January 2025",
    color: "text-orange-500",
  },
];

export default function ProfileInfo() {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">

      {/* About Card */}
      <motion.div
        initial={{ opacity: 0, x: -25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-[32px] border border-slate-700 bg-[#0F172A] p-8 backdrop-blur-3xl shadow-[0_0_30px_rgba(168,85,247,.12)]"
      >
        <h2 className="mb-6 text-2xl font-bold text-slate-100">
          About Me
        </h2>

        <p className="leading-8 text-slate-400">
          Passionate Full Stack Developer specializing in the MERN Stack,
          Java, and scalable web applications.

          I love creating beautiful user experiences, solving challenging
          problems, contributing to open source, and continuously learning
          modern technologies.

          Outside coding, I enjoy competitive programming, UI/UX design,
          and exploring new frameworks.
        </p>

        {/* Skills */}
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            "React",
            "Node.js",
            "Express",
            "MongoDB",
            "Java",
            "Tailwind CSS",
            "Socket.io",
            "TypeScript",
          ].map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-300 transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-fuchsia-600 hover:to-cyan-500 hover:text-white"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Information Card */}
      <motion.div
        initial={{ opacity: 0, x: 25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-[32px] border border-slate-700 bg-[#0F172A] p-8 backdrop-blur-3xl shadow-[0_0_30px_rgba(168,85,247,.12)]"
      >
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Contact Information
        </h2>

        <div className="space-y-5">
          {info.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                whileHover={{
                  x: 5,
                  scale: 1.02,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                }}
                className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:bg-slate-700 hover:shadow-[0_0_20px_rgba(168,85,247,.15)]"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 ${item.color}`}
                >
                  <Icon size={22} />
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    {item.title}
                  </p>

                  <h3 className="font-semibold text-slate-100">
                    {item.value}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
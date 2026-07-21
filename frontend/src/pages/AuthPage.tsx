import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
  HiOutlineVideoCamera,
  HiOutlineCloudArrowUp,
} from "react-icons/hi2";

import LoginForm from "../views/auth/LoginPage";
import RegisterForm from "../views/auth/RegisterPage";
import SocialLogin from "../views/auth/SocialLogin";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const features = [
    {
      icon: <HiOutlineChatBubbleLeftRight size={24} />,
      title: "Real-time Messaging",
      desc: "Instant conversations with lightning-fast delivery.",
    },
    {
      icon: <HiOutlineVideoCamera size={24} />,
      title: "HD Voice & Video",
      desc: "Crystal clear audio and video calls.",
    },
    {
      icon: <HiOutlineShieldCheck size={24} />,
      title: "End-to-End Encryption",
      desc: "Your conversations stay private and secure.",
    },
    {
      icon: <HiOutlineCloudArrowUp size={24} />,
      title: "Unlimited File Sharing",
      desc: "Share photos, videos and documents instantly.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617]">

      {/* Background Glow */}
      <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[180px]" />
      <div className="absolute right-0 bottom-0 h-[550px] w-[550px] rounded-full bg-cyan-500/10 blur-[180px]" />
      <div className="absolute left-1/2 top-1/2 h-h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] lg:h-[700px] lg:w-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-[220px]" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="
            relative
            z-10
            mx-auto
            flex
            min-h-screen
            max-w-7xl
            items-center
            gap-8
            px-4
            py-6
            sm:px-6
            lg:gap-16
            lg:px-8
            ">

        {/* ================= LEFT ================= */}

        <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="relative hidden flex-1 lg:flex lg:flex-col lg:justify-center"
        >
        {/* Logo */}
        <motion.div
            whileHover={{ scale: 1.03 }}
            className="inline-flex w-fit items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 shadow-lg">
            <HiOutlineChatBubbleLeftRight className="text-3xl text-white" />
            </div>

            <div>
            <h2 className="text-3xl font-bold text-white">
                ChatVerse
            </h2>

            <p className="text-sm text-slate-400">
                Secure Messaging Platform
            </p>
            </div>
        </motion.div>

        {/* Heading */}
        <div className="mt-6">
            <h1 className="max-w-xl text-6xl font-black leading-[1.1] text-white">
            Connect
            <br />

            <span className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">
                without limits.
            </span>
            </h1>

            <p className="mt-4 max-w-lg text-lg leading-8 text-slate-400">
            Chat with friends, collaborate with teams, share files, and make HD
            voice & video calls - all in one secure platform.
            </p>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-4">
            {features.map((feature, index) => (
            <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                delay: index * 0.1,
                }}
                whileHover={{ x: 8 }}
                className="group flex items-start gap-4"
            >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-400 transition-all duration-300 group-hover:bg-fuchsia-500 group-hover:text-white">
                {feature.icon}
                </div>

                <div>
                <h3 className="font-semibold text-white">
                    {feature.title}
                </h3>

                <p className="text-sm leading-6 text-slate-400">
                    {feature.desc}
                </p>
                </div>
            </motion.div>
            ))}
        </div>

        {/* Divider */}
        <div className="my-5 h-px w-full max-w-xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Stats */}
        <div className="flex max-w-xl items-center justify-between">
            <div>
            <h3 className="text-2xl font-bold text-white">
                120K+
            </h3>

            <p className="mt-1 text-xs text-slate-400">
                Active Users
            </p>
            </div>

            <div className="h-10 w-px bg-white/10" />

            <div>
            <h3 className="text-2xl font-bold text-white">
                2M+
            </h3>

            <p className="mt-1 text-xs  text-slate-400">
                Messages
            </p>
            </div>

            <div className="h-10 w-px bg-white/10" />

            <div>
            <h3 className="text-2xl font-bold text-white">
                99.9%
            </h3>

            <p className="mt-1 text-xs text-slate-400">
                Uptime
            </p>
            </div>
        </div>
        </motion.div>

        {/* ================= RIGHT ================= */}

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .7 }}
          className="
            w-full
            max-w-md
            mx-auto
            lg:max-w-none
            lg:w-[620px]
            "
        >

          <div className="
            rounded-3xl
            border
            border-white/10
            bg-slate-900/80
            p-5
            sm:p-7
            lg:p-8
            backdrop-blur-3xl
            shadow-[0_0_60px_rgba(168,85,247,.15)]
            ">

            <h2 className="text-center text-2xl sm:text-3xl font-bold text-white">
              {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
            </h2>

            <p className="
                mt-2
                text-center
                text-sm
                leading-6
                text-slate-400
                sm:text-base
                ">
              {isLogin
                ? "Sign in to continue your conversations."
                : "Create your account and start chatting today."}
            </p>

            {/* Toggle */}

            <div className="mt-4 mb-4 flex rounded-2xl bg-slate-800 p-1">

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsLogin(true)}
                className={`flex-1 rounded-2xl py-3 sm:py-4 text-sm sm:text-base font-bold transition-all duration-300 ${
                  isLogin
                    ? "bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(168,85,247,.45)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                SigIn
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsLogin(false)}
                className={`flex-1 rounded-2xl py-4 text-base font-bold transition-all duration-300 ${
                  !isLogin
                    ? "bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(168,85,247,.45)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Register
              </motion.button>

            </div>

            {/* Form */}

            <AnimatePresence mode="wait">

              {isLogin ? (

                <motion.div
                  key="login"
                  initial={{
                    opacity: 0,
                    x: -35,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: 35,
                  }}
                  transition={{
                    duration: .3,
                  }}
                >
                  <LoginForm />
                </motion.div>

              ) : (

                <motion.div
                  key="register"
                  initial={{
                    opacity: 0,
                    x: 35,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -35,
                  }}
                  transition={{
                    duration: .3,
                  }}
                >
                  <RegisterForm />
                </motion.div>

              )}

            </AnimatePresence>

            {/* Social Login */}

            <SocialLogin />

            {/* Footer */}

            <div className="mt-8 border-t border-white/10 pt-6">

              <p className="text-center text-sm text-slate-400">

                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}

                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: .95,
                  }}
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 font-semibold text-fuchsia-400 transition hover:text-cyan-400 hover:underline"
                >
                  {isLogin
                    ? "Create Account"
                    : "Sign In"}
                </motion.button>

              </p>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-500">

                <button className="transition hover:text-white">
                  Privacy
                </button>

                <span>•</span>

                <button className="transition hover:text-white">
                  Terms
                </button>

                <span>•</span>

                <button className="transition hover:text-white">
                  Support
                </button>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </div>
  );
}
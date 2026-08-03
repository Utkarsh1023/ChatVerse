import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { FaSignInAlt } from "react-icons/fa";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* Background Glow */}
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-10 top-24 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-[120px]"
      />

      <motion.div
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -40, 0], scale: [1.1, 1, 1.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/15 blur-[140px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="relative -translate-y-6 w-full max-w-xl rounded-[16px] border border-slate-700 bg-[#0F172A]/95 px-8 py-6 shadow-[0_0_40px_rgba(168,85,247,.15)] backdrop-blur-3xl"
      >
        <form autoComplete="off" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email or Username
            </label>

            <div className="group flex items-center rounded-2xl border border-slate-700 bg-slate-900/60 px-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-fuchsia-500/50 focus-within:border-fuchsia-500 focus-within:ring-4 focus-within:ring-fuchsia-500/20">
              <FiUser className="text-slate-500 transition group-focus-within:text-fuchsia-400" />

              <input
                type="text"
                name="email"
                placeholder="Enter your email or username"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent px-3 py-3 text-slate-100 placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>

            <div className="group flex items-center rounded-2xl border border-slate-700 bg-slate-900/60 px-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-fuchsia-500/50 focus-within:border-fuchsia-500 focus-within:ring-4 focus-within:ring-fuchsia-500/20">
              <FiLock className="text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent px-3 py-3 text-slate-100 placeholder:text-slate-500 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FiEyeOff className="text-slate-500" />
                ) : (
                  <FiEye className="text-slate-400 hover:text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-fuchsia-500"
              />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="text-sm text-fuchsia-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,.4)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>

            {!loading && (
              <FaSignInAlt
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}


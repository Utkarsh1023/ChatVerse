import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { SiGnuprivacyguard } from "react-icons/si";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation (matches backend zod rules)
    if (name.trim().length < 3) {
      alert("Name must be at least 3 characters");
      return;
    }
    if (username.trim().length < 3) {
      alert("Username must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      alert("Username can only contain letters, numbers and underscores");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });

      navigate("/dashboard");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.fieldErrors?.email?.[0] ||
        err?.message ||
        "Registration failed. Please try again.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="absolute left-16 top-32 h-44 w-44 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="absolute right-24 bottom-24 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-[180px]" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="relative mt-5 mb-5 w-full max-w-2xl rounded-[16px] border border-slate-700 bg-[#0F172A]/95 p-8 shadow-[0_0_40px_rgba(168,85,247,.15)] backdrop-blur-3xl"
      >
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Full Name
            </label>

            <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800 px-4 transition-all duration-300 focus-within:border-fuchsia-500 focus-within:ring-2 focus-within:ring-fuchsia-500/30">
              <FiUser className="text-gray-400" />

              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent px-3 py-3 text-slate-100 placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          {/* Username */}
          <div className="mb-2">
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Username
            </label>

            <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800 px-4 transition-all duration-300 focus-within:border-fuchsia-500 focus-within:ring-2 focus-within:ring-fuchsia-500/30">
              <FiUser className="text-gray-400" />

              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent px-3 py-3 text-slate-100 placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-2">
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Email
            </label>

            <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800 px-4 transition-all duration-300 focus-within:border-fuchsia-500 focus-within:ring-2 focus-within:ring-fuchsia-500/30">
              <FiMail className="text-slate-400" />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent px-3 py-3 text-slate-100 placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                Password
              </label>

              <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800 px-4 transition-all duration-300 focus-within:border-fuchsia-500 focus-within:ring-2 focus-within:ring-fuchsia-500/30">
                <FiLock className="text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent px-3 py-3 text-slate-100 placeholder:text-slate-500 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="text-slate-400" />
                  ) : (
                    <FiEye className="text-slate-400 transition hover:text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                Confirm Password
              </label>

              <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800 px-4 transition-all duration-300 focus-within:border-fuchsia-500 focus-within:ring-2 focus-within:ring-fuchsia-500/30">
                <FiLock className="text-slate-400" />

                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent px-3 py-3 text-slate-100 placeholder:text-slate-500 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <FiEyeOff className="text-slate-400" />
                  ) : (
                    <FiEye className="text-slate-400 transition hover:text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Terms */}
          <label className="mt-3 flex items-center gap-3 text-sm text-slate-400">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-600 text-fuchsia-500 focus:ring-fuchsia-500"
            />
            I agree to the Terms & Privacy Policy
          </label>

          {/* Register Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,.4)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{loading ? "Creating Account..." : "Sign Up"}</span>

            {!loading && (
              <SiGnuprivacyguard
                size={22}
                className="transition-transform duration-300 group-hover:translate-x-2"
              />
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}


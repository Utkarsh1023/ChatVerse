import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { updateProfile, getProfile, updateProfileAvatar } from "../../api/axios";

import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineGlobeAsiaAustralia,
  HiOutlineCamera,
} from "react-icons/hi2";

type InputFieldProps = {
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function InputField({
  icon,
  label,
  name,
  value,
  type = "text",
  onChange,
}: InputFieldProps) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        {icon}
        {label}
      </label>

      <input
        required
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-slate-100"
      />
    </motion.div>
  );
}

export default function AccountSettings() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    country: "",
    bio: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();

        setForm({
          fullName: res.user.fullName ?? "",
          username: res.user.username ?? "",
          email: res.user.email ?? "",
          phone: res.user.phone ?? "",
          country: res.user.country ?? "",
          bio: res.user.bio ?? "",
          avatar: res.user.avatar ?? "",
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSave = async () => {
    const {
      fullName,
      username,
      email,
      phone,
      country,
      bio,
    } = form;

    if (
      !fullName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !country.trim() ||
      !bio.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await updateProfile(form);

      setForm({
        fullName: res.user.fullName ?? "",
        username: res.user.username ?? "",
        email: res.user.email ?? "",
        phone: res.user.phone ?? "",
        country: res.user.country ?? "",
        bio: res.user.bio ?? "",
        avatar: res.user.avatar ?? form.avatar,
      });

      alert("✅ Profile Updated Successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-700 bg-slate-800 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:bg-slate-900 hover:shadow-[0_0_20px_rgba(168,85,247,.15)]">
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white">
            Update Profile
          </h2>

          <p className="mt-2 text-slate-400">
            Update your personal information and profile.
          </p>
        </div>

        {/* Profile Card */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-slate-900/60 p-8">
          <div className="flex flex-col gap-8 lg:flex-row">

            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img
                  src={form.avatar || "https://i.pravatar.cc/300"}
                  alt="Profile"
                  className="h-36 w-36 rounded-full border-4 border-fuchsia-500/30 object-cover shadow-[0_0_35px_rgba(168,85,247,.35)]"
                />

                <label
                  htmlFor="profileImage"
                  className="absolute bottom-2 right-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white shadow-lg transition hover:scale-110"
                >
                  <HiOutlineCamera size={18} />
                </label>

                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setAvatarLoading(true);
                      const res = await updateProfileAvatar(file);
                      setForm((prev) => ({
                        ...prev,
                        avatar: res.user?.avatar ?? "",
                      }));
                      alert("✅ Avatar updated successfully");
                    } catch (err) {
                      console.error(err);
                      alert("❌ Failed to update avatar");
                    } finally {
                      setAvatarLoading(false);
                    }
                  }}
                />
              </motion.div>

              <button
                className="mt-4 text-sm font-medium text-fuchsia-400 hover:text-fuchsia-300"
                disabled={avatarLoading}
              >
                {avatarLoading ? "Uploading..." : "Change Photo"}
              </button>
            </div>

            {/* Details */}
            <div className="grid flex-1 gap-5 md:grid-cols-2">

              <InputField
                icon={<HiOutlineUser />}
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
              />

              <InputField
                icon={<HiOutlineUser />}
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
              />

              <InputField
                icon={<HiOutlineEnvelope />}
                label="Email"
                name="email"
                value={form.email}
                type="email"
                onChange={handleChange}
              />

              <InputField
                icon={<HiOutlinePhone />}
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />

              <div className="md:col-span-2">
                <InputField
                  icon={<HiOutlineGlobeAsiaAustralia />}
                  label="Location"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <HiOutlineUser />
                  Bio
                </label>

                <textarea
                  rows={4}
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-800/80 px-5 py-4 text-white outline-none transition-all duration-300 hover:border-slate-500 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20"
                />
              </div>
              <div className="mt-6 flex w-full items-center justify-center gap-3">
                <motion.button
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 0 30px rgba(168,85,247,.45)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={loading}
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
      disabled:cursor-not-allowed
      disabled:opacity-60
      sm:flex-none
      sm:px-8
      sm:text-base
    "
                >
                  {loading ? "Saving..." : "Save Changes"}
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
                  Cancel
                </motion.button>
              </div>

            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
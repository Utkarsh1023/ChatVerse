import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AccountSettings from "../Setting/AccountSettings";
import {
  FiEdit2,
  FiShare2,
  FiCheckCircle,
  FiSettings,
  FiCamera,
  FiLoader,
} from "react-icons/fi";
import { HiOutlineXMark } from "react-icons/hi2";
import {
  HiOutlineArrowLeft,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { MdCake } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import {
  getProfileStats,
  updateCover,
  getProfileByUsername,
  type UserProfile,
  type StatsResponse,
} from "../../api/profile";

type ProfileHeaderProps = {
  username: string;
};

export default function ProfileHeader({ username }: ProfileHeaderProps) {
  const { user, updateUser } = useAuth();

  // Live profile + stats fetched from the backend (GET /api/profile/:username
  // and GET /api/profile/:username/stats) so the header always shows the
  // selected user — never the authenticated user for someone else's profile.
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<StatsResponse["stats"] | null>(null);
  const [loadError, setLoadError] = useState("");

  // True when the URL username belongs to the logged-in user. Only in this
  // case may we fall back to the AuthContext `user` snapshot.
  const isOwnProfile = Boolean(user?.username && username === user.username);

  // ---- Change cover image state ----
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // 🐞 TRACE: confirm the username received from useParams() in the URL.
      console.log(`[ProfileHeader] useParams username = "${username}"`);

      if (!username || username === "undefined" || username === "null") {
        if (!mounted) return;
        setProfile(null);
        setStats(null);
        setLoadError("User not found");
        return;
      }

      try {
        // 🐞 TRACE: these call GET /api/profile/:username and
        // GET /api/profile/:username/stats — never /profile/me.
        const [profileData, statsData] = await Promise.all([
          getProfileByUsername(username),
          getProfileStats(username),
        ]);

        if (!mounted) return;
        setProfile(profileData);
        setStats(statsData);
        setLoadError("");
      } catch (err) {
        if (!mounted) return;
        setProfile(null);
        setStats(null);
        // CRITICAL: do NOT fall back to the authenticated user here — that
        // would show the logged-in user's profile for every broken URL.
        setLoadError("User not found");
        if (!isOwnProfile) {
          console.error(
            `[ProfileHeader] Failed to load profile for "${username}":`,
            err
          );
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [username, isOwnProfile]);

  // Revoke any pending object URL when the component unmounts.
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  /** Upload the selected cover image to the backend. */
  const handleCoverChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    // Always reset the input so selecting the same file again re-triggers.
    event.target.value = "";

    if (!file) return;

    // Client-side validation before uploading.
    const isImage = /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!isImage) {
      toast.error("Only jpg, jpeg, png and webp images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum allowed size is 5 MB.");
      return;
    }

    // Revoke the previous preview if one exists.
    if (coverPreview) URL.revokeObjectURL(coverPreview);

    // Immediately preview the selected image.
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
    setUploadingCover(true);

    try {
      const updated = await updateCover(file);

      // Replace the preview with the Cloudinary URL returned by the backend.
      setCoverPreview(null);
      setProfile((prev) =>
        prev ? { ...prev, coverImage: updated.coverImage ?? "" } : prev
      );
      // Keep AuthContext synchronized so other pages reflect the new cover.
      updateUser({ coverImage: updated.coverImage ?? "" });

      toast.success("Cover image updated successfully");
    } catch (err) {
      // Upload failed — revert to the previous cover.
      setCoverPreview(null);
      URL.revokeObjectURL(objectUrl);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update cover image";
      toast.error(message);
    } finally {
      setUploadingCover(false);
    }
  };

  // Merge data sources:
  //  - For ANOTHER user's profile: use ONLY the fetched `profile` — never the
  //    AuthContext `user` (that is the bug that showed the logged-in user).
  //  - For the OWN profile: fetched profile wins, fall back to AuthContext.
  const dataSource = isOwnProfile ? user : null;
  const fullName = profile?.fullName || (isOwnProfile ? dataSource?.fullName : "") || "";
  const currentUsername = profile?.username || (isOwnProfile ? dataSource?.username : "") || "";
  const location = profile?.country || (isOwnProfile ? dataSource?.country : "") || "";
  const bio = profile?.bio || (isOwnProfile ? dataSource?.bio : "") || "";
  const avatarSrc = profile?.avatar || (isOwnProfile ? dataSource?.avatar : "") || "";
  // Local object URL preview takes precedence while uploading.
  const coverSrc =
    coverPreview ||
    profile?.coverImage ||
    (isOwnProfile ? dataSource?.coverImage : "") ||
    "/default-cover.jpg";

  // Real counts from the backend; fall back to populated array lengths.
  const statValues = {
    Friends: stats?.friends ?? profile?.friends?.length ?? 0,
    Followers: stats?.followers ?? profile?.followers?.length ?? 0,
    Following: stats?.following ?? profile?.following?.length ?? 0,
    Posts: stats?.posts ?? profile?.posts?.length ?? 0,
  };
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  // "User not found" state — never show the logged-in user's data here.
  if (loadError && !isOwnProfile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-[32px] border border-white/10 bg-slate-900 p-10 text-center shadow-[0_0_50px_rgba(168,85,247,.15)]">
        <div className="text-6xl">🔍</div>
        <h2 className="mt-6 text-2xl font-bold text-white">User not found</h2>
        <p className="mt-2 max-w-sm text-slate-400">
          No account exists for <span className="font-semibold text-fuchsia-400">@{username}</span>.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-6 py-3 font-semibold text-white transition hover:scale-105"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-900 shadow-[0_0_50px_rgba(168,85,247,.15)]"
    >
      {/* ================= COVER ================= */}

      <div className="relative h-64 overflow-hidden">

        <img
          src={coverSrc}
          alt=""
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-black/30" />

        <div className="absolute -left-20 top-10 h-60 w-60 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />

        {/* Back */}

        <Link
          to="/dashboard"
          className="absolute left-6 top-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl transition hover:scale-105 hover:bg-violet-600"
        >
          <HiOutlineArrowLeft className="text-xl text-white" />
        </Link>

        {/* Change Cover — only the owner can edit their cover. */}
        {isOwnProfile && (
        <label
          htmlFor="cover-upload"
          className={`
            absolute bottom-5 right-5 z-10 flex items-center gap-2 rounded-xl
            border border-white/20 px-4 py-2 text-white backdrop-blur-xl
            transition
            ${
              uploadingCover
                ? "pointer-events-none cursor-not-allowed bg-slate-700/60 opacity-80"
                : "cursor-pointer bg-black/40 hover:bg-fuchsia-600"
            }
          `}
        >
          {uploadingCover ? (
            <FiLoader className="animate-spin text-lg" />
          ) : (
            <FiCamera />
          )}
          {uploadingCover ? "Uploading..." : "Cover"}
        </label>
        )}

        {isOwnProfile && (
        <input
          id="cover-upload"
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleCoverChange}
          disabled={uploadingCover}
        />
        )}
      </div>

      {/* ================= PROFILE ================= */}

      <div className="relative px-8 pb-8">

        {/* Avatar */}

        <motion.div
          initial={{ scale: .85 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 170,
          }}
          className="-mt-20"
        >
          <div className="relative inline-block">

            {/* Animated Border */}

            <div className="rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 p-1 shadow-[0_0_35px_rgba(168,85,247,.45)]">

              <img
                src={avatarSrc}
                alt=""
                className="h-40 w-40 rounded-full border-4 border-slate-900 object-cover"
              />
            </div>

            {/* Online */}

            {/* <span className="absolute bottom-5 right-5 h-6 w-6 rounded-full border-4 border-slate-900 bg-emerald-500" /> */}

            {/* Camera */}

             {/* <button className="absolute bottom-2 left-28 flex h-11 w-11 items-center justify-center rounded-full bg-fuchsia-600 text-white shadow-lg transition hover:scale-105">
              <FiCamera />
            </button>  */}
          </div>
        </motion.div>

        {/* ================= CONTENT ================= */}

        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <h1 className="text-4xl font-bold tracking-tight text-white">
                {fullName || "Your Name"}
              </h1>

              <FiCheckCircle className="text-2xl text-sky-500 drop-shadow-[0_0_8px_rgba(59,130,246,.8)]" />

            </div>

            <p className="mt-2 text-lg font-medium text-fuchsia-400">
              @{currentUsername || "username"}
            </p>

            <div className="mt-5 items-center gap-10 text-slate-400">

              <div className="flex items-center gap-2">
                <MdCake className="text-lg text-pink-400" />
                {bio}
              </div>

              <div className="flex items-center gap-2">
                <HiOutlineLocationMarker className="text-lg text-cyan-400" />
                {location}
              </div>

              {/* <div className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-sm text-fuchsia-300">
                B.Tech • IIIT Ranchi
              </div> */}

            </div>

          </div>

          {/* ================= ACTIONS ================= */}

          <div className="flex flex-wrap gap-3">
            {isOwnProfile && (
            <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenEditModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-[0_0_25px_rgba(168,85,247,.4)]"
            >
              <FiEdit2 />
              Edit Profile
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: .95 }}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800 px-6 py-3 text-slate-200 transition hover:border-fuchsia-500 hover:bg-slate-700"
            >
              <FiShare2 />
              Share
            </motion.button>

            <Link to="/dashboard/settings">

              <motion.button
                whileHover={{ scale: 1.05, rotate: 20 }}
                whileTap={{ scale: .95 }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-800 text-slate-300 transition hover:bg-gradient-to-r hover:from-fuchsia-600 hover:to-cyan-500 hover:text-white"
              >
                <FiSettings size={22} />
              </motion.button>

            </Link>
            </>
            )}
          </div>

        </div>
      </div>
      <AnimatePresence>
  {openEditModal && (
    <motion.div
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.25 }}
  onClick={() => setOpenEditModal(false)}
>
  <motion.div
    initial={{ opacity: 0, scale: 0.92, y: 30 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.92, y: 30 }}
    transition={{
      duration: 0.3,
      ease: "easeOut",
    }}
    onClick={(e) => e.stopPropagation()}
    className="
      relative
      w-[95%]
      max-w-5xl
      max-h-[90vh]
      overflow-y-auto
      rounded-3xl
      border
      border-white/10
      bg-slate-900/80
      backdrop-blur-xl
      shadow-2xl
      shadow-violet-500/10
    "
  >
    {/* Close Button */}
    <motion.button
      whileHover={{
        scale: 1.08,
        rotate: 90,
      }}
      whileTap={{
        scale: 0.94,
      }}
      onClick={() => setOpenEditModal(false)}
      className="
        absolute
        right-5
        top-5
        z-20
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-2xl
        border
        border-white/10
        bg-slate-800/80
        text-slate-300
        backdrop-blur-md
        transition-all
        duration-300
        hover:border-red-500/40
        hover:bg-red-500/15
        hover:text-red-400
        hover:shadow-lg
        hover:shadow-red-500/20
      "
      aria-label="Close"
    >
      <HiOutlineXMark className="text-2xl" />
    </motion.button>

    <div className="p-8">
      <AccountSettings
        onClose={() => setOpenEditModal(false)}
      />
    </div>
  </motion.div>
</motion.div>
  )}
</AnimatePresence>
    </motion.div>
    
  );
}
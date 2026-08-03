import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlinePhoto,
  HiOutlineVideoCamera,
  HiOutlineTrash,
  HiOutlineXMark,
} from "react-icons/hi2";
import { useRef, useState } from "react";
import { uploadStory } from "../api/story";
import { useAuth } from "../context/AuthContext";

const MAX_VIDEO_DURATION = 15; // story videos are capped at 15 seconds

interface CreateStoryModalProps {
    open: boolean;
    onClose: () => void;
    /** Called after a successful upload — parent refreshes the grouped list. */
    onUploaded: () => void | Promise<void>;
}

export default function CreateStoryModal({
  open,
  onClose,
  onUploaded,
}: CreateStoryModalProps) {
  const { user } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const preview = file ? URL.createObjectURL(file) : "";
  const avatarSrc = user?.avatar || "";
  const displayName = user?.fullName || user?.name || "Your Story";

  const handleUpload = async () => {
    if (!file || uploading) return;

    setUploading(true);
    try {
      await uploadStory(file, caption);
      setFile(null);
      setCaption("");
      onClose();
      await onUploaded();
    } catch (err) {
      console.error(err);
      alert("Failed to upload story");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-5"
        >
          <motion.div
            initial={{ scale: .9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: .9, opacity: 0 }}
            transition={{ duration: .25 }}
            className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-[#0F172A]/95 shadow-2xl"
          >
            {/* Header */}

            <div className="flex items-center justify-between border-b border-white/10 p-6">

              <div>

                <h2 className="text-2xl font-bold text-white">
                  Create Story
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Share a moment with your friends
                </p>

              </div>

              <button
                onClick={onClose}
                disabled={uploading}
                className="rounded-xl bg-white/5 p-2 text-slate-300 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
              >
                <HiOutlineXMark size={22} />
              </button>

            </div>

            <div className="grid gap-10 p-8 lg:grid-cols-2">

              {/* Preview */}

              <div className="flex justify-center">

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-[9/16] w-64 overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
                >
                  {file ? (
                    file.type.startsWith("image") ? (
                      <img
                        src={preview}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <video
                        src={preview}
                        controls
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-violet-600/20 via-slate-900 to-cyan-500/20">

                      <HiOutlinePhoto
                        size={70}
                        className="text-violet-400"
                      />

                      <p className="mt-5 text-slate-300">
                        Story Preview
                      </p>

                    </div>
                  )}
                </motion.div>

              </div>

              {/* Right */}

              <div className="space-y-6">

                {/* User */}

                <div className="flex items-center gap-4">

                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="h-14 w-14 rounded-full object-cover"
                  />

                  <div>

                    <h3 className="font-semibold text-white">
                      {displayName}
                    </h3>

                    <p className="text-sm text-slate-400">
                      Friends • 24 Hours
                    </p>

                  </div>

                </div>

                {/* Upload */}

                <div className="grid grid-cols-2 gap-4">

                  <button
                    onClick={() =>
                      imageInputRef.current?.click()
                    }
                    disabled={uploading}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-violet-300 transition hover:bg-violet-500 hover:text-white disabled:opacity-50"
                  >
                    <HiOutlinePhoto size={22} />
                    Photo
                  </button>

                  <button
                    onClick={() =>
                      videoInputRef.current?.click()
                    }
                    disabled={uploading}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-300 transition hover:bg-cyan-500 hover:text-white disabled:opacity-50"
                  >
                    <HiOutlineVideoCamera size={22} />
                    Video
                  </button>

                </div>

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      setFile(e.target.files[0]);
                  }}
                />

<input
                  hidden
                  type="file"
                  accept="video/*"
                  ref={videoInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    // Validate video duration ≤ 15 seconds.
                    const video = document.createElement("video");
                    video.preload = "metadata";
                    video.onloadedmetadata = () => {
                      URL.revokeObjectURL(video.src);
                      if (video.duration > MAX_VIDEO_DURATION) {
                        alert(
                          `Video must be ${MAX_VIDEO_DURATION} seconds or less.`
                        );
                        e.target.value = "";
                      } else {
                        setFile(f);
                      }
                    };
                    video.onerror = () => {
                      // If we can't read metadata, allow the file anyway.
                      setFile(f);
                    };
                    video.src = URL.createObjectURL(f);
                  }}
                />

                {/* Caption */}

                <textarea
                  rows={5}
                  maxLength={150}
                  value={caption}
                  onChange={(e) =>
                    setCaption(e.target.value)
                  }
                  placeholder="Write something..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
                />

                <div className="text-right text-xs text-slate-500">
                  {caption.length}/150
                </div>

                {/* Remove */}

                {file && (
                  <button
                    onClick={() => setFile(null)}
                    disabled={uploading}
                    className="flex items-center gap-2 text-red-400 transition hover:text-red-300 disabled:opacity-50"
                  >
                    <HiOutlineTrash />
                    Remove Media
                  </button>
                )}

                {/* Footer */}

                <div className="flex justify-end gap-4 pt-3">

                  <button
                    onClick={onClose}
                    disabled={uploading}
                    className="rounded-xl bg-white/5 px-6 py-3 text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 font-medium text-white transition hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Uploading..." : "Upload Story"}
                  </button>

                </div>

              </div>

            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { HiOutlinePhoto } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { createPost } from "../api/postApi";
interface Props {
  open: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export default function CreatePostModal({
  open,
  onClose,
  onPostCreated,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const onPost = async () => {
    if (!selectedFile || isPosting) return;

    try {
      setIsPosting(true);

      const formData = new FormData();
      // Backend expects multipart field name: "media"
      formData.append("media", selectedFile);

      if (caption.trim()) formData.append("caption", caption.trim());

      const res = await createPost(formData);

      console.log("Post created:", res.data);

      // Refresh the feed
      onPostCreated?.();

      // Reset modal state
      setSelectedFile(null);
      setCaption("");

      // Close modal
      onClose();
    } catch (error: any) {
  console.log("Status:", error.response?.status);
  console.log("Response:", error.response?.data);
  console.log("Message:", error.message);

  alert("Post upload failed. Check console/back-end logs.");

    } finally {
      setIsPosting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (

    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
      />

      {/* Center Container */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.92,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 0.92,
        }}
        transition={{
          duration: 0.3,
        }}
        className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          p-5
        "
      >
        <div
          className="
            w-full
            max-w-2xl
            max-h-[90vh]
            overflow-y-auto
            rounded-3xl
            border
            border-white/10
            bg-[#0F172A]
            p-5
            shadow-[0_0_60px_rgba(168,85,247,.18)]
          "
        >
          {/* ALL YOUR MODAL CONTENT HERE */}
          
            <div className="flex items-center justify-between border-b border-white/10 pb-3">

              <div>

                <h2 className="text-2xl font-bold text-white">
                  Create Post
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Share your thoughts with everyone
                </p>

              </div>

              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="rounded-xl bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                <IoClose size={22} />
              </motion.button>

            </div>

            
            {/* Text Area OR Preview */}

              {!selectedFile ? (
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What's on your mind, Utkarsh?"
                  className="
                    mt-4
                    min-h-[180px]
                    w-full
                    resize-none
                    rounded-2xl
                    bg-transparent
                    text-lg
                    leading-8
                    text-white
                    outline-none
                    placeholder:text-slate-500
                  "
                />
              ) : (
                <>
                {/* Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="
                    mt-4
                    rounded-2xl
                    border
                    border-white/10
                    bg-slate-800
                    p-2
                  "
                >
                  <div className="mb-2 flex items-center justify-between">

                    <p className="text-sm font-medium text-slate-300">
                      Preview
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="rounded-lg px-3 py-1 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      Remove
                    </button>

                  </div>

                  {selectedFile.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="max-h-80 w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <video
                      controls
                      src={URL.createObjectURL(selectedFile)}
                      className="max-h-80 w-full rounded-2xl object-cover"
                    />
                  )}
                  {/* Caption */}
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="
                    mt-2
                    h-166
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-white/10
                    bg-slate-800
                    p-3
                    text-white
                    outline-none
                    transition-all
                    duration-300
                    placeholder:text-slate-500
                    focus:border-fuchsia-500
                    focus:ring-2
                    focus:ring-fuchsia-500/20
                  "
                />
                </motion.div>

                
              </>
            )}
            

            <div className="mt-4 grid grid-cols-2 gap-4">

              {/* Photo */}
              <motion.button
                whileHover={{
                  y: -4,
                  scale: 1.04,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                onClick={() => imageInputRef.current?.click()}
                className="
                  flex
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/10
                  bg-slate-800
                  px-5
                  py-4
                  transition-all
                  duration-300
                  hover:border-fuchsia-500/30
                  hover:bg-slate-700
                "
              >
                <HiOutlinePhoto
                  size={24}
                  className="text-cyan-400"
                />

                <span className="font-medium text-white">
                  Photo
                </span>
              </motion.button>

              {/* Video */}
              <motion.button
                whileHover={{
                  y: -4,
                  scale: 1.04,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                onClick={() => videoInputRef.current?.click()}
                className="
                  flex
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/10
                  bg-slate-800
                  px-5
                  py-4
                  transition-all
                  duration-300
                  hover:border-fuchsia-500/30
                  hover:bg-slate-700
                "
              >
                <MdOutlineSlowMotionVideo
                  size={24}
                  className="text-fuchsia-400"
                />

                <span className="font-medium text-white">
                  Video
                </span>
              </motion.button>

            </div>

            {/* Hidden Inputs */}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />



            {/* Footer */}

            <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row">

              

              <div className="flex gap-3 ">

                <motion.button
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={onClose}
                  className="
                    rounded-2xl
                    border
                    border-slate-700
                    bg-slate-800
                    px-6
                    py-3
                    font-semibold
                    text-slate-300
                    transition
                    hover:bg-slate-700
                    hover:text-white
                  "
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.03,
                    boxShadow:
                      "0 0 30px rgba(168,85,247,.45)",
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={onPost}
                  disabled={!selectedFile || isPosting}
                  className="
                    rounded-2xl
                    bg-gradient-to-r
                    from-fuchsia-600
                    via-violet-600
                    to-cyan-500
                    px-8
                    py-3
                    font-semibold
                    text-white
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >
                   {isPosting ? "Posting..." : "Post"}
                </motion.button>
              </div>

            </div>
        </div>
      </motion.div>
    
    </>
  )}
  </AnimatePresence>
  );
}
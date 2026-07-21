import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineXMark } from "react-icons/hi2";
import { useEffect } from "react";
export interface Story {
  id: number;
  name: string;
  avatar: string;
  isMine?: boolean;
  media?: string;
  type?: "image" | "video";
  createdAt?: string;
}
interface StoryViewerModalProps {
  open: boolean;
  story: Story | null;
  onClose: () => void;
}

export default function StoryViewerModal({
  open,
  story,
  onClose,
}: StoryViewerModalProps) {
  if (!story) return null;
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
        onClose();
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative h-[90vh] w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
          >
            {/* Progress Bar */}
            <div className="absolute left-4 right-4 top-4 z-20 h-1 overflow-hidden rounded-full bg-white/20">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 15, ease: "linear" }}
                className="h-full bg-white"
              />
            </div>

            {/* Header */}
            <div className="absolute left-0 right-0 top-8 z-20 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="h-11 w-11 rounded-full border-2 border-violet-500 object-cover"
                />

                <div>
                  <h3 className="font-semibold text-white">
                    {story.name}
                  </h3>

                  <p className="text-xs text-slate-300">
                    {story.createdAt || "Just now"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-full bg-black/40 p-2 text-white transition hover:bg-red-500"
              >
                <HiOutlineXMark size={22} />
              </button>
            </div>

            {/* Story Content */}
            <div className="flex h-full items-center justify-center bg-black">
              {story.type === "image" ? (
                <img
                  src={story.media}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <video
                  src={story.media}
                  controls={false}
                  autoPlay
                  onEnded={onClose}
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            {/* Bottom Gradient */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
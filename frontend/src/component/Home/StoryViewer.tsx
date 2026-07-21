import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineXMark,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineHeart,
  HiOutlinePaperAirplane,
} from "react-icons/hi2";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function StoryViewer({ open, onClose }: Props) {
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
          />

          {/* Story */}
          <motion.div
            initial={{ scale: .9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: .9, opacity: 0 }}
            transition={{ duration: .3 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
          >
            <div className="relative h-[85vh] w-[420px] overflow-hidden rounded-3xl bg-slate-900">

              {/* Progress */}
              <div className="absolute left-4 right-4 top-4 h-1 rounded-full bg-white/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "70%" }}
                  transition={{ duration: 5 }}
                  className="h-full rounded-full bg-white"
                />
              </div>

              {/* Header */}
              <div className="absolute left-5 right-5 top-8 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <img
                    src="https://i.pravatar.cc/150?img=32"
                    className="h-12 w-12 rounded-full"
                  />

                  <div>
                    <h3 className="font-semibold text-white">
                      Prachi Dubey
                    </h3>

                    <p className="text-sm text-slate-300">
                      5 min ago
                    </p>
                  </div>

                </div>

                <button
                  onClick={onClose}
                  className="rounded-xl bg-black/30 p-2"
                >
                  <HiOutlineXMark className="text-2xl text-white" />
                </button>

              </div>

              {/* Story */}
              <img
                src="https://picsum.photos/500/900"
                className="h-full w-full object-cover"
              />

              {/* Navigation */}
              <button className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3">
                <HiOutlineChevronLeft className="text-2xl text-white" />
              </button>

              <button className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3">
                <HiOutlineChevronRight className="text-2xl text-white" />
              </button>

              {/* Bottom */}
              <div className="absolute bottom-6 left-5 right-5 flex items-center gap-4">

                <input
                  placeholder="Reply..."
                  className="
                    flex-1
                    rounded-full
                    border
                    border-white/20
                    bg-black/30
                    px-5
                    py-3
                    text-white
                    outline-none
                  "
                />

                <button>
                  <HiOutlineHeart className="text-3xl text-white" />
                </button>

                <button>
                  <HiOutlinePaperAirplane className="text-3xl text-white" />
                </button>

              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
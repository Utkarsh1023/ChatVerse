import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineXMark,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineEllipsisHorizontal,
  HiOutlineTrash,
  HiOutlinePlay,
  HiHeart,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import type { StoryGroup } from "../types/story";
import { deleteStory, resolveMediaUrl } from "../api/story";

const IMAGE_DURATION = 5000; // images auto-advance after 5s
const MAX_VIDEO_DURATION = 15; // story videos are capped at 15 seconds

function timeAgo(iso?: string): string {
  if (!iso) return "Just now";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Just now";

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

interface StoryViewerModalProps {
  open: boolean;
  /** All story groups (one circle per user). */
  groups: StoryGroup[];
  /** Which user's circle was clicked — opens the viewer on their stories. */
  initialUserId: string | null;
  /** Logged-in user's id — used to show the delete menu only for the owner. */
  currentUserId: string | null;
  onClose: () => void;
  /** Called after a story is deleted so the parent can refresh the list. */
  onDeleted?: (storyId: string) => void;
  /** Called when the owner taps the "+" add-story button inside the viewer. */
  onCreateStory?: () => void;
}

export default function StoryViewerModal({
  open,
  groups,
  initialUserId,
  currentUserId,
  onClose,
  onDeleted,
  onCreateStory,
}: StoryViewerModalProps) {
  const [groupIdx, setGroupIdx] = useState(0);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // When true, the browser blocked autoplay for the current video story —
  // we show a play button so the user can start it with a real gesture.
  const [playBlocked, setPlayBlocked] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const elapsedRef = useRef(0);
  const lastTimerStoryIdRef = useRef<string | null>(null);
  const groupIdxRef = useRef(groupIdx);
  const storyIdxRef = useRef(storyIdx);

  useEffect(() => {
    groupIdxRef.current = groupIdx;
  }, [groupIdx]);

  useEffect(() => {
    storyIdxRef.current = storyIdx;
  }, [storyIdx]);

  // Reset to the clicked user's circle whenever the viewer is (re)opened.
  useEffect(() => {
    if (open && initialUserId) {
      const idx = groups.findIndex((g) => g.user._id === initialUserId);
      setGroupIdx(idx >= 0 ? idx : 0);
      setStoryIdx(0);
      setProgress(0);
      elapsedRef.current = 0;
      lastTimerStoryIdRef.current = null;
      setPaused(false);
      setShowDeleteMenu(false);
      setConfirmingDelete(false);
      setPlayBlocked(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialUserId]);

  const activeGroup = groups[groupIdx];
  const activeStories = activeGroup?.stories ?? [];
  const activeStory = activeStories[storyIdx];
  // Ownership is determined by the GROUP's user — all stories inside a group
  // belong to the same user. (The grouped API does not repeat `user` on each
  // story item, so we must not read `activeStory.user._id` here.)
  const isOwner = currentUserId
    ? String(activeGroup?.user?._id || "") === String(currentUserId)
    : false;

  const activeDuration =
    activeStory?.type === "video"
      ? MAX_VIDEO_DURATION * 1000
      : IMAGE_DURATION;

  // Move to the next story / next user / close.
  const goNext = useCallback(() => {
    const gIdx = groupIdxRef.current;
    const sIdx = storyIdxRef.current;
    const group = groups[gIdx];

    if (!group) {
      onClose();
      return;
    }

    if (sIdx + 1 < group.stories.length) {
      setStoryIdx(sIdx + 1);
    } else if (gIdx + 1 < groups.length) {
      setGroupIdx(gIdx + 1);
      setStoryIdx(0);
    } else {
      onClose();
    }
  }, [groups, onClose]);

  // Move to the previous story / previous user.
  const goPrev = useCallback(() => {
    const gIdx = groupIdxRef.current;
    const sIdx = storyIdxRef.current;

    if (sIdx > 0) {
      setStoryIdx(sIdx - 1);
    } else if (gIdx > 0) {
      setGroupIdx(gIdx - 1);
      const prevGroup = groups[gIdx - 1];
      setStoryIdx(prevGroup ? Math.max(prevGroup.stories.length - 1, 0) : 0);
    }
  }, [groups]);

  // Reset progress whenever the active story changes.
  useEffect(() => {
    if (!open) return;
    setProgress(0);
    elapsedRef.current = 0;
  }, [open, groupIdx, storyIdx]);

  // Auto-advance timer for IMAGE stories (videos use the onEnded event).
  useEffect(() => {
    if (!open || paused) return;
    const group = groups[groupIdx];
    const story = group?.stories[storyIdx];
    if (!story || story.type === "video") return;

    // When the timer (re)starts for a DIFFERENT story, ignore any leftover
    // elapsed time from the previous story so every image gets its full 5s.
    if (lastTimerStoryIdRef.current !== story._id) {
      elapsedRef.current = 0;
      lastTimerStoryIdRef.current = story._id;
    }

    setProgress((elapsedRef.current / IMAGE_DURATION) * 100);
    const start = Date.now() - elapsedRef.current;

    const interval = window.setInterval(() => {
      const pct = Math.min(((Date.now() - start) / IMAGE_DURATION) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        window.clearInterval(interval);
        elapsedRef.current = 0;
        goNext();
      }
    }, 50);

    return () => {
      window.clearInterval(interval);
      elapsedRef.current = Date.now() - start;
    };
  }, [open, paused, groupIdx, storyIdx, goNext, groups]);

  // Try to autoplay the active video story once it's the current story.
  // Browsers may reject this when the story was reached without a fresh user
  // gesture (e.g. auto-advanced from an image) — in that case we surface a
  // play button (playBlocked) so the user can start it with a real tap.
  // Videos are capped at MAX_VIDEO_DURATION: we auto-advance when the video
  // reaches 15s (or ends naturally, whichever comes first).
  useEffect(() => {
    if (!open) return;
    const group = groups[groupIdx];
    const story = group?.stories[storyIdx];
    if (!story || story.type !== "video") return;

    const video = videoRef.current;
    if (!video) return;

    // Reset the blocked flag for this new video story.
    setPlayBlocked(false);

    paused
? video.pause()
: video.play().catch(()=>{});

    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay was blocked — show the manual play button.
        setPlayBlocked(true);
      });
    };

    if (video.readyState >= 1) {
      tryPlay();
    } else {
      video.addEventListener("loadeddata", tryPlay, { once: true });
      return () => {
        video.removeEventListener("loadeddata", tryPlay);
      };
    }

    // Auto-advance when the video has played for 15 seconds.
    const capInterval = window.setInterval(() => {
      if (video.currentTime >= MAX_VIDEO_DURATION) {
        goNext();
      }
    }, 200);

    return () => {
      window.clearInterval(capInterval);
    };
  }, [open, paused, groupIdx, storyIdx, groups, goNext]);

  // Keyboard navigation.
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        onClose();
      } else if(e.code === "Space"){
        e.preventDefault();
        setPaused(v=>!v);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, goNext, goPrev, onClose]);

  // Safety clamps when the underlying groups change (e.g. after a delete).
  useEffect(() => {
    if (!open) return;
    if (groups.length === 0) {
      onClose();
      return;
    }
    setGroupIdx((prev) => (prev >= groups.length ? groups.length - 1 : prev));
  }, [open, groups.length, onClose]);

  useEffect(() => {
    if (!open) return;
    const group = groups[groupIdx];
    if (!group) return;
    if (group.stories.length === 0) {
      onClose();
      return;
    }
    setStoryIdx((prev) =>
      prev >= group.stories.length ? group.stories.length - 1 : prev
    );
  }, [open, groupIdx, groups, onClose]);

  const handleConfirmDelete = async () => {
    if (!activeStory || deleting) return;

    setDeleting(true);
    try {
      const group = groups[groupIdx];
      const wasLast = group?.stories.length === 1;

      await deleteStory(activeStory._id);
      setShowDeleteMenu(false);
      setConfirmingDelete(false);
      onDeleted?.(activeStory._id);

      if (wasLast) {
        // The user's circle is now empty — close the viewer.
        onClose();
      } else {
        // Continue with the next available story.
        // If we deleted the last index, step back one.
        setStoryIdx((prev) =>
          prev >= (group?.stories.length ?? 0) - 1
            ? Math.max(prev - 1, 0)
            : prev
        );
      }
    } catch (err) {
      console.error("Failed to delete story:", err);
      toast.error("Unable to delete story");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(()=>{

const next=activeStories[storyIdx+1];

if(!next) return;

if(next.type==="image"){

const img=new Image();

img.src=resolveMediaUrl(next.media);

}else{

const video=document.createElement("video");

video.src=resolveMediaUrl(next.media);

}

},[storyIdx]);

  const handleZoneClick = (zone: "prev" | "next") => {
    if (zone === "prev") goPrev();
    else goNext();
  };
  const longPressRef = useRef<number>();
  const handlePointerDown = () => {
  longPressRef.current = window.setTimeout(() => {
    setPaused(true);
  }, 200);
};

const handlePointerUp = () => {
  if (longPressRef.current) {
    clearTimeout(longPressRef.current);
  }

  setPaused(false);
};
const [liked, setLiked] = useState(false);
const [showHeart, setShowHeart] = useState(false);
const handleDoubleClick = () => {
    setLiked(true);
    setShowHeart(true);

    setTimeout(() => {
        setShowHeart(false);
    },700);
}
  return (
    <AnimatePresence>
      {open && activeStory && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onDoubleClick={handleDoubleClick}
        >
          <motion.div
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative h-[90vh] w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* ---------- Media ---------- */}
            <div className="flex h-full items-center justify-center bg-black">
              {activeStory.type === "video" ? (
                <video
                  key={activeStory._id}
                  ref={videoRef}
                  src={resolveMediaUrl(activeStory.media)}
                  autoPlay
                  playsInline
                  preload="auto"
                  onEnded={goNext}
                  onPlay={() => setPlayBlocked(false)}
                  onTimeUpdate={(e) => {
                    const v = e.currentTarget;
                    // Progress is relative to the 15s cap, not the raw file
                    // duration — so the bar fills over exactly 15 seconds.
                    const pct = Math.min(
                      (v.currentTime / MAX_VIDEO_DURATION) * 100,
                      100
                    );
                    setProgress(pct);
                  }}
                  className="h-full w-full object-contain"
                />
              ) : (
                <img
                  src={resolveMediaUrl(activeStory.media)}
                  alt={activeStory.caption || "Story"}
                  className="h-full w-full object-contain"
                />
              )}
              <AnimatePresence>
              {showHeart && (
              <motion.div
              initial={{scale:0,opacity:0}}
              animate={{scale:1.4,opacity:1}}
              exit={{scale:2,opacity:0}}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
              <HiHeart
              className="text-white drop-shadow-2xl"
              size={120}
              />
              </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* ---------- Manual play button (autoplay blocked) ---------- */}
            {activeStory.type === "video" && playBlocked && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <button
                  onClick={() => {
                    const video = videoRef.current;
                    if (!video) return;
                    // Real user gesture → the browser allows playback with sound.
                    video
                      .play()
                      .then(() => setPlayBlocked(false))
                      .catch(() => setPlayBlocked(true));
                  }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition hover:scale-110 hover:bg-white/30"
                  aria-label="Play video story"
                >
                  <HiOutlinePlay size={36} className="ml-1 text-white" />
                </button>
              </div>
            )}

            {/* ---------- Progress bars ---------- */}
            <div className="absolute left-4 right-4 top-4 z-20 flex gap-1">
              {activeStories.map((story, i) => {
                const isActive = i === storyIdx;
                const isPast = i < storyIdx;
                const fill = isPast ? 100 : isActive ? progress : 0;

                return (
                  <div
                    key={story._id}
                    className="h-1 flex-1 overflow-hidden rounded-full bg-white/20"
                  >
                    <motion.div
                      className="h-full rounded-full bg-white"
                      animate={{ width: `${fill}%` }}
                      transition={
                        isActive && activeDuration
                          ? { duration: 0.05 }
                          : { duration: 0.2 }
                      }
                    />
                  </div>
                );
              })}
            </div>

            {/* ---------- Header ---------- */}
            <div className="absolute left-0 right-0 top-8 z-20 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <img
  src={
    activeGroup.user?.avatar
      ? resolveMediaUrl(activeGroup.user.avatar)
      : "/default-avatar.png"
  }
  alt={activeGroup.user?.name || "User"}
  className="h-11 w-11 rounded-full border-2 border-violet-500 object-cover"
/>
                <div>
                  <h3 className="font-semibold text-white">
                    {activeGroup.user.name}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {timeAgo(activeStory.createdAt)} •{" "}
                    <span className="text-slate-400">
                      {storyIdx + 1}/{activeStories.length}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Owner controls */}
                {isOwner && (
                  <div className="relative">
                    <button
                      onClick={() => setShowDeleteMenu((v) => !v)}
                      className="rounded-full bg-black/40 p-2 text-white transition hover:bg-white/20"
                      aria-label="Story options"
                    >
                      <HiOutlineEllipsisHorizontal size={20} />
                    </button>

                    <AnimatePresence>
                      {showDeleteMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
                        >
                          <button
                            onClick={() => setConfirmingDelete(true)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                          >
                            <HiOutlineTrash size={18} />
                            Delete Story
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="rounded-full bg-black/40 p-2 text-white transition hover:bg-red-500"
                  aria-label="Close viewer"
                >
                  <HiOutlineXMark size={22} />
                </button>
              </div>
            </div>

            {/* ---------- Caption (if any) ---------- */}
            {activeStory.caption && (
              <div className="pointer-events-none absolute bottom-6 left-5 right-5 z-10">
                <p className="text-sm text-white/90 drop-shadow-lg">
                  {activeStory.caption}
                </p>
              </div>
            )}

            {/* ---------- Bottom gradient ---------- */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* ---------- Tap zones ---------- */}
            <button
              onClick={() => handleZoneClick("prev")}
              aria-label="Previous story"
              className="absolute inset-y-0 left-0 z-10 w-[35%] cursor-pointer outline-none"
            />
            <button
              onClick={() => handleZoneClick("next")}
              aria-label="Next story"
              className="absolute inset-y-0 right-0 z-10 w-[35%] cursor-pointer outline-none"
            />

            {/* Visible prev/next chevrons */}
            <button
              onClick={() => handleZoneClick("prev")}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
              aria-label="Previous"
            >
              <HiOutlineChevronLeft size={24} />
            </button>
            <button
              onClick={() => handleZoneClick("next")}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
              aria-label="Next"
            >
              <HiOutlineChevronRight size={24} />
            </button>

            {/* ---------- Delete confirmation dialog ---------- */}
            <AnimatePresence>
              {confirmingDelete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                  onClick={() => setConfirmingDelete(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-72 rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
                  >
                    <h3 className="text-lg font-bold text-white">
                      Delete Story?
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      This will permanently remove this story.
                    </p>

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => setConfirmingDelete(false)}
                        className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmDelete}
                        disabled={deleting}
                        className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


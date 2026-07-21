import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { HiOutlinePlus } from "react-icons/hi2";
import type { Story } from "../StoryViewerModal";

interface StoryBarProps {
  stories: Story[];
  onCreateStory: () => void;
  onOpenStory: (story: Story) => void;
}

export default function StoryBar({
  stories,
  onCreateStory,
  onOpenStory,
}: StoryBarProps) {
  const { user } = useAuth();
  const avatarSrc = user?.avatar || "";

  return (
    <section className="mb-8">
      <div
        className="
          flex
          gap-4
          overflow-x-auto
    md:overflow-visible
    scrollbar-hide
    pb-2
        "
      >
        {stories.map((story) => (
          <motion.div
            key={story.id}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (story.isMine && !story.media) {
                onCreateStory();
              } else {
                onOpenStory(story);
              }
            }}
            className="flex min-w-[88px] shrink-0 cursor-pointer flex-col items-center md:shrink"
          >
            {/* Story Ring */}
            <div
              className="
                relative
                rounded-full
                bg-gradient-to-tr
                from-pink-500
                via-violet-500
                to-cyan-400
                p-[3px]
              "
            >
              <div className="rounded-full bg-slate-950 p-[3px]">
                <img
                  src={avatarSrc}
                  alt={story.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              </div>

              {/* My Story */}
              {story.isMine && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateStory();
                  }}
                  className="
                    absolute
                    -bottom-1
                    -right-1
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-r
                    from-violet-600
                    to-cyan-500
                    text-white
                    shadow-lg
                  "
                >
                  <HiOutlinePlus size={14} />
                </button>
              )}

              {/* Online */}
              {!story.isMine && (
                <span
                  className="
                    absolute
                    bottom-1
                    right-1
                    h-3
                    w-3
                    rounded-full
                    border-2
                    border-slate-950
                    bg-green-500
                  "
                />
              )}
            </div>

            <p
              className="
                mt-3
                w-20
                truncate
                text-center
                text-xs
                font-medium
                text-slate-300
              "
            >
              {story.name}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
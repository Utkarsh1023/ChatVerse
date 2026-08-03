import { motion } from "framer-motion";
import { HiOutlinePlus } from "react-icons/hi2";
import type { StoryGroup } from "../../types/story";
import { resolveMediaUrl } from "../../api/story";

interface StoryCardProps {
  group: StoryGroup;
  isMine: boolean;
  /** True when it's the "Your Story" placeholder (no stories uploaded yet). */
  isPlaceholder?: boolean;
  onCreateStory: () => void;
  onOpenStory: (group: StoryGroup) => void;
}

/**
 * A single story circle = ONE user + all their stories grouped.
 * - "Your Story" (no stories): avatar with a large "+" → opens Create modal.
 * - "Your Story" (has stories): latest story as thumbnail + small "+" overlay
 *   (bottom-right). Clicking "+" opens Create modal; clicking elsewhere opens
 *   the viewer.
 * - Other users: ring around avatar → opens the viewer.
 */
export default function StoryCard({
  group,
  isMine,
  isPlaceholder,
  onCreateStory,
  onOpenStory,
}: StoryCardProps) {
  const user = group.user;
  const avatar = resolveMediaUrl(user.avatar || "");
  const latestStory = group.stories[group.stories.length - 1];

  const handleClick = () => {
    if (isMine) {
      if (isPlaceholder) {
        onCreateStory();
      } else {
        onOpenStory(group);
      }
    } else {
      onOpenStory(group);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className="flex min-w-[88px] shrink-0 cursor-pointer flex-col items-center md:shrink"
    >
      {/* Story Ring / Avatar */}
      <div
        className={`
          relative
          rounded-full
          p-[3px]
          ${
            isMine && isPlaceholder
              ? "bg-slate-700"
              : "bg-gradient-to-tr from-pink-500 via-violet-500 to-cyan-400"
          }
        `}
      >
        <div className="rounded-full bg-slate-950 p-[3px]">
          {isMine && isPlaceholder ? (
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-600/40 via-slate-800 to-cyan-500/40">
              <img
                src={avatar}
                alt={user.name}
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />

              {/* Large "+" when the user has NO stories */}
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg">
                <HiOutlinePlus size={22} />
              </span>
            </div>
          ) : (
            <img
              src={
                isMine && latestStory
                  ? resolveMediaUrl(latestStory.media)
                  : avatar
              }
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
        </div>

        {/* Small "+" overlay bottom-right — "Your Story" WITH existing stories */}
        {isMine && !isPlaceholder && (
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
            aria-label="Add to your story"
          >
            <HiOutlinePlus size={14} />
          </button>
        )}

        {/* Online dot for other users */}
        {!isMine && (
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
        {isMine ? "Your Story" : user.name}
      </p>
    </motion.div>
  );
}


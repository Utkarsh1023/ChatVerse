import type { StoryGroup } from "../../types/story";
import { useAuth } from "../../context/AuthContext";
import StoryCard from "./StoryCard";

interface StoryBarProps {
  /** Grouped stories — ONE entry per user. */
  groups: StoryGroup[];
  onCreateStory: () => void;
  onOpenStory: (group: StoryGroup) => void;
}

/**
 * Instagram-style story bar.
 *
 * Renders exactly ONE circle per user:
 *
 *   + Your Story   Alice   Bob   Charlie   David
 *
 * "Your Story" is always shown first (empty → large "+", else latest story
 * thumbnail + small "+" overlay). There are never duplicate circles for the
 * same user.
 */
export default function StoryBar({
  groups,
  onCreateStory,
  onOpenStory,
}: StoryBarProps) {
  const { user } = useAuth();

  const ownUserId = user?.id || "";

  // Build the "Your Story" placeholder group from the logged-in user.
  const myGroup: StoryGroup = {
    user: {
      _id: ownUserId,
      name: user?.fullName || user?.name || "Your Story",
      username: user?.username,
      avatar: user?.avatar || "",
    },
    stories: [],
  };

  const myStoryGroup = groups.find((g) => g.user._id === ownUserId) ?? null;

  // The rest of the users' groups (never includes the logged-in user twice).
  const otherGroups = groups.filter((g) => g.user._id !== ownUserId);

  // A fake group used ONLY for the empty "Your Story" circle.
  const placeholderGroup: StoryGroup = {
    user: myGroup.user,
    stories: [],
  };

  const hasMyStories = Boolean(myStoryGroup && myStoryGroup.stories.length > 0);

  return (
    <section className="mb-2">
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
        {/* "Your Story" — always one circle */}
        {hasMyStories && myStoryGroup ? (
          <StoryCard
            key={`mine-${ownUserId}`}
            group={myStoryGroup}
            isMine
            onCreateStory={onCreateStory}
            onOpenStory={onOpenStory}
          />
        ) : (
          <StoryCard
            key={`placeholder-${ownUserId || "me"}`}
            group={placeholderGroup}
            isMine
            isPlaceholder
            onCreateStory={onCreateStory}
            onOpenStory={onOpenStory}
          />
        )}

        {/* One circle per other user */}
        {otherGroups.map((group) => (
          <StoryCard
            key={group.user._id}
            group={group}
            isMine={false}
            onCreateStory={onCreateStory}
            onOpenStory={onOpenStory}
          />
        ))}
      </div>
    </section>
  );
}


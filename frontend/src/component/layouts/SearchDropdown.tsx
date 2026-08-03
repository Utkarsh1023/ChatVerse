import { motion } from "framer-motion";
import { HiOutlineUserGroup, HiCheckBadge } from "react-icons/hi2";
import type { User } from "../../types/user";

export type SearchDropdownProps = {
  users: User[];
  loading: boolean;
  error: string | null;
  searched: boolean;
  onSelect: (user: User) => void;
};

/** Short, human-readable label shown next to each search result. */
const relationshipLabel = (relationship: User["relationship"]): string => {
  switch (relationship) {
    case "friend":
      return "Friend";
    case "request_sent":
      return "Request Sent";
    case "request_received":
      return "Sent You a Request";
    case "self":
      return "You";
    default:
      return "";
  }
};

/** Tailwind badge styles per relationship. */
const relationshipBadgeClass = (
  relationship: User["relationship"]
): string => {
  switch (relationship) {
    case "friend":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "request_sent":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "request_received":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
    case "self":
      return "border-violet-500/30 bg-violet-500/10 text-violet-300";
    default:
      return "";
  }
};

export default function SearchDropdown({
  users,
  loading,
  error,
  searched,
  onSelect,
}: SearchDropdownProps) {
  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center gap-3 p-8 text-slate-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-cyan-400" />
        <span className="text-sm">Searching...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-sm text-red-400">{error}</div>
    );
  }

  if (!searched) {
    return (
      <div className="flex items-center justify-center gap-2 p-6 text-sm text-slate-400">
        <HiOutlineUserGroup className="text-lg" />
        Type to search users
      </div>
    );
  }

  // Belt & suspenders: never render the logged-in user in the dropdown.
  // The backend already excludes them, but this guards against stale cached
  // payloads or a relationship field that was never populated.
  const visibleUsers = users.filter((u) => u.relationship !== "self");

  if (visibleUsers.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-400">
        No users found
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto py-2">
      {visibleUsers.map((user, i) => {
        const badge = relationshipLabel(user.relationship);
        const badgeClass = relationshipBadgeClass(user.relationship);

        return (
          <motion.button
            key={user._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
            onClick={() => onSelect(user)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/10"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={user.avatar || "https://ui-avatars.com/api/?background=random"}
                alt={user.name}
                className="h-11 w-11 rounded-full object-cover"
              />
              {user.isOnline && (
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-green-500" />
              )}
            </div>

            {/* Name / Username */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-semibold text-white">{user.name}</p>
                {user.isVerified && (
                  <HiCheckBadge className="shrink-0 text-base text-cyan-400" />
                )}
                {badge && (
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${badgeClass}`}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-slate-400">@{user.username}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}


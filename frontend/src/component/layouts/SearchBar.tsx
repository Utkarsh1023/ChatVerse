import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import useDebounce from "../../hooks/useDebounce";
import { searchUsers } from "../../api/chatApi";
import { User } from "../../types/user";
import SearchDropdown from "./SearchDropdown";

export type SearchBarProps = {
  onSelectUser: (user: User) => void;
  placeholder?: string;
};

export default function SearchBar({
  onSelectUser,
  placeholder = "Search users...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 400);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Debounced API call
  useEffect(() => {
    const q = debouncedQuery.trim();

    if (!q) {
      setUsers([]);
      setLoading(false);
      setError(null);
      setOpen(false);
      setSearched(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      setSearched(true);
      setOpen(true);

      try {
        const results = await searchUsers(q);
        if (!cancelled) setUsers(results);
      } catch (err) {
        console.error("Search failed:", err);
        if (!cancelled) {
          setUsers([]);
          setError("Search failed. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (user: User) => {
    onSelectUser(user);
    setQuery("");
    setUsers([]);
    setOpen(false);
    setSearched(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="flex items-center gap-2 rounded-2xl bg-slate-800/80 px-4">
        <HiOutlineMagnifyingGlass className="shrink-0 text-xl text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent px-2 py-3 text-white outline-none placeholder:text-slate-400"
        />
        {loading && (
          <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-500 border-t-cyan-400" />
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50"
          >
            <SearchDropdown
              loading={loading}
              users={users}
              error={error}
              searched={searched}
              onSelect={handleSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


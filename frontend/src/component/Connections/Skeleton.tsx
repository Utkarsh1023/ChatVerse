import { motion } from "framer-motion";

export default function Skeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5"
        >
          <div className="mx-auto h-20 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="mx-auto mt-4 h-4 w-2/3 animate-pulse rounded-lg bg-white/10" />
          <div className="mx-auto mt-2 h-3 w-1/2 animate-pulse rounded-lg bg-white/5" />
          <div className="mt-4 space-y-2">
            <div className="h-9 animate-pulse rounded-xl bg-white/5" />
            <div className="h-9 animate-pulse rounded-xl bg-white/5" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

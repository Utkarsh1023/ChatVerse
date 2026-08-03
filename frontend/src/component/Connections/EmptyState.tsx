import { motion } from "framer-motion";
import { HiOutlineFaceSmile } from "react-icons/hi2";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  icon,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-20 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
        {icon || <HiOutlineFaceSmile className="text-3xl text-slate-500" />}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-400">{description}</p>
    </motion.div>
  );
}

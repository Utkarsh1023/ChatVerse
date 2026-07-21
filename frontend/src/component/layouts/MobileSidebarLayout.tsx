import { ReactNode, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeftOnRectangle } from "react-icons/hi2";

import Sidebar from "./Sidebar";

type MobileSidebarLayoutProps = {
  children: ReactNode;
};

export default function MobileSidebarLayout({ children }: MobileSidebarLayoutProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const portalTarget = useMemo(() => {
    const el = document.getElementById("root");
    return el ?? document.body;
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const backdrop = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        />
      )}
    </AnimatePresence>
  );

  const panel = (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="panel"
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: "tween", duration: 0.25 }}
          className="fixed left-3 top-3 z-50 w-[280px] max-w-[80vw] lg:hidden"
        >
          <Sidebar />
        </motion.aside>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Mobile top back + hamburger */}
      <div className="lg:hidden sticky top-0 z-30">
        <div className="flex items-center justify-between px-3 py-3 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full glass border border-white/10 bg-white/5 text-white flex items-center justify-center"
            aria-label="Back"
          >
            <HiOutlineArrowLeftOnRectangle className="text-xl" />
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOpen(true)}
            className="h-10 w-10 rounded-full glass border border-white/10 bg-white/5 text-white flex items-center justify-center"
            aria-label="Open menu"
          >
            <span className="block w-5">
              <span className="block h-[2px] bg-white/80 rounded mb-1" />
              <span className="block h-[2px] bg-white/80 rounded mb-1" />
              <span className="block h-[2px] bg-white/80 rounded" />
            </span>
          </motion.button>
        </div>
      </div>

      {createPortal(backdrop, portalTarget)}
      {createPortal(panel, portalTarget)}

      {/* Desktop unchanged; mobile gets the top bar above */}
      <div className="lg:pt-0">{children}</div>
    </div>
  );
}

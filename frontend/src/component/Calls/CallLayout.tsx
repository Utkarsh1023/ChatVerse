import { useState } from "react";
import Sidebar from "../layouts/Sidebar";
import CallsHeader from "./CallsHeader";
import CallStats from "./CallStats";
import CallTabs from "./CallTabs";
import CallHistory from "./CallHistory";
import UpcomingMeetings from "./UpcomingMeetings";
import { AnimatePresence, motion } from "framer-motion";
export default function CallsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 p-2">
      <div className="mx-auto h-[calc(100vh-24px)] max-w-full overflow-hidden">
        <div className="flex h-full gap-2 rounded-3xl bg-slate-900/70">

          {/* Sidebar */}
          <div className="hidden shrink-0 lg:block">
            <Sidebar />
          </div>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                />

                {/* Drawer */}
                <motion.div
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 28,
                  }}
                  className="fixed left-0 top-0 z-50 h-screen w-72 lg:hidden"
                >
                  <Sidebar />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex min-w-0 flex-1">

            {/* Calls Section */}
            <div className="ml-2 min-w-0 flex-1">

              <div className="flex h-full flex-col rounded-3xl bg-slate-900/70">

                {/* Header */}
                <CallsHeader />

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">

                  {/* <CallStats /> */}

                  <div className="mt-6">
                    <CallTabs />
                  </div>

                  <div className="mt-8">
                    <CallHistory />
                  </div>

                </div>

              </div>

            </div>

            {/* Right Panel */}
            <div className="ml-2 hidden xl:block">
              <UpcomingMeetings />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
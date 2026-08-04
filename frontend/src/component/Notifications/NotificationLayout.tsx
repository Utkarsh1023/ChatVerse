import Sidebar from "../layouts/Sidebar";
import NotificationsHeader from "./NotificationsHeader";
import NotificationStats from "./NotificationStats";
import NotificationsList from "./NotificationsList";
import RightNotificationPanel from "./RightNotificationPanel"
import MobileBottomNav from "../layouts/MobileBottomNav";
import CreatePostModal from "../CreatePostModel";
import CreateSearchModal from "../CreateSearchModal";
import {useState} from "react";
export default function NotificationsPage() {
    const user = { username: "" };
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  return (  
    <div className="h-screen bg-slate-950 p-2">
  <div className="mx-auto h-full max-w-full overflow-hidden pb-16 lg:pb-0">
        <div className="flex h-full gap-2 overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl">

          {/* Sidebar */}
          <div className="hidden lg:block shrink-0">
            <Sidebar 
              username={user.username}
              onOpenCreatePost={() => setOpenCreatePost(true)}
              onOpenSearch={() => setOpenSearch(true)}
            />
          </div>

          {/* Main Content */}
          <div className="flex min-w-0 flex-1">

            {/* Notifications Section */}
            <div className="ml-2 min-w-0 flex-1">

              <div className="flex h-full flex-col rounded-3xl bg-slate-900/70">

                {/* Header */}
                <NotificationsHeader />

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 pb-16 lg:pb-6">
                    <NotificationsList />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        <div
          className="
            fixed
            inset-x-0
            bottom-0
            z-50
            border-t
            border-slate-800
            bg-slate-900/95
            backdrop-blur-xl
            pb-[env(safe-area-inset-bottom)]
            lg:hidden
          "
        >
          <MobileBottomNav
          onOpenSearch={() => setOpenSearch(true)}
            onOpenCreatePost={() => setOpenCreatePost(true)}
          />
        </div>
        <CreatePostModal
          open={openCreatePost}
          onClose={() => setOpenCreatePost(false)}
        />
        <CreateSearchModal
                  open={openSearch}
                  onClose={() => setOpenSearch(false)}
              />
    </div>
  );
}
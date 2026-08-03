import Sidebar from "../layouts/Sidebar";
import NotificationsHeader from "./NotificationsHeader";
import NotificationStats from "./NotificationStats";
import NotificationsList from "./NotificationsList";
import RightNotificationPanel from "./RightNotificationPanel"
import MobileBottomNav from "../layouts/MobileBottomNav";
import CreatePostModal from "../CreatePostModel";
import {useState} from "react";
export default function NotificationsPage() {
    const user = { username: "" };
  const [openCreatePost, setOpenCreatePost] = useState(false);
  return (  
    <div className="min-h-screen bg-slate-950 p-2">
      <div className="mx-auto h-[calc(100vh-24px)] max-w-full overflow-hidden">
        <div className="flex h-full gap-2 overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl">

          {/* Sidebar */}
          <div className="hidden lg:block shrink-0">
            <Sidebar 
              username={user.username}
              onOpenCreatePost={() => setOpenCreatePost(true)}
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
                <div className="flex-1 overflow-y-auto p-6">

                  <NotificationStats />

                  <div className="mt-8">
                    <NotificationsList />
                  </div>

                </div>

              </div>

            </div>

            {/* Right Panel */}
            <div className="ml-2 hidden xl:block">
              <RightNotificationPanel />
            </div>

          </div>

        </div>
      </div>
      <MobileBottomNav onOpenCreatePost={() => setOpenCreatePost(true)} />
        <CreatePostModal
        open={openCreatePost}
        onClose={() => setOpenCreatePost(false)}
      />
    </div>
  );
}
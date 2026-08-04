import { useState } from "react";
import Sidebar from "../component/layouts/Sidebar";
import MobileBottomNav from "../component/layouts/MobileBottomNav";
import CreatePostModal from "../component/CreatePostModel";
import CreateSearchModal from "../component/CreateSearchModal";
import ConnectionsHeader from "../component/Connections/ConnectionsHeader";
import ConnectionsSections from "../component/Connections/ConnectionsSections";
import { useConnectionsData } from "../component/Connections/useConnectionsData";
import { useAuth } from "../context/AuthContext";

export default function ConnectionsPage() {
  const { user } = useAuth();
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const data = useConnectionsData();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await data.reload();
    } finally {
      setRefreshing(false);
    }
  };

  const stats = data.stats;
  const totalConnections =
    stats.friends + stats.followers + stats.following;

  return (
    <div className="h-screen bg-slate-950 p-2">
  <div className="mx-auto h-full max-w-full overflow-hidden pb-16 lg:pb-0">
        <div className="flex h-full gap-2 overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl">
          {/* Sidebar */}
<div className="hidden shrink-0 lg:block">
            <Sidebar
              username={user?.username}
              onOpenCreatePost={() => setOpenCreatePost(true)}
              onOpenSearch={() => setOpenSearch(true)}
            />
          </div>

          {/* Main */}
            <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">                   <div className="space-y-4 p-1 md:p-2">
              <ConnectionsHeader
                activeTab={data.activeTab}
                onTabChange={data.setActiveTab}
                countFor={data.countFor}
                online={stats.online}
                totalConnections={totalConnections}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />

              <div className="space-y-4">
                <ConnectionsSections data={data} />
              </div>
            </div>
          </main>
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
    onOpenCreatePost={() => setOpenCreatePost(true)}
  />
</div>      <CreatePostModal
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

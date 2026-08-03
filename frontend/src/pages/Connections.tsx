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
    <div className="min-h-screen bg-slate-950 p-2">
      <div className="mx-auto h-[calc(100vh-24px)] max-w-full overflow-hidden">
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
          <main className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-1 md:p-2">
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

<MobileBottomNav onOpenCreatePost={() => setOpenCreatePost(true)} />
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

import { useParams } from "react-router-dom";

import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProfileSocial from "./ProfileSocial";
// import ProfileInfo from "./ProfileInfo";
// import RecentActivity from "./RecentActivity";
import ProfileTabs from "./ProfileTabs";
export default function ProfilePage() {
  const { username = "" } = useParams<{ username: string }>();

  return (
    <div className="min-h-screen bg-bg px-4 py-6">
      <div className="mx-auto w-full max-w-8xl">
        <div className="flex flex-col">
          <ProfileHeader username={username} />
          {/* <ProfileStats username={username} /> */}
          {/* <ProfileInfo username={username} /> */}
          {/* <ProfileSocial username={username} /> */}
          {/* <RecentActivity username={username} /> */}
          <ProfileTabs />
        </div>
      </div>
    </div>
  );
}
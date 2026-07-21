import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileInfo from './ProfileInfo';
import ProfileSocial from './ProfileSocial';
import RecentActivity from './RecentActivity';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto w-full max-w-8xl">
        <div className="flex flex-col">
          <ProfileHeader />
          <ProfileStats />
          {/* <ProfileInfo /> */}
          <ProfileSocial />
          {/* <RecentActivity /> */}
        </div>
      </div>
    </div>
  );
}


import { motion } from "framer-motion";

const tabs = [
  { id: "posts", label: "Posts", count: 42 },
  { id: "friends", label: "Friends", count: 268 },
  { id: "followers", label: "Followers", count: "5.2K" },
  { id: "following", label: "Following", count: 187 },
];

interface Props {
  activeTab: string;
  onChange: (tab: string) => void;
}

export default function ProfileTabs({
  activeTab,
  onChange,
}: Props) {
  return (
    <div className="mt-8 rounded-3xl border border-slate-700 bg-[#0F172A] p-2 shadow-[0_0_30px_rgba(168,85,247,.12)]">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative overflow-hidden rounded-2xl py-4"
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="profile-tab"
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
            )}

            <div className="relative z-10">
              <h3
                className={`text-2xl font-bold ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-slate-100"
                }`}
              >
                {tab.count}
              </h3>

              <p
                className={`text-sm ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-slate-400"
                }`}
              >
                {tab.label}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}




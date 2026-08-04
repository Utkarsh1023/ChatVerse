import { NavLink, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserGroup,
  HiOutlineBell,
  HiMagnifyingGlass,
  HiMiniPlus,
} from "react-icons/hi2";
import { IoSettingsOutline } from "react-icons/io5";
import { useEffect } from "react";
import { useNotificationBadge } from "../../hooks/useNotificationBadge";
type MobileBottomNavProps = {
  onOpenCreatePost: () => void;
  onOpenSearch: ()=> void;
};
export default function MobileBottomNav({onOpenCreatePost, onOpenSearch}: MobileBottomNavProps) {
  const location = useLocation();
  const { unreadCount, clearBadge } = useNotificationBadge();

  // Clear the notification badge whenever the user opens the notifications page.
  useEffect(() => {
    if (location.pathname === "/dashboard/notifications") {
      clearBadge();
    }
  }, [location.pathname, clearBadge]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl p-3 transition-all duration-300 ${
    isActive
      ? "bg-cyan-500/15 text-cyan-400"
      : "text-slate-400 hover:bg-white/10 hover:text-white"
  }`;
    
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-900/95 backdrop-blur lg:hidden">
      <div className="flex h-16 items-center justify-around">
        <NavLink to="/dashboard" end className={linkClass}>
          <HiOutlineHome size={26} />
        </NavLink>

        <NavLink to="/dashboard/chats" className={linkClass}>
          <HiOutlineChatBubbleLeftRight size={26} />
        </NavLink>
        <button
          onClick={onOpenSearch}
          className="
            items-center
            justify-center
            text-slate-400
            
          "
        >
          <HiMagnifyingGlass size={28} />
        </button>
        <button
          onClick={onOpenCreatePost}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg transition hover:scale-110"
        >
          <HiMiniPlus size={30} />
        </button>

        <NavLink to="/dashboard/connections" className={linkClass}>
          <HiOutlineUserGroup size={26} />
        </NavLink>

        <NavLink
          to="/dashboard/notifications"
          className={({ isActive }) =>
            `relative rounded-xl p-2 transition ${
              isActive ? "text-cyan-400" : "text-slate-400"
            }`
          }
        >
          <HiOutlineBell size={26} />

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink to="/dashboard/settings" className={linkClass}>
          <IoSettingsOutline size={26} />
        </NavLink>
      </div>
    </div>
  );
}
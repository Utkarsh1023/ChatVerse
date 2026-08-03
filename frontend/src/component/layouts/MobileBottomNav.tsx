import { NavLink } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserGroup,
  HiOutlineBell,
  HiMiniPlus,
} from "react-icons/hi2";
import { IoSettingsOutline } from "react-icons/io5";
type MobileBottomNavProps = {
  onOpenCreatePost: () => void;
};
export default function MobileBottomNav({onOpenCreatePost}: MobileBottomNavProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-xl p-2 transition ${
      isActive ? "text-cyan-400" : "text-slate-400"
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
          onClick={onOpenCreatePost}
          className="
            
            items-center
            justify-center
            size-26
            text-slate-400
            
          "
        >
          <HiMiniPlus size={28} />
        </button>

        <NavLink to="/dashboard/connections" className={linkClass}>
          <HiOutlineUserGroup size={26} />
        </NavLink>

        <NavLink to="/dashboard/notifications" className={linkClass}>
          <HiOutlineBell size={26} />
        </NavLink>

        <NavLink to="/dashboard/settings" className={linkClass}>
          <IoSettingsOutline size={26} />
        </NavLink>
      </div>
    </div>
  );
}
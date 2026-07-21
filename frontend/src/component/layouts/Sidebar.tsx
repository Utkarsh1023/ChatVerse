import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineHome,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineBell,
  HiOutlineArrowLeftOnRectangle,
} from "react-icons/hi2";
import { IoSettingsOutline } from "react-icons/io5";
import { BsChatSquareHeartFill } from "react-icons/bs";

const menu = [
  {
    title: "Home",
    icon: HiOutlineHome,
    path: "/dashboard",
  },
  {
    title: "Chats",
    icon: HiOutlineChatBubbleLeftRight,
    path: "/dashboard/chats",
    badge: 5,
  },
  {
    title: "Friends",
    icon: HiOutlineUserGroup,
    path: "/dashboard/connections",
  },
  {
    title: "Calls",
    icon: HiOutlinePhone,
    path: "/dashboard/calls",
  },
  {
    title: "Notifications",
    icon: HiOutlineBell,
    path: "/dashboard/notifications",
    badge: 12,
  },
  {
    title: "Settings",
    icon: IoSettingsOutline,
    path: "/settings",
  },
];

export default function Sidebar() {
  const {logout} =useAuth();
  const navigate= useNavigate();
  const { user } = useAuth();

  const displayName = user?.fullName || "";
  const avatarSrc = user?.avatar || "";
  const handleLogout = async () => {
    console.log("Logout clicked");

    try {
      await logout();
      console.log("Logout API success");
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: .5 }}
      className="
      w-24
      rounded-2xl
      border border-white/10
      bg-slate-900/70
      backdrop-blur-xl
      shadow-2xl
      flex
      flex-col
      justify-between
      p-4
      h-full"
    >
      {/* Logo */}

      <div>

        <Link to="/dashboard">
          <motion.div
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-violet-600
              to-cyan-500
              cursor-pointer
            "
          >
            <BsChatSquareHeartFill
              size={24}
              className="text-white"
            />
          </motion.div>
        </Link>

        {/* Menu */}

        <div className="mt-10 flex flex-col gap-2">

          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.title}
                to={item.path}
                end={item.path === "/dashboard"}
              >
                {({ isActive }) => (

                  <motion.div
                    whileHover={{
                      scale: 1.08,
                      x: 5,
                    }}
                    whileTap={{
                      scale: .95,
                    }}
                    className={`
                    relative
                    h-14
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    transition

                    ${
                      isActive
                        ? "bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-600/40"
                        : "hover:bg-white/5"
                    }
                    `}
                  >
                    <Icon
                      size={25}
                      className="text-white"
                    />

                    {item.badge && (
                      <span
                        className="
                        absolute
                        -top-1
                        -right-1
                        h-4
                        w-4
                        rounded-full
                        bg-red-500
                        text-[10px]
                        text-white
                        flex
                        items-center
                        justify-center"
                      >
                        {item.badge}
                      </span>
                    )}

                  </motion.div>

                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom */}

      <div>
        <Link to="/profile">
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-3 text-center"
        >
            {/* Profile Content */}
            <img
            src={avatarSrc}
            alt=""
            className="
            h-12
            w-12
            rounded-2xl
            mx-auto
            border-2
            border-cyan-500"
          />

          <p className="mt-2 text-xs text-white font-semibold">
            {displayName}
          </p>
        </motion.div>
        </Link>

        <motion.button
        
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className="
            mt-4
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/5
            px-4
            py-3
            text-red-400
            transition-all
            duration-300
            hover:border-red-500/40
            hover:bg-red-500/15
            hover:shadow-lg
            hover:shadow-red-500/20
        "
        >
        <HiOutlineArrowLeftOnRectangle
            size={20}
            className="transition-transform duration-300 group-hover:-translate-x-1"
        />
        
        <span className="text-sm font-medium mr-2">
            Logout
        </span>
        </motion.button>

      </div>
    </motion.aside>
  );
}
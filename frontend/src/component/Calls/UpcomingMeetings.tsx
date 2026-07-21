import { motion } from "framer-motion";
import {
  HiOutlineVideoCamera,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlinePlus,
} from "react-icons/hi2";

const meetings = [
  {
    id: 1,
    title: "Frontend Team Meeting",
    time: "10:00 AM",
    date: "Today",
    participants: 8,
  },
  {
    id: 2,
    title: "MERN Project Review",
    time: "2:30 PM",
    date: "Today",
    participants: 5,
  },
  {
    id: 3,
    title: "Hackathon Discussion",
    time: "6:00 PM",
    date: "Tomorrow",
    participants: 12,
  },
];

const recentCalls = [
  {
    id: 1,
    name: "Prachi Dubey",
    avatar: "https://i.pravatar.cc/150?img=32",
    duration: "18 min",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    avatar: "https://i.pravatar.cc/150?img=15",
    duration: "8 min",
  },
  {
    id: 3,
    name: "Ananya Singh",
    avatar: "https://i.pravatar.cc/150?img=25",
    duration: "42 min",
  },
];

export default function UpcomingMeetings() {
  return (
    <aside className="w-[340px] border-l border-white/10 bg-slate-900/60 backdrop-blur-xl">
      <div className="h-screen overflow-y-auto p-6 space-y-6">

        {/* Instant Meeting */}

        <motion.div
          whileHover={{ y: -3 }}
          className="
            rounded-3xl
            border
            border-violet-500/20
            bg-gradient-to-br
            from-violet-600/20
            to-cyan-500/20
            p-6
          "
        >
          <div className="flex items-center gap-3">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600">

              <HiOutlineVideoCamera className="text-2xl text-white" />

            </div>

            <div>

              <h3 className="font-bold text-white">
                Instant Meeting
              </h3>

              <p className="text-sm text-slate-300">
                Start a meeting now
              </p>

            </div>

          </div>

          <button
            className="
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-gradient-to-r
              from-violet-600
              to-cyan-500
              py-3
              font-medium
              text-white
            "
          >
            <HiOutlinePlus />
            Start Meeting
          </button>

        </motion.div>

        {/* Upcoming Meetings */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">

          <div className="mb-5 flex items-center gap-2">

            <HiOutlineCalendarDays className="text-cyan-400 text-xl" />

            <h3 className="font-semibold text-white">
              Upcoming Meetings
            </h3>

          </div>

          <div className="space-y-4">

            {meetings.map((meeting) => (

              <motion.div
                key={meeting.id}
                whileHover={{ x: 4 }}
                className="
                  rounded-2xl
                  bg-white/5
                  p-4
                "
              >

                <h4 className="font-medium text-white">
                  {meeting.title}
                </h4>

                <div className="mt-3 flex items-center justify-between text-sm text-slate-400">

                  <span className="flex items-center gap-1">
                    <HiOutlineClock />
                    {meeting.time}
                  </span>

                  <span>
                    {meeting.date}
                  </span>

                </div>

                <div className="mt-3 flex items-center justify-between">

                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    <HiOutlineUsers />
                    {meeting.participants}
                  </span>

                  <button
                    className="
                      rounded-xl
                      bg-violet-600
                      px-3
                      py-2
                      text-xs
                      text-white
                    "
                  >
                    Join
                  </button>

                </div>

              </motion.div>

            ))}

          </div>

        </div>

        {/* Recent Calls */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">

          <h3 className="mb-5 font-semibold text-white">
            Recent Calls
          </h3>

          <div className="space-y-4">

            {recentCalls.map((call) => (

              <motion.div
                key={call.id}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3"
              >

                <img
                  src={call.avatar}
                  className="h-11 w-11 rounded-full"
                />

                <div className="flex-1">

                  <p className="text-sm font-medium text-white">
                    {call.name}
                  </p>

                  <p className="text-xs text-slate-400">
                    {call.duration}
                  </p>

                </div>

                <button
                  className="
                    rounded-xl
                    bg-emerald-500/20
                    p-2
                    text-emerald-400
                    hover:bg-emerald-500
                    hover:text-white
                    transition
                  "
                >
                  <HiOutlineVideoCamera />
                </button>

              </motion.div>

            ))}

          </div>

        </div>

      </div>
    </aside>
  );
}
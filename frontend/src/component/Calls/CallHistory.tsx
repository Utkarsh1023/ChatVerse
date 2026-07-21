import CallCard from "./CallCard";

const callHistory = {
  today: [
    {
      id: 1,
      name: "Prachi Dubey",
      username: "prachi",
      avatar: "https://i.pravatar.cc/300?img=32",
      type: "outgoing",
      media: "video",
      duration: "18 min",
      time: "09:45 AM",
      online: true,
    },
    {
      id: 2,
      name: "Rahul Sharma",
      username: "rahul",
      avatar: "https://i.pravatar.cc/300?img=15",
      type: "incoming",
      media: "voice",
      duration: "8 min",
      time: "08:15 AM",
      online: false,
    },
  ],

  yesterday: [
    {
      id: 3,
      name: "Ananya Singh",
      username: "ananya",
      avatar: "https://i.pravatar.cc/300?img=25",
      type: "missed",
      media: "voice",
      duration: "--",
      time: "07:30 PM",
      online: true,
    },
    {
      id: 4,
      name: "Aman Kumar",
      username: "aman",
      avatar: "https://i.pravatar.cc/300?img=52",
      type: "incoming",
      media: "video",
      duration: "42 min",
      time: "04:10 PM",
      online: true,
    },
  ],

  earlier: [
    {
      id: 5,
      name: "Sneha Verma",
      username: "sneha",
      avatar: "https://i.pravatar.cc/300?img=44",
      type: "outgoing",
      media: "voice",
      duration: "12 min",
      time: "Monday",
      online: false,
    },
    {
      id: 6,
      name: "Nikhil Raj",
      username: "nikhil",
      avatar: "https://i.pravatar.cc/300?img=11",
      type: "missed",
      media: "video",
      duration: "--",
      time: "Sunday",
      online: true,
    },
  ],
};

export default function CallHistory() {
  return (
    <div className="space-y-10">

      <CallSection title="Today" calls={callHistory.today} />

      <CallSection title="Yesterday" calls={callHistory.yesterday} />

      <CallSection title="Earlier" calls={callHistory.earlier} />

    </div>
  );
}

type SectionProps = {
  title: string;
  calls: any[];
};

function CallSection({ title, calls }: SectionProps) {
  return (
    <section>

      {/* Section Header */}

      <div className="mb-5 flex items-center justify-between">

        <h2 className="text-xl font-bold text-white">
          {title}
        </h2>

        <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-400">
          {calls.length} Calls
        </span>

      </div>

      {/* Cards */}

      <div className="grid gap-5 md:grid-cols-2">

        {calls.map((call) => (
          <CallCard
            key={call.id}
            {...call}
          />
        ))}

      </div>

    </section>
  );
}
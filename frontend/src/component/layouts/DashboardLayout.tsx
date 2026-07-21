import {useState} from "react";
import Sidebar from "./Sidebar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

export default function DashboardLayout() {
  const [activePeerId, setActivePeerId] = useState("user2");

  return (

    <div className="min-h-screen bg-slate-950 p-2 ">

      <div className="mx-auto h-[calc(100vh-24px)] max-w-full overflow-hidden">
        <div className="flex h-full gap-2 overflow-hidden rounded-3xl  bg-slate-900/70 backdrop-blur-xl">
          {/* Sidebar (always visible) */}
          <div className="hidden shrink-0 lg:block">
            <Sidebar />
          </div>

          {/* Chat panels */}
          <div className="flex min-w-0 flex-1">
            {/* Chat List (hide on small screens) */}
            <div className="hidden shrink-0 lg:block">
            <ChatList onSelectConversation={setActivePeerId} />

            </div>

            {/* Chat Window (flexes) */}
            <div className="min-w-0 flex-1 ml-2">
              <ChatWindow activePeerId={activePeerId} />
            </div>


            {/* Right sidebar now controlled by ChatWindow ellipsis button */}
            <div className="hidden shrink-0 xl:block" />

          </div>
        </div>
      </div>
    </div>
  );
}


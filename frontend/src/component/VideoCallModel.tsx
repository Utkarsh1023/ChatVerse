import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  HiOutlineMicrophone,
  HiOutlineSpeakerXMark,
  HiOutlineVideoCamera,
  HiOutlineVideoCameraSlash,
  HiOutlinePhoneXMark
} from "react-icons/hi2";
import { MdScreenShare } from "react-icons/md";
import { IoClose } from "react-icons/io5";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function VideoCallModal({
  open,
  onClose,
}: Props) {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
        useEffect(() => {
    if (!open) return;

    const startCamera = async () => {
        try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        streamRef.current = stream;

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }
        } catch (err) {
        console.error("Camera Error:", err);
        }
    };

    startCamera();

    return () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
    };
    }, [open]);
  return (
    <AnimatePresence>

      {open && (

        <>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: .9,
              y: 40,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: .9,
              y: 40,
            }}
            transition={{
              duration: .3,
            }}
            className="
                fixed
                inset-0
                z-[60]
                flex
                items-center
                justify-center
                p-6
            "
          >

            <div
              className="
                relative
                h-[85vh]
                w-full
                max-w-6xl
                overflow-hidden
                rounded-3xl
                border
                border-white/10
                bg-slate-900
            "
            >

              {/* Header */}

              <div className="flex items-center justify-between border-b border-white/10 p-5">

                <div>

                  <h2 className="text-2xl font-bold text-white">
                    Video Call
                  </h2>

                  <p className="text-slate-400">
                    Calling Rahul Sharma...
                  </p>

                </div>

                <button
                  onClick={onClose}
                  className="rounded-xl bg-slate-800 p-2"
                >
                  <IoClose
                    size={22}
                    className="text-white"
                  />
                </button>

              </div>

              {/* Remote */}

              <div className="relative flex h-[calc(100%-140px)] items-center justify-center bg-slate-950">

                <img
                  src="https://i.pravatar.cc/300?img=15"
                  className="h-40 w-40 rounded-full border-4 border-cyan-500"
                />

                {/* Self */}

                <div
                className="
                    absolute
                    bottom-12
                    right-6
                    h-52
                    w-80
                    overflow-hidden
                    rounded-3xl
                    border
                    border-white/10
                    bg-slate-900
                    shadow-[0_15px_40px_rgba(0,0,0,.45)]
                "
                >
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                />

                {/* You label */}
                <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1 text-sm text-white backdrop-blur">
                    You
                </div>

                {/* Live indicator */}
                <div className="absolute top-3 right-3 flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    LIVE
                </div>
                </div>

              </div>

              {/* Controls */}

              <div className="absolute bottom-0 flex w-full items-center justify-center gap-5 border-t border-white/10 bg-slate-900/80 p-3">

                <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    const enabled = !micOn;
                    setMicOn(enabled);

                    streamRef.current
                    ?.getAudioTracks()
                    .forEach((track) => {
                        track.enabled = enabled;
                    });
                }}
                className={`rounded-full p-4 transition-all ${
                    micOn
                    ? "bg-slate-800 text-white"
                    : "bg-red-500 text-white"
                }`}
                >
                {micOn ? (
                    <HiOutlineMicrophone size={24} />
                ) : (
                    <HiOutlineSpeakerXMark size={24} />
                )}
                </motion.button>

                <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    const enabled = !cameraOn;
                    setCameraOn(enabled);

                    streamRef.current
                    ?.getVideoTracks()
                    .forEach((track) => {
                        track.enabled = enabled;
                    });
                }}
                className={`rounded-full p-4 transition-all ${
                    cameraOn
                    ? "bg-slate-800 text-white"
                    : "bg-red-500 text-white"
                }`}
                >
                {cameraOn ? (
                    <HiOutlineVideoCamera size={24} />
                ) : (
                    <HiOutlineVideoCameraSlash size={24} />
                )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  className="rounded-full bg-slate-800 p-4 text-white"
                >
                  <MdScreenShare size={24} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: .95 }}
                  onClick={onClose}
                  className="
                    rounded-full
                    bg-red-600
                    p-4
                    text-white
                "
                >
                  <HiOutlinePhoneXMark size={24} />
                </motion.button>

              </div>

            </div>

          </motion.div>

        </>
      )}

    </AnimatePresence>
  );
}
import { motion } from "framer-motion";
import {
  HiOutlineQuestionMarkCircle,
  HiOutlineEnvelope,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBookOpen,
  HiOutlinePaperClip,
  HiOutlinePaperAirplane,
} from "react-icons/hi2";

export default function ContactSupport() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
className="rounded-2xl border border-slate-700 bg-slate-800 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:bg-slate-900 hover:shadow-[0_0_20px_rgba(168,85,247,.15)]"    >
      {/* Header */}

      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/10 p-4">
          <HiOutlineQuestionMarkCircle
            size={34}
            className="text-fuchsia-400"
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white">
            Contact Support
          </h2>

          <p className="mt-1 text-slate-400">
            Need assistance? Our support team is here to help.
          </p>
        </div>
      </div>

      {/* Quick Support */}

      <div className="mt-10 grid gap-6 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 text-center">
          <HiOutlineEnvelope
            className="mx-auto text-cyan-400"
            size={34}
          />

          <h3 className="mt-4 text-lg font-semibold text-white">
            Email
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            support@chatapp.com
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 text-center">
          <HiOutlineChatBubbleLeftRight
            className="mx-auto text-fuchsia-400"
            size={34}
          />

          <h3 className="mt-4 text-lg font-semibold text-white">
            Live Chat
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Available 24/7
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 text-center">
          <HiOutlineBookOpen
            className="mx-auto text-emerald-400"
            size={34}
          />

          <h3 className="mt-4 text-lg font-semibold text-white">
            Help Center
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Browse documentation
          </p>
        </div>

      </div>

      {/* Form */}

      <div className="mt-10 rounded-3xl border border-slate-700 bg-slate-900/60 p-8">

        <div className="grid gap-3 md:grid-cols-2">

          <input
            placeholder="Your Name"
            className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-white outline-none focus:border-fuchsia-500"
          />

          <input
            placeholder="Email Address"
            className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-white outline-none focus:border-fuchsia-500"
          />

          <select className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-white outline-none">
            <option>General Question</option>
            <option>Technical Issue</option>
            <option>Bug Report</option>
          </select>

          <select className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-white outline-none">
            <option>Low Priority</option>
            <option>Medium Priority</option>
            <option>High Priority</option>
          </select>

        </div>

        <input
          placeholder="Subject"
          className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-white outline-none focus:border-fuchsia-500"
        />

        <textarea
          rows={2}
          placeholder="Describe your issue..."
          className="mt-3 w-full resize-none rounded-2xl border border-slate-700 bg-slate-800 px-5 py-4 text-white outline-none focus:border-fuchsia-500"
        />

        <button className="mt-5 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-slate-300 hover:border-fuchsia-500/30">
          <HiOutlinePaperClip />
          Attach Screenshot
        </button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: .98 }}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 py-4 font-semibold text-white"
        >
          <HiOutlinePaperAirplane size={20} />
          Send Request
        </motion.button>

      </div>

      {/* FAQ */}

      <div className="mt-4 rounded-3xl border border-slate-700 bg-slate-900/60 p-8">

        <h3 className="text-xl font-semibold text-white">
          Frequently Asked Questions
        </h3>

        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800 p-5">
        <ul className="list-inside list-disc space-y-3">
            <li className="cursor-pointer text-white transition-all duration-300 hover:text-fuchsia-400 hover:underline hover:underline-offset-4">
            How do I recover my account?
            </li>

            <li className="cursor-pointer text-white transition-all duration-300 hover:text-fuchsia-400 hover:underline hover:underline-offset-4">
            Why am I not receiving messages?
            </li>

            <li className="cursor-pointer text-white transition-all duration-300 hover:text-fuchsia-400 hover:underline hover:underline-offset-4">
            How can I change my email address?
            </li>
        </ul>
        </div>
      </div>
    </motion.div>
  );
}
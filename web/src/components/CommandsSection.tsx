import React from "react";

const commands = [
  {
    num: "01",
    name: "send <file>",
    desc: "Stream any file or archive directly to peer with real-time backpressure flow control.",
    badge: "File Transfer",
  },
  {
    num: "02",
    name: "receive <code>",
    desc: "Connect via 6-digit pairing code and verify chunk digests bit-for-bit with SHA-256.",
    badge: "Receiver",
  },
  {
    num: "03",
    name: "clip [send]",
    desc: "Beam system pasteboard or pipe from stdin (`cat token | p2pcopy clip`).",
    badge: "Clipboard Beam",
  },
  {
    num: "04",
    name: "clip get <code>",
    desc: "Receive beamed clipboard directly into pasteboard or stream to stdout.",
    badge: "Clipboard Sync",
  },
  {
    num: "05",
    name: "signal",
    desc: "Host a self-contained ephemeral WebSocket signaling relay on your own server.",
    badge: "Signaling Relay",
  },
  {
    num: "06",
    name: "--ice <url>",
    desc: "Configure custom STUN or TURN relays to traverse strict corporate symmetric NATs.",
    badge: "NAT Traversal",
  },
];

export const CommandsSection: React.FC = () => {
  return (
    <section id="commands" className="scroll-mt-24 border-t border-line py-20 text-left sm:py-28">
      <div>
        {/* Main Section Heading in clean pure raw white */}
        <h2 className="text-3xl sm:text-4xl text-white font-bold tracking-tight">
          Six commands, zero config.
        </h2>
        <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-ink-soft">
          Simple Unix-style verbs designed for muscle memory, shell scripting, and pipeline composition.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {commands.map((cmd) => (
          <div
            key={cmd.num}
            className="rounded-[14px] border border-[#2a2a36] bg-panel p-5 transition-all duration-300 hover:border-[#3e3e52] hover:bg-paper-2 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-[6px] bg-paper-2 border border-line text-ink-soft">
                {cmd.num}
              </span>
              {/* Sub-sub heading badge in emerald */}
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {cmd.badge}
              </span>
            </div>
            {/* Command name kept in raw white */}
            <p className="font-mono text-sm font-semibold text-white mb-1.5">{cmd.name}</p>
            <p className="text-xs sm:text-sm leading-relaxed text-ink-soft">{cmd.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

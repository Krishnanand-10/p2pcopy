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
    badge: "Clipboard",
  },
  {
    num: "04",
    name: "clip get <code>",
    desc: "Receive beamed clipboard directly into pasteboard or stream to stdout.",
    badge: "Sync",
  },
  {
    num: "05",
    name: "signal",
    desc: "Host a self-contained ephemeral WebSocket signaling relay on your own server.",
    badge: "Self-Host",
  },
  {
    num: "06",
    name: "--ice <url>",
    desc: "Configure custom STUN or TURN relays to traverse strict corporate symmetric NATs.",
    badge: "Firewall",
  },
];

export const CommandsSection: React.FC = () => {
  return (
    <section id="commands" className="scroll-mt-24 border-t border-line py-20 text-left sm:py-28">
      <div>
        <h2 className="text-3xl sm:text-4xl text-ink font-semibold tracking-tight">
          Six commands, <span className="serif-italic text-mint font-normal">zero config.</span>
        </h2>
        <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-ink-soft">
          Simple Unix-style verbs designed for muscle memory, shell scripting, and pipeline composition.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {commands.map((cmd) => (
          <div
            key={cmd.num}
            className="rounded-[14px] border border-line bg-panel p-5 transition-colors duration-200 hover:border-line-strong hover:bg-paper-2"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-[6px] bg-paper-2 border border-line text-ink-soft">
                {cmd.num}
              </span>
              <span className="font-mono text-xs text-mint/90 font-medium">
                {cmd.badge}
              </span>
            </div>
            <p className="font-mono text-sm font-semibold text-ink mb-1.5">{cmd.name}</p>
            <p className="text-xs sm:text-sm leading-relaxed text-ink-soft">{cmd.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

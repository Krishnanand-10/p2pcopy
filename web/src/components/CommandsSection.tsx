import React from "react";

const commands = [
  {
    num: "01",
    name: "send <file>",
    desc: "Stream any file or archive directly to peer with real-time backpressure.",
  },
  {
    num: "02",
    name: "receive <code>",
    desc: "Connect via 6-digit pairing code and verify SHA-256 bit-for-bit.",
  },
  {
    num: "03",
    name: "clip [send]",
    desc: "Beam system pasteboard or pipe from stdin (`cat token | p2pcopy clip`).",
  },
  {
    num: "04",
    name: "clip get <code>",
    desc: "Receive beamed clipboard directly into pasteboard or stdout.",
  },
  {
    num: "05",
    name: "signal",
    desc: "Host a self-contained ephemeral signaling server on your own VPS.",
  },
  {
    num: "06",
    name: "--ice <url>",
    desc: "Configure custom STUN or TURN relays for strict corporate firewalls.",
  },
];

export const CommandsSection: React.FC = () => {
  return (
    <section id="commands" className="scroll-mt-24 border-t border-line py-20 text-left sm:py-28">
      <div>
        <h2 className="text-3xl sm:text-4xl text-ink font-normal tracking-tight">
          Six commands, <span className="serif-italic text-mint">zero config.</span>
        </h2>
        <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-ink-soft">
          Simple Unix-style verbs designed for developer muscle memory and pipeline composition.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {commands.map((cmd) => (
          <div
            key={cmd.num}
            className="group relative h-full overflow-hidden rounded-[12px] border border-line bg-panel p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong"
          >
            <span
              aria-hidden="true"
              className="serif-italic pointer-events-none absolute -right-1 -top-4 select-none text-[5.5rem] leading-none text-ink/[0.045] transition-colors duration-300 group-hover:text-ink/[0.08]"
            >
              {cmd.num}
            </span>
            <p className="relative font-mono text-sm font-semibold text-mint">{cmd.name}</p>
            <p className="relative mt-2 text-sm leading-relaxed text-ink-soft">{cmd.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

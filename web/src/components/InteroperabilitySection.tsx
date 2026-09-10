import React from "react";

interface TransferMode {
  source: string;
  dest: string;
  flow: string;
  desc: string;
}

const modes: TransferMode[] = [
  {
    source: "Terminal",
    dest: "Terminal",
    flow: "p2pcopy send ➔ p2pcopy receive",
    desc: "Direct machine-to-machine streaming between developer terminals with zero cloud intermediation.",
  },
  {
    source: "Terminal",
    dest: "Browser",
    flow: "p2pcopy send ➔ Web tab",
    desc: "Beam files or clipboard from a headless remote server directly to a phone or laptop browser.",
  },
  {
    source: "Browser",
    dest: "Terminal",
    flow: "Web tab ➔ p2pcopy receive",
    desc: "Teammates drop files into the browser; you download them straight into your local terminal directory.",
  },
  {
    source: "Browser",
    dest: "Browser",
    flow: "Web tab ➔ Web tab",
    desc: "100% zero-install, direct peer-to-peer web transfers between any two browser tabs or mobile devices.",
  },
];

export const InteroperabilitySection: React.FC = () => {
  return (
    <section id="interoperability" className="scroll-mt-24 border-t border-line py-20 text-left sm:py-28">
      <div>
        {/* Main Section Heading in clean, pure raw white */}
        <h2 className="text-3xl sm:text-4xl text-white font-bold tracking-tight">
          Full Cross-Platform Interoperability
        </h2>

        {/* Raw muted subtext */}
        <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-ink-soft">
          Seamlessly mix and match terminal CLI and web browser in any direction. Zero configuration, zero accounts, and zero cloud storage required on either end.
        </p>

        {/* 4 Transfer Modes mentioned after description */}
        <div className="mt-5 flex items-center gap-2">
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            4 Transfer Modes
          </span>
        </div>
      </div>

      {/* 4 Transfer Modes Grid: Clean, focused on what it is and the description */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modes.map((mode, index) => (
          <div
            key={index}
            className="rounded-[16px] border border-[#2a2a36] bg-panel p-5 hover:border-[#3e3e52] hover:bg-paper-2 transition-all duration-300 shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* What it is */}
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{mode.source}</span>
                <span className="text-emerald-400 font-bold">➔</span>
                <span>{mode.dest}</span>
              </h3>

              {/* Flow Command — kept strictly on a single line */}
              <div className="mt-2.5 inline-block rounded-[6px] border border-line bg-paper-2 px-2 py-0.5 font-mono text-[10px] xl:text-[11px] text-ink whitespace-nowrap">
                {mode.flow}
              </div>

              {/* Description */}
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                {mode.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InteroperabilitySection;

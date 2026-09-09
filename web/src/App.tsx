import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { TerminalDemo } from "./components/TerminalDemo";
import { FeatureGrid } from "./components/FeatureGrid";
import { CommandsSection } from "./components/CommandsSection";
import { WebReceiver } from "./components/WebReceiver";
import { LibrarySection } from "./components/LibrarySection";
import { Copy, Check } from "lucide-react";

export const App: React.FC = () => {
  const [heroCopied, setHeroCopied] = useState(false);
  const [ctaCopied, setCtaCopied] = useState(false);

  const copyCommand = (cmd: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(cmd);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#070708] text-ink flex flex-col selection:bg-mint/20 selection:text-mint">
      {/* Soft Ambient Top Lighting */}
      <div className="fixed inset-0 pointer-events-none ambient-glow z-0" />

      {/* Sticky Header */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 w-full flex-1">
        {/* Hero Section */}
        <section className="flex flex-col items-center pt-20 text-center sm:pt-24">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] text-xs font-mono text-emerald-400 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>v0.1.0 Released on npm</span>
          </div>

          {/* Main Title */}
          <h1 className="mx-auto max-w-[20ch] text-[2.75rem] leading-[1.12] sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink">
            Direct device-to-device <span className="serif-italic text-mint font-normal">streaming</span> from your terminal.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-[54ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            Transfer files and beam clipboards directly between machines with zero cloud storage, no accounts, and end-to-end encryption. Terminal or web browser.
          </p>

          {/* Action Row */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {/* Install Pill */}
            <div className="inline-flex items-center gap-3 rounded-[12px] border border-line bg-paper-2 py-2.5 pl-4 pr-2 font-mono text-sm">
              <span className="text-mint select-none">$</span>
              <span className="select-all font-mono text-ink">npx p2pcopy send &lt;file&gt;</span>
              <button
                type="button"
                onClick={() => copyCommand("npx p2pcopy send <file>", setHeroCopied)}
                aria-label="Copy command"
                className="shrink-0 rounded-[10px] border border-line p-2 text-ink-faint transition-colors duration-300 hover:border-line-strong hover:text-ink active:scale-[0.96]"
              >
                {heroCopied ? (
                  <Check className="h-3.5 w-3.5 text-mint" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Secondary CTA */}
            <a
              href="#receiver"
              className="rounded-[11px] border border-line-strong px-5 py-3 text-sm font-medium text-ink transition-colors duration-300 hover:bg-paper-2"
            >
              Try Web Receiver
            </a>
          </div>

          {/* Interactive Hero Terminal */}
          <div className="mt-14 w-full flex justify-center">
            <TerminalDemo />
          </div>
        </section>

        {/* Feature Grid */}
        <FeatureGrid />

        {/* Commands List */}
        <CommandsSection />

        {/* In-Browser Web Receiver */}
        <WebReceiver />

        {/* Typed Library */}
        <LibrarySection />

        {/* Bottom CTA Banner */}
        <section className="pb-24 pt-10 sm:pb-28">
          <div className="relative overflow-hidden rounded-[24px] border border-line bg-panel px-8 py-16 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-44"
              style={{
                background:
                  "radial-gradient(460px 180px at 50% 0, rgba(84, 214, 166, 0.1), transparent 70%)",
              }}
            />

            <h2 className="mt-2 text-3xl leading-[1.15] sm:text-4xl text-ink font-semibold tracking-tight">
              One command <span className="serif-italic text-mint font-normal">away.</span>
            </h2>

            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-3 rounded-[12px] border border-line bg-paper-2 py-2.5 pl-4 pr-2 font-mono text-sm">
                <span className="text-mint select-none">$</span>
                <span className="select-all font-mono text-ink">npm install -g p2pcopy</span>
                <button
                  type="button"
                  onClick={() => copyCommand("npm install -g p2pcopy", setCtaCopied)}
                  aria-label="Copy install command"
                  className="shrink-0 rounded-[10px] border border-line p-2 text-ink-faint transition-colors duration-300 hover:border-line-strong hover:text-ink active:scale-[0.96]"
                >
                  {ctaCopied ? (
                    <Check className="h-3.5 w-3.5 text-mint" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <p className="mt-5 text-sm text-ink-faint">
              Node 18+, Windows, macOS, Linux, and modern web browsers. Zero configuration.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col justify-between gap-8 sm:flex-row items-center sm:items-start text-center sm:text-left">
            <div>
              <p className="flex items-center justify-center sm:justify-start gap-2.5 font-mono text-sm font-semibold text-ink">
                <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true">
                  <rect width="64" height="64" rx="16" fill="#0c0c0f" />
                  <rect
                    x="1.5"
                    y="1.5"
                    width="61"
                    height="61"
                    rx="14.5"
                    fill="none"
                    stroke="#2c2c33"
                    strokeWidth="3"
                  />
                  <path
                    d="M27 23 L43 32 L27 41 Z"
                    fill="#54d6a6"
                    stroke="#54d6a6"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <span>p2pcopy</span>
              </p>
              <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-ink-soft">
                Zero-cloud, direct device-to-device file streaming and clipboard sync over WebRTC DataChannels.
              </p>
            </div>

            <div className="flex gap-12 text-sm">
              <div>
                <p className="font-medium text-ink">Project</p>
                <ul className="mt-3 space-y-2 text-ink-soft">
                  <li>
                    <a
                      href="https://www.npmjs.com/package/p2pcopy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors duration-300 hover:text-ink"
                    >
                      npm package
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/Krishnanand-10/p2pcopy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors duration-300 hover:text-ink"
                    >
                      GitHub repository
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="transition-colors duration-300 hover:text-ink">
                      Features
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-ink">Protocol</p>
                <ul className="mt-3 space-y-2 text-ink-soft">
                  <li>WebRTC DTLS 1.3</li>
                  <li>SCTP DataChannel</li>
                  <li>SHA-256 Checksum</li>
                  <li>STUN / TURN Relay</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-line text-xs text-ink-faint flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>MIT License © 2026 Krishna Tiwari</span>
            <span>All transfers encrypted end-to-end</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
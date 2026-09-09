import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { DualTerminal } from "./components/DualTerminal";
import { BentoGrid } from "./components/BentoGrid";
import { Copy, Check, Terminal, Shield, Zap, Lock, Cpu, Globe, ArrowRight } from "lucide-react";

export const App: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    navigator.clipboard.writeText("npx p2pcopy receive <pairing-code>");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-obsidian text-zinc-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Background ambient lighting and grid */}
      <div className="fixed inset-0 pointer-events-none ambient-glow z-0" />
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-60 z-0" />

      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center max-w-6xl mx-auto w-full">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-mono text-cyan-300 mb-8 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>v0.1.0 Now Published Globally on npm</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1]">
          Zero-cloud, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">encrypted</span> terminal file & clipboard sharing.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-zinc-400 max-w-2xl leading-relaxed font-light">
          Transfer files and clipboard contents directly between any two computers over WebRTC. No cloud storage, no accounts, no uploads.
        </p>

        {/* 1-Click NPX Command Box */}
        <div className="mt-8 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-md">
          <span className="text-zinc-500 font-mono text-sm select-none">$</span>
          <code className="text-xs sm:text-sm font-mono text-cyan-300 font-semibold tracking-wide">
            npx p2pcopy receive &lt;pairing-code&gt;
          </code>
          <button
            onClick={copyInstall}
            className="ml-2 p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
            title="Copy command"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Interactive Dual Terminal Simulator */}
        <section id="demo" className="w-full">
          <DualTerminal />
        </section>

        {/* Bento Grid Feature Matrix */}
        <BentoGrid />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>MIT Licensed © 2026 Krishna Tiwari</span>
          <span>WebRTC DTLS/SCTP • End-to-End Encrypted</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
import React from "react";
import { Navbar } from "./components/Navbar";
import { Terminal, Shield, Zap, Lock, Cpu, Globe } from "lucide-react";

export const App: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-obsidian text-zinc-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Background ambient lighting and grid */}
      <div className="fixed inset-0 pointer-events-none ambient-glow z-0" />
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-60 z-0" />

      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24 text-center max-w-5xl mx-auto">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-mono text-cyan-300 mb-8 shadow-sm">
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
        <div className="mt-10 inline-flex items-center gap-4 px-5 py-3 rounded-xl border border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-md">
          <span className="text-zinc-500 font-mono text-sm select-none">$</span>
          <code className="text-sm sm:text-base font-mono text-cyan-300 font-semibold tracking-wide">
            npx p2pcopy receive &lt;pairing-code&gt;
          </code>
        </div>
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
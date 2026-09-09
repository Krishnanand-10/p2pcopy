import React from "react";
import { Terminal, Github, ExternalLink, ShieldCheck, Zap } from "lucide-react";

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-obsidian/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400/60 transition-all shadow-lg shadow-cyan-950/40">
            <Zap className="h-5 w-5" />
          </div>
          <span className="font-mono text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            p2pcopy
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              v0.1.0
            </span>
          </span>
        </a>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#demo" className="hover:text-white transition-colors">
            Interactive CLI
          </a>
          <a href="#receiver" className="hover:text-white transition-colors flex items-center gap-2">
            <span>Web Receiver</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </a>
          <a href="#architecture" className="hover:text-white transition-colors">
            Architecture
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* NPM Badge */}
          <a
            href="https://www.npmjs.com/package/p2pcopy"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs font-mono text-zinc-300 hover:border-cyan-500/40 hover:text-white transition-all"
          >
            <span className="h-2 w-2 rounded-full bg-red-500" />
            npm package
          </a>

          {/* GitHub Star Button */}
          <a
            href="https://github.com/Krishnanand-10/p2pcopy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-sm"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
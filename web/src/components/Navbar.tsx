import React from "react";
import { Github } from "lucide-react";

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Unique P2P Peer Transfer Logo */}
        <a href="#" className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-tight text-white group">
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#0e0e13" stroke="#22222b" strokeWidth="1.5" />
            <path d="M8 12h11M15 8l4 4-4 4" stroke="#00d2ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 20H13M17 16l-4 4 4 4" stroke="#00d2ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-white font-bold tracking-tight">p2pcopy</span>
        </a>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 text-sm text-ink-soft sm:gap-6">
          <a href="#features" className="hidden transition-colors duration-300 hover:text-white sm:block">
            Features
          </a>
          <a href="#commands" className="hidden transition-colors duration-300 hover:text-white sm:block">
            Commands
          </a>
          <a href="#receiver" className="hidden transition-colors duration-300 hover:text-white sm:block">
            Web Receiver
          </a>
          <a href="#library" className="hidden transition-colors duration-300 hover:text-white md:block">
            Library
          </a>

          {/* NPM Badge */}
          <a
            href="https://www.npmjs.com/package/p2pcopy"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[10px] bg-neon px-4 py-2 text-sm font-semibold text-black transition-opacity duration-300 hover:opacity-90 shadow-sm"
          >
            npm
          </a>

          {/* GitHub Link */}
          <a
            href="https://github.com/Krishnanand-10/p2pcopy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-ink-soft transition-colors duration-300 hover:border-line-strong hover:bg-paper-2 hover:text-white"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </nav>
    </header>
  );
};
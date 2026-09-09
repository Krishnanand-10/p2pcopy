import React from "react";
import { Github } from "lucide-react";

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-tight text-ink">
          <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <rect width="64" height="64" rx="16" fill="#0c0c0f"></rect>
            <rect x="1.5" y="1.5" width="61" height="61" rx="14.5" fill="none" stroke="#2c2c33" strokeWidth="3"></rect>
            <path d="M27 23 L43 32 L27 41 Z" fill="#54d6a6" stroke="#54d6a6" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"></path>
          </svg>
          <span>p2pcopy</span>
        </a>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 text-sm text-ink-soft sm:gap-6">
          <a href="#features" className="hidden transition-colors duration-300 hover:text-ink sm:block">
            Features
          </a>
          <a href="#commands" className="hidden transition-colors duration-300 hover:text-ink sm:block">
            Commands
          </a>
          <a href="#receiver" className="hidden transition-colors duration-300 hover:text-ink sm:block">
            Web Receiver
          </a>
          <a href="#library" className="hidden transition-colors duration-300 hover:text-ink md:block">
            Library
          </a>

          {/* NPM Badge */}
          <a
            href="https://www.npmjs.com/package/p2pcopy"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[11px] bg-signal px-4 py-2 text-sm font-semibold text-signal-contrast transition-opacity duration-300 hover:opacity-90"
          >
            npm
          </a>

          {/* GitHub Link */}
          <a
            href="https://github.com/Krishnanand-10/p2pcopy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-ink-soft transition-colors duration-300 hover:bg-paper-2 hover:text-ink"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </nav>
    </header>
  );
};
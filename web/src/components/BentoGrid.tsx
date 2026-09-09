import React from "react";
import { Shield, Lock, Cpu, Globe, Zap, HardDrive, CheckCircle2, ArrowRight, Server, Radio, Key } from "lucide-react";

export const BentoGrid: React.FC = () => {
  return (
    <section id="features" className="w-full max-w-6xl mx-auto py-16 px-2 text-left">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-zinc-400 mb-4">
          <Zap className="h-3.5 w-3.5 text-cyan-400" />
          <span>Engineered for Reliability & Privacy</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Everything the cloud upload sites do,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
            minus the cloud.
          </span>
        </h2>
        <p className="mt-4 text-zinc-400 text-base sm:text-lg font-light">
          Built on WebRTC DataChannels with DTLS end-to-end encryption. No cloud buckets, no accounts, and zero file retention.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Zero Cloud Storage (Span 2) */}
        <div className="lg:col-span-2 glass-panel glass-panel-hover rounded-2xl p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Lock className="h-5 w-5" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                DTLS 1.3 / SCTP End-to-End Encryption
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Zero Cloud Storage. Pure Direct Streaming.
            </h3>
            <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl font-light">
              Unlike WeTransfer, Dropbox, or Google Drive, your files never touch a storage bucket. The ephemeral signaling server only brokers the initial handshake; all payloads stream device-to-device with military-grade DTLS encryption.
            </p>
          </div>

          {/* Visual Architecture Diagram inside Card */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-3 items-center text-center font-mono text-xs text-zinc-400 gap-2">
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-white/10">
              <div className="text-white font-semibold flex items-center justify-center gap-1.5 mb-1">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Sender
              </div>
              <span className="text-[11px] text-zinc-500">Local Disk / RAM</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                <Lock className="h-3 w-3" /> E2EE WebRTC
              </span>
              <div className="w-full h-0.5 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500 relative">
                <div className="absolute inset-0 bg-cyan-400 animate-pulse" />
              </div>
              <span className="text-[10px] text-zinc-500 mt-1">Zero Intermediate Cloud</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/90 border border-white/10">
              <div className="text-white font-semibold flex items-center justify-center gap-1.5 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Receiver
              </div>
              <span className="text-[11px] text-zinc-500">Destination Disk</span>
            </div>
          </div>
        </div>

        {/* Card 2: Instant Clipboard Beam */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Radio className="h-5 w-5" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                Developer Ergonomics
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Terminal Clipboard Beam
            </h3>
            <p className="mt-3 text-zinc-400 text-sm leading-relaxed font-light">
              Stop pasting sensitive SSH keys, tokens, or hashes into Slack or Discord. Pipe any command output directly to peer:
            </p>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-zinc-950 border border-white/10 font-mono text-xs text-zinc-300">
            <div className="text-zinc-500 text-[11px] mb-1"># Pipe SSH key directly:</div>
            <div className="text-emerald-300">$ cat id_rsa.pub | p2pcopy clip</div>
          </div>
        </div>

        {/* Card 3: Backpressure & Low Memory */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-violet-400 font-semibold">
                Resource Optimization
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Backpressure Controlled
            </h3>
            <p className="mt-3 text-zinc-400 text-sm leading-relaxed font-light">
              Transfer 50GB files using only ~1MB of RAM. Backpressure thresholds pause disk reading when the network buffer fills, eliminating memory bloat.
            </p>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-zinc-950 border border-white/10 font-mono text-xs flex justify-between items-center">
            <span className="text-zinc-400">Memory Footprint:</span>
            <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              ~1.2 MB RAM
            </span>
          </div>
        </div>

        {/* Card 4: SHA-256 Verification */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
                Integrity Guaranteed
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Automated SHA-256 Checksums
            </h3>
            <p className="mt-3 text-zinc-400 text-sm leading-relaxed font-light">
              Every transmission computes cryptographic hashes on the fly. Receiver verifies the chunk digest before flushing to disk, rejecting corrupted packets.
            </p>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-zinc-950 border border-white/10 font-mono text-xs text-zinc-400 flex items-center justify-between">
            <span>Integrity Check:</span>
            <span className="text-amber-300 font-semibold flex items-center gap-1">
              <Key className="h-3 w-3" /> Bit-for-Bit Match
            </span>
          </div>
        </div>

        {/* Card 5: NAT & TURN Resilience */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Globe className="h-5 w-5" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                NAT Traversal Spectrum
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              STUN + TURN Resilience
            </h3>
            <p className="mt-3 text-zinc-400 text-sm leading-relaxed font-light">
              Automatic STUN hole-punching for ~85% of home routers. Behind strict enterprise symmetric NATs? Quietly falls back to blind TURN relays while preserving 100% E2EE.
            </p>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-zinc-950 border border-white/10 font-mono text-xs text-zinc-400 flex items-center justify-between">
            <span>Fallback Mode:</span>
            <span className="text-cyan-300 font-semibold">Blind Relay Supported</span>
          </div>
        </div>
      </div>
    </section>
  );
};
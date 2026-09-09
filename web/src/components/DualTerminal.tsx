import React, { useState, useEffect } from "react";
import { Terminal, Copy, Check, RotateCcw, FileBox, Clipboard, ArrowRight } from "lucide-react";

export const DualTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"file" | "clip">("file");
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulation timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (step === 0) {
      setProgress(0);
      timer = setTimeout(() => setStep(1), 600);
    } else if (step === 1) {
      // Sender generates code
      timer = setTimeout(() => setStep(2), 1200);
    } else if (step === 2) {
      // Receiver runs command
      timer = setTimeout(() => setStep(3), 1400);
    } else if (step === 3) {
      // WebRTC connects & starts streaming
      timer = setTimeout(() => setStep(4), 800);
    } else if (step === 4) {
      // Progress increment
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep(5);
            return 100;
          }
          return prev + 12;
        });
      }, 150);
      return () => clearInterval(interval);
    } else if (step === 5) {
      // Completed, pause before loop
      timer = setTimeout(() => {
        setStep(0);
      }, 7000);
    }

    return () => clearTimeout(timer);
  }, [step, activeTab]);

  const handleCopyCommand = () => {
    const cmd = activeTab === "file" ? "npx p2pcopy receive 842-194" : "npx p2pcopy clip get 842-194";
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep(0);
    setProgress(0);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 mb-20 text-left">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 px-2">
        {/* Tab switcher */}
        <div className="inline-flex p-1 rounded-xl bg-zinc-900/90 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => {
              setActiveTab("file");
              handleReset();
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === "file"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileBox className="h-3.5 w-3.5" />
            <span>File Transfer (42.5 MB)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("clip");
              handleReset();
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === "clip"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Clipboard className="h-3.5 w-3.5" />
            <span>Instant Clipboard Sync</span>
          </button>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-900/70 hover:bg-zinc-800 text-xs font-mono text-zinc-400 hover:text-white transition-all"
            title="Replay animation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Replay</span>
          </button>

          <button
            onClick={handleCopyCommand}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-mono text-cyan-300 font-medium transition-all shadow-sm"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied!" : "Copy Receiver Command"}</span>
          </button>
        </div>
      </div>

      {/* Dual Terminal Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Terminal 1: SENDER */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/90 shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col h-[380px]">
          {/* Window Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-xs text-zinc-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                alice@laptop ~ (Sender)
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">macOS</span>
          </div>

          {/* Terminal Content */}
          <div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed text-zinc-300 flex-1 overflow-y-auto">
            {activeTab === "file" ? (
              <>
                <div className="flex items-center gap-2 text-zinc-100">
                  <span className="text-cyan-400 font-bold">$</span>
                  <span>p2pcopy send archive.tar.gz</span>
                </div>

                {step >= 1 && (
                  <div className="mt-2 text-zinc-400 space-y-1">
                    <div className="text-cyan-300">ℹ Computing SHA-256 checksum for archive.tar.gz (42.5 MB)...</div>
                    <div className="text-emerald-400">✔ SHA-256: 8a4f91e...c218</div>
                    <div className="text-zinc-500">ℹ Connecting to signaling relay wss://p2pcopy.onrender.com...</div>
                  </div>
                )}

                {step >= 2 && (
                  <div className="mt-3 p-2.5 rounded-lg border border-yellow-500/30 bg-yellow-500/[0.04] text-yellow-300 text-xs">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>🔑 PAIRING CODE:</span>
                      <span className="text-emerald-400 font-bold text-sm tracking-wider">842-194</span>
                    </div>
                    <div className="text-zinc-400 mt-1">Run on receiving machine:</div>
                    <div className="text-cyan-300 font-semibold">&gt; npx p2pcopy receive 842-194</div>
                  </div>
                )}

                {step >= 3 && (
                  <div className="mt-3 space-y-1">
                    <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span>✔</span> WebRTC DataChannel connected (E2EE active via DTLS)!
                    </div>
                    {step >= 4 && (
                      <div className="text-cyan-300">
                        {step === 5 ? "✔ File archive.tar.gz sent and verified by receiver!" : "Streaming 64KB SCTP chunks with backpressure..."}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-zinc-100">
                  <span className="text-emerald-400 font-bold">$</span>
                  <span>cat ~/.ssh/id_ed25519.pub | p2pcopy clip</span>
                </div>

                {step >= 1 && (
                  <div className="mt-2 text-zinc-400 space-y-1">
                    <div className="text-cyan-300">ℹ Captured stdin buffer (104 chars)</div>
                    <div className="text-zinc-500">ℹ Connecting to signaling relay wss://p2pcopy.onrender.com...</div>
                  </div>
                )}

                {step >= 2 && (
                  <div className="mt-3 p-2.5 rounded-lg border border-yellow-500/30 bg-yellow-500/[0.04] text-yellow-300 text-xs">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>🔑 PAIRING CODE:</span>
                      <span className="text-emerald-400 font-bold text-sm tracking-wider">842-194</span>
                    </div>
                    <div className="text-zinc-400 mt-1">Receiver command:</div>
                    <div className="text-cyan-300 font-semibold">&gt; npx p2pcopy clip get 842-194</div>
                  </div>
                )}

                {step >= 3 && (
                  <div className="mt-3 space-y-1">
                    <div className="text-emerald-400 font-semibold">✔ WebRTC DataChannel connected (E2EE active)!</div>
                    {step >= 4 && <div className="text-cyan-300">Streaming clipboard payload...</div>}
                    {step >= 5 && <div className="text-emerald-400 font-semibold">✔ Receiver received and copied content to clipboard!</div>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Terminal 2: RECEIVER */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/90 shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col h-[380px]">
          {/* Window Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-xs text-zinc-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                bob@thinkpad:~$ (Receiver)
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Linux / Windows</span>
          </div>

          {/* Terminal Content */}
          <div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed text-zinc-300 flex-1 overflow-y-auto">
            {step < 2 ? (
              <div className="text-zinc-600 italic mt-6 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-zinc-700 animate-pulse" />
                Waiting for sender to broadcast pairing code...
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-zinc-100">
                  <span className="text-emerald-400 font-bold">$</span>
                  <span>
                    {activeTab === "file" ? "npx p2pcopy receive 842-194" : "npx p2pcopy clip get 842-194"}
                  </span>
                </div>

                {step >= 3 && (
                  <div className="mt-2 text-zinc-400 space-y-1">
                    <div className="text-zinc-500">ℹ Joining room 842-194...</div>
                    <div className="text-emerald-400 font-semibold">✔ Joined room. Negotiating direct WebRTC connection...</div>
                    <div className="text-emerald-400 font-semibold">✔ WebRTC DataChannel connected (E2EE active)!</div>
                  </div>
                )}

                {activeTab === "file" && step >= 4 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-cyan-300">Receiving: archive.tar.gz (42.5 MB)</div>
                    {/* Live Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden border border-white/5">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                        <span>{Math.round((42.5 * progress) / 100)} MB / 42.5 MB</span>
                        <span className="text-cyan-300 font-semibold">{progress}% | 18.4 MB/s</span>
                        <span>ETA: {progress === 100 ? "0s" : "1s"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "file" && step >= 5 && (
                  <div className="mt-4 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-white">
                      <span>✔</span> File received successfully: archive.tar.gz
                    </div>
                    <div className="text-zinc-400">Location: ./archive.tar.gz</div>
                    <div className="text-emerald-400 font-semibold">SHA-256: 8a4f91e...c218 (Verified ✔)</div>
                  </div>
                )}

                {activeTab === "clip" && step >= 4 && (
                  <div className="mt-4 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-semibold">✔ Content copied directly to clipboard! 📋</span>
                      <span className="text-[10px] text-zinc-400">Ctrl+V ready</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 font-mono select-all text-[11px] break-all">
                      ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIInx9+Pq9K... alice@work
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
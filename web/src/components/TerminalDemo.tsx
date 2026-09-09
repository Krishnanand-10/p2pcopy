import React, { useState, useEffect } from "react";

export const TerminalDemo: React.FC = () => {
  const [tab, setTab] = useState<"send" | "receive" | "clip">("send");
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
    const timers = [
      setTimeout(() => setFrame(1), 300),
      setTimeout(() => setFrame(2), 900),
      setTimeout(() => setFrame(3), 1600),
      setTimeout(() => setFrame(4), 2300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [tab]);

  return (
    <div className="w-full max-w-3xl">
      {/* Mode Selector Tabs */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setTab("send")}
            className={`rounded-[8px] px-3 py-1.5 transition-all duration-200 ${
              tab === "send"
                ? "bg-paper-2 text-emerald-400 font-medium border border-emerald-500/30 shadow-sm"
                : "text-ink-soft hover:text-white hover:bg-paper-2/50 border border-transparent"
            }`}
          >
            p2pcopy send
          </button>
          <button
            onClick={() => setTab("receive")}
            className={`rounded-[8px] px-3 py-1.5 transition-all duration-200 ${
              tab === "receive"
                ? "bg-paper-2 text-emerald-400 font-medium border border-emerald-500/30 shadow-sm"
                : "text-ink-soft hover:text-white hover:bg-paper-2/50 border border-transparent"
            }`}
          >
            p2pcopy receive
          </button>
          <button
            onClick={() => setTab("clip")}
            className={`rounded-[8px] px-3 py-1.5 transition-all duration-200 ${
              tab === "clip"
                ? "bg-paper-2 text-emerald-400 font-medium border border-emerald-500/30 shadow-sm"
                : "text-ink-soft hover:text-white hover:bg-paper-2/50 border border-transparent"
            }`}
          >
            p2pcopy clip
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-ink-faint">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>WebRTC DataChannel (E2EE)</span>
        </div>
      </div>

      {/* Terminal Window Frame */}
      <div className="overflow-hidden rounded-[18px] border border-terminal-line bg-terminal text-left shadow-2xl">
        {/* Titlebar with Colored Window Dots */}
        <div className="flex items-center justify-between border-b border-terminal-line px-4 py-3 bg-[#0a0a0e]">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="size-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="size-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">p2pcopy — terminal session</span>
          <div className="w-10"></div>
        </div>

        {/* Content Body with Proper Terminal Colors */}
        <div className="min-h-[290px] p-5 font-mono text-[13px] leading-6">
          {tab === "send" && (
            <div className="space-y-1">
              <div>
                <span className="text-emerald-400 font-bold">$ </span>
                <span className="text-zinc-100 font-medium">p2pcopy send archive.tar.gz</span>
              </div>

              {frame >= 1 && (
                <div className="text-zinc-400">
                  <span className="text-emerald-400">✔</span> SHA-256: <span className="text-amber-300/90 font-mono">8a4f91e843c0892f3c...</span>
                </div>
              )}

              {frame >= 2 && (
                <div className="my-3 py-2.5 px-3.5 rounded-[10px] border border-amber-500/30 bg-amber-500/[0.05] font-mono text-xs">
                  <div className="text-zinc-300">Pairing code generated for peer:</div>
                  <div className="mt-1 text-amber-300 font-bold text-sm tracking-wider">
                    $ p2pcopy receive 842-194
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500">
                    Browser receiver: https://p2pcopy.onrender.com#842-194
                  </div>
                </div>
              )}

              {frame >= 3 && (
                <>
                  <div className="text-zinc-400">
                    <span className="text-emerald-400">✔</span> Direct WebRTC connection established (DTLS 1.3 / SCTP)
                  </div>
                  <div className="text-zinc-300">
                    archive.tar.gz [====================] <span className="text-emerald-400 font-semibold">100%</span> | 42.5 MB | <span className="text-emerald-400 font-medium">28.4 MB/s</span>
                  </div>
                </>
              )}

              {frame >= 4 && (
                <div className="text-emerald-400 font-medium pt-1">
                  ✔ Transfer complete. Verified bit-for-bit with receiver.
                </div>
              )}

              <div className="pt-1">
                <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-emerald-400"></span>
              </div>
            </div>
          )}

          {tab === "receive" && (
            <div className="space-y-1">
              <div>
                <span className="text-emerald-400 font-bold">$ </span>
                <span className="text-zinc-100 font-medium">p2pcopy receive 842-194</span>
              </div>

              {frame >= 1 && (
                <div className="text-zinc-400">
                  <span className="text-emerald-400">✔</span> Joined room 842-194
                </div>
              )}

              {frame >= 2 && (
                <div className="text-zinc-400">
                  <span className="text-emerald-400">✔</span> Peer connection established (DTLS 1.3 / SCTP)
                </div>
              )}

              {frame >= 3 && (
                <div className="text-zinc-300">
                  Receiving archive.tar.gz [====================] <span className="text-emerald-400 font-semibold">100%</span> | 42.5 MB | <span className="text-emerald-400 font-medium">28.4 MB/s</span>
                </div>
              )}

              {frame >= 4 && (
                <div className="space-y-1 pt-1">
                  <div className="text-emerald-400 font-medium">
                    ✔ File saved: ./archive.tar.gz
                  </div>
                  <div className="text-zinc-400 text-xs">
                    SHA-256 matched sender digest bit-for-bit: <span className="text-amber-300/80">8a4f91e...</span>
                  </div>
                </div>
              )}

              <div className="pt-1">
                <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-emerald-400"></span>
              </div>
            </div>
          )}

          {tab === "clip" && (
            <div className="space-y-1">
              <div>
                <span className="text-emerald-400 font-bold">$ </span>
                <span className="text-zinc-100 font-medium">cat ~/.ssh/id_ed25519.pub | p2pcopy clip</span>
              </div>

              {frame >= 1 && (
                <div className="text-zinc-400">
                  <span className="text-emerald-400">✔</span> Captured stdin (104 bytes)
                </div>
              )}

              {frame >= 2 && (
                <div className="my-3 py-2.5 px-3.5 rounded-[10px] border border-emerald-500/30 bg-emerald-500/[0.05] font-mono text-xs">
                  <div className="text-zinc-300">Receiver command:</div>
                  <div className="mt-1 text-emerald-400 font-bold text-sm tracking-wider">
                    $ p2pcopy clip get 309-812
                  </div>
                </div>
              )}

              {frame >= 3 && (
                <div className="text-zinc-400">
                  <span className="text-emerald-400">✔</span> WebRTC DataChannel connected
                </div>
              )}

              {frame >= 4 && (
                <div className="text-emerald-400 font-medium pt-1">
                  ✔ Clipboard payload delivered and acknowledged by peer pasteboard.
                </div>
              )}

              <div className="pt-1">
                <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-emerald-400"></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

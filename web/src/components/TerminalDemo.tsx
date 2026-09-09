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
        <div className="flex items-center gap-1 font-mono text-xs">
          <button
            onClick={() => setTab("send")}
            className={`rounded-[8px] px-3 py-1.5 transition-colors duration-200 ${
              tab === "send"
                ? "bg-paper-2 text-mint font-medium border border-line"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            p2pcopy send
          </button>
          <button
            onClick={() => setTab("receive")}
            className={`rounded-[8px] px-3 py-1.5 transition-colors duration-200 ${
              tab === "receive"
                ? "bg-paper-2 text-mint font-medium border border-line"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            p2pcopy receive
          </button>
          <button
            onClick={() => setTab("clip")}
            className={`rounded-[8px] px-3 py-1.5 transition-colors duration-200 ${
              tab === "clip"
                ? "bg-paper-2 text-mint font-medium border border-line"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            p2pcopy clip
          </button>
        </div>

        <span className="font-mono text-[11px] text-ink-faint">WebRTC DataChannel (E2EE)</span>
      </div>

      {/* Terminal Window */}
      <div className="overflow-hidden rounded-[18px] border border-terminal-line bg-terminal text-left shadow-2xl">
        {/* Titlebar */}
        <div className="flex items-center justify-between border-b border-terminal-line px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-zinc-700"></span>
            <span className="size-2.5 rounded-full bg-zinc-700"></span>
            <span className="size-2.5 rounded-full bg-zinc-700"></span>
          </div>
          <span className="font-mono text-[11px] text-zinc-600">p2pcopy terminal session</span>
          <div className="w-10"></div>
        </div>

        {/* Content Body */}
        <div className="min-h-[300px] p-5 font-mono text-[13px] leading-6">
          {tab === "send" && (
            <div className="space-y-1">
              <div>
                <span className="text-mint">$ </span>
                <span className="text-zinc-100 font-medium">p2pcopy send archive.tar.gz</span>
              </div>

              {frame >= 1 && (
                <div className="text-zinc-400">
                  <span className="text-mint">✔</span> SHA-256: 8a4f91e843c0892f3c...
                </div>
              )}

              {frame >= 2 && (
                <div className="my-3 py-2 px-3 rounded-[10px] border border-line bg-paper-2 font-mono text-xs">
                  <div className="text-ink-soft">To receive this file on another machine, run:</div>
                  <div className="mt-1 text-mint font-semibold text-sm">
                    $ p2pcopy receive 842-194
                  </div>
                  <div className="mt-1 text-[11px] text-ink-faint">
                    Or in browser: https://p2pcopy.onrender.com#842-194
                  </div>
                </div>
              )}

              {frame >= 3 && (
                <>
                  <div className="text-zinc-400">
                    <span className="text-mint">✔</span> Direct WebRTC connection established (DTLS/SCTP)
                  </div>
                  <div className="text-zinc-300">
                    archive.tar.gz [====================] 100% | 42.5 MB | 28.4 MB/s
                  </div>
                </>
              )}

              {frame >= 4 && (
                <div className="text-mint font-medium pt-1">
                  ✔ Transfer complete. SHA-256 verified by receiver.
                </div>
              )}

              <div className="pt-1">
                <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-mint"></span>
              </div>
            </div>
          )}

          {tab === "receive" && (
            <div className="space-y-1">
              <div>
                <span className="text-mint">$ </span>
                <span className="text-zinc-100 font-medium">p2pcopy receive 842-194</span>
              </div>

              {frame >= 1 && (
                <div className="text-zinc-400">
                  <span className="text-mint">✔</span> Joined room 842-194
                </div>
              )}

              {frame >= 2 && (
                <div className="text-zinc-400">
                  <span className="text-mint">✔</span> Peer connection established (DTLS 1.3 / SCTP)
                </div>
              )}

              {frame >= 3 && (
                <div className="text-zinc-300">
                  Receiving archive.tar.gz [====================] 100% | 42.5 MB | 28.4 MB/s
                </div>
              )}

              {frame >= 4 && (
                <div className="space-y-1 pt-1">
                  <div className="text-mint font-medium">
                    ✔ File saved: ./archive.tar.gz
                  </div>
                  <div className="text-zinc-400 text-xs">
                    SHA-256 matched sender digest bit-for-bit.
                  </div>
                </div>
              )}

              <div className="pt-1">
                <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-mint"></span>
              </div>
            </div>
          )}

          {tab === "clip" && (
            <div className="space-y-1">
              <div>
                <span className="text-mint">$ </span>
                <span className="text-zinc-100 font-medium">cat ~/.ssh/id_ed25519.pub | p2pcopy clip</span>
              </div>

              {frame >= 1 && (
                <div className="text-zinc-400">
                  <span className="text-mint">✔</span> Captured stdin (104 bytes)
                </div>
              )}

              {frame >= 2 && (
                <div className="my-3 py-2 px-3 rounded-[10px] border border-line bg-paper-2 font-mono text-xs">
                  <div className="text-ink-soft">Receiver command:</div>
                  <div className="mt-1 text-mint font-semibold text-sm">
                    $ p2pcopy clip get 309-812
                  </div>
                </div>
              )}

              {frame >= 3 && (
                <div className="text-zinc-400">
                  <span className="text-mint">✔</span> WebRTC DataChannel connected
                </div>
              )}

              {frame >= 4 && (
                <div className="text-mint font-medium pt-1">
                  ✔ Clipboard payload delivered and acknowledged by peer.
                </div>
              )}

              <div className="pt-1">
                <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-mint"></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

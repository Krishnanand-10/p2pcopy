import React from "react";
import { ShieldCheck, Radio, Cpu, CheckCircle2, Globe2 } from "lucide-react";

export const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="scroll-mt-24 py-20 text-left sm:py-28">
      <div>
        {/* Main Section Heading in clean pure raw white */}
        <h2 className="max-w-2xl text-3xl sm:text-4xl text-white font-bold tracking-tight">
          Everything cloud drives do, minus the cloud.
        </h2>
        <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-ink-soft">
          Built on WebRTC DataChannels with DTLS 1.3 end-to-end encryption. No intermediary storage buckets, no accounts, and zero file retention.
        </p>
      </div>

      {/* Grid of clearly distinguishable cards with standalone crisp borders */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: File Transfer (Span 2) */}
        <div className="rounded-[16px] border border-[#2a2a36] bg-panel p-7 transition-all duration-300 hover:border-[#3e3e52] hover:bg-paper-2 sm:col-span-2 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              {/* Sub-sub heading badge in emerald */}
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                File Transfer
              </span>
            </div>
            {/* Card title kept in raw white */}
            <h3 className="text-xl sm:text-2xl text-white font-bold tracking-tight">
              Nothing touches our servers
            </h3>
            <p className="mt-2.5 max-w-[54ch] text-sm leading-relaxed text-ink-soft">
              p2pcopy connects sender and receiver directly via peer-to-peer WebRTC. The signaling relay merely brokers the initial ephemeral handshake and immediately destroys the room. All payloads travel strictly device-to-device with DTLS 1.3 encryption.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
            <span className="rounded-[6px] border border-line-strong bg-paper-2 px-2.5 py-1 text-ink-soft">
              Direct WebRTC
            </span>
            <span className="rounded-[6px] border border-line-strong bg-paper-2 px-2.5 py-1 text-ink-soft">
              DTLS 1.3
            </span>
            <span className="rounded-[6px] border border-line-strong bg-paper-2 px-2.5 py-1 text-ink-soft">
              SCTP 64KB Chunks
            </span>
            <span className="rounded-[6px] border border-line-strong bg-paper-2 px-2.5 py-1 text-ink-soft">
              Zero Retention
            </span>
          </div>
        </div>

        {/* Card 2: Clipboard Beam */}
        <div className="rounded-[16px] border border-[#2a2a36] bg-panel p-7 transition-all duration-300 hover:border-[#3e3e52] hover:bg-paper-2 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Radio className="h-5 w-5 text-emerald-400" />
              {/* Sub-sub heading badge in emerald */}
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Clipboard Beam
              </span>
            </div>
            {/* Card title kept in raw white */}
            <h3 className="text-xl text-white font-bold tracking-tight">
              Clipboard in one pipe
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              <code className="font-mono text-ink text-xs bg-paper-2 px-1.5 py-0.5 rounded border border-line">cat id_rsa.pub | p2pcopy clip</code> beams SSH keys and tokens straight to peer pasteboards without leaving logs in chat apps.
            </p>
          </div>
          {/* Raw text */}
          <div className="mt-5 font-mono text-xs text-ink-soft">
            $ cat token | p2pcopy clip
          </div>
        </div>

        {/* Card 3: Backpressure Flow Control */}
        <div className="rounded-[16px] border border-[#2a2a36] bg-panel p-7 transition-all duration-300 hover:border-[#3e3e52] hover:bg-paper-2 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Cpu className="h-5 w-5 text-emerald-400" />
              {/* Sub-sub heading badge in emerald */}
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Backpressure
              </span>
            </div>
            {/* Card title kept in raw white */}
            <h3 className="text-xl text-white font-bold tracking-tight">
              Memory flow control
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Stream 50GB disk images with only <code className="font-mono text-ink text-xs bg-paper-2 px-1 rounded border border-line">~1.2 MB RAM</code>. Automatically throttles disk reads when network buffers reach high-water mark.
            </p>
          </div>
          {/* Raw text */}
          <div className="mt-5 flex items-center justify-between text-xs font-mono text-ink-soft">
            <span>Buffer limit: 1024 KB</span>
            <span>Low watermark: 256 KB</span>
          </div>
        </div>

        {/* Card 4: SHA-256 Integrity */}
        <div className="rounded-[16px] border border-[#2a2a36] bg-panel p-7 transition-all duration-300 hover:border-[#3e3e52] hover:bg-paper-2 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              {/* Sub-sub heading badge in emerald */}
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                SHA-256 Integrity
              </span>
            </div>
            {/* Card title kept in raw white */}
            <h3 className="text-xl text-white font-bold tracking-tight">
              Bit-for-bit checksums
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Transfers compute streaming cryptographic digests on both ends. The receiver validates bit-for-bit accuracy and rejects corrupted packets before writing to disk.
            </p>
          </div>
          {/* Raw text */}
          <div className="mt-5 font-mono text-xs text-ink-soft flex items-center gap-1.5">
            <span>✔</span>
            <span>Checksum verified prior to disk commit</span>
          </div>
        </div>

        {/* Card 5: NAT & TURN */}
        <div className="rounded-[16px] border border-[#2a2a36] bg-panel p-7 transition-all duration-300 hover:border-[#3e3e52] hover:bg-paper-2 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Globe2 className="h-5 w-5 text-emerald-400" />
              {/* Sub-sub heading badge in emerald */}
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                STUN & TURN
              </span>
            </div>
            {/* Card title kept in raw white */}
            <h3 className="text-xl text-white font-bold tracking-tight">
              NAT traversal resilience
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Automatic STUN hole-punching traverses ~85% of home & office routers. Pass <code className="font-mono text-ink text-xs bg-paper-2 px-1 rounded border border-line">--ice</code> to tunnel through strict corporate firewalls.
            </p>
          </div>
          {/* Raw text */}
          <div className="mt-5 font-mono text-xs text-ink-soft">
            STUN Discovery + Relay Fallback
          </div>
        </div>
      </div>
    </section>
  );
};

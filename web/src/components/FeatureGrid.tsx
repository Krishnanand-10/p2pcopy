import React from "react";
import { ShieldCheck, Radio, Cpu, CheckCircle2, Globe2, Sparkles } from "lucide-react";

export const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="scroll-mt-24 py-20 text-left sm:py-28">
      <div>
        <h2 className="max-w-2xl text-3xl sm:text-4xl text-ink font-semibold tracking-tight">
          Everything cloud drives do, <span className="serif-italic text-mint font-normal">minus the cloud.</span>
        </h2>
        <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-ink-soft">
          Built on WebRTC DataChannels with DTLS 1.3 end-to-end encryption. No intermediary storage buckets, no accounts, and zero file retention.
        </p>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-[16px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {/* Large Card (Span 2) */}
        <div className="bg-paper p-7 transition-colors duration-300 hover:bg-paper-2 sm:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-mint">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">End-to-End Encrypted</span>
            </div>
            <h3 className="mt-3 text-xl sm:text-2xl text-ink font-semibold tracking-tight">
              Nothing touches our servers
            </h3>
            <p className="mt-2.5 max-w-[54ch] text-sm leading-relaxed text-ink-soft">
              p2pcopy connects sender and receiver directly via peer-to-peer WebRTC. The signaling relay merely brokers the initial ephemeral handshake and immediately destroys the room. All payloads travel strictly device-to-device with DTLS 1.3 encryption.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
            <span className="rounded-[8px] border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
              100% E2EE
            </span>
            <span className="rounded-[8px] border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-300">
              Direct WebRTC
            </span>
            <span className="rounded-[8px] border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-violet-300">
              DTLS 1.3
            </span>
            <span className="rounded-[8px] border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-300">
              SCTP 64KB Chunks
            </span>
            <span className="rounded-[8px] border border-line-strong px-2.5 py-1 text-ink-soft">
              Zero Retention
            </span>
          </div>
        </div>

        {/* Card 2: Clipboard Beam */}
        <div className="bg-paper p-7 transition-colors duration-300 hover:bg-paper-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400">
              <Radio className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">Instant Sync</span>
            </div>
            <h3 className="mt-3 text-xl text-ink font-semibold tracking-tight">
              Clipboard in one pipe
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              <code className="font-mono text-ink text-xs bg-paper-2 px-1.5 py-0.5 rounded border border-line">cat id_rsa.pub | p2pcopy clip</code> beams SSH keys and tokens straight to peer pasteboards without leaving logs in Slack.
            </p>
          </div>
          <div className="mt-5 font-mono text-xs text-cyan-400/80">
            $ cat token | p2pcopy clip
          </div>
        </div>

        {/* Card 3: Backpressure */}
        <div className="bg-paper p-7 transition-colors duration-300 hover:bg-paper-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-violet-400">
              <Cpu className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">Low Memory</span>
            </div>
            <h3 className="mt-3 text-xl text-ink font-semibold tracking-tight">
              Backpressure flow control
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Stream 50GB disk images with only <code className="font-mono text-violet-300 text-xs">~1.2 MB RAM</code>. Automatically throttles disk reads when network buffers reach high-water mark.
            </p>
          </div>
          <div className="mt-5 flex items-center justify-between text-xs font-mono text-ink-faint">
            <span>Buffer limit: 1024 KB</span>
            <span className="text-violet-400">Low watermark: 256 KB</span>
          </div>
        </div>

        {/* Card 4: SHA-256 */}
        <div className="bg-paper p-7 transition-colors duration-300 hover:bg-paper-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">Integrity Verified</span>
            </div>
            <h3 className="mt-3 text-xl text-ink font-semibold tracking-tight">
              Bit-for-bit SHA-256
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Transfers compute streaming cryptographic digests on both ends. The receiver validates bit-for-bit accuracy and rejects corrupted packets before writing to disk.
            </p>
          </div>
          <div className="mt-5 font-mono text-xs text-amber-400/80 flex items-center gap-1.5">
            <span>✔</span>
            <span>Checksum verified prior to disk commit</span>
          </div>
        </div>

        {/* Card 5: NAT & TURN */}
        <div className="bg-paper p-7 transition-colors duration-300 hover:bg-paper-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400">
              <Globe2 className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">NAT Traversal</span>
            </div>
            <h3 className="mt-3 text-xl text-ink font-semibold tracking-tight">
              STUN + TURN Resilience
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Automatic STUN hole-punching traverses ~85% of home & office routers. Pass <code className="font-mono text-rose-300 text-xs">--ice</code> to tunnel through strict corporate firewalls.
            </p>
          </div>
          <div className="mt-5 font-mono text-xs text-rose-400/80">
            STUN Discovery + Relay Fallback
          </div>
        </div>
      </div>
    </section>
  );
};

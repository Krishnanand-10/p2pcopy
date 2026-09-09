import React from "react";
import { ShieldCheck, Radio, Cpu, CheckCircle, Globe2, Laptop } from "lucide-react";

export const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="scroll-mt-24 py-20 text-left sm:py-28">
      <div>
        <h2 className="max-w-2xl text-3xl sm:text-4xl text-ink font-normal tracking-tight">
          Everything cloud drives do, <span className="serif-italic text-mint">minus the cloud.</span>
        </h2>
        <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-ink-soft">
          Built on WebRTC DataChannels with DTLS end-to-end encryption. No intermediary storage buckets, no accounts, and zero data retention.
        </p>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-[16px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {/* Hero Card (Span 2) */}
        <div className="bg-paper p-7 transition-colors duration-300 hover:bg-paper-2 sm:col-span-2">
          <ShieldCheck className="h-6 w-6 text-mint" />
          <h3 className="mt-4 text-xl text-ink font-medium">Nothing touches our servers</h3>
          <p className="mt-2 max-w-[54ch] text-sm leading-relaxed text-ink-soft">
            p2pcopy connects sender and receiver directly via peer-to-peer WebRTC. The signaling relay merely brokers the initial ephemeral handshake and immediately destroys the room. All payloads travel strictly device-to-device with DTLS 1.3 encryption.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs">
            <span className="rounded-[10px] border border-line-strong px-2.5 py-1 text-ink-soft">Direct WebRTC</span>
            <span className="rounded-[10px] border border-line-strong px-2.5 py-1 text-ink-soft">DTLS 1.3</span>
            <span className="rounded-[10px] border border-line-strong px-2.5 py-1 text-ink-soft">SCTP Chunks</span>
            <span className="rounded-[10px] border border-line-strong px-2.5 py-1 text-ink-soft">Zero Retention</span>
            <span className="rounded-[10px] border border-mint/40 px-2.5 py-1 text-mint">100% E2EE</span>
          </div>
        </div>

        {/* Card 2: Clipboard */}
        <div className="bg-paper p-7 transition-colors duration-300 hover:bg-paper-2">
          <Radio className="h-6 w-6 text-mint" />
          <h3 className="mt-4 text-xl text-ink font-medium">Clipboard in one pipe</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            <code className="font-mono text-ink">cat id_rsa.pub | p2pcopy clip</code> beams SSH keys and tokens straight to peer pasteboards without leaving artifacts in chat apps.
          </p>
        </div>

        {/* Card 3: Backpressure */}
        <div className="bg-paper p-7 transition-colors duration-300 hover:bg-paper-2">
          <Cpu className="h-6 w-6 text-mint" />
          <h3 className="mt-4 text-xl text-ink font-medium">Backpressure flow control</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Stream 50GB disk images with only <code className="font-mono text-ink">~1.2 MB RAM</code>. Automatically throttles disk reads when network buffers fill up.
          </p>
        </div>

        {/* Card 4: SHA-256 */}
        <div className="bg-paper p-7 transition-colors duration-300 hover:bg-paper-2">
          <CheckCircle className="h-6 w-6 text-mint" />
          <h3 className="mt-4 text-xl text-ink font-medium">Bit-for-bit SHA-256</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Transfers calculate streaming cryptographic hashes. Receiver verifies digest bit-for-bit and rejects corrupted chunks before writing to disk.
          </p>
        </div>

        {/* Card 5: STUN & NAT */}
        <div className="bg-paper p-7 transition-colors duration-300 hover:bg-paper-2">
          <Globe2 className="h-6 w-6 text-mint" />
          <h3 className="mt-4 text-xl text-ink font-medium">NAT traversal & TURN</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Automatic STUN hole-punching for ~85% of home routers. Add <code className="font-mono text-ink">--ice</code> for strict corporate firewalls.
          </p>
        </div>
      </div>
    </section>
  );
};

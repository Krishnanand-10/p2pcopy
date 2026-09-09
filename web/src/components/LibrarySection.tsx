import React from "react";

export const LibrarySection: React.FC = () => {
  return (
    <section id="library" className="scroll-mt-24 border-t border-line py-20 text-left sm:py-28">
      <div>
        <h2 className="text-3xl sm:text-4xl text-ink font-normal tracking-tight">
          Also a <span className="serif-italic text-mint">typed library.</span>
        </h2>
        <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-ink-soft">
          Every capability is exported as an async function with progress events, backpressure control, and TypeScript definitions. The CLI is simply its first consumer.
        </p>
      </div>

      <div className="mt-10 overflow-x-auto rounded-[16px] border border-terminal-line bg-terminal p-6 font-mono text-[13px] leading-6 text-zinc-300">
        <pre>
          <code>{`import { sendFile, receiveFile, beamClipboard } from 'p2pcopy';

// Stream file directly peer-to-peer over WebRTC
const { code, complete } = await sendFile('./dataset.tar.gz', {
  onProgress: ({ percent, speedMBps }) => {
    console.log(\`Transferred \${percent}% (\${speedMBps} MB/s)\`);
  },
});

console.log(\`Pairing code for receiver: \${code}\`);
await complete; // Resolves when receiver validates SHA-256`}</code>
        </pre>
      </div>
    </section>
  );
};

import pc from "picocolors";

export const UI = {
  banner: () => {
    console.log(
      pc.cyan(`
  ╔═════════════════════════════════════════════╗
  ║   🚀 p2pcopy — Terminal Peer-to-Peer File   ║
  ║      & Clipboard Sync over WebRTC (E2EE)    ║
  ╚═════════════════════════════════════════════╝
`)
    );
  },

  info: (msg: string) => {
    console.log(`${pc.cyan("ℹ")} ${msg}`);
  },

  success: (msg: string) => {
    console.log(`${pc.green("✔")} ${pc.bold(msg)}`);
  },

  warn: (msg: string) => {
    console.log(`${pc.yellow("⚠")} ${msg}`);
  },

  error: (msg: string) => {
    console.error(`${pc.red("✖")} ${pc.bold(pc.red(msg))}`);
  },

  step: (step: number, total: number, msg: string) => {
    console.log(`${pc.dim(`[${step}/${total}]`)} ${pc.bold(msg)}`);
  },

  pairingCode: (code: string) => {
    console.log();
    console.log(pc.bgCyan(pc.black(pc.bold("  PAIRING CODE  "))));
    console.log(pc.bold(pc.yellow(`  >>>  ${code}  <<<`)));
    console.log(
      pc.dim(`  Run on receiving machine: `) +
        pc.green(`p2pcopy receive ${code}`)
    );
    console.log();
  },

  formatBytes: (bytes: number, decimals = 2): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  },

  formatSpeed: (bytesPerSec: number): string => {
    return `${UI.formatBytes(bytesPerSec)}/s`;
  },
};

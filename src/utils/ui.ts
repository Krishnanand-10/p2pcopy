import pc from "picocolors";

export const UI = {
  banner: () => {
    console.log(
      pc.bold(pc.cyan("  ╔═════════════════════════════════════════════════════╗")) +
        "\n" +
        pc.bold(pc.cyan("  ║")) +
        pc.bold(pc.white("   🚀 p2pcopy — Peer-to-Peer File & Clipboard        ")) +
        pc.bold(pc.cyan("║")) +
        "\n" +
        pc.bold(pc.cyan("  ║")) +
        pc.bold(pc.yellow("      Direct WebRTC • E2EE • Zero Cloud Storage      ")) +
        pc.bold(pc.cyan("║")) +
        "\n" +
        pc.bold(pc.cyan("  ╚═════════════════════════════════════════════════════╝")) +
        "\n"
    );
  },

  info: (msg: string) => {
    console.log(`${pc.bold(pc.cyan("ℹ"))} ${pc.white(msg)}`);
  },

  success: (msg: string) => {
    console.log(`${pc.bold(pc.green("✔"))} ${pc.bold(pc.white(msg))}`);
  },

  warn: (msg: string) => {
    console.log(`${pc.bold(pc.yellow("⚠"))} ${pc.yellow(msg)}`);
  },

  error: (msg: string) => {
    console.error(`${pc.bold(pc.red("✖"))} ${pc.bold(pc.red(msg))}`);
  },

  step: (step: number, total: number, msg: string) => {
    console.log(`${pc.white(`[${step}/${total}]`)} ${pc.bold(pc.white(msg))}`);
  },

  pairingCode: (code: string, commandType: "file" | "clip" = "file") => {
    const receiverCmd =
      commandType === "clip"
        ? `p2pcopy clip get ${code}`
        : `p2pcopy receive ${code}`;

    const width = 56;
    const label1 = `  🔑 PAIRING CODE:  ${code}`;
    const label2 = `  Run on receiving machine:`;
    const label3 = `  > ${receiverCmd}`;
    const pad = (str: string, visibleLen: number) =>
      str + " ".repeat(Math.max(0, width - visibleLen));

    console.log();
    console.log(pc.bold(pc.yellow(`  ╔${"═".repeat(width)}╗`)));
    console.log(
      pc.bold(pc.yellow("  ║")) +
        pad(
          `  ${pc.bold(pc.white("🔑 PAIRING CODE:"))}  ${pc.bold(pc.green(code))}`,
          label1.length
        ) +
        pc.bold(pc.yellow("║"))
    );
    console.log(
      pc.bold(pc.yellow("  ║")) +
        " ".repeat(width) +
        pc.bold(pc.yellow("║"))
    );
    console.log(
      pc.bold(pc.yellow("  ║")) +
        pad(`  ${pc.white("Run on receiving machine:")}`, label2.length) +
        pc.bold(pc.yellow("║"))
    );
    console.log(
      pc.bold(pc.yellow("  ║")) +
        pad(`  ${pc.bold(pc.cyan(`> ${receiverCmd}`))}`, label3.length) +
        pc.bold(pc.yellow("║"))
    );
    console.log(pc.bold(pc.yellow(`  ╚${"═".repeat(width)}╝`)));
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

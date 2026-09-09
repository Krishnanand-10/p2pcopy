import { spawnSync } from "child_process";
import os from "os";

export function readClipboard(): string {
  const platform = os.platform();

  try {
    if (platform === "win32") {
      const res = spawnSync("powershell.exe", ["-NoProfile", "-Command", "Get-Clipboard -Raw"], {
        encoding: "utf-8",
      });
      return res.stdout || "";
    }

    if (platform === "darwin") {
      const res = spawnSync("pbpaste", { encoding: "utf-8" });
      return res.stdout || "";
    }

    if (platform === "linux") {
      // Try wl-paste then xclip then xsel
      let res = spawnSync("wl-paste", { encoding: "utf-8" });
      if (res.status === 0) return res.stdout || "";

      res = spawnSync("xclip", ["-selection", "clipboard", "-o"], { encoding: "utf-8" });
      if (res.status === 0) return res.stdout || "";

      res = spawnSync("xsel", ["--clipboard", "--output"], { encoding: "utf-8" });
      if (res.status === 0) return res.stdout || "";
    }
  } catch (err: any) {
    throw new Error(`Failed to read clipboard: ${err.message}`);
  }

  return "";
}

export function writeClipboard(text: string): void {
  const platform = os.platform();

  try {
    if (platform === "win32") {
      spawnSync("clip.exe", { input: text, encoding: "utf-8" });
      return;
    }

    if (platform === "darwin") {
      spawnSync("pbcopy", { input: text, encoding: "utf-8" });
      return;
    }

    if (platform === "linux") {
      let res = spawnSync("wl-copy", { input: text, encoding: "utf-8" });
      if (res.status === 0) return;

      res = spawnSync("xclip", ["-selection", "clipboard"], { input: text, encoding: "utf-8" });
      if (res.status === 0) return;

      spawnSync("xsel", ["--clipboard", "--input"], { input: text, encoding: "utf-8" });
      return;
    }
  } catch (err: any) {
    throw new Error(`Failed to write to clipboard: ${err.message}`);
  }
}

export function readStdin(): Promise<string | null> {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      return resolve(null);
    }

    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      resolve(data.trim() ? data : null);
    });
    process.stdin.on("error", () => {
      resolve(null);
    });
  });
}
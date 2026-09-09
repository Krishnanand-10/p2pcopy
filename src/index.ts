import { Command } from "commander";
import fs from "fs";
import path from "path";
import pc from "picocolors";
import { UI } from "./utils/ui";
import { generatePairingCode, normalizeCode } from "./utils/code";
import { EphemeralSignalingServer } from "./signaling/server";
import { SignalingClient } from "./signaling/client";
import { WebRTCPeer } from "./webrtc/peer";
import { FileSender } from "./transfer/sender";
import { FileReceiver } from "./transfer/receiver";
import { readClipboard, writeClipboard, readStdin } from "./clipboard/index";

const DEFAULT_SIGNAL_URL = process.env.P2PCOPY_SIGNAL || "wss://p2pcopy.onrender.com";

const program = new Command();

program
  .name("p2pcopy")
  .description("Zero-cloud, E2EE peer-to-peer file and clipboard sharing over WebRTC")
  .version("0.1.0");

// Command: Send a file
program
  .command("send")
  .description("Send a file directly to another peer")
  .argument("<file>", "Path to the file to send")
  .option("-s, --signal <url>", "Signaling server URL", DEFAULT_SIGNAL_URL)
  .option("--ice <servers...>", "Custom STUN/TURN server URLs")
  .action(async (file: string, options: any) => {
    try {
      UI.banner();

      const resolvedPath = path.resolve(file);
      if (!fs.existsSync(resolvedPath)) {
        UI.error(`File not found: ${resolvedPath}`);
        process.exit(1);
      }

      const pairingCode = generatePairingCode();
      const signalUrl = options.signal;

      UI.info(`Connecting to signaling server at ${pc.cyan(signalUrl)}...`);
      const signalClient = new SignalingClient(signalUrl);
      await signalClient.connect();

      await signalClient.createRoom(pairingCode);
      UI.pairingCode(pairingCode);
      UI.info("Waiting for receiver to connect...");

      const peer = new WebRTCPeer({
        name: "sender",
        isInitiator: true,
        roomId: pairingCode,
        signalingClient: signalClient,
        customIceServers: options.ice,
      });

      await peer.start();

      peer.on("connected", async (dc) => {
        UI.success("WebRTC DataChannel connected (E2EE active)!");
        UI.info("Starting direct P2P file transfer...");

        try {
          const sender = new FileSender({
            filePath: resolvedPath,
            dataChannel: dc,
            showProgress: true,
          });

          await sender.send();

          console.log();
          UI.success(`File ${pc.bold(path.basename(resolvedPath))} sent and verified by receiver!`);

          setTimeout(() => {
            peer.close();
            signalClient.close();
            process.exit(0);
          }, 500);
        } catch (err: any) {
          UI.error(`Transfer error: ${err.message}`);
          peer.close();
          signalClient.close();
          process.exit(1);
        }
      });

      peer.on("error", (err) => {
        UI.error(`Peer error: ${err.message}`);
      });
    } catch (err: any) {
      UI.error(`Send failed: ${err.message}`);
      process.exit(1);
    }
  });

// Command: Receive a file
program
  .command("receive")
  .description("Receive a file from a peer using pairing code")
  .argument("<code>", "Pairing code (e.g. 749-102)")
  .option("-o, --output <dir>", "Output directory for received file", ".")
  .option("-s, --signal <url>", "Signaling server URL", DEFAULT_SIGNAL_URL)
  .option("--ice <servers...>", "Custom STUN/TURN server URLs")
  .action(async (code: string, options: any) => {
    try {
      UI.banner();

      const pairingCode = normalizeCode(code);
      const signalUrl = options.signal;

      UI.info(`Connecting to signaling server at ${pc.cyan(signalUrl)}...`);
      const signalClient = new SignalingClient(signalUrl);
      await signalClient.connect();

      UI.info(`Joining room ${pc.yellow(pairingCode)}...`);
      await signalClient.joinRoom(pairingCode);
      UI.success("Joined room. Negotiating direct WebRTC connection...");

      const peer = new WebRTCPeer({
        name: "receiver",
        isInitiator: false,
        roomId: pairingCode,
        signalingClient: signalClient,
        customIceServers: options.ice,
      });

      await peer.start();

      peer.on("connected", async (dc) => {
        UI.success("WebRTC DataChannel connected (E2EE active)!");
        UI.info("Awaiting file transfer from sender...");

        try {
          const receiver = new FileReceiver({
            outputDir: options.output,
            dataChannel: dc,
            showProgress: true,
          });

          const result = await receiver.receive();

          console.log();
          UI.success(`File received successfully: ${pc.bold(result.filename)}`);
          UI.info(`Location: ${pc.cyan(result.outputPath)}`);
          UI.info(`SHA-256 Checksum: ${pc.dim(result.sha256)} (Verified Ã¢Å“â€)`);

          setTimeout(() => {
            peer.close();
            signalClient.close();
            process.exit(0);
          }, 500);
        } catch (err: any) {
          UI.error(`Receive error: ${err.message}`);
          peer.close();
          signalClient.close();
          process.exit(1);
        }
      });

      peer.on("error", (err) => {
        UI.error(`Peer error: ${err.message}`);
      });
    } catch (err: any) {
      UI.error(`Receive failed: ${err.message}`);
      process.exit(1);
    }
  });

// Command: Clipboard sharing
const clipCommand = program
  .command("clip")
  .description("Sync clipboard contents directly between machines")
  .option("-s, --signal <url>", "Signaling server URL", DEFAULT_SIGNAL_URL)
  .option("--ice <servers...>", "Custom STUN/TURN server URLs")
  .action(async (options: any) => {
    // Default action for "p2pcopy clip" is send
    await handleClipSend(options);
  });

clipCommand
  .command("send")
  .description("Share clipboard contents with a peer")
  .option("-s, --signal <url>", "Signaling server URL", DEFAULT_SIGNAL_URL)
  .option("--ice <servers...>", "Custom STUN/TURN server URLs")
  .action(async (options: any) => {
    await handleClipSend(options);
  });

async function handleClipSend(options: any) {
  try {
    UI.banner();

    // Check piped stdin first, then system clipboard
    const stdinContent = await readStdin();
    const clipText = stdinContent || readClipboard();

    if (!clipText || clipText.trim().length === 0) {
      UI.warn("Clipboard is empty and no piped stdin input was provided.");
      process.exit(1);
    }

    const preview = clipText.length > 60 ? `${clipText.slice(0, 60)}...` : clipText;
    UI.info(`Content to share: ${pc.yellow(`"${preview.replace(/\r?\n/g, " ")}"`)} (${clipText.length} chars)`);

    const pairingCode = generatePairingCode();
    const signalUrl = options.signal;

    UI.info(`Connecting to signaling server at ${pc.cyan(signalUrl)}...`);
    const signalClient = new SignalingClient(signalUrl);
    await signalClient.connect();

    await signalClient.createRoom(pairingCode);
    UI.pairingCode(pairingCode, "clip");
    UI.info("Waiting for receiver to connect...");

    const peer = new WebRTCPeer({
      name: "clip-sender",
      isInitiator: true,
      roomId: pairingCode,
      signalingClient: signalClient,
      customIceServers: options.ice,
    });

    await peer.start();

    peer.on("data", (raw: any) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "CLIPBOARD_ACK") {
          UI.success("Receiver received and copied content to clipboard!");
          setTimeout(() => {
            peer.close();
            signalClient.close();
            process.exit(0);
          }, 300);
        }
      } catch {}
    });

    peer.on("connected", () => {
      UI.success("WebRTC DataChannel connected (E2EE active)!");
      UI.info("Streaming clipboard content...");
      peer.send(
        JSON.stringify({
          type: "CLIPBOARD",
          text: clipText,
          timestamp: Date.now(),
        })
      );
    });

    peer.on("error", (err) => {
      UI.error(`Peer error: ${err.message}`);
    });
  } catch (err: any) {
    UI.error(`Clipboard send failed: ${err.message}`);
    process.exit(1);
  }
}

clipCommand
  .command("get")
  .description("Fetch shared clipboard content from a peer")
  .argument("<code>", "Pairing code")
  .option("-s, --signal <url>", "Signaling server URL", DEFAULT_SIGNAL_URL)
  .option("--ice <servers...>", "Custom STUN/TURN server URLs")
  .option("--no-copy", "Do not copy to clipboard, only print to stdout")
  .action(async (code: string, options: any) => {
    try {
      UI.banner();

      const pairingCode = normalizeCode(code);
      const signalUrl = options.signal;

      UI.info(`Connecting to signaling server at ${pc.cyan(signalUrl)}...`);
      const signalClient = new SignalingClient(signalUrl);
      await signalClient.connect();

      UI.info(`Joining room ${pc.yellow(pairingCode)}...`);
      await signalClient.joinRoom(pairingCode);
      UI.success("Joined room. Negotiating direct WebRTC connection...");

      const peer = new WebRTCPeer({
        name: "clip-receiver",
        isInitiator: false,
        roomId: pairingCode,
        signalingClient: signalClient,
        customIceServers: options.ice,
      });

      await peer.start();

      peer.on("connected", (dc) => {
        UI.success("WebRTC DataChannel connected (E2EE active)!");
        UI.info("Awaiting clipboard content...");

        dc.onMessage((raw: any) => {
          try {
            const msg = JSON.parse(raw.toString());
            if (msg.type === "CLIPBOARD") {
              const text = msg.text;

              if (options.copy !== false) {
                writeClipboard(text);
                UI.success("Content copied directly to your clipboard! Ã°Å¸â€œâ€¹");
              }

              console.log();
              console.log(pc.bold(pc.cyan("--- CLIPBOARD CONTENT ---")));
              console.log(text);
              console.log(pc.bold(pc.cyan("-------------------------")));
              console.log();

              dc.sendMessage(JSON.stringify({ type: "CLIPBOARD_ACK" }));

              setTimeout(() => {
                peer.close();
                signalClient.close();
                process.exit(0);
              }, 300);
            }
          } catch (err: any) {
            UI.error(`Failed to process clipboard content: ${err.message}`);
          }
        });
      });

      peer.on("error", (err) => {
        UI.error(`Peer error: ${err.message}`);
      });
    } catch (err: any) {
      UI.error(`Clipboard receive failed: ${err.message}`);
      process.exit(1);
    }
  });

// Command: Ephemeral Signaling Relay
program
  .command("signal")
  .description("Run an ephemeral WebRTC signaling server")
  .option("-p, --port <number>", "Port to listen on", process.env.PORT || "9000")
  .option("-h, --host <host>", "Host to bind", "0.0.0.0")
  .action(async (options: any) => {
    UI.banner();
    const port = parseInt(options.port, 10);
    const server = new EphemeralSignalingServer({ port, host: options.host });

    try {
      await server.start();

      const shutdown = async () => {
        UI.info("Shutting down signaling server...");
        await server.close();
        process.exit(0);
      };

      process.on("SIGINT", shutdown);
      process.on("SIGTERM", shutdown);
    } catch (err: any) {
      UI.error(`Server failed to start: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
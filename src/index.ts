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
  .option("-s, --signal <url>", "Signaling server URL", "ws://localhost:9000")
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
  .option("-s, --signal <url>", "Signaling server URL", "ws://localhost:9000")
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
          UI.info(`SHA-256 Checksum: ${pc.dim(result.sha256)} (Verified ✔)`);

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
  .description("Sync clipboard contents directly between machines");

clipCommand
  .command("send")
  .description("Share clipboard contents with a peer")
  .option("-s, --signal <url>", "Signaling server URL", "ws://localhost:9000")
  .action((options: any) => {
    UI.banner();
    UI.info("Broadcasting clipboard content to peer...");
  });

clipCommand
  .command("get")
  .description("Fetch shared clipboard content from a peer")
  .argument("<code>", "Pairing code")
  .option("-s, --signal <url>", "Signaling server URL", "ws://localhost:9000")
  .action((code: string, options: any) => {
    UI.banner();
    UI.info(`Fetching clipboard content for code: ${code}`);
  });

// Command: Ephemeral Signaling Relay
program
  .command("signal")
  .description("Run an ephemeral WebRTC signaling server")
  .option("-p, --port <number>", "Port to listen on", "9000")
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
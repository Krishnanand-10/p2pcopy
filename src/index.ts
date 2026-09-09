import { Command } from "commander";
import { UI } from "./utils/ui";

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
  .action((file: string, options: any) => {
    UI.banner();
    UI.info(`Initiating transfer for file: ${file}`);
    UI.info(`Signaling server: ${options.signal}`);
    UI.warn("WebRTC data engine will be activated in next milestone.");
  });

// Command: Receive a file
program
  .command("receive")
  .description("Receive a file from a peer using pairing code")
  .argument("<code>", "Pairing code (e.g. 749-102)")
  .option("-o, --output <dir>", "Output directory for received file", ".")
  .option("-s, --signal <url>", "Signaling server URL", "ws://localhost:9000")
  .option("--ice <servers...>", "Custom STUN/TURN server URLs")
  .action((code: string, options: any) => {
    UI.banner();
    UI.info(`Connecting to peer with code: ${code}`);
    UI.info(`Output directory: ${options.output}`);
    UI.warn("WebRTC data engine will be activated in next milestone.");
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
  .action((options: any) => {
    UI.banner();
    UI.info(`Starting ephemeral signaling server on port ${options.port}...`);
  });

program.parse(process.argv);

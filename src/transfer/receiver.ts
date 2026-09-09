import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DataChannel } from "node-datachannel";
import cliProgress from "cli-progress";
import pc from "picocolors";
import {
  FileHeader,
  FileHeaderAck,
  TransferComplete,
  TransferControlMessage,
} from "./protocol";
import { UI } from "../utils/ui";

export interface ReceiveFileOptions {
  outputDir: string;
  dataChannel: DataChannel;
  showProgress?: boolean;
}

export interface ReceiveResult {
  filename: string;
  outputPath: string;
  size: number;
  sha256: string;
}

export class FileReceiver {
  private outputDir: string;
  private dc: DataChannel;
  private showProgress: boolean;

  constructor(options: ReceiveFileOptions) {
    this.outputDir = path.resolve(options.outputDir);
    this.dc = options.dataChannel;
    this.showProgress = options.showProgress ?? true;
  }

  public receive(): Promise<ReceiveResult> {
    return new Promise((resolve, reject) => {
      let header: FileHeader | null = null;
      let writeStream: fs.WriteStream | null = null;
      let outputPath = "";
      let receivedBytes = 0;
      let hash = crypto.createHash("sha256");
      let progressBar: cliProgress.SingleBar | null = null;
      let startTime = 0;

      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      const cleanup = (err?: Error) => {
        if (progressBar) progressBar.stop();
        if (writeStream) {
          writeStream.destroy();
          if (fs.existsSync(outputPath) && err) {
            try {
              fs.unlinkSync(outputPath);
            } catch {}
          }
        }
        if (err) reject(err);
      };

      this.dc.onMessage((raw: any) => {
        try {
          if (!header) {
            // First message must be the stringified JSON FileHeader
            if (typeof raw === "string") {
              const msg: TransferControlMessage = JSON.parse(raw);
              if (msg.type === "FILE_HEADER") {
                header = msg;
                outputPath = path.join(this.outputDir, header.filename);
                writeStream = fs.createWriteStream(outputPath);
                startTime = Date.now();

                UI.info(`Receiving file: ${pc.bold(header.filename)} (${UI.formatBytes(header.size)})`);
                UI.info(`Saving to: ${pc.cyan(outputPath)}`);

                if (this.showProgress) {
                  progressBar = new cliProgress.SingleBar(
                    {
                      format: `${pc.green("{bar}")} {percentage}% | {transferred}/{total} | {speed} | ETA: {eta}s`,
                      barCompleteChar: "\u2588",
                      barIncompleteChar: "\u2591",
                      hideCursor: true,
                    },
                    cliProgress.Presets.shades_classic
                  );
                  progressBar.start(header.size, 0, {
                    transferred: UI.formatBytes(0),
                    total: UI.formatBytes(header.size),
                    speed: "0 B/s",
                  });
                }

                // Send ACK back to sender so sender can stream chunks
                const ack: FileHeaderAck = { type: "FILE_HEADER_ACK" };
                this.dc.sendMessage(JSON.stringify(ack));
              }
            }
            return;
          }

          // Header already received: incoming messages are binary file chunks
          const chunk = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
          if (writeStream && chunk.length > 0) {
            writeStream.write(chunk);
            hash.update(chunk);
            receivedBytes += chunk.length;

            if (progressBar) {
              const elapsedSec = (Date.now() - startTime) / 1000;
              const speed = elapsedSec > 0 ? receivedBytes / elapsedSec : 0;
              progressBar.update(receivedBytes, {
                transferred: UI.formatBytes(receivedBytes),
                total: UI.formatBytes(header.size),
                speed: UI.formatSpeed(speed),
              });
            }

            // Check if transfer complete
            if (receivedBytes >= header.size) {
              if (progressBar) progressBar.stop();
              writeStream.end(() => {
                const computedHash = hash.digest("hex");
                if (computedHash === header!.sha256) {
                  const reply: TransferComplete = { type: "TRANSFER_COMPLETE", success: true };
                  this.dc.sendMessage(JSON.stringify(reply));

                  resolve({
                    filename: header!.filename,
                    outputPath,
                    size: header!.size,
                    sha256: computedHash,
                  });
                } else {
                  const reply: TransferComplete = {
                    type: "TRANSFER_COMPLETE",
                    success: false,
                    message: "Checksum mismatch",
                  };
                  this.dc.sendMessage(JSON.stringify(reply));
                  cleanup(new Error(`Checksum mismatch! Expected: ${header!.sha256}, Got: ${computedHash}`));
                }
              });
            }
          }
        } catch (err: any) {
          cleanup(err);
        }
      });

      this.dc.onError((err: string) => {
        cleanup(new Error(`DataChannel error during receive: ${err}`));
      });
    });
  }
}
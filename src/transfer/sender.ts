import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DataChannel } from "node-datachannel";
import cliProgress from "cli-progress";
import pc from "picocolors";
import {
  DEFAULT_CHUNK_SIZE,
  HIGH_WATER_MARK,
  LOW_WATER_MARK,
  FileHeader,
  TransferControlMessage,
} from "./protocol";
import { UI } from "../utils/ui";

export interface SendFileOptions {
  filePath: string;
  dataChannel: DataChannel;
  showProgress?: boolean;
}

export class FileSender {
  private filePath: string;
  private dc: DataChannel;
  private showProgress: boolean;

  constructor(options: SendFileOptions) {
    this.filePath = path.resolve(options.filePath);
    this.dc = options.dataChannel;
    this.showProgress = options.showProgress ?? true;
  }

  public async send(): Promise<void> {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`File not found: ${this.filePath}`);
    }

    const stat = fs.statSync(this.filePath);
    if (stat.isDirectory()) {
      throw new Error("Directory sending will be supported in a future update. Please zip directories for now.");
    }

    const filename = path.basename(this.filePath);
    const totalSize = stat.size;

    UI.info(`Computing SHA-256 checksum for ${pc.bold(filename)} (${UI.formatBytes(totalSize)})...`);
    const sha256 = await this.computeHash(this.filePath);
    UI.success(`SHA-256: ${pc.dim(sha256)}`);

    // Prepare header
    const header: FileHeader = {
      type: "FILE_HEADER",
      filename,
      size: totalSize,
      sha256,
      chunkSize: DEFAULT_CHUNK_SIZE,
    };

    // Await ACK from receiver
    await this.exchangeHeader(header);

    // Stream file data
    await this.streamFileData(totalSize);
  }

  private computeHash(file: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha256");
      const stream = fs.createReadStream(file);
      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", reject);
    });
  }

  private exchangeHeader(header: FileHeader): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout waiting for receiver to acknowledge file header."));
      }, 15000);

      const onMsg = (msg: any) => {
        try {
          if (typeof msg === "string") {
            const parsed: TransferControlMessage = JSON.parse(msg);
            if (parsed.type === "FILE_HEADER_ACK") {
              clearTimeout(timeout);
              resolve();
            }
          }
        } catch {
          // ignore binary chunks
        }
      };

      this.dc.onMessage(onMsg);
      this.dc.sendMessage(JSON.stringify(header));
    });
  }

  private streamFileData(totalSize: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dc.setBufferedAmountLowThreshold(LOW_WATER_MARK);

      let progressBar: cliProgress.SingleBar | null = null;
      let transferredBytes = 0;
      let startTime = Date.now();

      if (this.showProgress) {
        progressBar = new cliProgress.SingleBar(
          {
            format: `${pc.cyan("{bar}")} {percentage}% | {transferred}/{total} | {speed} | ETA: {eta}s`,
            barCompleteChar: "\u2588",
            barIncompleteChar: "\u2591",
            hideCursor: true,
          },
          cliProgress.Presets.shades_classic
        );
        progressBar.start(totalSize, 0, {
          transferred: UI.formatBytes(0),
          total: UI.formatBytes(totalSize),
          speed: "0 B/s",
        });
      }

      const stream = fs.createReadStream(this.filePath, {
        highWaterMark: DEFAULT_CHUNK_SIZE,
      });

      // Backpressure handler
      this.dc.onBufferedAmountLow(() => {
        stream.resume();
      });

      // Completion listener from receiver
      this.dc.onMessage((msg: any) => {
        try {
          if (typeof msg === "string") {
            const parsed: TransferControlMessage = JSON.parse(msg);
            if (parsed.type === "TRANSFER_COMPLETE") {
              if (progressBar) progressBar.stop();
              if (parsed.success) {
                resolve();
              } else {
                reject(new Error(`Receiver reported transfer failure: ${parsed.message}`));
              }
            }
          }
        } catch {
          // ignore binary messages
        }
      });

      stream.on("data", (chunk: any) => {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        this.dc.sendMessageBinary(buf);
        transferredBytes += buf.length;

        if (progressBar) {
          const elapsedSec = (Date.now() - startTime) / 1000;
          const speed = elapsedSec > 0 ? transferredBytes / elapsedSec : 0;
          progressBar.update(transferredBytes, {
            transferred: UI.formatBytes(transferredBytes),
            total: UI.formatBytes(totalSize),
            speed: UI.formatSpeed(speed),
          });
        }

        if (this.dc.bufferedAmount() > HIGH_WATER_MARK) {
          stream.pause();
        }
      });

      stream.on("error", (err) => {
        if (progressBar) progressBar.stop();
        reject(err);
      });
    });
  }
}
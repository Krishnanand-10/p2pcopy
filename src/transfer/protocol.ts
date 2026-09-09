export const DEFAULT_CHUNK_SIZE = 64 * 1024; // 64 KB per SCTP chunk
export const HIGH_WATER_MARK = 1024 * 1024;  // Pause disk read if bufferedAmount > 1MB
export const LOW_WATER_MARK = 256 * 1024;    // Resume disk read when bufferedAmount < 256KB

export interface FileHeader {
  type: "FILE_HEADER";
  filename: string;
  size: number;
  sha256: string;
  chunkSize: number;
}

export interface FileHeaderAck {
  type: "FILE_HEADER_ACK";
}

export interface TransferComplete {
  type: "TRANSFER_COMPLETE";
  success: boolean;
  message?: string;
}

export type TransferControlMessage =
  | FileHeader
  | FileHeaderAck
  | TransferComplete;
import { WebSocket } from "ws";
import { EventEmitter } from "events";
import { ClientMessage, ServerMessage, SignalPayload } from "./types";

export interface SignalingClientEvents {
  "peer-joined": (roomId: string) => void;
  "signal": (payload: SignalPayload) => void;
  "peer-disconnected": (roomId: string) => void;
  "error": (err: Error) => void;
  "close": () => void;
}

export class SignalingClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private isConnected = false;

  constructor(private url: string) {
    super();
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.on("open", () => {
          this.isConnected = true;
          resolve();
        });

        this.ws.on("message", (raw: string) => {
          try {
            const msg: ServerMessage = JSON.parse(raw.toString());
            this.handleServerMessage(msg);
          } catch (e: any) {
            this.emit("error", new Error(`Failed to parse server message: ${e.message}`));
          }
        });

        this.ws.on("close", () => {
          this.isConnected = false;
          this.emit("close");
        });

        this.ws.on("error", (err) => {
          if (!this.isConnected) {
            reject(new Error(`Failed to connect to signaling server at ${this.url}: ${err.message}`));
          } else {
            this.emit("error", err);
          }
        });
      } catch (err: any) {
        reject(err);
      }
    });
  }

  public createRoom(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || !this.isConnected) {
        return reject(new Error("Signaling client is not connected."));
      }

      const onMessage = (raw: string) => {
        try {
          const msg: ServerMessage = JSON.parse(raw.toString());
          if (msg.type === "room-created" && msg.roomId === roomId) {
            this.ws?.off("message", onMessage);
            resolve();
          } else if (msg.type === "error") {
            this.ws?.off("message", onMessage);
            reject(new Error(msg.message));
          }
        } catch {
          // ignore
        }
      };

      this.ws.on("message", onMessage);
      this.send({ type: "create-room", roomId });
    });
  }

  public joinRoom(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || !this.isConnected) {
        return reject(new Error("Signaling client is not connected."));
      }

      const onMessage = (raw: string) => {
        try {
          const msg: ServerMessage = JSON.parse(raw.toString());
          if (msg.type === "room-joined" && msg.roomId === roomId) {
            this.ws?.off("message", onMessage);
            resolve();
          } else if (msg.type === "error") {
            this.ws?.off("message", onMessage);
            reject(new Error(msg.message));
          }
        } catch {
          // ignore
        }
      };

      this.ws.on("message", onMessage);
      this.send({ type: "join-room", roomId });
    });
  }

  public sendSignal(roomId: string, payload: SignalPayload): void {
    this.send({ type: "signal", roomId, payload });
  }

  public close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  private send(msg: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private handleServerMessage(msg: ServerMessage): void {
    switch (msg.type) {
      case "peer-joined":
        this.emit("peer-joined", msg.roomId);
        break;
      case "signal":
        this.emit("signal", msg.payload);
        break;
      case "peer-disconnected":
        this.emit("peer-disconnected", msg.roomId);
        break;
      case "error":
        this.emit("error", new Error(msg.message));
        break;
    }
  }
}
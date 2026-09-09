import { WebSocketServer, WebSocket } from "ws";
import { ClientMessage, ServerMessage } from "./types";
import { UI } from "../utils/ui";
import pc from "picocolors";

export interface SignalingServerOptions {
  port: number;
  host?: string;
}

export class EphemeralSignalingServer {
  private wss: WebSocketServer | null = null;
  private rooms = new Map<string, Set<WebSocket>>();
  private socketToRoom = new Map<WebSocket, string>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(private options: SignalingServerOptions) {}

  public start(): Promise<number> {
    return new Promise((resolve, reject) => {
      const port = this.options.port;
      const host = this.options.host || "0.0.0.0";

      this.wss = new WebSocketServer({ port, host }, () => {
        UI.success(`Ephemeral signaling server listening on ${pc.cyan(`${host}:${port}`)}`);
        UI.info("Zero-storage mode active: rooms self-destruct upon peer disconnect.");
        resolve(port);
      });

      this.wss.on("connection", (ws: WebSocket) => {
        (ws as any).isAlive = true;

        ws.on("pong", () => {
          (ws as any).isAlive = true;
        });

        ws.on("message", (raw: string) => {
          try {
            const msg: ClientMessage = JSON.parse(raw.toString());
            this.handleMessage(ws, msg);
          } catch (err: any) {
            this.send(ws, { type: "error", message: `Invalid message format: ${err.message}` });
          }
        });

        ws.on("close", () => {
          this.handleDisconnect(ws);
        });

        ws.on("error", () => {
          this.handleDisconnect(ws);
        });
      });

      this.wss.on("error", (err) => {
        reject(err);
      });

      // Heartbeat every 30 seconds
      this.heartbeatInterval = setInterval(() => {
        if (!this.wss) return;
        this.wss.clients.forEach((ws: any) => {
          if (!ws.isAlive) {
            return ws.terminate();
          }
          ws.isAlive = false;
          ws.ping();
        });
      }, 30000);
    });
  }

  private handleMessage(ws: WebSocket, msg: ClientMessage): void {
    const { type, roomId } = msg;

    switch (type) {
      case "create-room": {
        if (this.rooms.has(roomId)) {
          this.send(ws, { type: "error", message: `Room ${roomId} already exists.` });
          return;
        }

        const room = new Set<WebSocket>([ws]);
        this.rooms.set(roomId, room);
        this.socketToRoom.set(ws, roomId);

        this.send(ws, { type: "room-created", roomId });
        break;
      }

      case "join-room": {
        const room = this.rooms.get(roomId);
        if (!room) {
          this.send(ws, { type: "error", message: `Room ${roomId} does not exist or expired.` });
          return;
        }

        if (room.size >= 2) {
          this.send(ws, { type: "error", message: `Room ${roomId} is already full.` });
          return;
        }

        room.add(ws);
        this.socketToRoom.set(ws, roomId);

        // Notify joiner
        this.send(ws, { type: "room-joined", roomId, isInitiator: false });

        // Notify initiator that peer joined
        for (const client of room) {
          if (client !== ws) {
            this.send(client, { type: "peer-joined", roomId });
          }
        }
        break;
      }

      case "signal": {
        const room = this.rooms.get(roomId);
        if (!room) {
          this.send(ws, { type: "error", message: `Cannot relay signal: room ${roomId} not found.` });
          return;
        }

        // Forward signal to the other peer
        for (const client of room) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            this.send(client, { type: "signal", roomId, payload: msg.payload });
          }
        }
        break;
      }

      case "leave-room": {
        this.handleDisconnect(ws);
        break;
      }
    }
  }

  private handleDisconnect(ws: WebSocket): void {
    const roomId = this.socketToRoom.get(ws);
    if (!roomId) return;

    this.socketToRoom.delete(ws);
    const room = this.rooms.get(roomId);

    if (room) {
      room.delete(ws);

      // Notify any remaining peer
      for (const peer of room) {
        if (peer.readyState === WebSocket.OPEN) {
          this.send(peer, { type: "peer-disconnected", roomId });
        }
      }

      // Self-destruct room
      this.rooms.delete(roomId);
    }
  }

  private send(ws: WebSocket, msg: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  public close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      if (this.wss) {
        this.wss.close(() => {
          this.rooms.clear();
          this.socketToRoom.clear();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
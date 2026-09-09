import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { ClientMessage, ServerMessage } from "./types";
import { UI } from "../utils/ui";
import pc from "picocolors";

export interface SignalingServerOptions {
  port: number;
  host?: string;
}

export class EphemeralSignalingServer {
  private httpServer: http.Server | null = null;
  private wss: WebSocketServer | null = null;
  private rooms = new Map<string, Set<WebSocket>>();
  private socketToRoom = new Map<WebSocket, string>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(private options: SignalingServerOptions) {}

  public start(): Promise<number> {
    return new Promise((resolve, reject) => {
      const port = this.options.port;
      const host = this.options.host || "0.0.0.0";

      // HTTP server to serve a status page for browser visits
      this.httpServer = http.createServer((req, res) => {
        if (req.url === "/" || req.url === "/health") {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>p2pcopy — Ephemeral Signaling Relay</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; box-sizing: border-box; }
    .card { background: #1e293b; padding: 2.5rem; border-radius: 1.25rem; border: 1px solid #334155; text-align: center; max-width: 520px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 0.4rem 0.9rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1.25rem; border: 1px solid rgba(16, 185, 129, 0.3); }
    .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px #10b981; }
    h1 { margin: 0.25rem 0 0.75rem 0; font-size: 1.85rem; color: #38bdf8; letter-spacing: -0.025em; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin: 0.5rem 0; }
    .terminal-box { background: #0b1120; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1rem; margin: 1.5rem 0; text-align: left; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.875rem; color: #cbd5e1; overflow-x: auto; }
    .cmd { color: #38bdf8; }
    .footer { margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid #334155; font-size: 0.85rem; color: #64748b; }
    a { color: #38bdf8; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span> Signaling Relay Online</div>
    <h1>🚀 p2pcopy</h1>
    <p>This is an ephemeral, zero-storage WebRTC signaling server. Payloads never touch this server — all files and clipboard data flow directly peer-to-peer with end-to-end encryption.</p>
    <div class="terminal-box">
      <div><span style="color:#64748b;"># Send a file</span></div>
      <div>$ <span class="cmd">p2pcopy send</span> &lt;file&gt;</div>
      <div style="margin-top:0.5rem;"><span style="color:#64748b;"># Receive on another machine</span></div>
      <div>$ <span class="cmd">p2pcopy receive</span> &lt;code&gt;</div>
    </div>
    <div class="footer">
      Open source on <a href="https://github.com/Krishnanand-10/p2pcopy" target="_blank">GitHub (Krishnanand-10/p2pcopy)</a>
    </div>
  </div>
</body>
</html>`);
        } else {
          res.writeHead(404);
          res.end();
        }
      });

      this.wss = new WebSocketServer({ server: this.httpServer });

      this.httpServer.listen(port, host, () => {
        UI.success(`Ephemeral signaling server listening on ${pc.cyan(`${host}:${port}`)}`);
        UI.info("Zero-storage mode active: rooms self-destruct upon peer disconnect.");
        resolve(port);
      });

      this.httpServer.on("error", (err) => {
        reject(err);
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

        this.send(ws, { type: "room-joined", roomId, isInitiator: false });

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

      for (const peer of room) {
        if (peer.readyState === WebSocket.OPEN) {
          this.send(peer, { type: "peer-disconnected", roomId });
        }
      }

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

      const closeWs = () => {
        if (this.wss) {
          this.wss.close(() => {
            this.rooms.clear();
            this.socketToRoom.clear();
            resolve();
          });
        } else {
          resolve();
        }
      };

      if (this.httpServer) {
        this.httpServer.close(() => {
          closeWs();
        });
      } else {
        closeWs();
      }
    });
  }
}
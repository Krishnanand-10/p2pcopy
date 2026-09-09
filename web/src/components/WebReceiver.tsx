import React, { useState, useRef, useEffect } from "react";
import { Download, Copy, Check, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

const SIGNAL_URL = "wss://p2pcopy.onrender.com";

interface FileHeader {
  type: "FILE_HEADER";
  filename: string;
  size: number;
  sha256: string;
  chunkSize: number;
}

export const WebReceiver: React.FC = () => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "negotiating" | "receiving" | "completed" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [receivedType, setReceivedType] = useState<"file" | "clip" | null>(null);

  // File download state
  const [fileHeader, setFileHeader] = useState<FileHeader | null>(null);
  const [receivedBytes, setReceivedBytes] = useState(0);
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState("0 B/s");

  // Clipboard state
  const [clipText, setClipText] = useState("");
  const [copied, setCopied] = useState(false);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const chunksRef = useRef<ArrayBuffer[]>([]);
  const startTimeRef = useRef<number>(0);

  // Auto-detect code from URL hash (e.g. #842-194)
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.replace("#", "").trim();
      if (hash) {
        setCode(hash);
      }
    }
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleStartReceive = () => {
    const cleanCode = code.trim().replace(/\s+/g, "");
    if (!cleanCode) return;

    setStatus("connecting");
    setStatusMessage("Connecting to signaling server...");
    chunksRef.current = [];
    setReceivedBytes(0);
    setProgress(0);
    setFileHeader(null);
    setClipText("");

    try {
      const ws = new WebSocket(SIGNAL_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatusMessage(`Joining room ${cleanCode}...`);
        ws.send(JSON.stringify({ type: "join-room", roomId: cleanCode }));
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "room-joined") {
            setStatus("negotiating");
            setStatusMessage("Joined room. Negotiating WebRTC peer connection...");
            initWebRTC(ws, cleanCode);
          } else if (msg.type === "signal") {
            handleSignal(msg.payload, ws, cleanCode);
          } else if (msg.type === "error") {
            setStatus("error");
            setStatusMessage(msg.message || "Failed to join room.");
            cleanup();
          }
        } catch (e) {
          console.error("Signaling message error:", e);
        }
      };

      ws.onerror = () => {
        setStatus("error");
        setStatusMessage("Failed to connect to signaling server.");
        cleanup();
      };
    } catch (err: any) {
      setStatus("error");
      setStatusMessage(err.message || "Connection failed.");
    }
  };

  const initWebRTC = (ws: WebSocket, roomId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "signal",
            roomId,
            payload: {
              type: "candidate",
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
            },
          })
        );
      }
    };

    pc.ondatachannel = (event) => {
      const dc = event.channel;
      dcRef.current = dc;
      dc.binaryType = "arraybuffer";

      dc.onopen = () => {
        setStatus("receiving");
        setStatusMessage("Direct WebRTC DataChannel connected! Awaiting stream...");
        startTimeRef.current = Date.now();
      };

      let currentHeader: FileHeader | null = null;
      let totalReceived = 0;

      dc.onmessage = (e) => {
        if (typeof e.data === "string") {
          try {
            const data = JSON.parse(e.data);

            if (data.type === "FILE_HEADER") {
              currentHeader = data;
              setFileHeader(data);
              setReceivedType("file");
              setStatusMessage(`Receiving ${data.filename} (${formatBytes(data.size)})...`);
              dc.send(JSON.stringify({ type: "FILE_HEADER_ACK" }));
            } else if (data.type === "CLIPBOARD") {
              setReceivedType("clip");
              setClipText(data.text);
              setStatus("completed");
              setStatusMessage("Clipboard payload received successfully.");
              dc.send(JSON.stringify({ type: "CLIPBOARD_ACK" }));
              cleanup();
            }
          } catch {}
          return;
        }

        if (e.data instanceof ArrayBuffer) {
          chunksRef.current.push(e.data);
          totalReceived += e.data.byteLength;
          setReceivedBytes(totalReceived);

          if (currentHeader && currentHeader.size > 0) {
            const percent = Math.min(100, Math.round((totalReceived / currentHeader.size) * 100));
            setProgress(percent);

            const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
            const speed = elapsedSec > 0 ? totalReceived / elapsedSec : 0;
            setDownloadSpeed(`${formatBytes(speed)}/s`);

            if (totalReceived >= currentHeader.size) {
              triggerFileDownload(currentHeader, dc);
            }
          }
        }
      };
    };
  };

  const handleSignal = async (payload: any, ws: WebSocket, roomId: string) => {
    const pc = pcRef.current;
    if (!pc) return;

    if (payload.type === "offer") {
      await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: payload.sdp }));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "signal",
            roomId,
            payload: {
              type: "answer",
              sdp: answer.sdp,
            },
          })
        );
      }
    } else if (payload.type === "candidate") {
      try {
        await pc.addIceCandidate(
          new RTCIceCandidate({
            candidate: payload.candidate,
            sdpMid: payload.sdpMid,
            sdpMLineIndex: payload.sdpMLineIndex,
          })
        );
      } catch (e) {
        console.error("Failed to add remote candidate:", e);
      }
    }
  };

  const triggerFileDownload = (header: FileHeader, dc: RTCDataChannel) => {
    const blob = new Blob(chunksRef.current);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = header.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    dc.send(JSON.stringify({ type: "TRANSFER_COMPLETE", success: true }));
    setStatus("completed");
    setStatusMessage(`File ${header.filename} downloaded successfully.`);
    cleanup();
  };

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  };

  const copyReceivedClip = () => {
    navigator.clipboard.writeText(clipText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="receiver" className="scroll-mt-24 border-t border-line py-20 text-left sm:py-28">
      <div>
        <h2 className="text-3xl sm:text-4xl text-white font-bold tracking-tight">
          Prefer the browser?
        </h2>
        <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-ink-soft">
          Enter your 6-digit pairing code to download files or receive clipboard text directly in this browser window over WebRTC.
        </p>
      </div>

      <div className="mt-10 max-w-2xl rounded-[16px] border border-line bg-panel p-6 sm:p-8">
        {status === "idle" || status === "error" ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="6-digit pairing code (e.g. 842-194)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartReceive()}
                className="flex-1 rounded-[12px] border border-line bg-paper-2 px-4 py-3 font-mono text-sm text-ink placeholder-ink-faint focus:border-[#00d2ff]/60 focus:outline-none"
              />
              <button
                onClick={handleStartReceive}
                disabled={!code.trim()}
                className="rounded-[11px] bg-[#00d2ff] px-5 py-3 text-sm font-semibold text-black transition-opacity duration-300 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Connect & Download
              </button>
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-[10px] border border-rose-500/20 bg-rose-500/10 p-3 font-mono text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        ) : status === "connecting" || status === "negotiating" ? (
          <div className="py-6 text-center space-y-3">
            <Loader2 className="h-6 w-6 text-[#00d2ff] animate-spin mx-auto" />
            <div className="font-mono text-xs text-ink-soft">{statusMessage}</div>
          </div>
        ) : status === "receiving" && receivedType === "file" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-ink font-medium">{fileHeader?.filename}</span>
              <span className="text-[#00d2ff] font-semibold">{progress}%</span>
            </div>

            <div className="w-full bg-paper-2 rounded-full h-2 overflow-hidden border border-line">
              <div
                className="bg-[#00d2ff] h-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between font-mono text-[11px] text-ink-faint">
              <span>{formatBytes(receivedBytes)} / {formatBytes(fileHeader?.size || 0)}</span>
              <span>Speed: {downloadSpeed}</span>
            </div>
          </div>
        ) : status === "completed" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#00d2ff]" />
                <span className="text-sm font-medium text-ink">
                  {receivedType === "file" ? "File downloaded to your device" : "Clipboard payload received"}
                </span>
              </div>
              <button
                onClick={() => {
                  setStatus("idle");
                  setCode("");
                }}
                className="font-mono text-xs text-ink-soft hover:text-ink underline underline-offset-4"
              >
                Receive another
              </button>
            </div>

            {receivedType === "clip" && (
              <div className="space-y-3 pt-2">
                <div className="rounded-[10px] border border-line bg-paper-2 p-3 font-mono text-xs text-ink-soft break-all select-all max-h-40 overflow-y-auto">
                  {clipText}
                </div>
                <button
                  onClick={copyReceivedClip}
                  className="rounded-[10px] bg-[#00d2ff] px-4 py-2 font-mono text-xs font-semibold text-black transition-opacity hover:opacity-90"
                >
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};
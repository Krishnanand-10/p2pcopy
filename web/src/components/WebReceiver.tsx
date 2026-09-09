import React, { useState, useRef } from "react";
import { Download, Copy, Check, ShieldCheck, Wifi, WifiOff, FileBox, Clipboard, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

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

  // Refs for WebRTC & WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const chunksRef = useRef<ArrayBuffer[]>([]);
  const startTimeRef = useRef<number>(0);

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
    setStatusMessage(`Connecting to signaling relay (${SIGNAL_URL})...`);
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
        } catch (e: any) {
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
        setStatusMessage("WebRTC DataChannel connected! Awaiting stream from sender...");
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

              // Acknowledge header so CLI starts sending chunks
              dc.send(JSON.stringify({ type: "FILE_HEADER_ACK" }));
            } else if (data.type === "CLIPBOARD") {
              setReceivedType("clip");
              setClipText(data.text);
              setStatus("completed");
              setStatusMessage("Clipboard content received successfully!");
              dc.send(JSON.stringify({ type: "CLIPBOARD_ACK" }));
              cleanup();
            }
          } catch {}
          return;
        }

        // Binary chunk received
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

    // Notify sender of completion
    dc.send(JSON.stringify({ type: "TRANSFER_COMPLETE", success: true }));

    setStatus("completed");
    setStatusMessage(`File ${header.filename} downloaded successfully!`);
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
    <section id="receiver" className="w-full max-w-4xl mx-auto py-16 px-4 text-left">
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono text-emerald-300 mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Zero-Install Web Receiver</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Receive in Your Browser
              </h3>
              <p className="text-zinc-400 text-sm mt-1 font-light">
                Non-tech friend? No terminal required. Enter the 6-digit code to stream files directly into this tab.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Direct WebRTC E2EE</span>
            </div>
          </div>

          {/* Form / Interactive Area */}
          <div className="mt-8">
            {status === "idle" || status === "error" ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="e.g. 842-194"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleStartReceive()}
                      className="w-full px-5 py-3.5 rounded-xl bg-zinc-950/80 border border-white/10 text-white placeholder-zinc-600 font-mono text-base focus:outline-none focus:border-cyan-400/80 transition-all shadow-inner"
                    />
                  </div>

                  <button
                    onClick={handleStartReceive}
                    disabled={!code.trim()}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 font-semibold text-sm transition-all shadow-lg shadow-cyan-950/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    <Download className="h-4 w-4" />
                    <span>Connect & Download</span>
                  </button>
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{statusMessage}</span>
                  </div>
                )}
              </div>
            ) : status === "connecting" || status === "negotiating" ? (
              <div className="p-8 rounded-2xl bg-zinc-950/60 border border-white/10 text-center space-y-4">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
                <div className="font-mono text-sm text-zinc-300">{statusMessage}</div>
                <div className="text-xs text-zinc-500 font-mono">Negotiating ICE candidates & DTLS keys with sender...</div>
              </div>
            ) : status === "receiving" && receivedType === "file" ? (
              <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <FileBox className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white font-mono">{fileHeader?.filename}</div>
                      <div className="text-xs text-zinc-400 font-mono">
                        {formatBytes(receivedBytes)} / {formatBytes(fileHeader?.size || 0)}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-sm text-cyan-300 font-bold">{progress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs font-mono text-zinc-500">
                  <span>Speed: <span className="text-zinc-300">{downloadSpeed}</span></span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Streaming via WebRTC
                  </span>
                </div>
              </div>
            ) : status === "completed" ? (
              <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-white">
                        {receivedType === "file" ? "Download Completed!" : "Clipboard Received!"}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {receivedType === "file"
                          ? `Saved to your Downloads folder: ${fileHeader?.filename}`
                          : "Received text snippet directly from peer terminal"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setStatus("idle");
                      setCode("");
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 transition-all"
                  >
                    Receive Another
                  </button>
                </div>

                {receivedType === "clip" && (
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/10 text-zinc-200 font-mono text-xs break-all max-h-48 overflow-y-auto">
                      {clipText}
                    </div>

                    <button
                      onClick={copyReceivedClip}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-all shadow-md active:scale-[0.98]"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? "Copied to Clipboard!" : "Copy to Clipboard"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};
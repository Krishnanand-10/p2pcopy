import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Download,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  FileText,
  Clipboard,
  X,
  Share2,
} from "lucide-react";

const SIGNAL_URL = "wss://p2pcopy.onrender.com";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
];

interface FileHeader {
  type: "FILE_HEADER";
  filename: string;
  size: number;
  sha256: string;
  chunkSize: number;
}

export const WebReceiver: React.FC = () => {
  // ==========================================
  // SENDER STATE (Box 1: Send a File or Beam Clipboard)
  // ==========================================
  const [senderMode, setSenderMode] = useState<"file" | "clip">("file");
  const [fileToSend, setFileToSend] = useState<File | null>(null);
  const [clipToSend, setClipToSend] = useState("");
  const [clipInputText, setClipInputText] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sendStatus, setSendStatus] = useState<
    "idle" | "preparing" | "waiting-for-peer" | "connecting" | "streaming" | "completed" | "error"
  >("idle");
  const [sendStatusMsg, setSendStatusMsg] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendProgress, setSendProgress] = useState(0);
  const [sendTransferred, setSendTransferred] = useState(0);
  const [sendSpeed, setSendSpeed] = useState("0 B/s");

  const sendWsRef = useRef<WebSocket | null>(null);
  const sendPcRef = useRef<RTCPeerConnection | null>(null);
  const sendDcRef = useRef<RTCDataChannel | null>(null);
  const sendSha256Ref = useRef<string>("");
  const clipToSendRef = useRef<string>("");
  const sendPendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const sendAbortRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ==========================================
  // RECEIVER STATE (Box 2: Receive with Code)
  // ==========================================
  const [receiveCode, setReceiveCode] = useState("");
  const [receiveStatus, setReceiveStatus] = useState<
    "idle" | "connecting" | "negotiating" | "receiving" | "completed" | "error"
  >("idle");
  const [receiveStatusMsg, setReceiveStatusMsg] = useState("");
  const [receiveError, setReceiveError] = useState("");
  const [receivedType, setReceivedType] = useState<"file" | "clip" | null>(null);
  const [recvHeader, setRecvHeader] = useState<FileHeader | null>(null);
  const [recvBytes, setRecvBytes] = useState(0);
  const [recvProgress, setRecvProgress] = useState(0);
  const [recvSpeed, setRecvSpeed] = useState("0 B/s");
  const [clipText, setClipText] = useState("");
  const [copiedClip, setCopiedClip] = useState(false);

  const recvWsRef = useRef<WebSocket | null>(null);
  const recvPcRef = useRef<RTCPeerConnection | null>(null);
  const recvDcRef = useRef<RTCDataChannel | null>(null);
  const recvPendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const recvChunksRef = useRef<ArrayBuffer[]>([]);
  const recvStartTimeRef = useRef<number>(0);

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Generate 6-digit code XXX-XXX
  const generatePairingCode = () => {
    const num1 = Math.floor(100 + Math.random() * 900);
    const num2 = Math.floor(100 + Math.random() * 900);
    return `${num1}-${num2}`;
  };

  // Auto-detect code from URL hash (e.g. #842-194)
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.replace("#", "").trim();
      if (hash && !["receiver", "features", "commands", "library"].includes(hash)) {
        setReceiveCode(hash);
      }
    }
  }, []);

  // Compute SHA-256 hash
  const computeSHA256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // ----------------------------------------------------
  // SENDER ACTIONS
  // ----------------------------------------------------
  const resetSender = () => {
    sendAbortRef.current = true;
    if (sendWsRef.current) {
      sendWsRef.current.close();
      sendWsRef.current = null;
    }
    if (sendPcRef.current) {
      sendPcRef.current.close();
      sendPcRef.current = null;
    }
    if (sendDcRef.current) {
      sendDcRef.current.close();
      sendDcRef.current = null;
    }
    setFileToSend(null);
    setClipToSend("");
    clipToSendRef.current = "";
    sendPendingCandidatesRef.current = [];
    setGeneratedCode("");
    setSendStatus("idle");
    setSendStatusMsg("");
    setSendError("");
    setSendProgress(0);
    setSendTransferred(0);
    setSendSpeed("0 B/s");
    setCopiedCode(false);
    setCopiedLink(false);
  };

  const startSendFile = async (file: File) => {
    resetSender();
    setSenderMode("file");
    setFileToSend(file);
    setSendStatus("preparing");
    setSendStatusMsg("Connecting to relay...");
    sendAbortRef.current = false;

    const code = generatePairingCode();
    setGeneratedCode(code);

    computeSHA256(file)
      .then((hash) => {
        sendSha256Ref.current = hash;
      })
      .catch((err) => {
        console.warn("SHA-256 calculation:", err);
      });

    try {
      const ws = new WebSocket(SIGNAL_URL);
      sendWsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "create-room", roomId: code }));
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "room-created") {
            setSendStatus("waiting-for-peer");
            setSendStatusMsg("Room created. Waiting for peer...");
          } else if (msg.type === "peer-joined") {
            setSendStatus("connecting");
            setSendStatusMsg("Peer joined! Establishing WebRTC...");
            initSenderWebRTC(ws, code, "file", file);
          } else if (msg.type === "signal") {
            handleSenderSignal(msg.payload);
          } else if (msg.type === "peer-disconnected") {
            setSendError("Peer disconnected before transfer finished.");
            setSendStatus("error");
            resetSender();
          } else if (msg.type === "error") {
            setSendError(msg.message || "Signaling error.");
            setSendStatus("error");
          }
        } catch (e) {
          console.error("Sender message error:", e);
        }
      };

      ws.onerror = () => {
        setSendError("Failed to connect to signaling server.");
        setSendStatus("error");
      };
    } catch (err: any) {
      setSendError(err.message || "Failed to start sending.");
      setSendStatus("error");
    }
  };

  const startSendClip = async (text: string) => {
    if (!text.trim()) return;
    resetSender();
    setSenderMode("clip");
    setClipToSend(text);
    clipToSendRef.current = text;
    setSendStatus("preparing");
    setSendStatusMsg("Connecting to relay...");
    sendAbortRef.current = false;

    const code = generatePairingCode();
    setGeneratedCode(code);

    try {
      const ws = new WebSocket(SIGNAL_URL);
      sendWsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "create-room", roomId: code }));
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "room-created") {
            setSendStatus("waiting-for-peer");
            setSendStatusMsg("Room created. Waiting for peer...");
          } else if (msg.type === "peer-joined") {
            setSendStatus("connecting");
            setSendStatusMsg("Peer joined! Establishing WebRTC...");
            initSenderWebRTC(ws, code, "clip", undefined, text);
          } else if (msg.type === "signal") {
            handleSenderSignal(msg.payload);
          } else if (msg.type === "peer-disconnected") {
            setSendError("Peer disconnected before transfer finished.");
            setSendStatus("error");
            resetSender();
          } else if (msg.type === "error") {
            setSendError(msg.message || "Signaling error.");
            setSendStatus("error");
          }
        } catch (e) {
          console.error("Sender message error:", e);
        }
      };

      ws.onerror = () => {
        setSendError("Failed to connect to signaling server.");
        setSendStatus("error");
      };
    } catch (err: any) {
      setSendError(err.message || "Failed to start clipboard beam.");
      setSendStatus("error");
    }
  };

  const initSenderWebRTC = async (
    ws: WebSocket,
    roomId: string,
    mode: "file" | "clip" = "file",
    file?: File,
    text?: string
  ) => {
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    });
    sendPcRef.current = pc;

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

    const dc = pc.createDataChannel("p2pcopy-datachannel");
    dc.binaryType = "arraybuffer";
    sendDcRef.current = dc;

    dc.onopen = async () => {
      if (mode === "clip") {
        setSendStatus("streaming");
        setSendStatusMsg("WebRTC connected! Streaming clipboard...");
        const payload = text || clipToSendRef.current;
        const msg = JSON.stringify({
          type: "CLIPBOARD",
          text: payload,
          timestamp: Date.now(),
        });
        dc.send(msg);
        // Small fallback pulse in case peer DataChannel was just attaching listener
        setTimeout(() => {
          try {
            if (dc.readyState === "open" && sendStatus !== "completed") {
              dc.send(msg);
            }
          } catch {}
        }, 150);
        return;
      }

      if (!file) return;
      setSendStatus("streaming");
      setSendStatusMsg("WebRTC connected! Streaming...");

      if (!sendSha256Ref.current) {
        try {
          sendSha256Ref.current = await computeSHA256(file);
        } catch {
          sendSha256Ref.current = "0000000000000000000000000000000000000000000000000000000000000000";
        }
      }

      const header: FileHeader = {
        type: "FILE_HEADER",
        filename: file.name,
        size: file.size,
        sha256: sendSha256Ref.current,
        chunkSize: 64 * 1024,
      };

      dc.send(JSON.stringify(header));
    };

    dc.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "FILE_HEADER_ACK" && file) {
            streamFileChunks(file, dc);
          } else if (msg.type === "TRANSFER_COMPLETE") {
            setSendStatus("completed");
            setSendStatusMsg(`Transfer complete! Verified by receiver.`);
          } else if (msg.type === "CLIPBOARD_ACK") {
            setSendStatus("completed");
            setSendStatusMsg(`Clipboard beamed! Copied by peer.`);
          }
        } catch (e) {
          console.error("Sender DC parse error:", e);
        }
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "signal",
          roomId,
          payload: {
            type: "offer",
            sdp: offer.sdp,
          },
        })
      );
    }
  };

  const handleSenderSignal = async (payload: any) => {
    const pc = sendPcRef.current;
    if (!pc) return;

    if (payload.type === "answer") {
      await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: payload.sdp }));
      // Drain queued candidates received before answer
      while (sendPendingCandidatesRef.current.length > 0) {
        const cand = sendPendingCandidatesRef.current.shift();
        if (cand) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.warn("Failed adding queued candidate:", e);
          }
        }
      }
    } else if (payload.type === "candidate") {
      if (payload.candidate) {
        const cand: RTCIceCandidateInit = {
          candidate: payload.candidate,
          sdpMid: payload.sdpMid,
          sdpMLineIndex: payload.sdpMLineIndex,
        };
        if (!pc.remoteDescription) {
          sendPendingCandidatesRef.current.push(cand);
        } else {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.error("Error adding sender candidate:", e);
          }
        }
      }
    }
  };

  const streamFileChunks = async (file: File, dc: RTCDataChannel) => {
    const CHUNK_SIZE = 64 * 1024;
    const HIGH_WATER_MARK = 1024 * 1024;
    dc.bufferedAmountLowThreshold = 256 * 1024;

    let offset = 0;
    const startTime = Date.now();

    try {
      while (offset < file.size && !sendAbortRef.current && dc.readyState === "open") {
        if (dc.bufferedAmount > HIGH_WATER_MARK) {
          await new Promise<void>((resolve) => {
            const onLow = () => {
              dc.removeEventListener("bufferedamountlow", onLow);
              resolve();
            };
            dc.addEventListener("bufferedamountlow", onLow);
          });
        }

        if (sendAbortRef.current || dc.readyState !== "open") break;

        const slice = file.slice(offset, offset + CHUNK_SIZE);
        const buffer = await slice.arrayBuffer();
        dc.send(buffer);
        offset += buffer.byteLength;

        const transferred = Math.min(offset, file.size);
        setSendTransferred(transferred);
        const pct = Math.min(100, Math.round((transferred / file.size) * 100));
        setSendProgress(pct);

        const elapsedSec = (Date.now() - startTime) / 1000;
        const speed = elapsedSec > 0 ? transferred / elapsedSec : 0;
        setSendSpeed(`${formatBytes(speed)}/s`);
      }
    } catch (err: any) {
      setSendError(`Streaming error: ${err.message}`);
      setSendStatus("error");
    }
  };

  const copyPairingCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#${generatedCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ----------------------------------------------------
  // RECEIVER ACTIONS
  // ----------------------------------------------------
  const resetReceiver = () => {
    if (recvWsRef.current) {
      recvWsRef.current.close();
      recvWsRef.current = null;
    }
    if (recvPcRef.current) {
      recvPcRef.current.close();
      recvPcRef.current = null;
    }
    if (recvDcRef.current) {
      recvDcRef.current.close();
      recvDcRef.current = null;
    }
    recvChunksRef.current = [];
    recvPendingCandidatesRef.current = [];
    setReceiveCode("");
    setReceiveStatus("idle");
    setReceiveStatusMsg("");
    setReceiveError("");
    setReceivedType(null);
    setRecvHeader(null);
    setRecvBytes(0);
    setRecvProgress(0);
    setRecvSpeed("0 B/s");
    setClipText("");
    setCopiedClip(false);
  };

  const handleStartReceive = () => {
    const cleanCode = receiveCode.trim().replace(/\s+/g, "");
    if (!cleanCode) return;

    resetReceiver();
    setReceiveCode(cleanCode);
    setReceiveStatus("connecting");
    setReceiveStatusMsg("Connecting to relay...");

    try {
      const ws = new WebSocket(SIGNAL_URL);
      recvWsRef.current = ws;

      ws.onopen = () => {
        setReceiveStatusMsg(`Joining ${cleanCode}...`);
        ws.send(JSON.stringify({ type: "join-room", roomId: cleanCode }));
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "room-joined") {
            setReceiveStatus("negotiating");
            setReceiveStatusMsg("Negotiating WebRTC...");
            initReceiverWebRTC(ws, cleanCode);
          } else if (msg.type === "signal") {
            handleReceiverSignal(msg.payload, ws, cleanCode);
          } else if (msg.type === "error") {
            setReceiveError(msg.message || "Failed to join room.");
            setReceiveStatus("error");
          }
        } catch (e) {
          console.error("Receiver message error:", e);
        }
      };

      ws.onerror = () => {
        setReceiveError("Failed to connect to relay.");
        setReceiveStatus("error");
      };
    } catch (err: any) {
      setReceiveError(err.message || "Connection failed.");
      setReceiveStatus("error");
    }
  };

  const initReceiverWebRTC = (ws: WebSocket, roomId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    });
    recvPcRef.current = pc;

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
      recvDcRef.current = dc;
      dc.binaryType = "arraybuffer";

      dc.onopen = () => {
        setReceiveStatus("receiving");
        setReceiveStatusMsg("Connected! Awaiting stream...");
        recvStartTimeRef.current = Date.now();
      };

      let currentHeader: FileHeader | null = null;
      let totalRecv = 0;

      dc.onmessage = (e) => {
        if (typeof e.data === "string") {
          try {
            const data = JSON.parse(e.data);

            if (data.type === "FILE_HEADER") {
              currentHeader = data;
              setRecvHeader(data);
              setReceivedType("file");
              setReceiveStatusMsg(`Receiving ${data.filename}...`);
              dc.send(JSON.stringify({ type: "FILE_HEADER_ACK" }));
            } else if (data.type === "CLIPBOARD") {
              setReceivedType("clip");
              setClipText(data.text);
              setReceiveStatus("completed");
              setReceiveStatusMsg("Clipboard payload received.");
              dc.send(JSON.stringify({ type: "CLIPBOARD_ACK" }));
            }
          } catch {}
          return;
        }

        if (e.data instanceof ArrayBuffer) {
          recvChunksRef.current.push(e.data);
          totalRecv += e.data.byteLength;
          setRecvBytes(totalRecv);

          if (currentHeader && currentHeader.size > 0) {
            const pct = Math.min(100, Math.round((totalRecv / currentHeader.size) * 100));
            setRecvProgress(pct);

            const elapsedSec = (Date.now() - recvStartTimeRef.current) / 1000;
            const speed = elapsedSec > 0 ? totalRecv / elapsedSec : 0;
            setRecvSpeed(`${formatBytes(speed)}/s`);

            if (totalRecv >= currentHeader.size) {
              triggerFileDownload(currentHeader, dc);
            }
          }
        }
      };
    };
  };

  const handleReceiverSignal = async (payload: any, ws: WebSocket, roomId: string) => {
    const pc = recvPcRef.current;
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

      // Drain queued candidates received before offer was set
      while (recvPendingCandidatesRef.current.length > 0) {
        const cand = recvPendingCandidatesRef.current.shift();
        if (cand) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.warn("Failed adding queued candidate:", e);
          }
        }
      }
    } else if (payload.type === "candidate") {
      if (payload.candidate) {
        const cand: RTCIceCandidateInit = {
          candidate: payload.candidate,
          sdpMid: payload.sdpMid,
          sdpMLineIndex: payload.sdpMLineIndex,
        };
        if (!pc.remoteDescription) {
          recvPendingCandidatesRef.current.push(cand);
        } else {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.error("Error adding candidate:", e);
          }
        }
      }
    }
  };

  const triggerFileDownload = (header: FileHeader, dc: RTCDataChannel) => {
    const blob = new Blob(recvChunksRef.current);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = header.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    dc.send(JSON.stringify({ type: "TRANSFER_COMPLETE", success: true }));
    setReceiveStatus("completed");
    setReceiveStatusMsg(`Downloaded ${header.filename}`);
  };

  const copyReceivedClip = () => {
    navigator.clipboard.writeText(clipText);
    setCopiedClip(true);
    setTimeout(() => setCopiedClip(false), 2000);
  };

  return (
    <section id="receiver" className="scroll-mt-24 border-t border-line py-16 text-left sm:py-20">
      <div>
        {/* Clean, pure white section heading */}
        <h2 className="text-3xl sm:text-4xl text-white font-bold tracking-tight">
          Prefer the browser?
        </h2>
        {/* Raw muted subtext */}
        <p className="mt-3 max-w-[58ch] text-sm sm:text-base leading-relaxed text-ink-soft">
          Send files or receive payloads directly in this browser window over WebRTC. Zero cloud storage, no accounts, end-to-end encrypted.
        </p>
      </div>

      {/* Stacked Layout: One below the other with comfortable max-w-[540px] size & exact emerald subheadings */}
      <div className="mt-8 flex flex-col space-y-4 max-w-[540px]">
        {/* ==================================================== */}
        {/* BOX 1: SEND A FILE (Comfortable, Sleek & Emerald)     */}
        {/* ==================================================== */}
        <div className="rounded-[14px] border border-[#2a2a36] bg-panel p-5 sm:p-6 hover:border-[#3e3e52] transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            {/* Exact emerald badge matching the subheadings in cards above */}
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Web Sender
            </span>
            {sendStatus !== "idle" && (
              <button
                onClick={resetSender}
                className="rounded-[6px] border border-line p-1.5 text-ink-soft hover:text-white hover:border-line-strong transition-colors"
                title="Cancel transfer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <h3 className="mt-3 text-lg font-bold text-white tracking-tight">
            Send File or Beam Clipboard
          </h3>
          <p className="mt-1 text-xs text-ink-soft">
            Stream directly device-to-device with end-to-end encryption.
          </p>

          {/* Mode Switch: File vs Clipboard */}
          {sendStatus === "idle" && (
            <div className="mt-3.5 flex items-center gap-1.5 p-1 rounded-[10px] bg-[#0c0c10] border border-line w-fit">
              <button
                type="button"
                onClick={() => setSenderMode("file")}
                className={`px-3 py-1 text-xs font-semibold rounded-[7px] transition-all flex items-center gap-1.5 ${
                  senderMode === "file"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm"
                    : "text-ink-soft hover:text-white border border-transparent"
                }`}
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Send File</span>
              </button>
              <button
                type="button"
                onClick={() => setSenderMode("clip")}
                className={`px-3 py-1 text-xs font-semibold rounded-[7px] transition-all flex items-center gap-1.5 ${
                  senderMode === "clip"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm"
                    : "text-ink-soft hover:text-white border border-transparent"
                }`}
              >
                <Clipboard className="h-3.5 w-3.5" />
                <span>Beam Clipboard</span>
              </button>
            </div>
          )}

          {/* Idle State: File Dropzone OR Clipboard Textarea */}
          {sendStatus === "idle" && senderMode === "file" && (
            <div className="mt-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    startSendFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`group flex flex-col sm:flex-row items-center justify-center gap-3 rounded-[12px] border-2 border-dashed py-4 px-4 text-center sm:text-left cursor-pointer transition-all ${
                  isDragging
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-[#2a2a36] bg-[#0c0c10] hover:border-emerald-400/50 hover:bg-paper-2"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      startSendFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[#2a2a36] bg-paper-2 group-hover:border-emerald-500/30 transition-colors">
                  <UploadCloud className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Drag & drop any file to send
                  </p>
                  <p className="text-xs text-ink-soft mt-0.5">
                    or <span className="text-emerald-400 underline underline-offset-4 decoration-emerald-500/30 group-hover:decoration-emerald-400 font-medium">browse from device</span> &bull; unlimited size
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Idle State: Clipboard Text Input */}
          {sendStatus === "idle" && senderMode === "clip" && (
            <div className="mt-3.5 space-y-2.5">
              <textarea
                value={clipInputText}
                onChange={(e) => setClipInputText(e.target.value)}
                placeholder="Type or paste text, secret token, or code snippet to beam..."
                rows={3}
                className="w-full rounded-[10px] border border-[#2a2a36] bg-[#0c0c10] p-3 font-mono text-xs text-white placeholder-ink-faint focus:border-emerald-500/50 focus:outline-none transition-colors resize-none"
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const t = await navigator.clipboard.readText();
                      if (t) setClipInputText(t);
                    } catch {}
                  }}
                  className="rounded-[8px] border border-line bg-paper-2 px-3 py-1.5 font-mono text-xs text-ink-soft hover:border-line-strong hover:text-white transition-colors"
                >
                  Paste from pasteboard
                </button>
                <button
                  type="button"
                  disabled={!clipInputText.trim()}
                  onClick={() => startSendClip(clipInputText)}
                  className="rounded-[8px] bg-emerald-400 px-4 py-1.5 font-semibold text-xs text-black hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Beam Text</span>
                  <span className="font-bold">➔</span>
                </button>
              </div>
            </div>
          )}

          {/* Waiting for Peer: Pairing code display */}
          {sendStatus === "waiting-for-peer" && (
            <div className="mt-5 space-y-3.5">
              {senderMode === "file" ? (
                <div className="flex items-center justify-between rounded-[10px] border border-line bg-paper-2 p-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="truncate text-xs font-semibold text-white">{fileToSend?.name}</span>
                  </div>
                  <span className="text-xs font-mono text-ink-soft shrink-0">{formatBytes(fileToSend?.size || 0)}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-[10px] border border-line bg-paper-2 p-3 font-mono text-xs text-ink-soft">
                  <div className="flex items-center gap-2 truncate">
                    <Clipboard className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="truncate text-white font-medium">
                      "{clipToSend.slice(0, 45)}{clipToSend.length > 45 ? "..." : ""}"
                    </span>
                  </div>
                  <span className="shrink-0 text-ink-faint">{clipToSend.length} chars</span>
                </div>
              )}

              <div className="rounded-[12px] border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
                <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                  Pairing Code
                </span>
                <div className="mt-1.5 flex items-center justify-center gap-3">
                  <span className="font-mono text-3xl font-bold tracking-widest text-white select-all">
                    {generatedCode}
                  </span>
                  <button
                    onClick={copyPairingCode}
                    className="rounded-[8px] border border-line p-2 text-ink-soft hover:text-white hover:border-line-strong transition-colors"
                    title="Copy code"
                  >
                    {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="mt-2.5 inline-flex items-center gap-2 rounded-[8px] border border-line bg-paper-2 px-3 py-1.5 font-mono text-xs text-ink">
                  <span className="text-emerald-400 font-bold">$</span>
                  <span>
                    {senderMode === "clip" ? `p2pcopy clip get ${generatedCode}` : `p2pcopy receive ${generatedCode}`}
                  </span>
                </div>

                <div className="mt-2.5 flex justify-center">
                  <button
                    onClick={copyShareLink}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-soft hover:text-white transition-colors"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>{copiedLink ? "Link copied!" : "Copy browser share link"}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-mono text-ink-soft">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Waiting for receiver to connect...</span>
              </div>
            </div>
          )}

          {/* Preparing / Connecting Spinner */}
          {(sendStatus === "preparing" || sendStatus === "connecting") && (
            <div className="py-8 text-center space-y-2.5">
              <Loader2 className="h-5 w-5 text-emerald-400 animate-spin mx-auto" />
              <div className="font-mono text-xs text-ink-soft">{sendStatusMsg}</div>
            </div>
          )}

          {/* Streaming Progress */}
          {sendStatus === "streaming" && (
            <div className="mt-5 space-y-3">
              {senderMode === "file" ? (
                <>
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-white truncate max-w-[240px] font-medium">{fileToSend?.name}</span>
                    <span className="text-emerald-400 font-semibold">{sendProgress}%</span>
                  </div>
                  <div className="w-full bg-paper-2 rounded-full h-2 overflow-hidden border border-line">
                    <div className="bg-emerald-400 h-full transition-all duration-150" style={{ width: `${sendProgress}%` }} />
                  </div>
                  <div className="flex justify-between font-mono text-[11px] text-ink-soft">
                    <span>{formatBytes(sendTransferred)} / {formatBytes(fileToSend?.size || 0)}</span>
                    <span>Speed: {sendSpeed}</span>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center space-y-2">
                  <Loader2 className="h-5 w-5 text-emerald-400 animate-spin mx-auto" />
                  <div className="font-mono text-xs text-ink-soft">Streaming clipboard to peer...</div>
                </div>
              )}
            </div>
          )}

          {/* Completed State */}
          {sendStatus === "completed" && (
            <div className="mt-5 space-y-3 py-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {senderMode === "file" ? "File Transferred Successfully" : "Clipboard Beamed Successfully"}
                  </h4>
                  <p className="text-xs text-ink-soft">
                    {senderMode === "file" ? "Verified directly by receiver via SHA-256." : "Directly received and copied to peer's pasteboard."}
                  </p>
                </div>
              </div>
              <button
                onClick={resetSender}
                className="rounded-[10px] bg-emerald-400 px-4 py-2 text-xs font-semibold text-black transition-opacity hover:bg-emerald-300"
              >
                {senderMode === "file" ? "Send Another File" : "Beam Another Item"}
              </button>
            </div>
          )}

          {/* Error State */}
          {sendStatus === "error" && (
            <div className="mt-5 space-y-2.5">
              <div className="flex items-center gap-2 rounded-[10px] border border-rose-500/20 bg-rose-500/10 p-3 font-mono text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="truncate">{sendError || "Transfer failed."}</span>
              </div>
              <button onClick={resetSender} className="font-mono text-xs text-ink-soft hover:text-white underline">
                &larr; Try again
              </button>
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* BOX 2: RECEIVE WITH CODE (Kept Separate Like Before) */}
        {/* ==================================================== */}
        <div className="rounded-[14px] border border-[#2a2a36] bg-panel p-5 sm:p-6 hover:border-[#3e3e52] transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            {/* Exact emerald badge matching the subheadings in cards above */}
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Web Receiver
            </span>
            {receiveStatus !== "idle" && (
              <button
                onClick={resetReceiver}
                className="rounded-[6px] border border-line p-1.5 text-ink-soft hover:text-white hover:border-line-strong transition-colors"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <h3 className="mt-3 text-lg font-bold text-white tracking-tight">
            Enter Pairing Code to Receive
          </h3>
          <p className="mt-1 text-xs text-ink-soft">
            Download files or receive clipboard text directly over WebRTC.
          </p>

          {/* Idle / Error State: Exact original input row layout */}
          {(receiveStatus === "idle" || receiveStatus === "error") && (
            <div className="mt-4 space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="6-digit pairing code (e.g. 842-194)"
                  value={receiveCode}
                  onChange={(e) => setReceiveCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStartReceive()}
                  className="flex-1 rounded-[10px] border border-[#2a2a36] bg-paper-2 px-3.5 py-2.5 font-mono text-sm text-ink placeholder-ink-faint focus:border-emerald-400/60 focus:outline-none transition-colors"
                />
                <button
                  onClick={handleStartReceive}
                  disabled={!receiveCode.trim()}
                  className="rounded-[10px] bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
                >
                  Connect & Download
                </button>
              </div>

              {receiveStatus === "error" && (
                <div className="flex items-center gap-2 rounded-[10px] border border-rose-500/20 bg-rose-500/10 p-3 font-mono text-xs text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="truncate">{receiveError || "Failed to connect to room."}</span>
                </div>
              )}
            </div>
          )}

          {/* Connecting / Negotiating */}
          {(receiveStatus === "connecting" || receiveStatus === "negotiating") && (
            <div className="py-8 text-center space-y-2.5">
              <Loader2 className="h-5 w-5 text-emerald-400 animate-spin mx-auto" />
              <div className="font-mono text-xs text-ink-soft">{receiveStatusMsg}</div>
            </div>
          )}

          {/* Receiving File Stream */}
          {receiveStatus === "receiving" && receivedType === "file" && (
            <div className="mt-5 space-y-3">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-white truncate max-w-[240px] font-medium">{recvHeader?.filename}</span>
                <span className="text-emerald-400 font-semibold">{recvProgress}%</span>
              </div>
              <div className="w-full bg-paper-2 rounded-full h-2 overflow-hidden border border-line">
                <div className="bg-emerald-400 h-full transition-all duration-150" style={{ width: `${recvProgress}%` }} />
              </div>
              <div className="flex justify-between font-mono text-[11px] text-ink-soft">
                <span>{formatBytes(recvBytes)} / {formatBytes(recvHeader?.size || 0)}</span>
                <span>Speed: {recvSpeed}</span>
              </div>
            </div>
          )}

          {/* Completed State */}
          {receiveStatus === "completed" && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Check className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {receivedType === "file" ? "File downloaded to device" : "Clipboard payload received"}
                  </span>
                </div>
                <button onClick={resetReceiver} className="font-mono text-xs text-emerald-400 hover:underline">
                  Receive another
                </button>
              </div>

              {receivedType === "clip" && (
                <div className="space-y-2 pt-1">
                  <div className="rounded-[10px] border border-line bg-paper-2 p-3 font-mono text-xs text-ink-soft break-all select-all max-h-36 overflow-y-auto">
                    {clipText}
                  </div>
                  <button
                    onClick={copyReceivedClip}
                    className="rounded-[10px] bg-emerald-400 px-4 py-2 font-mono text-xs font-semibold text-black hover:bg-emerald-300"
                  >
                    {copiedClip ? "Copied to clipboard!" : "Copy to Clipboard"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WebReceiver;
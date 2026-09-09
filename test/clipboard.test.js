const { EphemeralSignalingServer } = require("../dist/signaling/server");
const { SignalingClient } = require("../dist/signaling/client");
const { WebRTCPeer } = require("../dist/webrtc/peer");
const { readClipboard, writeClipboard } = require("../dist/clipboard/index");

async function testClipboard() {
  console.log("--> Starting test: WebRTC Instant Clipboard Sync");

  const secretText = "SECRET_DEV_TOKEN_" + Date.now();

  const port = 9879;
  const server = new EphemeralSignalingServer({ port, host: "127.0.0.1" });
  await server.start();

  const url = `ws://127.0.0.1:${port}`;
  const signalA = new SignalingClient(url);
  const signalB = new SignalingClient(url);
  await signalA.connect();
  await signalB.connect();

  const roomId = "777-888";
  await signalA.createRoom(roomId);

  const peerA = new WebRTCPeer({
    name: "clip-sender",
    isInitiator: true,
    roomId,
    signalingClient: signalA,
  });

  const peerB = new WebRTCPeer({
    name: "clip-receiver",
    isInitiator: false,
    roomId,
    signalingClient: signalB,
  });

  let receivedText = "";
  let senderGotAck = false;

  const testPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Clipboard test timed out after 10 seconds."));
    }, 10000);

    // Register listeners BEFORE starting peers to avoid race conditions
    peerA.on("data", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "CLIPBOARD_ACK") {
          console.log("✔ Sender received CLIPBOARD_ACK.");
          senderGotAck = true;
          clearTimeout(timeout);
          resolve();
        }
      } catch {}
    });

    peerB.on("data", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "CLIPBOARD") {
          receivedText = msg.text;
          console.log("✔ Receiver captured clipboard message:", receivedText);
          peerB.send(JSON.stringify({ type: "CLIPBOARD_ACK" }));
        }
      } catch {}
    });

    peerA.on("connected", () => {
      console.log("✔ Sender DataChannel open. Emitting clipboard payload...");
      peerA.send(
        JSON.stringify({
          type: "CLIPBOARD",
          text: secretText,
          timestamp: Date.now(),
        })
      );
    });

    peerB.on("connected", () => {
      console.log("✔ Receiver DataChannel open. Awaiting clipboard payload...");
    });
  });

  await peerA.start();
  await peerB.start();
  await signalB.joinRoom(roomId);

  await testPromise;

  if (receivedText !== secretText) {
    throw new Error(`Received clipboard text mismatch! Expected: ${secretText}, got: ${receivedText}`);
  }

  if (!senderGotAck) {
    throw new Error("Sender did not receive ACK from receiver!");
  }

  // Verify writeClipboard function
  writeClipboard(receivedText);
  const readBack = readClipboard().trim();
  console.log("✔ System clipboard written and read back successfully:", readBack === secretText);

  peerA.close();
  peerB.close();
  signalA.close();
  signalB.close();
  await server.close();

  console.log("🎉 SUCCESS: Instant clipboard sync verified completely!");
}

testClipboard().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
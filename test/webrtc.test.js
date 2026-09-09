const { EphemeralSignalingServer } = require("../dist/signaling/server");
const { SignalingClient } = require("../dist/signaling/client");
const { WebRTCPeer } = require("../dist/webrtc/peer");

async function testWebRTC() {
  console.log("--> Starting test: WebRTC DataChannel Direct Handshake");
  const port = 9877;
  const server = new EphemeralSignalingServer({ port, host: "127.0.0.1" });
  await server.start();

  const url = `ws://127.0.0.1:${port}`;
  const signalA = new SignalingClient(url);
  const signalB = new SignalingClient(url);

  await signalA.connect();
  await signalB.connect();

  const roomId = "555-666";
  await signalA.createRoom(roomId);
  console.log("✔ Sender created room:", roomId);

  const peerA = new WebRTCPeer({
    name: "sender-peer",
    isInitiator: true,
    roomId,
    signalingClient: signalA,
  });

  const peerB = new WebRTCPeer({
    name: "receiver-peer",
    isInitiator: false,
    roomId,
    signalingClient: signalB,
  });

  await peerA.start();
  await peerB.start();
  console.log("✔ Both WebRTC peers started.");

  let channelAOpen = false;
  let channelBOpen = false;
  let receiverGotPing = false;
  let senderGotPong = false;

  const testPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("WebRTC test timed out after 10 seconds."));
    }, 10000);

    peerA.on("connected", (dcA) => {
      console.log("✔ Sender DataChannel is OPEN.");
      channelAOpen = true;
      dcA.sendMessage("PING_TEST");
    });

    peerB.on("connected", (dcB) => {
      console.log("✔ Receiver DataChannel is OPEN.");
      channelBOpen = true;
    });

    peerB.on("data", (data) => {
      const msg = data.toString();
      if (msg === "PING_TEST") {
        console.log("✔ Receiver got data from Sender:", msg);
        receiverGotPing = true;
        const dcB = peerB.getDataChannel();
        if (dcB) {
          dcB.sendMessage("PONG_TEST");
        }
      }
    });

    peerA.on("data", (data) => {
      const msg = data.toString();
      if (msg === "PONG_TEST") {
        console.log("✔ Sender got data from Receiver:", msg);
        senderGotPong = true;
        clearTimeout(timeout);
        resolve();
      }
    });
  });

  await signalB.joinRoom(roomId);
  console.log("✔ Receiver joined room:", roomId);

  await testPromise;

  if (!channelAOpen || !channelBOpen || !receiverGotPing || !senderGotPong) {
    throw new Error("WebRTC verification checks failed!");
  }

  peerA.close();
  peerB.close();
  signalA.close();
  signalB.close();
  await server.close();

  console.log("🎉 SUCCESS: WebRTC DataChannel bidirectional exchange verified completely!");
}

testWebRTC().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
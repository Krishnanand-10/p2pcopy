const { EphemeralSignalingServer } = require("../dist/signaling/server");
const { SignalingClient } = require("../dist/signaling/client");

async function testSignaling() {
  console.log("--> Starting test: Ephemeral Signaling Handshake");
  const port = 9876;
  const server = new EphemeralSignalingServer({ port, host: "127.0.0.1" });
  await server.start();

  const url = `ws://127.0.0.1:${port}`;
  const clientA = new SignalingClient(url);
  const clientB = new SignalingClient(url);

  await clientA.connect();
  await clientB.connect();
  console.log("âœ” Both clients connected to signaling server.");

  const roomId = "482-910";
  await clientA.createRoom(roomId);
  console.log("âœ” Client A created room:", roomId);

  let peerJoinedTriggered = false;
  let clientBReceivedSignal = false;
  let clientAReceivedAnswer = false;

  clientA.on("peer-joined", (room) => {
    console.log("âœ” Client A received peer-joined event for room:", room);
    peerJoinedTriggered = true;
    clientA.sendSignal(roomId, { type: "offer", sdp: "mock-sdp-offer-data" });
  });

  clientB.on("signal", (payload) => {
    if (payload.type === "offer" && payload.sdp === "mock-sdp-offer-data") {
      console.log("âœ” Client B successfully received offer from Client A.");
      clientBReceivedSignal = true;
      clientB.sendSignal(roomId, { type: "answer", sdp: "mock-sdp-answer-data" });
    }
  });

  clientA.on("signal", (payload) => {
    if (payload.type === "answer" && payload.sdp === "mock-sdp-answer-data") {
      console.log("âœ” Client A successfully received answer from Client B.");
      clientAReceivedAnswer = true;
    }
  });

  await clientB.joinRoom(roomId);
  console.log("âœ” Client B joined room:", roomId);

  // Wait for exchange
  await new Promise((r) => setTimeout(r, 1000));

  if (!peerJoinedTriggered || !clientBReceivedSignal || !clientAReceivedAnswer) {
    throw new Error("Handshake exchange verification failed!");
  }

  clientA.close();
  clientB.close();
  await server.close();
  console.log("ðŸŽ‰ SUCCESS: Ephemeral signaling exchange verified completely!");
}

testSignaling().catch((err) => {
  console.error("âŒ Test failed:", err);
  process.exit(1);
});
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { EphemeralSignalingServer } = require("../dist/signaling/server");
const { SignalingClient } = require("../dist/signaling/client");
const { WebRTCPeer } = require("../dist/webrtc/peer");
const { FileSender } = require("../dist/transfer/sender");
const { FileReceiver } = require("../dist/transfer/receiver");

async function testFileTransfer() {
  console.log("--> Starting test: End-to-End P2P File Transfer with Backpressure and SHA-256");

  // 1. Create a 1MB test file with random bytes
  const testFileSize = 1024 * 1024; // 1 MB
  const sourceFilePath = path.resolve(__dirname, "test-source.bin");
  const destDir = path.resolve(__dirname, "downloads");

  const randomBuffer = crypto.randomBytes(testFileSize);
  fs.writeFileSync(sourceFilePath, randomBuffer);
  const expectedHash = crypto.createHash("sha256").update(randomBuffer).digest("hex");
  console.log(`✔ Generated test file (1 MB) with SHA-256: ${expectedHash}`);

  // 2. Start signaling server
  const port = 9878;
  const server = new EphemeralSignalingServer({ port, host: "127.0.0.1" });
  await server.start();

  const url = `ws://127.0.0.1:${port}`;
  const signalA = new SignalingClient(url);
  const signalB = new SignalingClient(url);
  await signalA.connect();
  await signalB.connect();

  const roomId = "888-999";
  await signalA.createRoom(roomId);

  const peerA = new WebRTCPeer({
    name: "sender",
    isInitiator: true,
    roomId,
    signalingClient: signalA,
  });

  const peerB = new WebRTCPeer({
    name: "receiver",
    isInitiator: false,
    roomId,
    signalingClient: signalB,
  });

  await peerA.start();
  await peerB.start();

  // 3. Coordinate transfer once DataChannels are open
  let transferPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("File transfer timed out after 15 seconds."));
    }, 15000);

    let senderDone = false;
    let receiverResult = null;

    peerA.on("connected", async (dcA) => {
      console.log("✔ Sender DataChannel open. Initiating FileSender...");
      const sender = new FileSender({
        filePath: sourceFilePath,
        dataChannel: dcA,
        showProgress: false,
      });

      try {
        await sender.send();
        console.log("✔ Sender finished streaming file.");
        senderDone = true;
        if (receiverResult) {
          clearTimeout(timeout);
          resolve(receiverResult);
        }
      } catch (err) {
        reject(err);
      }
    });

    peerB.on("connected", async (dcB) => {
      console.log("✔ Receiver DataChannel open. Initiating FileReceiver...");
      const receiver = new FileReceiver({
        outputDir: destDir,
        dataChannel: dcB,
        showProgress: false,
      });

      try {
        receiverResult = await receiver.receive();
        console.log("✔ Receiver finished and verified checksum.");
        if (senderDone) {
          clearTimeout(timeout);
          resolve(receiverResult);
        }
      } catch (err) {
        reject(err);
      }
    });
  });

  await signalB.joinRoom(roomId);

  const result = await transferPromise;

  // 4. Verify received file on disk
  const receivedFilePath = path.join(destDir, "test-source.bin");
  if (!fs.existsSync(receivedFilePath)) {
    throw new Error("Received file does not exist on disk!");
  }

  const receivedBuffer = fs.readFileSync(receivedFilePath);
  const actualHash = crypto.createHash("sha256").update(receivedBuffer).digest("hex");

  console.log(`✔ Disk verification - Expected: ${expectedHash}`);
  console.log(`✔ Disk verification - Actual:   ${actualHash}`);

  if (actualHash !== expectedHash) {
    throw new Error("Disk SHA-256 hash does not match original file!");
  }

  // 5. Cleanup
  peerA.close();
  peerB.close();
  signalA.close();
  signalB.close();
  await server.close();

  fs.unlinkSync(sourceFilePath);
  fs.unlinkSync(receivedFilePath);
  fs.rmdirSync(destDir);

  console.log("🎉 SUCCESS: File transfer, backpressure & SHA-256 verification 100% successful!");
}

testFileTransfer().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
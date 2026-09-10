# 🚀 p2pcopy

> **Zero-cloud, end-to-end encrypted peer-to-peer file and clipboard sharing right from your terminal.**

`p2pcopy` is a fast CLI tool that allows two computers to transfer files and clipboard content directly over **WebRTC DataChannels**. There are **no cloud storage buckets, no accounts, and no intermediate file uploads**. A short-lived, ephemeral signaling exchange connects both peers, after which data streams directly device-to-device with end-to-end DTLS/SCTP encryption.

---

## ⚡ Key Highlights

- 🔒 **End-to-End Encrypted (E2EE):** Built on WebRTC DTLS/SCTP. Payloads never touch third-party servers.
- 💨 **Zero Cloud Storage:** Data streams directly memory-to-memory / disk-to-disk between peers.
- 📋 **Terminal Clipboard Beam:** Sync secrets, SSH keys, or tokens across machines instantly (`p2pcopy clip`). Supports standard UNIX stdin pipes (`cat id_rsa.pub | p2pcopy clip`).
- 📦 **High-Performance Chunked Streaming:** 64KB SCTP chunks with backpressure buffer controls (`bufferedAmount`), streaming 50GB+ files using only ~1MB of RAM.
- 🛡️ **SHA-256 Verified:** Automatic on-the-fly checksum computation and verification before files are saved.
- 🌐 **Symmetric NAT & TURN Resilience:** Built-in STUN hole-punching with configurable TURN blind relay fallback for strict corporate firewalls.

---

[![npm version](https://img.shields.io/npm/v/p2pcopy.svg)](https://www.npmjs.com/package/p2pcopy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📥 Quickstart (Zero Installation Required!)

You do **not** need to clone the repository or install anything. Anyone with Node.js can run `p2pcopy` directly via `npx`:

```bash
# Sender:
npx p2pcopy send ./myfile.zip

# Receiver:
npx p2pcopy receive 749-102
```

---

## 🔄 4 Transfer Combinations

With both CLI and In-Browser capabilities, `p2pcopy` unlocks **4 flexible transfer combinations**:

| # | Combination | Flow | Real-World Use Case |
| :--- | :--- | :--- | :--- |
| **1** | **Terminal ➔ Terminal** | `p2pcopy send <file>` ➔ `p2pcopy receive <code>` | Direct machine-to-machine streaming between developer terminals. |
| **2** | **Terminal ➔ Browser** | `p2pcopy send <file>` ➔ Web Receiver tab | Beam files from a headless cloud server directly to a phone or laptop browser. |
| **3** | **Browser ➔ Terminal** | Drag file into browser ➔ `npx p2pcopy receive <code>` | Teammate sends from their browser; you download straight into your terminal. |
| **4** | **Browser ➔ Browser** | Drop file in browser ➔ Open Web Receiver tab | 100% zero-install, direct peer-to-peer web transfer between two browsers. |

---

### Global Installation (Optional)

If you want the command permanently installed on your system:

```bash
# Install globally from npm
npm install -g p2pcopy

# Or install from source
git clone https://github.com/Krishnanand-10/p2pcopy.git
cd p2pcopy
npm install && npm link
```

---

## 🧭 Usage & Commands

### 1. File Transfer

**Sender Machine:**
```bash
# Generate pairing code and wait for peer
p2pcopy send ./build-artifacts.zip
```
Output:
```text
  ╔═════════════════════════════════════════════╗
  ║   🚀 p2pcopy — Terminal Peer-to-Peer File   ║
  ║      & Clipboard Sync over WebRTC (E2EE)    ║
  ╚═════════════════════════════════════════════╝

ℹ Connecting to signaling server at ws://localhost:9000...

  PAIRING CODE  
  >>>  749-102  <<<
  Run on receiving machine: p2pcopy receive 749-102

ℹ Waiting for receiver to connect...
```

**Receiver Machine:**
```bash
p2pcopy receive 749-102

# Or specify a custom download directory
p2pcopy receive 749-102 --output ~/Downloads
```

---

### 2. Instant Clipboard Sync

**Beam Current Clipboard or Piped Input:**
```bash
# Share current clipboard contents
p2pcopy clip

# Or pipe output directly from another command
cat ~/.ssh/id_ed25519.pub | p2pcopy clip
# or
git diff | p2pcopy clip
```

**Receive Clipboard on Peer Machine:**
```bash
# Automatically copies content directly to your system clipboard
p2pcopy clip get 749-102

# Or print only to stdout without modifying clipboard
p2pcopy clip get 749-102 --no-copy
```

---

### 3. Ephemeral Signaling Relay

`p2pcopy` uses an in-memory, zero-storage WebSocket relay to broker the initial WebRTC SDP and ICE handshake:
```bash
# Run your own private signaling server
p2pcopy signal --port 9000

# Connect peers using your signaling server
p2pcopy send ./data.tar.gz --signal ws://your-server-ip:9000
p2pcopy receive 749-102 --signal ws://your-server-ip:9000
```
> **Privacy Note:** The signaling server never sees files, clipboard content, or encryption keys. It only relays opaque SDP strings to connect the peers and immediately terminates once the DataChannel is open.

---

## 🔬 Systems Insight: Pure P2P vs. Real-World Reliability

While `p2pcopy` prioritizes the **zero-cloud storage** and **privacy** principle, real-world networking at scale introduces edge cases:

```
[Tier 1: Direct LAN / UPnP]
          │ (Zero NAT, Maximum Speed)
          ▼
[Tier 2: STUN Hole-Punching]
          │ (Succeeds on ~80-85% of home & office NATs)
          ▼
[Tier 3: Encrypted TURN Blind Relay]
            (Guaranteed delivery for Symmetric NATs, CGNAT, & strict enterprise firewalls)
```

### The NAT Traversal Spectrum:
1. **STUN (Direct P2P):**  
   Discovers public IPs/ports. Works seamlessly on Full-Cone, Restricted-Cone, and Port-Restricted NATs.
2. **Symmetric NAT & Carrier-Grade NAT (CGNAT):**  
   Standard on mobile cellular networks (4G/5G) and strict enterprise firewalls. The router randomizes external ports for each destination endpoint, making direct UDP hole-punching impossible.
3. **Encrypted TURN Blind Relay Fallback:**  
   In production setups where peers are behind mutually incompatible symmetric NATs, `p2pcopy` supports TURN server configurations:
   ```bash
   p2pcopy send file.zip --ice turn:username:password@turn.example.com:3478
   # Or via environment variable
   export P2PCOPY_ICE="turn:username:password@turn.example.com:3478"
   ```
   **Crucially, the TURN relay only forwards encrypted DTLS frames** — zero file contents, file names, or clipboard bytes are readable by the relay.

---

## 🧪 Running Tests

The test suite exercises the entire stack end-to-end:
```bash
npm test
```
Tests included:
1. `test/signaling.test.js`: WebSocket signaling server, room lifecycle, and auto-teardown.
2. `test/webrtc.test.js`: WebRTC DataChannel connection negotiation and bidirectional ping-pong.
3. `test/file-transfer.test.js`: 1MB binary transfer, backpressure buffer throttling, and SHA-256 disk verification.
4. `test/clipboard.test.js`: Cross-machine clipboard synchronization and system clipboard integration.

---

## 📁 Architecture

```text
p2pcopy/
├── bin/
│   └── p2pcopy.js             # Global CLI executable runner
├── src/
│   ├── index.ts               # CLI command interface (Commander.js)
│   ├── signaling/
│   │   ├── server.ts          # Ephemeral in-memory WebSocket server
│   │   ├── client.ts          # Signaling handshake client
│   │   └── types.ts           # Wire message schemas
│   ├── webrtc/
│   │   ├── peer.ts            # WebRTC PeerConnection & DataChannel wrapper
│   │   └── config.ts          # STUN / TURN resolver
│   ├── transfer/
│   │   ├── sender.ts          # File stream reader with backpressure
│   │   ├── receiver.ts        # Chunk writer & SHA-256 verifier
│   │   └── protocol.ts        # Chunk size & wire protocol definitions
│   ├── clipboard/
│   │   └── index.ts           # OS clipboard reader/writer (Win, Mac, Linux) & stdin
│   └── utils/
│       ├── code.ts            # 6-digit pairing code generator
│       └── ui.ts              # Terminal formatting & spinners
├── test/                      # End-to-end test suite
├── package.json
└── tsconfig.json
```

---

## 📄 License
MIT © Krishna Tiwari
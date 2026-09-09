export interface IceConfig {
  iceServers: string[];
}

export const DEFAULT_STUN_SERVERS = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
  "stun:stun2.l.google.com:19302",
  "stun:stun3.l.google.com:19302",
  "stun:stun4.l.google.com:19302",
];

/**
 * Resolves ICE server configurations.
 * Supports:
 * - Direct command line flags (--ice turn:user:pass@turn.example.com:3478)
 * - Environment variable P2PCOPY_ICE (comma-separated list of STUN/TURN servers)
 * - Default public STUN servers for direct NAT punching
 */
export function resolveIceServers(customServers?: string[]): string[] {
  if (customServers && customServers.length > 0) {
    return customServers;
  }

  const envIce = process.env.P2PCOPY_ICE;
  if (envIce) {
    return envIce
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return DEFAULT_STUN_SERVERS;
}
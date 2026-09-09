export interface IceConfig {
  iceServers: string[];
}

export const DEFAULT_STUN_SERVERS = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
  "stun:stun2.l.google.com:19302",
];

export function resolveIceServers(customServers?: string[]): string[] {
  if (customServers && customServers.length > 0) {
    return customServers;
  }

  // Check environment variable
  const envIce = process.env.P2PCOPY_ICE;
  if (envIce) {
    return envIce.split(",").map((s) => s.trim()).filter(Boolean);
  }

  return DEFAULT_STUN_SERVERS;
}
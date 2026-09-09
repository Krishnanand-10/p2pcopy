export type SignalPayload =
  | { type: "offer"; sdp: string }
  | { type: "answer"; sdp: string }
  | { type: "candidate"; candidate: string; sdpMid?: string; sdpMLineIndex?: number };

export type ClientMessage =
  | { type: "create-room"; roomId: string }
  | { type: "join-room"; roomId: string }
  | { type: "signal"; roomId: string; payload: SignalPayload }
  | { type: "leave-room"; roomId: string };

export type ServerMessage =
  | { type: "room-created"; roomId: string }
  | { type: "room-joined"; roomId: string; isInitiator: boolean }
  | { type: "peer-joined"; roomId: string }
  | { type: "signal"; roomId: string; payload: SignalPayload }
  | { type: "peer-disconnected"; roomId: string }
  | { type: "error"; message: string };
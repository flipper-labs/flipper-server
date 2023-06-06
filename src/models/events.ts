export enum GeneralEvent {
  Connect = "connection",
  Reconnect = "reconnect",
  Disconnecting = "disconnecting",
}

export enum MatchEvent {
  Create = "match:create",
  ActiveMatches = "match:all_active",
  Join = "match:join",
  Spectate = "match:spectate",
  Chat = "match:chat",
  Bargain = "match:bargain",
  Start = "match:start",
  Complete = "match:complete",
  Abandon = "match:abandon",
}

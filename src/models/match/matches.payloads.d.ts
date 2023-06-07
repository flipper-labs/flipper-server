import { Blockchain } from "./enums.js";
import { Player } from "./models.js";

export interface CreateMatchPayload {
  creator: Player;
  gamemode: GameMode;
}

export interface JoinMatchPayload {
  matchID: UUID;
  opponent: Player;
}

export interface StartMatchPayload {
  matchID: UUID;
}

export interface SpectateMatchPayload {
  matchID: UUID;
}

export interface ChatPayload {
  matchID: UUID;
  message: string;
  player: Player;
}

export interface BargainPayload {
  matchID: UUID;
  player: Player;
  isLockedIn: boolean;
}

export interface CompleteMatchPayload {
  matchID: UUID;
  winnerWallet: string;
}

export interface AbandonMatchPayload {
  matchID: UUID;
  abandoned: Player;
}

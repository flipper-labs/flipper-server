import { UUID } from "crypto";

// Used to form a relationship as follow -> socketID: MatchPlayer, to connect player to its socket
export interface MatchPlayer {
  matchID: UUID;
  wallet: string;
}

export interface MatchPlayersSocket {
  player1ID: string;
  player1Wallet: string; // player 1's unique identifier after reconnection
  player2ID: string;
  player2Wallet: string; // player 2's unique identifier after reconnection
}

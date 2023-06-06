import { randomUUID, UUID } from "crypto";

import { Player } from "./../models.js";
import { GameMode, MatchStatus, MatchOutcome } from "./../enums.js";
import { CreateMatchPayload } from "./matches.payloads.js";

export class Match {
  // perhaps add getters/setters and make fields private
  readonly id: UUID;
  player1: Player;
  player2: Player;
  readonly gamemode: GameMode;
  status: MatchStatus;
  outcome: MatchOutcome;

  constructor(payload: CreateMatchPayload) {
    this.id = randomUUID();
    this.player1 = payload.creator;
    this.player2 = { wallet: "", nfts: [] };
    this.gamemode = payload.gamemode;
    this.status = MatchStatus.Created;
    this.outcome = MatchOutcome.None;
  }

  joinMatch(opponent: Player) {
    this.player2 = opponent;
  }

  completeMatch(winnerWallet: string) {
    if (this.player1.wallet === winnerWallet) {
      this.outcome = MatchOutcome.Player1Won;
    } else if (this.player2.wallet === winnerWallet) {
      this.outcome = MatchOutcome.Player2Won;
    }

    this.status = MatchStatus.Completed;
  }

  completeMatchUponAbandonment(abandoned: Player) {
    if (this.player1.wallet === abandoned.wallet) {
      this.outcome = MatchOutcome.Player1Abandoned;
    } else if (this.player2.wallet === abandoned.wallet) {
      this.outcome = MatchOutcome.Player2Abandoned;
    }

    this.status = MatchStatus.Completed;
  }

  isCompleted(): boolean {
    return this.status === MatchStatus.Completed;
  }
}

export enum GameMode {
  /** `WinnerTakesAll` - single roll, winner takes all of tokens at stake. */
  WinnerTakesAll = "Winner Takes All",
  /** `Multiflip` - single roll, ... (needs more description). */
  Multiflip = "Multiflip",
}

export enum MatchStatus {
  /** `Created` - the match has just been created, the creator is waiting for an opponent. */
  Created = "Created",
  /** `Ongoing` - the match is currently happening, no outcome yet. */
  Ongoing = "Ongoing",
  /** `Completed` - the match has finished. */
  Completed = "Completed",
}

export enum MatchOutcome {
  /** `None` - the default outcome, nothing has been determined yet. */
  None = "None",
  Player1Won = "Player 1 Won",
  Player2Won = "Player 2 Won",
  Player1Abandoned = "Player 1 Abandoned",
  Player2Abandoned = "Player 2 Abandoned",
}

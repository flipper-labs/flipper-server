import { UUID } from "crypto";

import { Match } from "./../models/match/index.js";
import { MatchStatus } from "./../models/enums.js";

export default class InMemoryData {
  private static instance: InMemoryData;
  private matches: Match[];

  private constructor() {
    this.matches = [] as Match[];
  }

  public static getInstance(): InMemoryData {
    if (!InMemoryData.instance) {
      InMemoryData.instance = new InMemoryData();
    }

    return InMemoryData.instance;
  }

  addNewMatch(match: Match): void {
    if (this.doesMatchExist(match.id)) {
      throw new Error();
    }
    this.matches.push(match);
  }

  getAllMatches(): Match[] {
    return this.matches;
  }

  getAllActiveMatches(): Match[] {
    return this.matches.filter(
      (match: Match) => match.status !== MatchStatus.Completed
    );
  }

  getMatch(id: UUID): Match {
    return this.matches.filter((match: Match) => match.id === id)[0];
  }

  doesMatchExist(id: UUID): boolean {
    return typeof this.getMatch(id) == null;
  }

  updateMatch(updatedMatch: Match) {
    const index = this.matches.findIndex(
      (match) => match.id === updatedMatch.id
    );
    this.matches[index] = updatedMatch;
  }

  getMatchesByLensFollowings(followings: LensProfile[]) {
    if (followings.length === 0) return this.matches;

    const filteredMatches: Match[] = [];
    for (let i = 0; i < this.matches.length; i++) {
      for (let j = 0; j < followings.length; j++) {
        // Check if current lens profile is part of the match by its wallet address
        const isFollowingPlayer1 =
          this.matches[i].player1.wallet === followings[j].ownedBy;
        const isFollowingPlayer2 =
          this.matches[i].player2.wallet === followings[j].ownedBy;

        if (isFollowingPlayer1 || isFollowingPlayer2) {
          // Asign the player his Lens profile
          if (isFollowingPlayer1)
            this.matches[i].player1.lensProfile = followings[j];
          if (isFollowingPlayer2)
            this.matches[i].player2.lensProfile = followings[j];

          filteredMatches.push(this.matches[i]);
        }
      }
    }

    return filteredMatches;
  }
}

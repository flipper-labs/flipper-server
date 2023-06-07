import { UUID } from "crypto";
import { Server, Socket } from "socket.io";

import { MatchOutcome } from "./../../models/enums.js";
import { GeneralEvent, MatchEvent } from "./../../models/events.js";
import { Match } from "./../../models/match/index.js";
import {
  MatchPlayer,
  MatchPlayersSocket,
} from "./../../models/sockets/index.js";
import {
  BargainPayload,
  ChatPayload,
} from "./../../models/match/matches.payloads.js";
import { ReconnectPayload } from "models/sockets/sockets.payloads.js";

/** SocketNotifier emits appropriate events to connected clients. */
export class SocketNotifier {
  private static instance: SocketNotifier;

  private io: Server;

  /** socketsMatches is used to identify which socket/player belongs to which match */
  private socketsMatches: Map<string, MatchPlayer>; // playerSocketID: {matchID, playerWallet}

  /** matchesPlayersSockets is used to get users' sockets and identify them via their wallets through matchID */
  private matchesPlayersSockets: Map<UUID, MatchPlayersSocket>; // matchID:{player1SocketID, player1Wallet, player2SocketID, player2Wallet}

  private constructor(io: Server) {
    this.io = io;
    this.socketsMatches = new Map<string, MatchPlayer>();
    this.matchesPlayersSockets = new Map<UUID, MatchPlayersSocket>();
  }

  /** Note: pass `io` only at root level a.k.a. main index file. */
  public static getInstance(io?: Server): SocketNotifier {
    if (!SocketNotifier.instance) {
      SocketNotifier.instance = new SocketNotifier(io as Server);
    }
    return SocketNotifier.instance;
  }

  matchCreated(match: Match, player1SocketID: string) {
    console.log(`[matchCreated] Match ${match.id} has been created`);
    this.io.emit(MatchEvent.Create, match);

    this.socketsMatches.set(player1SocketID, {
      matchID: match.id,
      wallet: match.player1.wallet,
    });
    this.matchesPlayersSockets.set(match.id, {
      player1ID: player1SocketID,
      player1Wallet: match.player1.wallet,
      player2ID: "",
      player2Wallet: "",
    });
  }

  matchJoined(match: Match, player2SocketID: string) {
    console.log(
      `[matchJoined] Player ${match.player2.wallet} has joined the match ${match.id}`
    );
    this.io.emit(MatchEvent.Join, match);

    this.socketsMatches.set(player2SocketID, {
      matchID: match.id,
      wallet: match.player2.wallet,
    });

    // Note that player 2's socket has joined the room
    let matchPlayersSocket = this.matchesPlayersSockets.get(match.id);
    if (matchPlayersSocket?.player2ID) {
      matchPlayersSocket.player2ID = player2SocketID;
      matchPlayersSocket.player2Wallet = match.player2.wallet;

      this.matchesPlayersSockets.set(match.id, matchPlayersSocket);
    }
  }

  matchSpectatorJoined(matchID: string) {
    console.log(
      `[matchSpectatorJoined] Spectator has joined the match ${matchID}`
    );
    this.io.to(matchID).emit(MatchEvent.Spectate);
  }

  chatMessageSent(payload: ChatPayload) {
    this.io.to(payload.matchID).emit(MatchEvent.Chat, payload);
  }

  bargainUpdated(match: Match, payload: BargainPayload) {
    console.log(
      `[bargainUpdated] Player ${payload.player.wallet} has updated their bargain`
    );
    this.io.to(payload.matchID).emit(MatchEvent.Bargain, payload);
  }

  matchStarted(match: Match) {
    console.log(`[matchStarted] The match ${match.id} has been started`);
    this.io.emit(MatchEvent.Start, match);
  }

  matchCompleted(match: Match) {
    console.log(`[matchCompleted] Match ${match.id} has been completed`);

    switch (match.outcome) {
      case MatchOutcome.Player1Won:
      case MatchOutcome.Player2Won:
        this.io.emit(MatchEvent.Complete, match);
        break;
      case MatchOutcome.Player1Abandoned:
      case MatchOutcome.Player2Abandoned:
        this.io.emit(MatchEvent.Abandon, match);
        break;
      default:
        console.log(
          `[matchCompleted] No event emitted for match ${match.id}, unknown outcome`
        );
        return;
    }

    // TODO: If players need any more notifications, emit them here and remove the socket references

    const playersSockets = this.matchesPlayersSockets.get(match.id);

    if (playersSockets?.player1ID)
      this.socketsMatches.delete(playersSockets?.player1ID);
    if (playersSockets?.player2ID)
      this.socketsMatches.delete(playersSockets?.player2ID);

    this.matchesPlayersSockets.delete(match.id);

    console.debug("[matchCompleted] Removed socket references.");
  }

  /** reconnect updates the match with player's new socket ID after it reconnects,
   * so that it can be recognized in future by its socket ID */
  reconnect(payload: ReconnectPayload, socket: Socket) {
    let matchPlayersSockets = this.matchesPlayersSockets.get(payload.matchID);
    if (!matchPlayersSockets) {
      throw new Error(`[reconnect] No match with ID ${payload.matchID}.]`);
    }

    const isPlayer1 = matchPlayersSockets.player1Wallet === payload.wallet;
    const isPlayer2 = matchPlayersSockets.player2Wallet === payload.wallet;

    if (!isPlayer1 && !isPlayer2) {
      throw new Error(
        `[reconnect] Neither of the players is ${payload.wallet}.`
      );
    }

    if (isPlayer1) {
      matchPlayersSockets.player1ID = socket.id;
    } else {
      matchPlayersSockets.player2ID = socket.id;
    }
    this.matchesPlayersSockets.set(payload.matchID, matchPlayersSockets);
    this.socketsMatches.set(socket.id, {
      matchID: payload.matchID,
      wallet: payload.wallet,
    });

    socket.join(payload.matchID);
    this.io.to(payload.matchID).emit(GeneralEvent.Reconnect, payload);

    return true;
  }

  getSocketMatch(socketID: string): MatchPlayer | undefined {
    return this.socketsMatches.get(socketID);
  }

  getMatchPlayersSockets(matchID: UUID): MatchPlayersSocket | undefined {
    return this.matchesPlayersSockets.get(matchID);
  }
}

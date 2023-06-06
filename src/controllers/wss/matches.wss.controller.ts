import { Socket } from "socket.io";

import { SocketNotifier } from "./../../services/sockets/index.js";
import InMemoryData from "./../../repositories/index.js";
import { MatchEvent } from "./../../models/events.js";
import { Match } from "./../../models/match/index.js";
import {
  CreateMatchPayload,
  JoinMatchPayload,
  SpectateMatchPayload,
  StartMatchPayload,
  AbandonMatchPayload,
  CompleteMatchPayload,
  ChatPayload,
  BargainPayload,
} from "./../../models/match/matches.payloads.js";

export const registerMatchHandler = (socket: Socket) => {
  socket.on(MatchEvent.Create, (payload: CreateMatchPayload) =>
    createMatch(socket, payload)
  );

  socket.on(MatchEvent.Join, (payload: JoinMatchPayload) =>
    joinMatch(socket, payload)
  );

  socket.on(MatchEvent.Start, (payload: StartMatchPayload) =>
    // startMatch(socket, payload)
    console.log("TODO")
  );

  socket.on(MatchEvent.Spectate, (payload: SpectateMatchPayload) =>
    spectateMatch(socket, payload)
  );

  socket.on(MatchEvent.Chat, (payload: ChatPayload) => chat(socket, payload));

  socket.on(MatchEvent.Bargain, (payload: BargainPayload) =>
    matchBargain(socket, payload)
  );

  socket.on(MatchEvent.Complete, (payload: CompleteMatchPayload) =>
    completeMatch(socket, payload)
  );

  socket.on(MatchEvent.Abandon, (payload: AbandonMatchPayload) =>
    abandonMatch(socket, payload)
  );
};

const createMatch = function (socket: Socket, payload: CreateMatchPayload) {
  const match = new Match(payload);
  socket.join(match.id);

  InMemoryData.getInstance().addNewMatch(match);
  SocketNotifier.getInstance().matchCreated(match, socket.id);
};

const joinMatch = function (socket: Socket, payload: JoinMatchPayload) {
  const match = InMemoryData.getInstance().getMatch(payload.matchID);

  if (!match) {
    console.log(`[joinMatch] Match with ID ${payload.matchID} does not exist`);
    return;
  }
  if (match.isCompleted()) {
    console.log(`[joinMatch] Match ${match.id} is already completed`);
    return;
  }

  socket.join(match.id);
  match.joinMatch(payload.opponent);

  InMemoryData.getInstance().updateMatch(match);
  SocketNotifier.getInstance().matchJoined(match, socket.id);
};

const chat = function (socket: Socket, payload: ChatPayload) {
  const match = InMemoryData.getInstance().getMatch(payload.matchID);

  if (!match) {
    console.log(`[chat] Match with ID ${payload.matchID} does not exist`);
    return;
  }
  if (match.isCompleted()) {
    console.log(`[chat] Match ${match.id} is already completed`);
    return;
  }

  const isPlayer1 = payload.player.wallet === match.player1.wallet;
  const isPlayer2 = payload.player.wallet === match.player2.wallet;

  // Allow only players to chat
  if (!isPlayer1 && !isPlayer2) return;

  SocketNotifier.getInstance().chatMessageSent(payload);
};

const matchBargain = function (socket: Socket, payload: BargainPayload) {
  const match = InMemoryData.getInstance().getMatch(payload.matchID);

  if (!match) {
    console.log(
      `[matchBargain] Match with ID ${payload.matchID} does not exist`
    );
    return;
  }
  if (match.isCompleted()) {
    console.log(`[matchBargain] Match ${match.id} is already completed`);
    return;
  }

  const isPlayer1 = payload.player.wallet === match.player1.wallet;
  const isPlayer2 = payload.player.wallet === match.player2.wallet;

  // Allow only players to bargain
  if (!isPlayer1 && !isPlayer2) return;

  if (isPlayer1) {
    match.player1.nfts = [...payload.player.nfts];
  } else {
    match.player2.nfts = [...payload.player.nfts];
  }

  InMemoryData.getInstance().updateMatch(match);
  SocketNotifier.getInstance().bargainUpdated(match, payload);
};

const spectateMatch = function (socket: Socket, payload: SpectateMatchPayload) {
  const match = InMemoryData.getInstance().getMatch(payload.matchID);

  if (!match) {
    console.log(
      `[spectateMatch] Match with ID ${payload.matchID} does not exist`
    );
    return;
  }
  if (match.isCompleted()) {
    console.log(`[spectateMatch] Match ${match.id} is already completed`);
    return;
  }

  socket.join(match.id);

  SocketNotifier.getInstance().matchSpectatorJoined(match.id);
};

// TODO
const startMatch = function (socket: Socket, payload: StartMatchPayload) {
  const match = InMemoryData.getInstance().getMatch(payload.matchID);

  if (!match) {
    console.log(`[startMatch] Match with ID ${payload.matchID} does not exist`);
    return;
  }
  if (match.isCompleted()) {
    console.log(`[startMatch] Match ${match.id} is already completed`);
    return;
  }

  // TODO: Contract interaction lgoic

  InMemoryData.getInstance().updateMatch(match);
  SocketNotifier.getInstance().matchStarted(match);
};

const completeMatch = function (socket: Socket, payload: CompleteMatchPayload) {
  const match = InMemoryData.getInstance().getMatch(payload.matchID);

  if (!match) {
    console.log(
      `[completeMatch] Match with ID ${payload.matchID} does not exist`
    );
    return;
  }
  if (match.isCompleted()) {
    console.log(`[completeMatch] Match ${match.id} is already completed`);
  }

  match.completeMatch(payload.winnerWallet);
  InMemoryData.getInstance().updateMatch(match);
  SocketNotifier.getInstance().matchCompleted(match);
};

const abandonMatch = function (socket: Socket, payload: AbandonMatchPayload) {
  const match = InMemoryData.getInstance().getMatch(payload.matchID);

  if (!match) {
    console.log(
      `[abandonMatch] Match with ID ${payload.matchID} does not exist`
    );
    return;
  }
  if (match.isCompleted()) {
    console.log(`[abandonMatch] Match ${match.id} is already completed`);
  }

  match.completeMatchUponAbandonment(payload.abandoned);
  InMemoryData.getInstance().updateMatch(match);
  SocketNotifier.getInstance().matchCompleted(match);
};

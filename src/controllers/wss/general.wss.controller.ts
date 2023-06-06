import { ReconnectPayload } from "models/sockets/sockets.payloads.js";
import { Socket } from "socket.io";

import { GeneralEvent } from "./../../models/events.js";
import { SocketNotifier } from "./../../services/sockets/index.js";

export const registerGeneralHandler = (socket: Socket) => {
  // Fired from client directly? Wasn't able to catch it on the server from Postman
  socket.on(GeneralEvent.Reconnect, (payload: ReconnectPayload) =>
    reconnect(socket, payload)
  );

  socket.on(GeneralEvent.Disconnecting, (reason: string) =>
    disconnecting(socket, reason)
  );
};

const reconnect = (socket: Socket, payload: ReconnectPayload) => {
  try {
    SocketNotifier.getInstance().reconnect(payload, socket);
  } catch (err) {
    console.error(err);
    return;
  }

  console.log(`[reconnect] Successfully reconnected player ${payload.wallet}!`);
};

const disconnecting = (socket: Socket, reason: string) => {
  const socketMatch = SocketNotifier.getInstance().getSocketMatch(socket.id);
  if (!socketMatch) {
    return;
  }

  const matchPlayerSocket = SocketNotifier.getInstance().getMatchPlayersSockets(
    socketMatch.matchID
  );
  if (!matchPlayerSocket) {
    console.log(
      `[disconnecting] Match with ID ${socketMatch.matchID} does not exist.`
    );
    return;
  }

  const isPlayer1 = matchPlayerSocket.player1ID;
  const isPlayer2 = matchPlayerSocket.player2ID;
  if (!isPlayer1 && !isPlayer2) return;

  if (isPlayer1) {
    console.log(
      `[disconnecting] Player 1 (${matchPlayerSocket.player1Wallet}) is disconnecting, reason: "${reason}"...`
    );
  } else {
    console.log(
      `[disconnecting] Player 2 (${matchPlayerSocket.player2Wallet}) is disconnecting, reason: "${reason}"...`
    );
  }
};

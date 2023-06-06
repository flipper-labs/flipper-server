import { Socket } from "socket.io";

import { registerMatchHandler } from "./../../controllers/wss/matches.wss.controller.js";
import { registerGeneralHandler } from "./../../controllers/wss/general.wss.controller.js";

/** Global event handler that wraps other event handlers.
 *
 *  Handlers registered with this global handlers will handle appropriate events.
 *
 * Suggested by: https://socket.io/docs/v4/server-application-structure/
 *
 * @example
 * io.on("connection", onConnection)
 * */
export const onConnection = (socket: Socket) => {
  registerMatchHandler(socket);
  registerGeneralHandler(socket);
};

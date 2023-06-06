import express, { Express } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import { matchesRouter } from "./routes/http/matches.route.js";
import { onConnection } from "./routes/wss/matches.wss.routes.js";
import { SocketNotifier } from "./services/sockets/index.js";

dotenv.config();

const app: Express = express();
const server: http.Server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
SocketNotifier.getInstance(io);

app.use(
  cors({
    // origin: `http://localhost:${srvConfig.SERVER_PORT}`,
    origin: function (origin, callback) {
      return callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true,
  }),
  bodyParser.json()
);

app.use("/matches", matchesRouter);

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`⚡️ Server is running at http://localhost:${port}`);
});

io.on("connection", onConnection);

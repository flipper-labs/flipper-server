import express, { Request, Response } from "express";

import { matchesHttpController } from "./../../controllers/http/matches.http.controller.js";

export const matchesRouter = express.Router();

matchesRouter.get(
  "/:address",
  async (req: Request, res: Response) =>
    await matchesHttpController.getLensFollowingsMatches(req, res)
);

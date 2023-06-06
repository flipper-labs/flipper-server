import { Request, Response } from "express";
import { ethers } from "ethers";

import InMemoryData from "./../../repositories/index.js";
import {
  FollowingRequest,
  defaultFollowingRequest,
  getFollowingRequest,
} from "./../../services/lens/requests/following.request.js";
import { client } from "./../../services/lens/index.js";
import { followingQuery } from "./../../services/lens/queries/followings.query.js";
import { Match } from "./../../models/match/index.js";
import { getIntegerQueryParam } from "./utils.js";
import { paginate } from "./../../utils/pagination.js";

const getLensFollowingsMatches = async (req: Request, res: Response) => {
  const address = req.params.address;
  if (address === "" || !ethers.isAddress(address)) {
    res.status(400).json({ error: "Invalid hex address. " }); // TODO: Stylize errors
    return;
  }

  let followingRequest: FollowingRequest = defaultFollowingRequest(address);

  try {
    followingRequest = getFollowingRequest(
      req.query.lensLimit ? (req.query.lensLimit as string) : null,
      req.query.lensPage ? (req.query.lensPage as string) : null,
      req.params.address
    );
  } catch (err: any) {
    console.error("Error validating Lens request params:", err);
    res.status(400).json({ error: "Page and/or limit cannot be 0 or less. " }); // TODO: Stylize errors
    return;
  }

  const response = await client.query(followingQuery, followingRequest);

  let matches: Match[] = [];
  if (response.data) {
    const lensProfiles = [...response.data.following.items];
    const followingProfiles: LensProfile[] = lensProfiles.map(
      (p: any): LensProfile => {
        return {
          id: p.profile.id,
          name: p.profile.name,
          handle: p.profile.handle,
          ownedBy: p.profile.ownedBy,
          picture: p.profile.picture
            ? { original: { url: p.profile.picture.original?.url } }
            : null,
        };
      }
    );

    matches =
      InMemoryData.getInstance().getMatchesByLensFollowings(followingProfiles);
  } else {
    matches = InMemoryData.getInstance().getAllMatches();
  }

  // Default limit and page
  let limit: number = 10,
    page: number = 1;

  try {
    limit = getIntegerQueryParam(
      req.query.limit ? (req.query.limit as string) : undefined
    );
    page = getIntegerQueryParam(
      req.query.page ? (req.query.page as string) : undefined
    );
  } catch (err) {
    // console.debug("Error parsing limit or page");
  }

  res.status(200).json(paginate(matches, { limit, page }));
};

export const matchesHttpController = {
  getLensFollowingsMatches,
};

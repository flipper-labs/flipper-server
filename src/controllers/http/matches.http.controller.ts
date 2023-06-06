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
import { MatchFilter, NFTNumberFilterParsed } from "models/match/filters.js";

const getMatches = (req: Request, res: Response) => {
  const filters = req.body as MatchFilter;

  let activeMatches = InMemoryData.getInstance().getAllActiveMatches();

  // address filter
  if (filters.player !== "") {
    activeMatches = activeMatches.filter(
      (match) =>
        match.player1.wallet === filters.player ||
        match.player2.wallet === filters.player
    );
  }

  // status filter
  const statusFilters = filters.status
    .map((s) => {
      if (s.checked) return s.value;
    })
    .filter((s) => s !== undefined);
  console.log("Status filter", statusFilters);

  if (statusFilters.length > 0) {
    activeMatches = activeMatches.filter((match) =>
      statusFilters.includes(match.status)
    );
  }

  console.log("After status", activeMatches);

  // nft number filter
  const nftNumberFilter: (NFTNumberFilterParsed | undefined)[] =
    filters.nftNumber
      .map((nn) => {
        if (!nn.checked) return;

        const splitted = nn.value.split("-");
        return {
          lower: parseInt(splitted[0]),
          upper: parseInt(splitted[1]),
        };
      })
      .filter((nn) => nn !== undefined);

  if (nftNumberFilter.length > 0) {
    activeMatches = activeMatches
      .filter((match) => {
        const player1Num = match.player1.nfts ? match.player1.nfts.length : 0;
        const player2Num = match.player2.nfts ? match.player2.nfts.length : 0;
        const total: number = player1Num + player2Num;

        for (let i = 0; i < nftNumberFilter.length; i++) {
          const filter = nftNumberFilter[i] as NFTNumberFilterParsed;
          if (filter.upper >= total && filter.lower <= total) {
            return match;
          }
        }

        return undefined;
      })
      .filter((m) => m !== undefined);
  }

  res.status(200).json(paginate(activeMatches, getLimitAndPage(req)));
};

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

  res.status(200).json(paginate(matches, getLimitAndPage(req)));
};

const getLimitAndPage = (req: Request) => {
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

  return { limit, page };
};

export const matchesHttpController = {
  getLensFollowingsMatches,
  getMatches,
};

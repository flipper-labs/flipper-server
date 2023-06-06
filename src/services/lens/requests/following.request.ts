export interface FollowingRequest {
  limit: number | null;
  cursor: string | null; // e.g. {"offset": 5}
  address: string;
}

export const defaultFollowingRequest = (address: string): FollowingRequest => {
  return {
    limit: null,
    cursor: null,
    address: address,
  };
};

export const getFollowingRequest = (
  qLimit: string | null,
  qPage: string | null,
  address: string
): FollowingRequest => {
  let limit: number | null = null;
  let cursor: string | null = null;

  if (qLimit) {
    limit = parseInt(qLimit as string);
    if (limit <= 0) {
      throw new Error("Limit cannot be less or equal to 0.");
    }
  }

  if (qPage) {
    let page = parseInt(qPage as string);
    if (page <= 0) {
      throw new Error("Page cannot be less or equal to 0.");
    }
    if (limit) {
      cursor = JSON.stringify({
        offset: limit * (page - 1), // 0-2 = page 0
      });
    }
  }

  return { limit, cursor, address };
};

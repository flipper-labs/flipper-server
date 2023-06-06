export interface PaginationParams {
  limit?: number;
  page?: number;
}

export interface PaginatedResult extends PaginationParams {
  data: any;
}

export const paginate = (arr: any[], pp: PaginationParams): PaginatedResult => {
  if (arr.length === 0) {
    return {
      limit: pp.limit,
      page: pp.page,
      data: [],
    };
  }

  const page = pp.page as number;
  const limit = pp.limit as number;

  let lowerBound = (page - 1) * limit;
  let upperBound = page * limit - 1;

  return {
    limit: limit,
    page: page,
    data: arr.slice(lowerBound, upperBound + 1), // include the last element at the upper bound
  };
};

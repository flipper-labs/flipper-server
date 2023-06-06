export interface MatchFilter {
  player: string;
  status: GenericFilter[];
  nftNumber: GenericFilter[];
}

export interface GenericFilter {
  value: string;
  checked: boolean;
}

export interface NFTNumberFilterParsed {
  upper: number;
  lower: number;
}

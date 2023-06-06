export interface Player {
  wallet: string;
  nfts?: NFT[];
  lensProfile?: LensProfile;
}

export interface NFT {
  contract: string;
  tokenId: number;
}

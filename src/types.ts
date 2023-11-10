export type Currency = {
    contract: string;
    name: string;
    symbol: string;
    decimals: number;
};

export type Price = {
    currency: Currency;
    amount: {
        raw: string;
        decimal: number;
        usd: number;
        native: number;
    };
    netAmount?: {
        raw: string;
        decimal: number;
        usd: number;
        native: number;
    };
};

export type BidOrAsk = {
    id: string;
    sourceDomain: string;
    price: Price;
    maker: string;
    validFrom: number;
    validUntil: number;
    token?: {
        contract: string;
        tokenId: string;
        name: string;
        image: string;
    };
};

export type RoyaltyBreakdown = {
    bps: number;
    recipient: string;
};

export type Collection = {
    chainId: number;
    id: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    image: string;
    banner: string;
    discordUrl: string | null;
    externalUrl: string;
    twitterUsername: string | null;
    openseaVerificationStatus: string;
    description: string;
    sampleImages: string[];
    tokenCount: string;
    onSaleCount: string;
    primaryContract: string;
    tokenSetId: string;
    creator: string;
    royalties: {
        recipient: string;
        breakdown: RoyaltyBreakdown[];
        bps: number;
    };
    allRoyalties: {
        onchain: RoyaltyBreakdown[];
        opensea: RoyaltyBreakdown[];
        artblocks: RoyaltyBreakdown[];
    };
    floorAsk: BidOrAsk;
    topBid: BidOrAsk;
    rank: {
        '1day': number | null;
        '7day': number | null;
        '30day': number | null;
        allTime: number;
    };
    volume: {
        '1day': number;
        '7day': number;
        '30day': number;
        allTime: number;
    };
    volumeChange: {
        '1day': number;
        '7day': number;
        '30day': number;
    };
    floorSale: {
        '1day': number;
        '7day': number;
        '30day': number;
    };
    floorSaleChange: {
        '1day': number;
        '7day': number;
        '30day': number;
    };
    salesCount?: {
        '1day': string;
        '7day': string;
        '30day': string;
        allTime: string;
    };
    collectionBidSupported: boolean;
    ownerCount: number;
    contractKind: string;
    mintedTimestamp: number;
    mintStages: any[];
};

export type SearchCollection = {
    collectionId: string;
    name: string;
    slug: string;
    contract: string;
    image: string;
    allTimeVolume: number;
    floorAskPrice: {
        currency: Currency;
        amount: {
            raw: string;
            decimal: number;
            usd: number;
            native: number;
        };
    };
    openseaVerificationStatus: string;
};

export type CollectionsParams = {
    id?: string;
    slug?: string;
    name?: string;
    contract?: string;
};

export type FormattedCollectionData = {
    Name: string;
    OpenSeaLink: string;
    ContractAddress: string;
    CollectionId: string;
    ListedCount: number;
    ListedPct: number;
    OwnerCount: number;
    OwnerPct: number;
    FloorAsk: number | null;
    FloorAskUsd: number | null;
    TopBid: number | null;
    TopBidUsd: number | null;
    Sales_1D: number;
    Sales_7D: number;
    Sales_30D: number;
    Sales_AllTime: number;
    Volume_1D: number;
    Volume_7D: number;
    Volume_30D: number;
    Volume_AllTime: number;
};

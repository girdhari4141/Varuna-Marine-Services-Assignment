
export interface PoolMemberInput {
    shipId: string;
    cb_before: number;
}

export interface PoolMemberOutput {
    shipId: string;
    cb_before: number;
    cb_after: number;
}

export interface CreatePoolRequest {
    year: number;
    members: PoolMemberInput[];
}

export interface CreatePoolResponse {
    poolId: number;
    year: number;
    totalCB: number;
    members: PoolMemberOutput[];
}

export interface AdjustedCBItem {
    shipId: string;
    vesselType: string;
    cb_before: number;
}

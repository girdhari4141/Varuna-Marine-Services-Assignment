// Pooling domain types for Fuel EU Maritime frontend

export interface PoolMember {
    shipId: string;
    vesselType?: string;
    cb_before: number;
    cb_after?: number;
}

export interface PoolRequest {
    year: number;
    members: {
        shipId: string;
        cb_before: number;
    }[];
}

export interface PoolResult {
    poolId: number;
    year: number;
    totalCB: number;
    members: PoolMember[];
}

export interface AdjustedCB {
    shipId: string;
    vesselType: string;
    cb_before: number;
}

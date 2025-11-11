import type { AdjustedCBItem, PoolMemberInput, PoolMemberOutput } from "../domain/Pooling.js";
import type { Pool } from "../domain/Pool.js";

export interface IPoolingRepository {
    /**
     * Get adjusted compliance balance for all ships in a given year
     * @param year
     * @returns Array of ships with their CB calculations
     */
    getAdjustedCB(year: number): Promise<AdjustedCBItem[]>;

    /**
     * Create a pool with the given members and their before/after CB values
     * @param year 
     * @param members
     * @returns The created pool with all member details
     */
    createPool(year: number, members: PoolMemberOutput[]): Promise<{
        poolId: number;
        year: number;
        totalCB: number;
        members: PoolMemberOutput[];
    }>;
}

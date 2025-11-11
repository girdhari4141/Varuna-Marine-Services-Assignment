import type { IPoolingRepository } from "../ports/IPoolingRepository.js";
import type { CreatePoolRequest, CreatePoolResponse, AdjustedCBItem, PoolMemberOutput } from "../domain/index.js";
import { AppError } from "../../shared/errors/AppError.js";

export class PoolingService {
    constructor(private poolingRepository: IPoolingRepository) {}

    // Get adjusted compliance balance for all ships in a given year
    async getAdjustedCB(year: number): Promise<AdjustedCBItem[]> {
        // Validate year
        if (year < 2020 || year > 2100) {
            throw new AppError("Year must be between 2020 and 2100", 400);
        }

        return this.poolingRepository.getAdjustedCB(year);
    }

    // Create a pool with greedy allocation strategy to redistribute CBs

    //Algorithm:
    //  Sort ships by CB descending (surplus first, deficits last)
    //  Use surplus to neutralize deficits greedily
    //  Stop when all deficits neutralized or surplus exhausted
    async createPool(request: CreatePoolRequest): Promise<CreatePoolResponse> {
        if (request.year < 2020 || request.year > 2100) {
            throw new AppError("Year must be between 2020 and 2100", 400);
        }

        if (!request.members || request.members.length === 0) {
            throw new AppError("Pool must have at least one member", 400);
        }

        for (const member of request.members) {
            // Ensure member is a plain non-null object (not array)
            if (typeof member !== "object" || member === null || Array.isArray(member)) {
                throw new AppError("All members must be objects", 400);
            }

            // shipId must exist and be a string
            if (!("shipId" in member) || typeof (member as any).shipId !== "string") {
                throw new AppError("All members must have a shipId", 400);
            }

            // cb_before must be a finite number
            if (typeof (member as any).cb_before !== "number" || Number.isNaN((member as any).cb_before) || !Number.isFinite((member as any).cb_before)) {
                throw new AppError("All members must have a numeric cb_before", 400);
            }
        }

        const totalCB = request.members.reduce((sum, m) => sum + m.cb_before, 0);
        if (totalCB < 0) {
            throw new AppError(
                `Pool invalid: total adjusted CB must be >= 0. Current total: ${totalCB.toFixed(2)}`,
                400
            );
        }

        const allocatedMembers = this.applyGreedyAllocation(request.members);

        const result = await this.poolingRepository.createPool(request.year, allocatedMembers);

        return result;
    }

    //  Greedy allocation algorithm:
    private applyGreedyAllocation(members: { shipId: string; cb_before: number }[]): PoolMemberOutput[] {
        // Create working copy with cb_after initialized to cb_before
        const workingMembers = members.map((m) => ({
            shipId: m.shipId,
            cb_before: m.cb_before,
            cb_after: m.cb_before,
        }));

        // Sort by CB descending (surplus first, deficits last)
        workingMembers.sort((a, b) => b.cb_before - a.cb_before);

        // Separate into surplus and deficit groups
        const surplusShips = workingMembers.filter((m) => m.cb_before > 0);
        const deficitShips = workingMembers.filter((m) => m.cb_before < 0);

        // If no deficits, return as-is (all ships keep their surplus)
        if (deficitShips.length === 0) {
            return workingMembers.map((m) => ({
                ...m,
                cb_before: Math.round(m.cb_before * 100) / 100,
                cb_after: Math.round(m.cb_after * 100) / 100,
            }));
        }

        for (const deficitShip of deficitShips) {
            const neededAmount = Math.abs(deficitShip.cb_before);
            let remainingDeficit = neededAmount;

            for (const surplusShip of surplusShips) {
                if (remainingDeficit <= 0) break; 

                const availableSurplus = surplusShip.cb_after; 
                if (availableSurplus <= 0) continue; 

                const transferAmount = Math.min(availableSurplus, remainingDeficit);

                surplusShip.cb_after -= transferAmount;
                deficitShip.cb_after += transferAmount;
                remainingDeficit -= transferAmount;
            }

            // Rule 2: Deficit ship cannot exit worse
            if (deficitShip.cb_after < deficitShip.cb_before) {
                deficitShip.cb_after = deficitShip.cb_before;
            }
        }

        // Rule 3: Surplus ships cannot exit negative (already ensured by algorithm)
        for (const ship of workingMembers) {
            if (ship.cb_before > 0 && ship.cb_after < 0) {
                ship.cb_after = 0;
            }
        }

        return workingMembers.map((m) => ({
            shipId: m.shipId,
            cb_before: Math.round(m.cb_before * 100) / 100,
            cb_after: Math.round(m.cb_after * 100) / 100,
        }));
    }
}

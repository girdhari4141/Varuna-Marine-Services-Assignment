import type { IPoolingRepository } from "../../../core/ports/IPoolingRepository.js";
import type { AdjustedCBItem, PoolMemberOutput } from "../../../core/domain/index.js";
import prisma from "../../../infrastructure/db/prisma.js";
import { AppError } from "../../../shared/errors/AppError.js";

const TARGET_INTENSITY = 89.3368;
const ENERGY_CONVERSION_FACTOR = 41000;

export class PoolingRepository implements IPoolingRepository {
    //  Calculate adjusted compliance balance for all ships in a given year
    //  Formula: CB = (Target - Actual) × EnergyInScope
    async getAdjustedCB(year: number): Promise<AdjustedCBItem[]> {
        try {
            const routes = await prisma.route.findMany({
                where: { year },
                select: {
                    route_id: true,
                    vesselType: true,
                    ghg_intensity: true,
                    fuelConsumption: true,
                },
            });

            if (routes.length === 0) {
                return [];
            }

            // Group by route_id (ship_id) and calculate CB for each ship
            const shipMap = new Map<string, { vesselType: string; totalCB: number }>();

            for (const route of routes) {
                const energyInScope = route.fuelConsumption * ENERGY_CONVERSION_FACTOR;
                const cb = (TARGET_INTENSITY - route.ghg_intensity) * energyInScope;

                if (shipMap.has(route.route_id)) {
                    const ship = shipMap.get(route.route_id)!;
                    ship.totalCB += cb;
                } else {
                    shipMap.set(route.route_id, {
                        vesselType: route.vesselType,
                        totalCB: cb,
                    });
                }
            }

            // Convert map to array
            const result: AdjustedCBItem[] = [];
            for (const [shipId, data] of shipMap.entries()) {
                result.push({
                    shipId,
                    vesselType: data.vesselType,
                    cb_before: Math.round(data.totalCB * 100) / 100, // Round to 2 decimals
                });
            }

            return result;
        } catch (error) {
            throw new AppError(
                `Failed to get adjusted CB: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500
            );
        }
    }

    // Create a pool and store all member relationships in the database
    async createPool(year: number, members: PoolMemberOutput[]): Promise<{
        poolId: number;
        year: number;
        totalCB: number;
        members: PoolMemberOutput[];
    }> {
        try {
            // Use transaction to ensure atomicity
            const result = await prisma.$transaction(async (tx) => {
                const pool = await tx.pool.create({
                    data: { year },
                });

                await tx.poolMember.createMany({
                    data: members.map((member) => ({
                        pool_id: pool.id,
                        ship_id: member.shipId,
                        cb_before: member.cb_before,
                        cb_after: member.cb_after,
                    })),
                });

                const totalCB = members.reduce((sum, m) => sum + m.cb_after, 0);

                return {
                    poolId: pool.id,
                    year: pool.year,
                    totalCB: Math.round(totalCB * 100) / 100,
                    members,
                };
            });

            return result;
        } catch (error) {
            throw new AppError(
                `Failed to create pool: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500
            );
        }
    }
}

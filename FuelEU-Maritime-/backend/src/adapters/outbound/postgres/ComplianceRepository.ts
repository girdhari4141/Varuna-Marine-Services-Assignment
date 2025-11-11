import type { IComplianceRepository } from "../../../core/ports/IComplianceRepository.js";
import type { AdjustedCB } from "../../../core/domain/index.js";
import prisma from "../../../infrastructure/db/prisma.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class ComplianceRepository implements IComplianceRepository {
    private readonly TARGET_INTENSITY = 89.3368; // gCO₂e/MJ (from requirements)
    private readonly ENERGY_CONVERSION_FACTOR = 41000; // MJ/t (fuel to energy conversion)

    /**
     * Get adjusted compliance balance for all ships in a given year
     * Formula: CB = (Target - Actual) × EnergyInScope
     * Where: EnergyInScope = fuelConsumption × 41000
     */
    async getAdjustedCBByYear(year: number): Promise<AdjustedCB[]> {
        try {
            // Fetch all routes for the specified year
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
                return []; // No routes found for this year
            }

            // Calculate CB for each ship
            const adjustedCBs: AdjustedCB[] = routes.map(route => {
                // Calculate Energy in Scope (MJ)
                const energyInScope = route.fuelConsumption * this.ENERGY_CONVERSION_FACTOR;

                // Calculate Compliance Balance (gCO₂e)
                // CB = (Target - Actual) × EnergyInScope
                const cb_before = (this.TARGET_INTENSITY - route.ghg_intensity) * energyInScope;

                return {
                    shipId: route.route_id,
                    vesselType: route.vesselType,
                    cb_before: Number(cb_before.toFixed(2)), // Round to 2 decimal places
                };
            });

            return adjustedCBs;
        } catch (error) {
            throw new AppError(
                `Failed to fetch adjusted CB for year ${year}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500
            );
        }
    }
}

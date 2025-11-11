import type { IRouteRepository } from "../ports/IRouteRepository.js";
import type { RouteComparison } from "../domain/index.js";
import { AppError } from "../../shared/errors/AppError.js";

export class RouteService {
    private readonly TARGET_INTENSITY = 89.3368; // gCO₂e/MJ

    constructor(private routeRepository: IRouteRepository) { }

    async getAllRoutes() {
        return this.routeRepository.getAllRoutes()
    }
    
    async setBaseline(routeId: string) {
        return this.routeRepository.setBaseline(routeId);
    }

    async getRouteComparison(): Promise<RouteComparison[]> {
        // Fetch baseline route
        const baseline = await this.routeRepository.getBaselineRoute();
        
        if (!baseline) {
            throw new AppError("No baseline route found. Please set a baseline first.", 404);
        }

        // Fetch all non-baseline routes
        const comparisonRoutes = await this.routeRepository.getNonBaselineRoutes();

        if (comparisonRoutes.length === 0) {
            return []; // No routes to compare
        }

        // Compute comparison statistics
        const comparisons: RouteComparison[] = comparisonRoutes.map(route => {
            // Formula: percentDiff = ((comparison.ghgIntensity / baseline.ghgIntensity) - 1) * 100
            const percentDiff = ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
            
            // Check compliance: compliant if comparison intensity ≤ target
            const compliant = route.ghgIntensity <= this.TARGET_INTENSITY;

            return {
                routeId: route.routeId,
                baselineIntensity: baseline.ghgIntensity,
                comparisonIntensity: route.ghgIntensity,
                percentDiff: Number(percentDiff.toFixed(2)), // Round to 2 decimal places
                compliant
            };
        });

        return comparisons;
    }
}
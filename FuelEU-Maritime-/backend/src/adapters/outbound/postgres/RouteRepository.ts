import type { Route } from "../../../core/domain/index.js";
import type { IRouteRepository } from "../../../core/ports/IRouteRepository.js";
import prisma from "../../../infrastructure/db/prisma.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class RouteRepository implements IRouteRepository {
    async getAllRoutes(): Promise<Route[]> {
        try {
            const routes = await prisma.route.findMany({
                select: {
                    id: true,
                    route_id: true,
                    vesselType: true,
                    fuelType: true,
                    year: true,
                    ghg_intensity: true,
                    fuelConsumption: true,
                    distance: true,
                    totalEmissions: true,
                    is_baseline: true,
                },
            });

            return routes.map((r: any): Route => ({
                id: r.id,
                routeId: r.route_id,
                vesselType: r.vesselType,
                fuelType: r.fuelType,
                year: r.year,
                ghgIntensity: r.ghg_intensity,
                fuelConsumption: r.fuelConsumption,
                distance: r.distance,
                totalEmissions: r.totalEmissions,
                isBaseline: r.is_baseline,
            }));
        } catch (error) {
            throw new AppError(
                `Failed to fetch routes: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500
            );
        }
    }
    async setBaseline(routeId: string): Promise<Route> {
        try {
            // First, check if the route exists
            const existingRoute = await prisma.route.findUnique({
                where: { route_id: routeId }
            });

            if (!existingRoute) {
                throw new AppError(`Route with ID ${routeId} not found`, 404);
            }

            // Reset all baselines to false
            await prisma.route.updateMany({ 
                data: { is_baseline: false } 
            });

            // Set the new baseline
            const updated = await prisma.route.update({
                where: { route_id: routeId },
                data: { is_baseline: true },
            });

            return {
                id: updated.id,
                routeId: updated.route_id,
                vesselType: updated.vesselType,
                fuelType: updated.fuelType,
                year: updated.year,
                ghgIntensity: updated.ghg_intensity,
                fuelConsumption: updated.fuelConsumption,
                distance: updated.distance,
                totalEmissions: updated.totalEmissions,
                isBaseline: updated.is_baseline,
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to set baseline: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500
            );
        }
    }

    async getBaselineRoute(): Promise<Route | null> {
        try {
            const baseline = await prisma.route.findFirst({
                where: { is_baseline: true },
                select: {
                    id: true,
                    route_id: true,
                    vesselType: true,
                    fuelType: true,
                    year: true,
                    ghg_intensity: true,
                    fuelConsumption: true,
                    distance: true,
                    totalEmissions: true,
                    is_baseline: true,
                },
            });

            if (!baseline) {
                return null;
            }

            return {
                id: baseline.id,
                routeId: baseline.route_id,
                vesselType: baseline.vesselType,
                fuelType: baseline.fuelType,
                year: baseline.year,
                ghgIntensity: baseline.ghg_intensity,
                fuelConsumption: baseline.fuelConsumption,
                distance: baseline.distance,
                totalEmissions: baseline.totalEmissions,
                isBaseline: baseline.is_baseline,
            };
        } catch (error) {
            throw new AppError(
                `Failed to fetch baseline route: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500
            );
        }
    }

    async getNonBaselineRoutes(): Promise<Route[]> {
        try {
            const routes = await prisma.route.findMany({
                where: { is_baseline: false },
                select: {
                    id: true,
                    route_id: true,
                    vesselType: true,
                    fuelType: true,
                    year: true,
                    ghg_intensity: true,
                    fuelConsumption: true,
                    distance: true,
                    totalEmissions: true,
                    is_baseline: true,
                },
            });

            return routes.map((r): Route => ({
                id: r.id,
                routeId: r.route_id,
                vesselType: r.vesselType,
                fuelType: r.fuelType,
                year: r.year,
                ghgIntensity: r.ghg_intensity,
                fuelConsumption: r.fuelConsumption,
                distance: r.distance,
                totalEmissions: r.totalEmissions,
                isBaseline: r.is_baseline,
            }));
        } catch (error) {
            throw new AppError(
                `Failed to fetch non-baseline routes: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500
            );
        }
    }
}
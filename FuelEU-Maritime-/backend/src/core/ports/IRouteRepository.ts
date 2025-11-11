import type { Route } from "../domain/index.js";

export interface IRouteRepository{
    getAllRoutes(): Promise<Route[]>;
    setBaseline(routeId: string): Promise<Route>;
    getBaselineRoute(): Promise<Route | null>;
    getNonBaselineRoutes(): Promise<Route[]>;
}
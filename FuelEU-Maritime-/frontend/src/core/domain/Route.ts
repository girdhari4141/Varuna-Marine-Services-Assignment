// Route domain types for Fuel EU Maritime frontend

export interface Route {
    id: number;
    routeId: string;
    vesselType: string;
    fuelType: string;
    year: number;
    ghgIntensity: number;
    fuelConsumption: number;
    distance: number;
    totalEmissions: number;
    isBaseline: boolean;
}

export interface RouteFilters {
    vesselType: string;
    fuelType: string;
    year: string;
}

import type { ShipCompliance, BankEntry } from "./index.js"

export interface Route {
  id: number;
  routeId: string; // maps to prisma `route_id`
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number; // maps to prisma `ghg_intensity`
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean; // maps to prisma `is_baseline`

  // Optional relations (may be omitted in domain DTOs)
  shipCompliances?: ShipCompliance[];
  bankEntries?: BankEntry[];
}
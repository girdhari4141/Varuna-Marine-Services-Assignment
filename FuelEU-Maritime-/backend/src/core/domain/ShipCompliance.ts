import type { Route } from "./Route.js";

export interface ShipCompliance {
  id: number;
  shipId: string; // maps to prisma `ship_id` and relates to Route.route_id
  year: number;
  cbGco2eq: number;

  // Optional relation
  route?: Route;
}
import type { Route } from "./Route.js";

export interface BankEntry {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;

  // Optional relation
  route?: Route;
}

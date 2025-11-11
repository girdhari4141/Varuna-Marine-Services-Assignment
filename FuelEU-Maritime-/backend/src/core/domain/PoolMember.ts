import type { Pool } from "./Pool.js";

export interface PoolMember {
  id: number;
  poolId: number;
  shipId: string;
  cbBefore: number; 
  cbAfter: number; 

  // Optional relation
  pool?: Pool;
}
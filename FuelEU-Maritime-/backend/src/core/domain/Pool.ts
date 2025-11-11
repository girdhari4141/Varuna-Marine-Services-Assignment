import type { PoolMember } from "./PoolMember.js";
export interface Pool {
  id: number;
  year: number;
  createdAt: Date;

  members?: PoolMember[];
}
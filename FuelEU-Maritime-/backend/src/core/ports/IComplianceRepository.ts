import type { AdjustedCB } from "../domain/index.js";

export interface IComplianceRepository {
    getAdjustedCBByYear(year: number): Promise<AdjustedCB[]>;
}

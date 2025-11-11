import type { BankRequest, ApplyRequest, ApplyResponse } from "../domain/index.js";

export interface IBankingRepository {
    bankSurplus(request: BankRequest): Promise<{ shipId: string; year: number; amount: number }>;
    applyBanked(request: ApplyRequest): Promise<ApplyResponse>;
    getTotalBanked(shipId: string): Promise<number>;
}
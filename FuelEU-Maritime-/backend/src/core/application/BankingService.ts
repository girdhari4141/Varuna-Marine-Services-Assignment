import type { IBankingRepository } from "../ports/IBankingRepository.js";
import type { BankRequest, BankResponse, ApplyRequest, ApplyResponse } from "../domain/index.js";

export class BankingService {
    constructor(private bankingRepository: IBankingRepository) {}

    async bankSurplus(request: BankRequest): Promise<BankResponse> {
        const result = await this.bankingRepository.bankSurplus(request);
        
        return {
            message: "Banked successfully",
            result,
        };
    }

    async applyBanked(request: ApplyRequest): Promise<ApplyResponse> {
        return this.bankingRepository.applyBanked(request);
    }

    async getTotalBanked(shipId: string): Promise<number> {
        return this.bankingRepository.getTotalBanked(shipId);
    }
}

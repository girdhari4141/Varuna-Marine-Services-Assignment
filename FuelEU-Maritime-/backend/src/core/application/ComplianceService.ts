import type { IComplianceRepository } from "../ports/IComplianceRepository.js";
import type { AdjustedCB } from "../domain/index.js";
import { AppError } from "../../shared/errors/AppError.js";

export class ComplianceService {
    constructor(private complianceRepository: IComplianceRepository) {}

    async getAdjustedCBByYear(year: number): Promise<AdjustedCB[]> {
        // Validate year
        if (!year || year < 2020 || year > 2100) {
            throw new AppError("Invalid year. Please provide a valid year between 2020 and 2100.", 400);
        }

        return this.complianceRepository.getAdjustedCBByYear(year);
    }
}

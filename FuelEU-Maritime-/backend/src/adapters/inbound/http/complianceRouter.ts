import { Router, Request, Response } from "express";
import { ComplianceService } from "../../../core/application/ComplianceService.js";
import { ComplianceRepository } from "../../outbound/postgres/ComplianceRepository.js";
import { asyncHandler } from "../../../shared/middleware/errorHandler.js";

const router = Router();
const complianceRepository = new ComplianceRepository();
const complianceService = new ComplianceService(complianceRepository);

// GET /compliance/adjusted-cb?year=YYYY - Get adjusted compliance balance for all ships in a year
router.get('/adjusted-cb', asyncHandler(async (req: Request, res: Response) => {
    const yearParam = req.query.year;

    // Validate year parameter
    if (!yearParam) {
        res.status(400).json({
            success: false,
            message: "Missing required query parameter: year"
        });
        return;
    }

    const year = Number(yearParam);

    // Validate year is a valid number
    if (isNaN(year)) {
        res.status(400).json({
            success: false,
            message: "Invalid year parameter. Must be a number."
        });
        return;
    }

    const adjustedCBs = await complianceService.getAdjustedCBByYear(year);
    
    res.status(200).json({
        success: true,
        year,
        data: adjustedCBs,
        count: adjustedCBs.length
    });
}));

export default router;

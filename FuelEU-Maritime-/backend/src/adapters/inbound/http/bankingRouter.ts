import { Router, Request, Response } from "express";
import { BankingService } from "../../../core/application/BankingService.js";
import { BankingRepository } from "../../outbound/postgres/BankingRepository.js";
import { asyncHandler } from "../../../shared/middleware/errorHandler.js";

const router = Router();
const bankingRepository = new BankingRepository();
const bankingService = new BankingService(bankingRepository);

// POST /banking/bank - Bank surplus credits
router.post('/bank', asyncHandler(async (req: Request, res: Response) => {
    const { shipId, year, amount } = req.body;

    // Validate required fields
    if (!shipId || !year || amount === undefined) {
        res.status(400).json({
            success: false,
            message: "Missing required fields: shipId, year, amount"
        });
        return;
    }

    // Validate types
    if (typeof shipId !== 'string' || typeof year !== 'number' || typeof amount !== 'number') {
        res.status(400).json({
            success: false,
            message: "Invalid field types: shipId must be string, year and amount must be numbers"
        });
        return;
    }

    const result = await bankingService.bankSurplus({ shipId, year, amount });
    
    res.status(201).json({
        success: true,
        ...result
    });
}));

// POST /banking/apply - Apply banked credits
router.post('/apply', asyncHandler(async (req: Request, res: Response) => {
    const { shipId, year, applyAmount } = req.body;

    // Validate required fields
    if (!shipId || !year || applyAmount === undefined) {
        res.status(400).json({
            success: false,
            message: "Missing required fields: shipId, year, applyAmount"
        });
        return;
    }

    // Validate types
    if (typeof shipId !== 'string' || typeof year !== 'number' || typeof applyAmount !== 'number') {
        res.status(400).json({
            success: false,
            message: "Invalid field types: shipId must be string, year and applyAmount must be numbers"
        });
        return;
    }

    const result = await bankingService.applyBanked({ shipId, year, applyAmount });
    
    res.status(200).json({
        success: true,
        ...result
    });
}));

// GET /banking/:shipId/balance - Get total banked balance for a ship
router.get('/:shipId/balance', asyncHandler(async (req: Request, res: Response) => {
    const { shipId } = req.params;

    if (!shipId) {
        res.status(400).json({
            success: false,
            message: "shipId parameter is required"
        });
        return;
    }

    const balance = await bankingService.getTotalBanked(shipId);
    
    res.status(200).json({
        success: true,
        shipId,
        balance
    });
}));

export default router;

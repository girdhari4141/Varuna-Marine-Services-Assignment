import { Router, Request, Response } from "express";
import { PoolingService } from "../../../core/application/PoolingService.js";
import { PoolingRepository } from "../../outbound/postgres/PoolingRepository.js";
import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import { AppError } from "../../../shared/errors/AppError.js";

const router = Router();
const poolingRepository = new PoolingRepository();
const poolingService = new PoolingService(poolingRepository);

//  POST /api/pools
//  Create a pool with greedy allocation to redistribute CBs
router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        const { year, members } = req.body;

        // Validate request body: year must be a finite number and members must be a non-empty array
        const yearNum = Number(year);
        if (typeof year === "undefined" || !Number.isFinite(yearNum)) {
            throw new AppError("Request body must include a valid numeric 'year'", 400);
        }

        if (!Array.isArray(members) || members.length === 0) {
            throw new AppError("Request body must include a non-empty array 'members'", 400);
        }

        // Basic member shape validation to prevent downstream runtime errors
        for (const m of members) {
            if (typeof m !== "object" || m === null || Array.isArray(m)) {
                throw new AppError("All members must be objects", 400);
            }
            if (!("shipId" in m)) {
                throw new AppError("All members must have a shipId", 400);
            }
            if (!("cb_before" in m)) {
                throw new AppError("All members must have a numeric cb_before", 400);
            }
        }

        const result = await poolingService.createPool({ year: yearNum, members });

        res.status(201).json(result);
    })
);

export default router;

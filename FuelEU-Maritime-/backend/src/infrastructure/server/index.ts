import express from "express";
import cors from "cors";
import routesRouter from "../../adapters/inbound/http/routesRouter.js";
import bankingRouter from "../../adapters/inbound/http/bankingRouter.js";
import complianceRouter from "../../adapters/inbound/http/complianceRouter.js";
import poolingRouter from "../../adapters/inbound/http/poolingRouter.js";
import { errorHandler } from "../../shared/middleware/errorHandler.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for the frontend dev server (adjust origin in production)
app.use(
    cors({
        origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// API routes
app.use("/api/routes", routesRouter);
app.use("/api/banking", bankingRouter);
app.use("/api/compliance", complianceRouter);
app.use("/api/pools", poolingRouter);

// Error handler (must be last)
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(Number(port), () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`🏥 Health: http://localhost:${port}/health`);
    console.log(`📍 Routes: http://localhost:${port}/api/routes`);
    console.log(`💰 Banking: http://localhost:${port}/api/banking`);
    console.log(`📊 Compliance: http://localhost:${port}/api/compliance`);
    console.log(`🏊 Pooling: http://localhost:${port}/api/pools`);
});

export default app;

import express, { NextFunction, Request, Response } from "express";
import { env } from "./config/env";
import { FuelLogController } from "./controllers/fuelLogController";
import { ensureFuelLogSchema } from "./db/ensureFuelLogSchema";
import { pool } from "./db/pool";
import { createFuelLogRouter } from "./routes/fuelLogRoutes";
import { FuelLogService } from "./services/fuelLogService";
import { ApiError, sendError } from "./utils/api";

const app = express();

app.use(express.json({ limit: "10mb" }));

const fuelLogService = new FuelLogService(pool);
const fuelLogController = new FuelLogController(fuelLogService);

app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Welcome to TransitOps API", data: null });
});

app.get("/db-test", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "Connected to PostgreSQL successfully",
      data: { time: result.rows[0].now },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to connect to PostgreSQL";
    sendError(res, 500, message);
  }
});

app.use("/api/fuel-logs", createFuelLogRouter(fuelLogController));

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ApiError) {
    sendError(res, error.statusCode, error.message);
    return;
  }

  console.error(error);
  sendError(res, 500, "Internal server error.");
});

async function startServer() {
  await ensureFuelLogSchema(pool);

  app.listen(env.port, () => {
    console.log(`Server is running on port ${env.port}`);
  });
}

void startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

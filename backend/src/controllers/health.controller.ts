/**
 * Health Check Controller
 * Provides endpoints for monitoring application health
 */

import type { Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../config/env.config.js";
import { logger } from "../utils/logger.util.js";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: ServiceStatus;
    cloudinary: ServiceStatus;
    clerk: ServiceStatus;
  };
}

interface ServiceStatus {
  status: "up" | "down" | "unknown";
  message?: string;
  responseTime?: number;
}

/**
 * Basic health check - returns 200 if server is running
 */
export const healthCheck = async (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Detailed health check - checks all services
 */
export const detailedHealthCheck = async (_req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Check database connection
    const dbStatus = await checkDatabase();

    // Check Cloudinary (basic check - just verify config exists)
    const cloudinaryStatus = checkCloudinary();

    // Check Clerk (basic check - just verify config exists)
    const clerkStatus = checkClerk();

    // Determine overall status
    const allServicesUp =
      dbStatus.status === "up" &&
      cloudinaryStatus.status === "up" &&
      clerkStatus.status === "up";

    const anyServiceDown =
      dbStatus.status === "down" ||
      cloudinaryStatus.status === "down" ||
      clerkStatus.status === "down";

    const overallStatus: "healthy" | "degraded" | "unhealthy" = allServicesUp
      ? "healthy"
      : anyServiceDown
      ? "unhealthy"
      : "degraded";

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version || "1.0.0",
      services: {
        database: dbStatus,
        cloudinary: cloudinaryStatus,
        clerk: clerkStatus,
      },
    };

    const statusCode = overallStatus === "healthy" ? 200 : 503;

    logger.info(
      `Health check completed in ${
        Date.now() - startTime
      }ms - Status: ${overallStatus}`
    );

    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error("Health check failed:", error);

    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
};

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<ServiceStatus> {
  const startTime = Date.now();

  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return {
        status: "down",
        message: "Database not connected",
      };
    }

    const db = mongoose.connection.db;
    if (!db) {
      return {
        status: "down",
        message: "Database connection not ready",
      };
    }

    // Perform a simple ping to verify connection
    await db.admin().ping();

    const responseTime = Date.now() - startTime;

    return {
      status: "up",
      message: "Database connected",
      responseTime,
    };
  } catch (error) {
    logger.error("Database health check failed:", error);
    return {
      status: "down",
      message: error instanceof Error ? error.message : "Database check failed",
    };
  }
}

/**
 * Check Cloudinary configuration
 */
function checkCloudinary(): ServiceStatus {
  try {
    // Basic check - verify environment variables are set
    if (
      !env.CLOUDINARY_CLOUD_NAME ||
      !env.CLOUDINARY_API_KEY ||
      !env.CLOUDINARY_API_SECRET
    ) {
      return {
        status: "down",
        message: "Cloudinary configuration missing",
      };
    }

    return {
      status: "up",
      message: "Cloudinary configured",
    };
  } catch {
    return {
      status: "down",
      message: "Cloudinary check failed",
    };
  }
}

/**
 * Check Clerk configuration
 */
function checkClerk(): ServiceStatus {
  try {
    // Basic check - verify environment variables are set
    if (!env.CLERK_PUBLISHABLE_KEY || !env.CLERK_SECRET_KEY) {
      return {
        status: "down",
        message: "Clerk configuration missing",
      };
    }

    return {
      status: "up",
      message: "Clerk configured",
    };
  } catch {
    return {
      status: "down",
      message: "Clerk check failed",
    };
  }
}

/**
 * Readiness check - returns 200 when server is ready to accept traffic
 */
export const readinessCheck = async (_req: Request, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ready: false,
        message: "Database not ready",
      });
    }

    res.status(200).json({
      ready: true,
      message: "Server is ready",
    });
  } catch {
    res.status(503).json({
      ready: false,
      message: "Server not ready",
    });
  }
};

/**
 * Liveness check - returns 200 if server process is alive
 */
export const livenessCheck = (_req: Request, res: Response) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
};

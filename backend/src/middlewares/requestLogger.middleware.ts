import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { logger } from "../utils/logger.util.js";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/health") {
    return next();
  }

  const start = process.hrtime.bigint();

  const incomingRequestId = req.headers["x-request-id"];
  const requestId =
    (typeof incomingRequestId === "string" && incomingRequestId.length > 0
      ? incomingRequestId
      : Array.isArray(incomingRequestId) && incomingRequestId.length > 0
        ? incomingRequestId[0]
        : undefined) ?? randomUUID();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    const userId = req.auth?.userId;

    const logData = {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      ip: req.ip,
      userId,
    };

    if (res.statusCode >= 500) {
      logger.error("HTTP request failed", logData);
      return;
    }

    if (res.statusCode >= 400) {
      logger.warn("HTTP request error", logData);
      return;
    }

    logger.info("HTTP request", logData);
  });

  next();
};

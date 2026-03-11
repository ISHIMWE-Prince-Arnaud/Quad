/**
 * Health Check Routes
 * Endpoints for monitoring application health
 */

import { Router } from "express";
import {
  healthCheck,
  detailedHealthCheck,
  readinessCheck,
  livenessCheck,
} from "../controllers/health.controller.js";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.get("/", healthCheck);

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check with service status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health status
 */
router.get("/detailed", detailedHealthCheck);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check (for Kubernetes/load balancers)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Ready to safely accept traffic
 */
router.get("/ready", readinessCheck);

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check (for Kubernetes/load balancers)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is still alive
 */
router.get("/live", livenessCheck);

export default router;

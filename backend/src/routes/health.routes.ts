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
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
router.get("/", healthCheck);

/**
 * @route   GET /health/detailed
 * @desc    Detailed health check with service status
 * @access  Public
 */
router.get("/detailed", detailedHealthCheck);

/**
 * @route   GET /health/ready
 * @desc    Readiness check (for Kubernetes/load balancers)
 * @access  Public
 */
router.get("/ready", readinessCheck);

/**
 * @route   GET /health/live
 * @desc    Liveness check (for Kubernetes/load balancers)
 * @access  Public
 */
router.get("/live", livenessCheck);

export default router;

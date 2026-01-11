import type { Request, Response, NextFunction } from "express";

// Auth middleware for API routes
// Uses Clerk's clerkMiddleware (configured in server.ts) which populates req.auth
// Returns a JSON 401 error instead of redirecting, which is better for SPAs
export const requireApiAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.auth?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthenticated",
    });
  }

  return next();
};

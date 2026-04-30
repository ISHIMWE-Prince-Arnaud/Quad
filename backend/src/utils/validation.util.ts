import { ZodError, type ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validateSchema =
  (schema: ZodSchema<unknown>, property: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[property]);
      req[property] = parsed; // Apply Zod transformations (defaults, transforms, etc.)
      next();
    } catch (error: unknown) {
      const zodError = error instanceof ZodError ? error : undefined;
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: zodError?.issues,
      });
    }
  };

import { ZodError, type ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validateSchema =
  (schema: ZodSchema<unknown>, property: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[property]);
      // Apply Zod transformations (defaults, coerced types, etc.)
      // Use Object.assign for req.query/params to avoid throwing on
      // non-writable property descriptors in some Express versions.
      if (req[property] && typeof req[property] === "object") {
        Object.assign(req[property], parsed);
      } else {
        req[property] = parsed;
      }
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

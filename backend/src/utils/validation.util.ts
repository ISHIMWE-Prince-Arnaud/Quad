import { ZodError, type ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validateSchema =
  (schema: ZodSchema<unknown>, property: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[property]);
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

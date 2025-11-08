import type { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validateSchema =
  (schema: ZodSchema<any>, property: "body" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[property]);
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }
  };

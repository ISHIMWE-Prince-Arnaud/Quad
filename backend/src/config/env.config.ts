import { z } from "zod";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 4000))
    .refine((val) => !isNaN(val), { message: "PORT must be a number" }),
  MONGODB_URI: z.string().min(1, "Missing MongoDB URI"),
  CLERK_PUBLISHABLE_KEY: z.string().min(1, "Missing CLERK_PUBLISHABLE_KEY"),
  CLERK_SECRET_KEY: z.string().min(1, "Missing CLERK_SECRET_KEY"),
  CLERK_WEBHOOK_SECRET: z.string().min(1, "Missing CLERK_WEBHOOK_SECRET"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "Missing CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: z.string().min(1, "Missing CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: z.string().min(1, "Missing CLOUDINARY_API_SECRET"),
  SKIP_INDEX_CREATION: z.string().optional().default('false'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Use console.error here as logger isn't available yet
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
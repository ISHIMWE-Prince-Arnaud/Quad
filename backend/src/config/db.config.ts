import mongoose from "mongoose";
import { env } from "./env.config.js";
import { logger } from "../utils/logger.util.js";

export const connectDB = async() => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        logger.database("DB connected successfully");
    } catch (error: unknown) {
        logger.error("Error connecting to DB", error);
        process.exit(1)
    }
}
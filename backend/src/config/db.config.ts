import mongoose from "mongoose";
import { env } from "./env.config.js";

export const connectDB = async() => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log("DB connected successfully");
    } catch (error) {
        console.log("Error connecting to DB", error);
        process.exit(1)
    }
}
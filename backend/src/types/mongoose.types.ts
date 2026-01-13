import type { Document } from "mongoose";

export type LeanDocument<T extends Document> = Omit<T, keyof Document> & { _id: T['_id'] };

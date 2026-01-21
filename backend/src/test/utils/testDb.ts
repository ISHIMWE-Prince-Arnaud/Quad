import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | null = null;

export const startTestDb = async (): Promise<string> => {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 60_000,
      },
    });
  }

  const uri = mongoServer.getUri("quad_test");

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri);
  }

  return uri;
};

export const clearTestDb = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  const ops = Object.values(collections).map((collection) => collection.deleteMany({}));
  await Promise.all(ops);
};

export const stopTestDb = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } finally {
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
  }
};

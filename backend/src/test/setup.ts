import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { setSocketIO } from "../config/socket.config.js";
import { clearTestDb, startTestDb, stopTestDb } from "./utils/testDb.js";
import { logger } from "../utils/logger.util.js";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quad_test";
process.env.CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || "pk_test";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test";
process.env.CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || "whsec_test";
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "cloud";
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "key";
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "secret";
process.env.SKIP_INDEX_CREATION = "true";

vi.spyOn(logger, "error").mockImplementation(() => {});

vi.mock("@clerk/express", () => {
  return {
    getAuth: (req: any) => ({ userId: req?.auth?.userId ?? null }),
    clerkMiddleware: () => (_req: any, _res: any, next: any) => next(),
    clerkClient: {
      users: {
        getUser: async (userId: string) => ({
          id: userId,
          username: `user_${userId}`,
          emailAddresses: [{ emailAddress: `${userId}@example.com` }],
          firstName: "Test",
          lastName: "User",
          imageUrl: "https://example.com/avatar.png",
        }),
      },
    },
  };
});

vi.mock("svix", () => {
  class Webhook {
    constructor(_secret: string) {}

    verify(payload: any, headers: any) {
      if (headers?.["x-test-invalid-signature"] === "1") {
        throw new Error("Invalid signature");
      }

      const buf = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
      return JSON.parse(buf.toString("utf8"));
    }
  }

  return { Webhook };
});

const ioMock: any = {
  emit: vi.fn(),
  on: vi.fn(),
};
ioMock.to = vi.fn(() => ioMock);
setSocketIO(ioMock);

beforeAll(async () => {
  await startTestDb();
});

afterEach(async () => {
  await clearTestDb();
});

afterAll(async () => {
  await stopTestDb();
});

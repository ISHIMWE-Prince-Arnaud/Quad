import { afterAll, afterEach, beforeAll, vi } from "vitest";
import type { Server } from "socket.io";
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
    getAuth: (req: unknown) => ({
      userId:
        (req as { auth?: { userId?: string | null } } | null | undefined)?.auth
          ?.userId ?? null,
    }),
    clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
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

    verify(payload: unknown, headers: unknown) {
      const hdrs = headers as Record<string, unknown> | null | undefined;
      if (hdrs?.["x-test-invalid-signature"] === "1") {
        throw new Error("Invalid signature");
      }

      if (Buffer.isBuffer(payload)) {
        return JSON.parse(payload.toString("utf8"));
      }

      if (typeof payload === "string") {
        const buf = Buffer.from(payload);
        return JSON.parse(buf.toString("utf8"));
      }

      throw new Error("Invalid payload type for svix.Webhook.verify mock");
    }
  }

  return { Webhook };
});

const ioMock = {
  emit: vi.fn(),
  on: vi.fn(),
  to: vi.fn(),
};
ioMock.to.mockReturnValue(ioMock);
setSocketIO(ioMock as unknown as Server);

beforeAll(async () => {
  await startTestDb();
});

afterEach(async () => {
  await clearTestDb();
});

afterAll(async () => {
  await stopTestDb();
});

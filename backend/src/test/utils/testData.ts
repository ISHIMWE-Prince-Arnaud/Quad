import { User } from "../../models/User.model.js";
import { Post } from "../../models/Post.model.js";

export const createTestUser = async (overrides?: Partial<{ clerkId: string; username: string; email: string }>) => {
  const clerkId = overrides?.clerkId ?? "test_user_1";
  const username = overrides?.username ?? "testuser";
  const email = overrides?.email ?? `${username}@example.com`;

  const existing = await User.findOne({ clerkId });
  if (existing) return existing;

  return User.create({
    clerkId,
    username,
    email,
  });
};

export const createTestPost = async (overrides?: Partial<{ userId: string; text: string }>) => {
  const userId = overrides?.userId ?? "test_user_1";
  const author = await createTestUser({ clerkId: userId, username: `u_${userId}`, email: `${userId}@example.com` });

  return Post.create({
    userId: author.clerkId,
    author: {
      clerkId: author.clerkId,
      username: author.username,
      email: author.email,
      displayName: author.displayName,
      firstName: author.firstName,
      lastName: author.lastName,
      profileImage: author.profileImage,
      coverImage: author.coverImage,
      bio: author.bio,
    },
    text: overrides?.text ?? "Hello world",
    media: [],
  });
};

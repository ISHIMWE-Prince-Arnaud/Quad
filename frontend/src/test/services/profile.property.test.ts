import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { ProfileService } from "@/services/profileService";
import { endpoints } from "@/lib/api";
import type { ApiProfile } from "@/types/api";

/**
 * Feature: quad-production-ready, Property 21: Profile Content Tab Pagination
 *
 * For any profile content tab (Posts, Stories, Polls), pagination should work correctly
 * with cursor-based navigation.
 *
 * Validates: Requirements 6.5
 */

// Mock the API endpoints
vi.mock("@/lib/api", () => ({
  endpoints: {
    profiles: {
      getUserPosts: vi.fn(),
      getUserStories: vi.fn(),
      getUserPolls: vi.fn(),
      updateOwn: vi.fn(),
      getByUsername: vi.fn(),
    },
  },
}));

describe("Property 21: Profile Content Tab Pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should paginate posts correctly with non-overlapping results", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for username
        fc
          .string({ minLength: 3, maxLength: 30 })
          .filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
        // Generator for page size
        fc.integer({ min: 1, max: 50 }),
        // Generator for total items
        fc.integer({ min: 0, max: 200 }),
        async (username, pageSize, totalItems) => {
          // Generate mock posts
          const allPosts = Array.from({ length: totalItems }, (_, i) => ({
            _id: `post-${i}`,
            userId: "test-user-id",
            author: {
              _id: "test-user-id",
              clerkId: "test-clerk-id",
              username: username,
              email: "test@example.com",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              joinedAt: new Date().toISOString(),
            },
            text: `Post content ${i}`,
            media: [],
            reactionsCount: 0,
            commentsCount: 0,
            createdAt: new Date(Date.now() - i * 1000).toISOString(),
            updatedAt: new Date(Date.now() - i * 1000).toISOString(),
          }));

          // Track which posts have been returned
          const returnedPostIds = new Set<string>();

          // Mock paginated responses
          vi.mocked(endpoints.profiles.getUserPosts).mockImplementation(
            async (_username: string, params?: any) => {
              const page = params?.page || 1;
              const limit = params?.limit || pageSize;
              const startIndex = (page - 1) * limit;
              const endIndex = Math.min(startIndex + limit, totalItems);
              const pagePosts = allPosts.slice(startIndex, endIndex);

              return {
                data: {
                  data: pagePosts,
                  pagination: {
                    page,
                    limit,
                    total: totalItems,
                    hasMore: endIndex < totalItems,
                  },
                },
              } as any;
            }
          );

          // Fetch first page
          const page1Result = await ProfileService.getUserPosts(username, {
            page: 1,
            limit: pageSize,
          });

          expect(page1Result.posts.length).toBeLessThanOrEqual(pageSize);
          expect(page1Result.total).toBe(totalItems);

          // Track first page IDs
          page1Result.posts.forEach((post) => {
            expect(returnedPostIds.has(post._id)).toBe(false); // No duplicates
            returnedPostIds.add(post._id);
          });

          // If there are more pages, fetch second page
          if (page1Result.hasMore) {
            const page2Result = await ProfileService.getUserPosts(username, {
              page: 2,
              limit: pageSize,
            });

            expect(page2Result.posts.length).toBeLessThanOrEqual(pageSize);

            // Verify no overlap with first page
            page2Result.posts.forEach((post) => {
              expect(returnedPostIds.has(post._id)).toBe(false); // No duplicates
              returnedPostIds.add(post._id);
            });
          }

          // Verify total items across all pages equals total count
          const allPages: typeof page1Result.posts = [];
          let currentPageNum = 1;
          let hasMore = true;

          do {
            const pageResult = await ProfileService.getUserPosts(username, {
              page: currentPageNum,
              limit: pageSize,
            });

            allPages.push(...pageResult.posts);
            hasMore = pageResult.hasMore;
            currentPageNum++;

            // Safety check to prevent infinite loops
            if (currentPageNum > 1000) break;
          } while (hasMore);

          expect(allPages.length).toBe(totalItems);

          // Verify all IDs are unique
          const allIds = new Set(allPages.map((p) => p._id));
          expect(allIds.size).toBe(totalItems);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should paginate stories correctly with non-overlapping results", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for username
        fc
          .string({ minLength: 3, maxLength: 30 })
          .filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
        // Generator for page size
        fc.integer({ min: 1, max: 50 }),
        // Generator for total items
        fc.integer({ min: 0, max: 200 }),
        async (username, pageSize, totalItems) => {
          // Generate mock stories
          const allStories = Array.from({ length: totalItems }, (_, i) => ({
            _id: `story-${i}`,
            clerkId: "test-clerk-id",
            content: `Story content ${i}`,
            media: `https://example.com/story-${i}.jpg`,
            mediaType: "image" as const,
            author: {
              _id: "test-user-id",
              clerkId: "test-clerk-id",
              username: username,
              email: "test@example.com",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              joinedAt: new Date().toISOString(),
            },
            views: 0,
            isViewed: false,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            createdAt: new Date(Date.now() - i * 1000).toISOString(),
          }));

          // Mock paginated responses
          vi.mocked(endpoints.profiles.getUserStories).mockImplementation(
            async (_username: string, params?: any) => {
              const page = params?.page || 1;
              const limit = params?.limit || pageSize;
              const startIndex = (page - 1) * limit;
              const endIndex = Math.min(startIndex + limit, totalItems);
              const pageStories = allStories.slice(startIndex, endIndex);

              return {
                data: {
                  data: pageStories,
                  pagination: {
                    page,
                    limit,
                    total: totalItems,
                    hasMore: endIndex < totalItems,
                  },
                },
              } as any;
            }
          );

          // Fetch all pages and verify no duplicates
          const allPages: any[] = [];
          let currentPageNum = 1;
          let hasMore = true;

          do {
            const pageResult = await ProfileService.getUserStories(username, {
              page: currentPageNum,
              limit: pageSize,
            });

            allPages.push(...pageResult.stories);
            hasMore = pageResult.hasMore;
            currentPageNum++;

            // Safety check
            if (currentPageNum > 1000) break;
          } while (hasMore);

          expect(allPages.length).toBe(totalItems);

          // Verify all IDs are unique
          const allIds = new Set(allPages.map((s) => s._id));
          expect(allIds.size).toBe(totalItems);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should paginate polls correctly with non-overlapping results", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for username
        fc
          .string({ minLength: 3, maxLength: 30 })
          .filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
        // Generator for page size
        fc.integer({ min: 1, max: 50 }),
        // Generator for total items
        fc.integer({ min: 0, max: 200 }),
        async (username, pageSize, totalItems) => {
          // Generate mock polls
          const allPolls = Array.from({ length: totalItems }, (_, i) => ({
            _id: `poll-${i}`,
            clerkId: "test-clerk-id",
            question: "Do you like property testing?",
            options: [
              { option: "Yes", votes: 10, percentage: 50 },
              { option: "No", votes: 10, percentage: 50 },
            ],
            totalVotes: 20,
            author: {
              _id: "test-user-id",
              clerkId: "test-clerk-id",
              username: username,
              email: "test@example.com",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              joinedAt: new Date().toISOString(),
            },
            isExpired: false,
            isAnonymous: false,
            createdAt: new Date(Date.now() - i * 1000).toISOString(),
            updatedAt: new Date(Date.now() - i * 1000).toISOString(),
          }));

          // Mock paginated responses
          vi.mocked(endpoints.profiles.getUserPolls).mockImplementation(
            async (_username: string, params?: any) => {
              const page = params?.page || 1;
              const limit = params?.limit || pageSize;
              const startIndex = (page - 1) * limit;
              const endIndex = Math.min(startIndex + limit, totalItems);
              const pagePolls = allPolls.slice(startIndex, endIndex);

              return {
                data: {
                  data: pagePolls,
                  pagination: {
                    page,
                    limit,
                    total: totalItems,
                    hasMore: endIndex < totalItems,
                  },
                },
              } as any;
            }
          );

          // Fetch all pages and verify no duplicates
          const allPages: any[] = [];
          let currentPageNum = 1;
          let hasMore = true;

          do {
            const pageResult = await ProfileService.getUserPolls(username, {
              page: currentPageNum,
              limit: pageSize,
            });

            allPages.push(...pageResult.polls);
            hasMore = pageResult.hasMore;
            currentPageNum++;

            // Safety check
            if (currentPageNum > 1000) break;
          } while (hasMore);

          expect(allPages.length).toBe(totalItems);

          // Verify all IDs are unique
          const allIds = new Set(allPages.map((p) => p._id));
          expect(allIds.size).toBe(totalItems);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: quad-production-ready, Property 18: Profile Update Validation
 *
 * For any profile update with valid data, the update should succeed and the profile
 * should reflect the changes immediately.
 *
 * Validates: Requirements 6.2
 */

describe("Property 18: Profile Update Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully update profile with valid data", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for username
        fc
          .string({ minLength: 3, maxLength: 30 })
          .filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
        // Generator for profile update data
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          username: fc
            .string({ minLength: 3, maxLength: 30 })
            .filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
          bio: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
          profileImage: fc.option(fc.webUrl(), { nil: undefined }),
          coverImage: fc.option(fc.webUrl(), { nil: undefined }),
        }),
        async (originalUsername, updateData) => {
          // Create original profile
          const originalProfile: ApiProfile = {
            _id: "test-user-id",
            clerkId: "test-clerk-id",
            username: originalUsername,
            email: "test@example.com",
            firstName: "Original",
            lastName: "Name",
            bio: "Original bio",
            profileImage: "https://example.com/original.jpg",
            coverImage: "https://example.com/cover.jpg",
            isVerified: false,
            joinedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Create updated profile
          const updatedProfile: ApiProfile = {
            ...originalProfile,
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            username: updateData.username,
            bio: updateData.bio ?? originalProfile.bio,
            profileImage:
              updateData.profileImage ?? originalProfile.profileImage,
            coverImage: updateData.coverImage ?? originalProfile.coverImage,
            updatedAt: new Date().toISOString(),
          };

          // Mock the update endpoint
          vi.mocked(endpoints.profiles.updateOwn).mockResolvedValue({
            data: { success: true, data: updatedProfile },
          } as any);

          // Mock the getByUsername endpoint to return updated profile
          vi.mocked(endpoints.profiles.getByUsername).mockResolvedValue({
            data: { success: true, data: updatedProfile },
          } as any);

          // Perform update
          const updateResult = await ProfileService.updateProfile(
            originalUsername,
            updateData
          );

          // Verify update succeeded
          expect(updateResult._id).toBe(originalProfile._id);
          expect(updateResult.clerkId).toBe(originalProfile.clerkId);
          expect(updateResult.firstName).toBe(updateData.firstName);
          expect(updateResult.lastName).toBe(updateData.lastName);
          expect(updateResult.username).toBe(updateData.username);
          expect(updateResult.bio).toBe(updateData.bio ?? originalProfile.bio);
          expect(updateResult.profileImage).toBe(
            updateData.profileImage ?? originalProfile.profileImage
          );
          expect(updateResult.coverImage).toBe(
            updateData.coverImage ?? originalProfile.coverImage
          );

          // Verify reading the profile returns updated data
          const readResult = await ProfileService.getProfileByUsername(
            updateData.username
          );

          expect(readResult._id).toBe(originalProfile._id);
          expect(readResult.firstName).toBe(updateData.firstName);
          expect(readResult.lastName).toBe(updateData.lastName);
          expect(readResult.username).toBe(updateData.username);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve ID and clerkId when updating profile", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for username
        fc
          .string({ minLength: 3, maxLength: 30 })
          .filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
        // Generator for profile update data
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          bio: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
        }),
        async (username, updateData) => {
          const originalId = "test-user-id";
          const originalClerkId = "test-clerk-id";

          const originalProfile: ApiProfile = {
            _id: originalId,
            clerkId: originalClerkId,
            username: username,
            email: "test@example.com",
            firstName: "Original",
            lastName: "Name",
            joinedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const updatedProfile: ApiProfile = {
            ...originalProfile,
            ...updateData,
            updatedAt: new Date().toISOString(),
          };

          vi.mocked(endpoints.profiles.updateOwn).mockResolvedValue({
            data: { success: true, data: updatedProfile },
          } as any);

          const result = await ProfileService.updateProfile(
            username,
            updateData
          );

          // Verify ID and clerkId are preserved
          expect(result._id).toBe(originalId);
          expect(result.clerkId).toBe(originalClerkId);

          // Verify updates were applied
          expect(result.firstName).toBe(updateData.firstName);
          expect(result.lastName).toBe(updateData.lastName);
          if (updateData.bio !== undefined) {
            expect(result.bio).toBe(updateData.bio);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle partial profile updates", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for username
        fc
          .string({ minLength: 3, maxLength: 30 })
          .filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
        // Generator for which fields to update
        fc.record({
          updateFirstName: fc.boolean(),
          updateLastName: fc.boolean(),
          updateBio: fc.boolean(),
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          bio: fc.string({ maxLength: 500 }),
        }),
        async (username, config) => {
          const originalProfile: ApiProfile = {
            _id: "test-user-id",
            clerkId: "test-clerk-id",
            username: username,
            email: "test@example.com",
            firstName: "Original",
            lastName: "Name",
            bio: "Original bio",
            joinedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Build partial update
          const updateData: Partial<typeof originalProfile> = {};
          if (config.updateFirstName) updateData.firstName = config.firstName;
          if (config.updateLastName) updateData.lastName = config.lastName;
          if (config.updateBio) updateData.bio = config.bio;

          const updatedProfile: ApiProfile = {
            ...originalProfile,
            ...updateData,
            updatedAt: new Date().toISOString(),
          };

          vi.mocked(endpoints.profiles.updateOwn).mockResolvedValue({
            data: { success: true, data: updatedProfile },
          } as any);

          const result = await ProfileService.updateProfile(
            username,
            updateData
          );

          // Verify only specified fields were updated
          if (config.updateFirstName) {
            expect(result.firstName).toBe(config.firstName);
          } else {
            expect(result.firstName).toBe(originalProfile.firstName);
          }

          if (config.updateLastName) {
            expect(result.lastName).toBe(config.lastName);
          } else {
            expect(result.lastName).toBe(originalProfile.lastName);
          }

          if (config.updateBio) {
            expect(result.bio).toBe(config.bio);
          } else {
            expect(result.bio).toBe(originalProfile.bio);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

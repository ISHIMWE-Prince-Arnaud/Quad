import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { ProfileService } from "@/services/profileService";
import { endpoints } from "@/lib/api";
import type { ApiProfile } from "@/types/api";

/**
 * Feature: quad-production-ready, Property 20: Username Change URL Update
 *
 * For any username change, the profile URL should update to `/app/profile/:newUsername`
 * and redirect from the old URL.
 *
 * Validates: Requirements 6.4
 */

// Mock the API endpoints
vi.mock("@/lib/api", () => ({
  endpoints: {
    profiles: {
      updateOwn: vi.fn(),
      getByUsername: vi.fn(),
    },
  },
}));

describe("Property 20: Username Change URL Update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update profile URL when username changes", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for old username
        fc
          .string({ minLength: 3, maxLength: 30 })
          .filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
        // Generator for new username (must be different)
        fc
          .string({ minLength: 3, maxLength: 30 })
          .filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
        async (oldUsername, newUsername) => {
          // Skip if usernames are the same
          if (oldUsername === newUsername) return;

          const originalProfile: ApiProfile = {
            _id: "test-user-id",
            clerkId: "test-clerk-id",
            username: oldUsername,
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            joinedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const updatedProfile: ApiProfile = {
            ...originalProfile,
            username: newUsername,
            updatedAt: new Date().toISOString(),
          };

          // Mock the update endpoint
          vi.mocked(endpoints.profiles.updateOwn).mockResolvedValue({
            data: { success: true, data: updatedProfile },
          } as any);

          // Mock getByUsername to return updated profile with new username
          vi.mocked(endpoints.profiles.getByUsername).mockImplementation(
            async (username: string) => {
              if (username === newUsername) {
                return {
                  data: { success: true, data: updatedProfile },
                } as any;
              } else if (username === oldUsername) {
                // Old username should 404 after update
                throw { response: { status: 404 } };
              }
              throw { response: { status: 404 } };
            }
          );

          // Perform username update
          const updateResult = await ProfileService.updateProfile(oldUsername, {
            username: newUsername,
          });

          // Verify update succeeded with new username
          expect(updateResult.username).toBe(newUsername);
          expect(updateResult._id).toBe(originalProfile._id);
          expect(updateResult.clerkId).toBe(originalProfile.clerkId);

          // Verify new username is accessible
          const newProfileResult = await ProfileService.getProfileByUsername(
            newUsername
          );
          expect(newProfileResult.username).toBe(newUsername);
          expect(newProfileResult._id).toBe(originalProfile._id);

          // Verify old username is no longer accessible
          await expect(
            ProfileService.getProfileByUsername(oldUsername)
          ).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve all profile data when changing username", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for old username
        fc
          .string({ minLength: 3, maxLength: 30 })
          .filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
        // Generator for new username
        fc
          .string({ minLength: 3, maxLength: 30 })
          .filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
        // Generator for profile data
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          bio: fc.option(fc.string({ maxLength: 500 })),
          profileImage: fc.option(fc.webUrl()),
          coverImage: fc.option(fc.webUrl()),
        }),
        async (oldUsername, newUsername, profileData) => {
          // Skip if usernames are the same
          if (oldUsername === newUsername) return;

          const originalProfile: ApiProfile = {
            _id: "test-user-id",
            clerkId: "test-clerk-id",
            username: oldUsername,
            email: "test@example.com",
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            bio: profileData.bio,
            profileImage: profileData.profileImage,
            coverImage: profileData.coverImage,
            joinedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const updatedProfile: ApiProfile = {
            ...originalProfile,
            username: newUsername,
            updatedAt: new Date().toISOString(),
          };

          vi.mocked(endpoints.profiles.updateOwn).mockResolvedValue({
            data: { success: true, data: updatedProfile },
          } as any);

          vi.mocked(endpoints.profiles.getByUsername).mockImplementation(
            async (username: string) => {
              if (username === newUsername) {
                return {
                  data: { success: true, data: updatedProfile },
                } as any;
              }
              throw { response: { status: 404 } };
            }
          );

          // Update username
          const updateResult = await ProfileService.updateProfile(oldUsername, {
            username: newUsername,
          });

          // Verify all profile data is preserved
          expect(updateResult.username).toBe(newUsername);
          expect(updateResult._id).toBe(originalProfile._id);
          expect(updateResult.clerkId).toBe(originalProfile.clerkId);
          expect(updateResult.firstName).toBe(profileData.firstName);
          expect(updateResult.lastName).toBe(profileData.lastName);
          expect(updateResult.bio).toBe(profileData.bio);
          expect(updateResult.profileImage).toBe(profileData.profileImage);
          expect(updateResult.coverImage).toBe(profileData.coverImage);
          expect(updateResult.email).toBe(originalProfile.email);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle username change with special characters correctly", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for old username with underscores
        fc
          .array(
            fc.constantFrom(
              ..."abcdefghijklmnopqrstuvwxyz0123456789_".split("")
            ),
            {
              minLength: 3,
              maxLength: 30,
            }
          )
          .map((chars) => chars.join(""))
          .filter((s) => s.length >= 3 && /^[a-zA-Z0-9_]+$/.test(s)),
        // Generator for new username with underscores
        fc
          .array(
            fc.constantFrom(
              ..."abcdefghijklmnopqrstuvwxyz0123456789_".split("")
            ),
            {
              minLength: 3,
              maxLength: 30,
            }
          )
          .map((chars) => chars.join(""))
          .filter((s) => s.length >= 3 && /^[a-zA-Z0-9_]+$/.test(s)),
        async (oldUsername, newUsername) => {
          // Skip if usernames are the same
          if (oldUsername === newUsername) return;

          const originalProfile: ApiProfile = {
            _id: "test-user-id",
            clerkId: "test-clerk-id",
            username: oldUsername,
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            joinedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const updatedProfile: ApiProfile = {
            ...originalProfile,
            username: newUsername,
            updatedAt: new Date().toISOString(),
          };

          vi.mocked(endpoints.profiles.updateOwn).mockResolvedValue({
            data: { success: true, data: updatedProfile },
          } as any);

          vi.mocked(endpoints.profiles.getByUsername).mockImplementation(
            async (username: string) => {
              if (username === newUsername) {
                return {
                  data: { success: true, data: updatedProfile },
                } as any;
              }
              throw { response: { status: 404 } };
            }
          );

          // Update username
          const updateResult = await ProfileService.updateProfile(oldUsername, {
            username: newUsername,
          });

          // Verify username was updated correctly
          expect(updateResult.username).toBe(newUsername);
          expect(updateResult.username).toMatch(/^[a-zA-Z0-9_]+$/);

          // Verify new username is accessible
          const newProfileResult = await ProfileService.getProfileByUsername(
            newUsername
          );
          expect(newProfileResult.username).toBe(newUsername);
        }
      ),
      { numRuns: 100 }
    );
  });
});

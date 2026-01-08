import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/**
 * Feature: quad-production-ready, Property 27: Content Deletion Confirmation
 *
 * For any content deletion request, a confirmation dialog should appear before
 * the deletion is executed.
 *
 * Validates: Requirements 8.5
 */

describe("Property 27: Content Deletion Confirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("should require explicit confirmation before executing deletion", async () => {
    // Test the core property: deletion requires confirmation
    // We test with a smaller sample size to avoid timeouts
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 50 }),
          description: fc.string({ minLength: 10, maxLength: 100 }),
        }),
        async ({ title, description }) => {
          const onConfirm = vi.fn();
          const onOpenChange = vi.fn();

          // Render the ConfirmDialog
          render(
            <ConfirmDialog
              open={true}
              onOpenChange={onOpenChange}
              title={title}
              description={description}
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={onConfirm}
            />
          );

          // Property: onConfirm should NOT be called before user interaction
          expect(onConfirm).not.toHaveBeenCalled();

          // Click confirm button
          const confirmButton = await screen.findByRole("button", {
            name: /delete/i,
          });
          fireEvent.click(confirmButton);

          // Property: onConfirm should be called exactly once after confirmation
          await waitFor(() => {
            expect(onConfirm).toHaveBeenCalledTimes(1);
          });

          cleanup();
        }
      ),
      { numRuns: 5 } // Reduced to avoid timeouts
    );
  }, 10000);

  it("should prevent deletion when cancelled", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 50 }),
          description: fc.string({ minLength: 10, maxLength: 100 }),
        }),
        async ({ title, description }) => {
          const onConfirm = vi.fn();
          const onOpenChange = vi.fn();

          render(
            <ConfirmDialog
              open={true}
              onOpenChange={onOpenChange}
              title={title}
              description={description}
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={onConfirm}
            />
          );

          // Click cancel button
          const cancelButton = await screen.findByRole("button", {
            name: /cancel/i,
          });
          fireEvent.click(cancelButton);

          // Property: onConfirm should NOT be called when cancelled
          expect(onConfirm).not.toHaveBeenCalled();

          // Property: onOpenChange should be called to close dialog
          await waitFor(() => {
            expect(onOpenChange).toHaveBeenCalledWith(false);
          });

          cleanup();
        }
      ),
      { numRuns: 5 }
    );
  }, 10000);

  it("should display destructive variant for deletion confirmations", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc
            .string({ minLength: 5, maxLength: 50 })
            .filter((s) => s.trim().length >= 5),
          description: fc
            .string({ minLength: 10, maxLength: 100 })
            .filter((s) => s.trim().length >= 10),
        }),
        async ({ title, description }) => {
          const onConfirm = vi.fn();
          const onOpenChange = vi.fn();

          render(
            <ConfirmDialog
              open={true}
              onOpenChange={onOpenChange}
              title={title}
              description={description}
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={onConfirm}
            />
          );

          // Property: Dialog should be visible
          const dialog = await screen.findByRole("dialog");
          expect(dialog).toBeInTheDocument();

          // Property: Destructive icon should be present
          const alertIcon = document.querySelector(".text-destructive");
          expect(alertIcon).toBeInTheDocument();

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  }, 10000);

  it("should disable actions during loading state", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 50 }),
          description: fc.string({ minLength: 10, maxLength: 100 }),
        }),
        async ({ title, description }) => {
          const onConfirm = vi.fn();
          const onOpenChange = vi.fn();

          render(
            <ConfirmDialog
              open={true}
              onOpenChange={onOpenChange}
              title={title}
              description={description}
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={onConfirm}
              loading={true}
            />
          );

          // Property: Loading text should be displayed
          expect(screen.getByText("Processing...")).toBeInTheDocument();

          // Property: Both buttons should be disabled during loading
          const buttons = screen.getAllByRole("button");
          const confirmButton = buttons.find((btn) =>
            btn.textContent?.includes("Processing")
          );
          const cancelButton = buttons.find((btn) =>
            btn.textContent?.includes("Cancel")
          );

          expect(confirmButton).toBeDisabled();
          expect(cancelButton).toBeDisabled();

          cleanup();
        }
      ),
      { numRuns: 10 }
    );
  });

  it("should work for all content types (post, story, poll)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("post", "story", "poll"),
        async (contentType) => {
          const onConfirm = vi.fn();
          const onOpenChange = vi.fn();

          const titles = {
            post: "Delete post?",
            story: "Delete story?",
            poll: "Delete poll?",
          };

          const descriptions = {
            post: "This action cannot be undone. This will permanently delete your post and remove it from feeds.",
            story:
              "This action cannot be undone. This will permanently delete your story.",
            poll: "This action cannot be undone. This will permanently delete your poll and all votes.",
          };

          render(
            <ConfirmDialog
              open={true}
              onOpenChange={onOpenChange}
              title={titles[contentType]}
              description={descriptions[contentType]}
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={onConfirm}
            />
          );

          // Wait for dialog to be fully rendered and interactive
          const confirmButton = await screen.findByRole("button", {
            name: /delete/i,
          });

          // Property: Deletion requires confirmation for all content types
          expect(onConfirm).not.toHaveBeenCalled();

          // Wait a bit for animations to complete
          await new Promise((resolve) => setTimeout(resolve, 100));

          fireEvent.click(confirmButton);

          // Property: Deletion executes after confirmation
          await waitFor(() => {
            expect(onConfirm).toHaveBeenCalledTimes(1);
          });

          cleanup();
        }
      ),
      { numRuns: 3 }
    );
  }, 10000);

  it("should handle async deletion operations", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 50 }),
          description: fc.string({ minLength: 10, maxLength: 100 }),
          delayMs: fc.integer({ min: 1, max: 20 }),
        }),
        async ({ title, description, delayMs }) => {
          const onConfirm = vi.fn(async () => {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          });
          const onOpenChange = vi.fn();

          render(
            <ConfirmDialog
              open={true}
              onOpenChange={onOpenChange}
              title={title}
              description={description}
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={onConfirm}
            />
          );

          const confirmButton = await screen.findByRole("button", {
            name: /delete/i,
          });
          fireEvent.click(confirmButton);

          // Property: onConfirm should be called
          await waitFor(() => {
            expect(onConfirm).toHaveBeenCalledTimes(1);
          });

          // Property: Async operation should complete
          const firstCallResult = onConfirm.mock.results[0];
          expect(firstCallResult?.type).toBe("return");
          await (firstCallResult?.value as Promise<unknown>);

          cleanup();
        }
      ),
      { numRuns: 5 }
    );
  }, 10000);
});

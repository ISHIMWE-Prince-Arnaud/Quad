/**
 * Property-Based Tests for Form Validation Error Display
 * Feature: quad-production-ready, Property 12: Form Validation Error Display
 * Validates: Requirements 5.2
 *
 * Property: For any form submission with invalid data, the form should display
 * field-specific error messages inline without submitting to the API.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import fc from "fast-check";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Test schemas
const testPostSchema = z.object({
  text: z
    .string()
    .min(1, "Text is required")
    .max(100, "Text must be at most 100 characters"),
});

const testProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
});

// Test form components
function TestPostForm({
  onSubmit,
}: {
  onSubmit: (data: z.infer<typeof testPostSchema>) => void;
}) {
  const form = useForm<z.infer<typeof testPostSchema>>({
    resolver: zodResolver(testPostSchema),
    mode: "onChange",
    defaultValues: { text: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} data-testid="test-form">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text</FormLabel>
              <FormControl>
                <Textarea {...field} data-testid="text-input" />
              </FormControl>
              <FormMessage data-testid="text-error" />
            </FormItem>
          )}
        />
        <Button type="submit" data-testid="submit-button">
          Submit
        </Button>
      </form>
    </Form>
  );
}

function TestProfileForm({
  onSubmit,
}: {
  onSubmit: (data: z.infer<typeof testProfileSchema>) => void;
}) {
  const form = useForm<z.infer<typeof testProfileSchema>>({
    resolver: zodResolver(testProfileSchema),
    mode: "onChange",
    defaultValues: { username: "", bio: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} data-testid="test-form">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} data-testid="username-input" />
              </FormControl>
              <FormMessage data-testid="username-error" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea {...field} data-testid="bio-input" />
              </FormControl>
              <FormMessage data-testid="bio-error" />
            </FormItem>
          )}
        />
        <Button type="submit" data-testid="submit-button">
          Submit
        </Button>
      </form>
    </Form>
  );
}

describe("Property 12: Form Validation Error Display", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Post Form Validation", () => {
    it("should display error for empty text field", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestPostForm onSubmit={onSubmit} />);

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText("Text is required");
        expect(errorMessage).toBeInTheDocument();
      });

      // Should not call onSubmit with invalid data
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should display error for text exceeding max length", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestPostForm onSubmit={onSubmit} />);

      const textInput = screen.getByTestId("text-input");
      // Type a long string
      await user.type(textInput, "a".repeat(101));

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(
          /Text must be at most 100 characters/
        );
        expect(errorMessage).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should clear error when valid text is entered", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestPostForm onSubmit={onSubmit} />);

      const textInput = screen.getByTestId("text-input");

      // First trigger error with empty submission
      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText("Text is required")).toBeInTheDocument();
      });

      // Then enter valid text
      await user.type(textInput, "Valid text");

      // Error should clear
      await waitFor(() => {
        expect(screen.queryByText("Text is required")).not.toBeInTheDocument();
      });
    });
  });

  describe("Profile Form Validation", () => {
    it("should display error for username less than 3 characters", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestProfileForm onSubmit={onSubmit} />);

      const usernameInput = screen.getByTestId("username-input");
      await user.type(usernameInput, "ab");

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(
          /Username must be at least 3 characters/
        );
        expect(errorMessage).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should display error for username with invalid characters", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestProfileForm onSubmit={onSubmit} />);

      const usernameInput = screen.getByTestId("username-input");
      await user.type(usernameInput, "user@name");

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(
          /Username can only contain letters, numbers, and underscores/
        );
        expect(errorMessage).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should display error for bio exceeding max length", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestProfileForm onSubmit={onSubmit} />);

      const usernameInput = screen.getByTestId("username-input");
      await user.type(usernameInput, "validuser");

      const bioInput = screen.getByTestId("bio-input");
      await user.type(bioInput, "a".repeat(501));

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(
          /Bio must be at most 500 characters/
        );
        expect(errorMessage).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should not display errors for valid profile data", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestProfileForm onSubmit={onSubmit} />);

      const usernameInput = screen.getByTestId("username-input");
      await user.type(usernameInput, "validuser123");

      const bioInput = screen.getByTestId("bio-input");
      await user.type(bioInput, "This is a valid bio");

      // Should not have any error messages
      await waitFor(() => {
        expect(screen.queryByTestId("username-error")).not.toHaveTextContent(
          /.+/
        );
        expect(screen.queryByTestId("bio-error")).not.toHaveTextContent(/.+/);
      });
    });
  });

  describe("Error Message Accessibility", () => {
    it("should have proper ARIA attributes for error messages", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestPostForm onSubmit={onSubmit} />);

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText("Text is required");
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveAttribute("role", "alert");
        expect(errorMessage).toHaveAttribute("aria-live", "polite");
      });
    });
  });

  describe("Error Message Animation", () => {
    it("should apply animation class to error messages", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestPostForm onSubmit={onSubmit} />);

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText("Text is required");
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass("animate-slide-in-from-top");
      });
    });
  });

  describe("Property-Based Validation Tests", () => {
    it("should validate that all strings exceeding 100 chars are rejected for post text", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 101, maxLength: 200 }), (text) => {
          const result = testPostSchema.safeParse({ text });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it("should validate that all strings under 3 chars are rejected for username", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 2 }), (username) => {
          const result = testProfileSchema.safeParse({ username, bio: "" });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it("should validate that all usernames with invalid chars are rejected", () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 3, maxLength: 30 })
            .filter((s) => /[^a-zA-Z0-9_]/.test(s)),
          (username) => {
            const result = testProfileSchema.safeParse({ username, bio: "" });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should validate that all bios exceeding 500 chars are rejected", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 501, maxLength: 600 }), (bio) => {
          const result = testProfileSchema.safeParse({
            username: "validuser",
            bio,
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });
});

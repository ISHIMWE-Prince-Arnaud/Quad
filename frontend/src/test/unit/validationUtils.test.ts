import { describe, it, expect } from "vitest";
import {
  usernameValidator,
  emailValidator,
  urlValidator,
  nonEmptyStringValidator,
  sanitizeHtml,
  sanitizeInput,
  formatValidationErrors,
  validateData,
  uniqueArrayValidator,
} from "@/lib/validationUtils";
import { z } from "zod";

describe("Validation Utils", () => {
  describe("usernameValidator", () => {
    it("should accept valid usernames", () => {
      expect(usernameValidator.safeParse("john_doe").success).toBe(true);
      expect(usernameValidator.safeParse("user123").success).toBe(true);
      expect(usernameValidator.safeParse("test_user_123").success).toBe(true);
    });

    it("should reject short usernames", () => {
      expect(usernameValidator.safeParse("ab").success).toBe(false);
    });

    it("should reject long usernames", () => {
      const longUsername = "a".repeat(31);
      expect(usernameValidator.safeParse(longUsername).success).toBe(false);
    });

    it("should reject usernames with special characters", () => {
      expect(usernameValidator.safeParse("user@name").success).toBe(false);
      expect(usernameValidator.safeParse("user-name").success).toBe(false);
      expect(usernameValidator.safeParse("user name").success).toBe(false);
    });
  });

  describe("emailValidator", () => {
    it("should accept valid emails", () => {
      expect(emailValidator.safeParse("test@example.com").success).toBe(true);
      expect(emailValidator.safeParse("user.name@domain.co.uk").success).toBe(
        true
      );
    });

    it("should reject invalid emails", () => {
      expect(emailValidator.safeParse("notanemail").success).toBe(false);
      expect(emailValidator.safeParse("@example.com").success).toBe(false);
      expect(emailValidator.safeParse("test@").success).toBe(false);
    });
  });

  describe("urlValidator", () => {
    it("should accept valid URLs", () => {
      expect(urlValidator.safeParse("https://example.com").success).toBe(true);
      expect(urlValidator.safeParse("http://test.com/path").success).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(urlValidator.safeParse("not a url").success).toBe(false);
      expect(urlValidator.safeParse("example.com").success).toBe(false);
    });
  });

  describe("nonEmptyStringValidator", () => {
    it("should accept non-empty strings", () => {
      const validator = nonEmptyStringValidator("Field");
      expect(validator.safeParse("Hello").success).toBe(true);
    });

    it("should reject empty strings", () => {
      const validator = nonEmptyStringValidator("Field");
      expect(validator.safeParse("").success).toBe(false);
    });

    it("should reject whitespace-only strings", () => {
      const validator = nonEmptyStringValidator("Field");
      expect(validator.safeParse("   ").success).toBe(false);
    });

    it("should enforce max length when provided", () => {
      const validator = nonEmptyStringValidator("Field", 5);
      expect(validator.safeParse("Hello").success).toBe(true);
      expect(validator.safeParse("Hello World").success).toBe(false);
    });
  });

  describe("sanitizeHtml", () => {
    it("should remove script tags", () => {
      const html = '<div>Hello</div><script>alert("xss")</script>';
      const result = sanitizeHtml(html);
      expect(result).not.toContain("<script>");
      expect(result).toContain("<div>Hello</div>");
    });

    it("should remove event handlers", () => {
      const html = "<div onclick=\"alert('xss')\">Click me</div>";
      const result = sanitizeHtml(html);
      expect(result).not.toContain("onclick");
    });

    it("should handle multiple script tags", () => {
      const html =
        "<script>bad()</script><div>Good</div><script>worse()</script>";
      const result = sanitizeHtml(html);
      expect(result).not.toContain("<script>");
      expect(result).toContain("<div>Good</div>");
    });
  });

  describe("sanitizeInput", () => {
    it("should trim whitespace", () => {
      expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    it("should remove angle brackets", () => {
      expect(sanitizeInput("<script>")).toBe("script");
      expect(sanitizeInput("Hello <world>")).toBe("Hello world");
    });

    it("should handle normal text", () => {
      expect(sanitizeInput("Hello World")).toBe("Hello World");
    });
  });

  describe("formatValidationErrors", () => {
    it("should format Zod errors", () => {
      const schema = z.object({
        name: z.string().min(3),
        email: z.string().email(),
      });

      const result = schema.safeParse({ name: "ab", email: "invalid" });
      if (!result.success) {
        // Check that error has the expected structure
        expect(result.error).toBeDefined();
        expect(result.error.issues).toBeDefined();

        const errors = formatValidationErrors(result.error);
        expect(Object.keys(errors).length).toBeGreaterThan(0);
      }
    });

    it("should handle nested errors", () => {
      const schema = z.object({
        user: z.object({
          name: z.string().min(3),
        }),
      });

      const result = schema.safeParse({ user: { name: "ab" } });
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.issues).toBeDefined();

        const errors = formatValidationErrors(result.error);
        expect(Object.keys(errors).length).toBeGreaterThan(0);
      }
    });
  });

  describe("validateData", () => {
    const schema = z.object({
      name: z.string().min(3),
      age: z.number().min(0),
    });

    it("should return success for valid data", () => {
      const result = validateData(schema, { name: "John", age: 25 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John");
        expect(result.data.age).toBe(25);
      }
    });

    it("should return errors for invalid data", () => {
      const result = validateData(schema, { name: "ab", age: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveProperty("name");
        expect(result.errors).toHaveProperty("age");
      }
    });
  });

  describe("uniqueArrayValidator", () => {
    it("should validate unique arrays", () => {
      const result = uniqueArrayValidator(
        [1, 2, 3],
        (dups) => `Duplicates: ${dups.join(", ")}`
      );
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it("should detect duplicates", () => {
      const result = uniqueArrayValidator(
        [1, 2, 2, 3, 3],
        (dups) => `Duplicates: ${dups.join(", ")}`
      );
      expect(result.valid).toBe(false);
      expect(result.message).toContain("Duplicates");
    });

    it("should work with strings", () => {
      const result = uniqueArrayValidator(
        ["a", "b", "a"],
        (dups) => `Duplicates: ${dups.join(", ")}`
      );
      expect(result.valid).toBe(false);
      expect(result.message).toContain("a");
    });
  });
});

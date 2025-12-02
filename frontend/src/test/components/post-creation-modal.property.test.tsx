import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CreatePostModal } from "@/components/forms/CreatePostModal";

// Mock dependencies
vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    user: {
      _id: "test-user-id",
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      profileImage: "https://example.com/avatar.jpg",
    },
  }),
}));

vi.mock("@/services/uploadService", () => ({
  UploadService: {
    validateFile: vi.fn(() => ({ valid: true })),
    uploadPostMedia: vi.fn(() =>
      Promise.resolve({ url: "https://example.com/image.jpg" })
    ),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Feature: quad-ui-ux-redesign, Property 16: Post creation modal content
// For any post creation modal opening, the modal should contain a text input, media uploader, and action buttons
// Validates: Requirements 4.1

describe("Post Creation Modal Property Tests", () => {
  afterEach(() => {
    cleanup();
  });

  it("Property 16: Post creation modal contains all required elements when open", () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn();

    render(
      <CreatePostModal
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // Property 1: Modal should contain a text input
    const textarea = screen.getByPlaceholderText("What's happening?");
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");

    // Property 2: Modal should contain media uploader
    const mediaUploadArea = screen.getByText(/Add photos or videos/i);
    expect(mediaUploadArea).toBeInTheDocument();

    // Property 3: Modal should contain action buttons (Cancel and Post)
    const cancelButton = screen.getByRole("button", {
      name: /cancel/i,
    });
    const postButton = screen.getByRole("button", { name: /^post$/i });

    expect(cancelButton).toBeInTheDocument();
    expect(postButton).toBeInTheDocument();

    // Property 4: Modal should have a title
    const title = screen.getByText("Create Post");
    expect(title).toBeInTheDocument();
  });

  it("Property 16: Post creation modal does not render when closed", () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn();

    render(
      <CreatePostModal
        open={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // When modal is closed, elements should not be visible
    const textarea = screen.queryByPlaceholderText("What's happening?");
    expect(textarea).not.toBeInTheDocument();
  });

  it("Property 16: Post button is disabled when no content", () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn();

    render(
      <CreatePostModal
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // Property: Post button should be disabled when there's no content
    const postButton = screen.getByRole("button", { name: /^post$/i });
    expect(postButton).toBeDisabled();
  });

  it("Property 16: Character counter is displayed", () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn();

    render(
      <CreatePostModal
        open={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // Property: Character counter should be visible
    const charCounter = screen.getByText(/0\/1000/);
    expect(charCounter).toBeInTheDocument();
  });
});

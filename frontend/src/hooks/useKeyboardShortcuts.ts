import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

/**
 * Hook to register keyboard shortcuts
 * @param shortcuts Array of keyboard shortcuts to register
 * @param enabled Whether shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches =
          shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const shiftMatches =
          shortcut.shiftKey === undefined ||
          event.shiftKey === shortcut.shiftKey;
        const altMatches =
          shortcut.altKey === undefined || event.altKey === shortcut.altKey;
        const metaMatches =
          shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;

        if (
          keyMatches &&
          ctrlMatches &&
          shiftMatches &&
          altMatches &&
          metaMatches
        ) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Hook for common application keyboard shortcuts
 */
export function useAppKeyboardShortcuts() {
  const navigate = useNavigate();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: "h",
      description: "Go to home/feed",
      action: () => navigate("/app/feed"),
    },
    {
      key: "p",
      description: "Go to profile",
      action: () => {
        // Navigate to current user's profile
        const username = localStorage.getItem("username");
        if (username) {
          navigate(`/app/profile/${username}`);
        }
      },
    },
    {
      key: "b",
      description: "Go to notifications",
      action: () => navigate("/app/notifications"),
    },
    {
      key: "/",
      description: "Show keyboard shortcuts",
      action: () => {
        // This will be handled by a modal component
        const event = new CustomEvent("show-keyboard-shortcuts");
        window.dispatchEvent(event);
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);
}

import DOMPurify from "dompurify";

export function sanitizeInput(input: string): string {
  if (!input) return "";

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Basic HTML sanitization using textContent (escapes all HTML)
 * For production, prefer DOMPurify.sanitize() with explicit allowlists
 */
export function sanitizeHTML(html: string): string {
  if (!html) return "";

  const temp = document.createElement("div");
  temp.textContent = html;
  return temp.innerHTML;
}

export function stripHTML(input: string): string {
  if (!input) return "";

  const temp = document.createElement("div");
  temp.innerHTML = input;
  return temp.textContent || temp.innerText || "";
}

/**
 * Sanitize HTML for display using DOMPurify
 * Replaces weak regex-based sanitization with robust XSS protection
 */
export function sanitizeForDisplay(input: string): string {
  if (!input) return "";

  // Use DOMPurify for robust XSS protection
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

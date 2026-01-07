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

export function sanitizeForDisplay(input: string): string {
  if (!input) return "";

  let sanitized = input.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );

  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "");
  sanitized = sanitized.replace(/javascript:/gi, "");

  return sanitized;
}

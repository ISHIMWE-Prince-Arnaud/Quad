import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const target = new Date(date)
  const diffInMs = now.getTime() - target.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) {
    return "just now"
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`
  } else {
    return formatDate(date)
  }
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Gets a formatted display name from a user object
 */
export function getDisplayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  username: string;
}): string {
  const first = user.firstName?.trim();
  const last = user.lastName?.trim();
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name.length > 0 ? name : user.username;
}

/**
 * Formats a future date into a human-readable "Expires in..." string
 */
export function formatExpiresIn(future: string | Date | null | undefined): string {
  if (!future) return "";
  const futureDate = new Date(future);
  const now = new Date();
  const diffMs = futureDate.getTime() - now.getTime();

  if (Number.isNaN(futureDate.getTime()) || diffMs <= 0) return "Expired";

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const weekMs = 7 * dayMs;
  const monthMs = 30 * dayMs;

  if (diffMs >= 2 * monthMs)
    return `Expires in ${Math.ceil(diffMs / monthMs)} months`;
  if (diffMs >= monthMs) return "Expires in 1 month";

  if (diffMs >= 2 * weekMs)
    return `Expires in ${Math.ceil(diffMs / weekMs)} weeks`;
  if (diffMs >= weekMs) return "Expires in 1 week";

  if (diffMs >= 2 * dayMs)
    return `Expires in ${Math.ceil(diffMs / dayMs)} days`;
  if (diffMs >= dayMs) return "Expires in 1 day";

  if (diffMs >= 2 * hourMs)
    return `Expires in ${Math.ceil(diffMs / hourMs)} hours`;
  if (diffMs >= hourMs) return "Expires in 1 hour";

  if (diffMs >= 2 * minuteMs)
    return `Expires in ${Math.ceil(diffMs / minuteMs)} minutes`;
  return "Expires in 1 minute";
}

export async function copyToClipboard(text: string) {
  try {
    if (globalThis.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall back below
  }

  try {
    const el = document.createElement("textarea")
    el.value = text
    el.setAttribute("readonly", "")
    el.style.position = "fixed"
    el.style.top = "0"
    el.style.left = "0"
    el.style.opacity = "0"
    document.body.appendChild(el)
    el.focus()
    el.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

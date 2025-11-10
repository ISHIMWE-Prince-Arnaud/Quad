/**
 * Calculate reading time for story content
 * Based on average reading speed of 200-250 words per minute
 */

/**
 * Strip HTML tags from content to count actual text
 */
const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, " ")  // Remove HTML tags
    .replace(/&nbsp;/g, " ")    // Replace &nbsp; with space
    .replace(/&[a-z]+;/gi, " ") // Replace HTML entities
    .replace(/\s+/g, " ")        // Normalize whitespace
    .trim();
};

/**
 * Count words in text
 */
const countWords = (text: string): number => {
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
};

/**
 * Calculate reading time in minutes
 * @param content - HTML content from rich text editor
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Reading time in minutes (rounded up, minimum 1)
 */
export const calculateReadingTime = (
  content: string,
  wordsPerMinute: number = 200
): number => {
  // Strip HTML and count words
  const plainText = stripHtml(content);
  const wordCount = countWords(plainText);
  
  // Calculate minutes
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  // Return minimum of 1 minute
  return Math.max(1, minutes);
};

/**
 * Generate excerpt from content
 * @param content - HTML content
 * @param maxLength - Maximum excerpt length (default: 200 characters)
 * @returns Excerpt string
 */
export const generateExcerpt = (
  content: string,
  maxLength: number = 200
): string => {
  // Strip HTML tags
  const plainText = stripHtml(content);
  
  // Truncate to max length
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Truncate and add ellipsis
  const truncated = plainText.substring(0, maxLength);
  
  // Try to cut at last complete word
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.8) {
    // If last space is close to end, use it
    return truncated.substring(0, lastSpace) + "...";
  }
  
  // Otherwise just truncate
  return truncated + "...";
};

/**
 * Validate HTML content
 * Basic validation to prevent XSS and malformed HTML
 * Note: In production, use a proper HTML sanitizer like DOMPurify on frontend
 */
export const validateHtmlContent = (content: string): boolean => {
  // Check for balanced tags (basic validation)
  const openTags = (content.match(/<[^/][^>]*>/g) || []).length;
  const closeTags = (content.match(/<\/[^>]+>/g) || []).length;
  
  // Allow some difference for self-closing tags
  const tagDiff = Math.abs(openTags - closeTags);
  
  // If difference is too large, likely malformed
  if (tagDiff > 10) {
    return false;
  }
  
  // Check for dangerous scripts (should be sanitized on frontend too)
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Get word count from content
 * Useful for displaying to users
 */
export const getWordCount = (content: string): number => {
  const plainText = stripHtml(content);
  return countWords(plainText);
};

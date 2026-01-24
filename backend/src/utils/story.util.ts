import sanitizeHtml from "sanitize-html";

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
 * Sanitize HTML content to prevent XSS attacks
 * Uses sanitize-html package with strict configuration for rich text editors
 * @param content - Raw HTML content from editor
 * @returns Sanitized HTML safe for storage and display
 */
export const sanitizeHtmlContent = (content: string): string => {
  return sanitizeHtml(content, {
    // Allowed tags for rich text editing
    allowedTags: [
      // Text formatting
      "p", "br", "strong", "b", "em", "i", "u", "s", "del", "mark",
      // Headings
      "h1", "h2", "h3", "h4", "h5", "h6",
      // Lists
      "ul", "ol", "li",
      // Quotes and code
      "blockquote", "pre", "code",
      // Links (carefully controlled)
      "a",
      // Tables
      "table", "thead", "tbody", "tr", "th", "td",
      // Misc
      "hr", "span", "div"
    ],
    
    // Allowed attributes
    allowedAttributes: {
      "a": ["href", "title", "target", "rel"],
      "code": ["class"],  // For syntax highlighting
      "pre": ["class"],
      "th": ["colspan", "rowspan", "colwidth"],
      "td": ["colspan", "rowspan", "colwidth"],
      "span": ["class", "style"],
      "div": ["class", "style"],
      "*": ["id", "style"]
    },
    
    // URL schemes allowed in links
    allowedSchemes: ["http", "https", "mailto"],
    
    // Disallow javascript: and data: URLs
    allowedSchemesByTag: {
      "a": ["http", "https", "mailto"]
    },
    
    // Force all links to open in new tab with security
    transformTags: {
      "a": (_tagName: string, attribs: sanitizeHtml.Attributes) => {
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            target: "_blank",
            rel: "noopener noreferrer"  // Security best practice
          }
        };
      }
    },
    
    allowedStyles: {
      "*": {
        "color": [/^#[0-9a-fA-F]{3,8}$/],
        "background-color": [/^#[0-9a-fA-F]{3,8}$/],
        "text-align": [/^(left|right|center|justify)$/],
      },
    },
    
    // Remove all classes except for code highlighting
    allowedClasses: {
      "code": ["language-*"],
      "pre": ["language-*"],
      "div": ["callout", "callout-*"]
    }
  });
};

/**
 * Validate that HTML content is not empty after sanitization
 * @param content - Sanitized HTML content
 * @returns true if content is valid, false if empty
 */
export const validateHtmlContent = (content: string): boolean => {
  const sanitized = sanitizeHtmlContent(content);
  const textOnly = stripHtml(sanitized).trim();
  return textOnly.length > 0;
};

/**
 * Get word count from content
 * Useful for displaying to users
 */
export const getWordCount = (content: string): number => {
  const plainText = stripHtml(content);
  return countWords(plainText);
};

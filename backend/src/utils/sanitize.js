export const sanitizeText = (text) => {
  if (!text) return '';

  // Sanitize HTML special characters to prevent XSS
  return cleanText
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
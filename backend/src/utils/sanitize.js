export const sanitizeText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const extractTags = (text) => {
  if (!text) return [];
  
  const tagPattern = /#(\w+)/g;
  const matches = text.match(tagPattern);
  
  if (!matches) return [];
  
  return matches.map(tag => tag.substring(1).toLowerCase());
};

import { decode } from 'html-entities';

/**
 * Checks if HTML content is meaningful (not just tags/whitespace/entities).
 * Used for backend validation of comments/posts.
 */
export function isMeaningfulHtml(html: string): boolean {
  if (!html) return false;
  // Remove tags, decode entities, trim
  const text = decode(html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')).replace(/\s+/g, ' ').trim();
  return text.length > 0;
} 
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

/**
 * Ensures only <input type="checkbox"> elements are allowed and strips event handlers from <input> and <label>.
 * Use after DOMPurify.sanitize for defense-in-depth.
 */
export function enforceSafeCheckboxInputs(html: string): string {
  if (!html) return html;
  // Use DOMParser to parse HTML
  const parser = typeof window !== 'undefined' ? window.DOMParser : require('jsdom').JSDOM;
  let doc;
  if (typeof window !== 'undefined') {
    doc = new window.DOMParser().parseFromString(html, 'text/html');
  } else {
    const { JSDOM } = require('jsdom');
    doc = new JSDOM(html).window.document;
  }
  // Remove <input> elements that are not type="checkbox"
  doc.querySelectorAll('input').forEach((input: Element) => {
    if ((input as HTMLInputElement).getAttribute('type') !== 'checkbox') {
      input.parentNode?.removeChild(input);
    } else {
      // Remove all event handler attributes
      Array.from(input.attributes).forEach(attr => {
        if (/^on/i.test(attr.name)) input.removeAttribute(attr.name);
      });
    }
  });
  // Remove all event handler attributes from <label>
  doc.querySelectorAll('label').forEach((label: Element) => {
    Array.from(label.attributes).forEach(attr => {
      if (/^on/i.test(attr.name)) label.removeAttribute(attr.name);
    });
  });
  return doc.body.innerHTML;
} 
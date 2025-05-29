# Comment Backend Validation & Security

## Validation
- Strips HTML tags and decodes entities before checking for meaningful text.
- Rejects comments that are empty after this process.

## Sanitization
- All comment content is sanitized on the backend using DOMPurify.
- Only a safe subset of HTML tags and attributes is allowed.

## Rate Limiting (Planned)
- Will limit comment submissions per user/IP to prevent spam.

## Rationale
- Ensures robust defense against XSS, spam, and empty/meaningless comments.
- Defense in depth: never trust frontend validation alone.

## References
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [isomorphic-dompurify](https://www.npmjs.com/package/isomorphic-dompurify) 
// Integration tests for /api/posts and /api/posts/trending using Jest
// NOTE: These are templates. For Next.js app directory API routes, handlers use (req: Request) for GET. For real integration, use next-test-api-route-handler or Next.js test utilities.
// Requires: jest, @types/jest

import * as postsRoute from '@/app/api/posts/route';
import * as trendingRoute from '@/app/api/posts/trending/route';

describe('/api/posts', () => {
  it('should list posts (GET)', async () => {
    const req = new Request('http://localhost/api/posts');
    const res = await postsRoute.GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.posts)).toBe(true);
  });
  // TODO: Add tests for filters, pagination, etc.
});

describe('/api/posts/trending', () => {
  it('should list trending posts (GET)', async () => {
    const res = await trendingRoute.GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.posts)).toBe(true);
  });
  // TODO: Add tests for trending score, edge cases, etc.
}); 
// Integration test for /api/admin/posts using Jest
// NOTE: This is a template. For Next.js app directory API routes, handlers use (req: Request) for POST and no args for GET. For real integration, use next-test-api-route-handler or Next.js test utilities.
// Requires: jest, @types/jest

import * as postsRoute from '@/app/api/admin/posts/route';

describe('/api/admin/posts', () => {
  it('should list posts (GET)', async () => {
    // GET handler requires a Request object (app directory convention)
    const req = new Request('http://localhost/api/admin/posts');
    const res = await postsRoute.GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.posts)).toBe(true);
  });

  // TODO: Add tests for filters, valid admin POST, invalid input, etc. when POST handler is implemented.
  // For full integration, mock admin auth and database as needed.
}); 
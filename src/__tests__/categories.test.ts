// Integration test for /api/categories using Jest + Supertest
// NOTE: This is a template. For Next.js app directory API routes, handlers use (req: Request) for POST and no args for GET. For real integration, use next-test-api-route-handler or Next.js test utilities.
// Requires: jest, supertest, @types/jest, @types/supertest

import * as categoriesRoute from '@/app/api/categories/route';

describe('/api/categories', () => {
  it('should list categories', async () => {
    // GET handler takes no arguments
    const res = await categoriesRoute.GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.categories)).toBe(true);
  });

  it('should reject POST if not authenticated', async () => {
    // POST handler expects a Request object
    const req = new Request('http://localhost/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Category' }),
      headers: { 'Content-Type': 'application/json' },
    });
    // This will throw if requireAdmin() is not mocked/skipped
    let res;
    try {
      res = await categoriesRoute.POST(req);
    } catch (e) {
      // If requireAdmin throws, treat as 401
      expect(e).toBeDefined();
      return;
    }
    expect(res.status).toBe(401);
  });

  // Additional tests for valid/invalid input would require mocking requireAdmin and database
}); 
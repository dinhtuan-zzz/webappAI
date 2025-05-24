// Integration tests for /api/search using Jest
// NOTE: This is a template. For Next.js app directory API routes, handlers use (req: NextRequest) for GET. For real integration, use next-test-api-route-handler or Next.js test utilities.
// Requires: jest, @types/jest, next

import * as searchRoute from '@/app/api/search/route';
import { NextRequest } from 'next/server';

describe('/api/search', () => {
  it('should search posts (GET)', async () => {
    const req = new NextRequest('http://localhost/api/search?q=test');
    const res = await searchRoute.GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should filter by category (GET)', async () => {
    const req = new NextRequest('http://localhost/api/search?categories=cat1');
    const res = await searchRoute.GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should filter by date (GET)', async () => {
    const req = new NextRequest('http://localhost/api/search?date=year');
    const res = await searchRoute.GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return empty array if no posts match (GET)', async () => {
    const req = new NextRequest('http://localhost/api/search?q=__unlikely__');
    const res = await searchRoute.GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length === 0).toBe(true);
  });
  // TODO: Add more edge case tests as needed.
}); 
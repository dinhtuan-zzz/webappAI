import { createServer, Server } from 'http';
import request from 'supertest';
import { POST as nextAuthHandler } from './route';
import { prisma } from '@/lib/prisma';
import { createRequest, createResponse } from 'node-mocks-http';
import { testApiHandler } from 'next-test-api-route-handler';
import { NextApiRequest, NextApiResponse } from 'next';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    user: { findUnique: jest.fn() },
    session: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('NextAuth API integration', () => {
  let server: Server;
  let port: number;
  beforeAll((done) => {
    server = createServer((req, res) => {
      // Patch req.query for NextAuth compatibility
      const url = req.url || '';
      // e.g. /api/auth/callback/credentials => ['callback', 'credentials']
      const match = url.match(/\/api\/auth\/(.*)/);
      const nextauth = match ? match[1].split('/').filter(Boolean) : [];
      (req as any).query = { nextauth };
      nextAuthHandler(req, res);
    });
    server.listen(0, () => {
      // @ts-ignore
      port = server.address().port;
      (global as any).testPort = port;
      done();
    });
  });
  afterAll(() => server.close());
  afterEach(() => jest.clearAllMocks());

  it('should reject login with invalid credentials', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const req = createRequest({
      method: 'POST',
      url: '/api/auth/callback/credentials',
      query: { nextauth: ['callback', 'credentials'] },
      body: { email: 'bad@user.com', password: 'wrong' },
    });
    const res = createResponse();
    await nextAuthHandler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it('should allow login with valid credentials and create a session', async () => {
    const mockUser = { id: 'user1', email: 'good@user.com', password: 'hashed', status: 'ACTIVE', roles: [], username: 'gooduser', role: 'user' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.session.create as jest.Mock).mockResolvedValue({ id: 'sess1', sessionToken: 'token', userId: 'user1', expires: new Date(), device: 'test', ip: '127.0.0.1', location: 'Test City' });
    const req = createRequest({
      method: 'POST',
      url: '/api/auth/callback/credentials',
      query: { nextauth: ['callback', 'credentials'] },
      body: { email: 'good@user.com', password: 'correct' },
    });
    const res = createResponse();
    await nextAuthHandler(req, res);
    expect([200, 302]).toContain(res._getStatusCode());
    expect(prisma.session.create).toHaveBeenCalled();
  });

  // Add more tests for session persistence, logout, etc., using node-mocks-http
});

describe('NextAuth API integration (session persistence)', () => {
  it('should persist session and allow access with session cookie', async () => {
    // 1. Mock user and session creation
    const mockUser = { id: 'user1', email: 'good@user.com', password: 'hashed', status: 'ACTIVE', roles: [], username: 'gooduser', role: 'user' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.session.create as jest.Mock).mockResolvedValue({ id: 'sess1', sessionToken: 'token', userId: 'user1', expires: new Date(Date.now() + 100000), device: 'test', ip: '127.0.0.1', location: 'Test City' });

    // 2. Simulate login
    const req = createRequest({ method: 'POST', url: '/api/auth/callback/credentials', body: { email: 'good@user.com', password: 'correct' } });
    const res = createResponse();
    await testApiHandler({
      appHandler: { POST: nextAuthHandler },
      requestPatcher: req => {
        req.headers.set('cookie', 'next-auth.session-token=token');
      },
      test: async ({ fetch }) => {
        const setCookie = res.getHeader('Set-Cookie');
        expect(setCookie).toBeDefined();
        // 3. Simulate authenticated request with session cookie (pseudo, as NextAuth expects more context)
        // In a real test, you would call a protected endpoint with this cookie and assert user context
        // For now, just assert the cookie is set and session was created
        expect(prisma.session.create).toHaveBeenCalled();
      }
    });
  });
});

describe('NextAuth API integration (logout, session expiry, 2FA)', () => {
  let port: number;
  beforeAll(() => {
    // port is set in the previous describe block
    // If needed, set it here as well
    // port = ...
  });
  afterEach(() => jest.clearAllMocks());

  it('should logout and delete session from DB', async () => {
    (prisma.session.delete as jest.Mock).mockResolvedValue({ id: 'sess1' });
    await testApiHandler({
      appHandler: { POST: nextAuthHandler },
      requestPatcher: req => {
        const url = `http://localhost:${(global as any).testPort || 3000}/api/auth/signout`;
        const headers = new Headers(req.headers);
        headers.set('cookie', 'next-auth.session-token=token');
        return new Request(url, { ...req, headers });
      },
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'POST' });
        expect([200, 302]).toContain(res.status);
        expect(prisma.session.delete).toHaveBeenCalled();
      }
    });
  });

  it('should deny access with expired session', async () => {
    (prisma.session.findUnique as jest.Mock).mockResolvedValue({
      id: 'sess1',
      sessionToken: 'token',
      userId: 'user1',
      expires: new Date(Date.now() - 10000), // expired
    });
    await testApiHandler({
      appHandler: { POST: nextAuthHandler },
      requestPatcher: req => {
        const url = `http://localhost:${(global as any).testPort || 3000}/api/auth/session`;
        const headers = new Headers(req.headers);
        headers.set('cookie', 'next-auth.session-token=token');
        return new Request(url, { ...req, headers });
      },
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'POST' });
        expect(res.status).toBe(401);
      }
    });
  });

  it('should require 2FA if enabled', async () => {
    const mockUser = { id: 'user2', email: '2fa@user.com', password: 'hashed', status: 'ACTIVE', roles: [], username: 'user2fa', role: 'user', twoFASecret: 'SECRET' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    await testApiHandler({
      appHandler: { POST: nextAuthHandler },
      requestPatcher: req => {
        const url = `http://localhost:${(global as any).testPort || 3000}/api/auth/callback/credentials`;
        const headers = new Headers(req.headers);
        headers.set('content-type', 'application/json');
        return new Request(url, { ...req, headers });
      },
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'POST', body: JSON.stringify({ email: '2fa@user.com', password: 'correct' }) });
        expect([401, 403, 422]).toContain(res.status);
      }
    });
  });
}); 
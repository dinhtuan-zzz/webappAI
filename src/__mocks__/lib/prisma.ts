export const prisma = {
  user: { findUnique: jest.fn() },
  session: { create: jest.fn(), delete: jest.fn(), findUnique: jest.fn() },
}; 
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma'; // Adjust import if your prisma client is elsewhere

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;
  if (typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Missing query' });
  }
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { profile: { displayName: { contains: query, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        username: true,
        profile: { select: { displayName: true, avatarUrl: true } },
      },
      take: 10,
    });
    res.status(200).json({ users });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
} 
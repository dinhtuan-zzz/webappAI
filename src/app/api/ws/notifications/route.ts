import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// In-memory map of userId to WebSocket connections
const userSockets = new Map<string, Set<WebSocket>>();

/**
 * WebSocket handler for real-time notifications.
 * Upgrades GET requests to a WebSocket connection for the authenticated user.
 */
export async function GET(req: Request) {
  // @ts-ignore: Next.js will inject upgrade logic
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Upgrade required', { status: 426 });
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  // @ts-ignore: Next.js will inject upgrade logic
  const { socket, response } = Deno.upgradeWebSocket(req);
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId)!.add(socket);
  socket.onclose = () => {
    userSockets.get(userId)?.delete(socket);
  };
  socket.onmessage = () => {};
  return response;
}

// Helper to broadcast to a user
export function sendNotificationToUser(userId: string, notification: any) {
  const sockets = userSockets.get(userId);
  if (sockets) {
    for (const ws of sockets) {
      ws.send(JSON.stringify(notification));
    }
  }
} 
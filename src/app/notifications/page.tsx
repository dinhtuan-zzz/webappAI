import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import NotificationItem from '@/components/notifications/NotificationItem';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NotificationCenterPage({ searchParams }: { searchParams: Record<string, string> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <div className="p-8 text-center text-gray-500">Please <Link href="/login" className="text-blue-600 underline">log in</Link> to view notifications.</div>;
  }
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 20;
  const isRead = searchParams.isRead;
  const type = searchParams.type;
  const where: any = { userId: session.user.id };
  if (isRead === 'true') where.isRead = true;
  if (isRead === 'false') where.isRead = false;
  if (type) where.type = type;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
  ]);
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="flex gap-2 mb-4">
        <Link href="/notifications" className={!isRead ? 'font-semibold underline' : ''}>All</Link>
        <Link href="/notifications?isRead=false" className={isRead === 'false' ? 'font-semibold underline' : ''}>Unread</Link>
        <Link href="/notifications?isRead=true" className={isRead === 'true' ? 'font-semibold underline' : ''}>Read</Link>
        {/* Add more filters by type if needed */}
      </div>
      <div className="divide-y rounded-lg border bg-white">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No notifications</div>
        ) : (
          notifications.map((n: any) => <NotificationItem key={n.id} notification={n} />)
        )}
      </div>
      <div className="flex justify-between items-center mt-6">
        <button
          className="text-xs text-blue-600 hover:underline"
          disabled={notifications.length === 0}
          onClick={async () => {
            'use server';
            await prisma.notification.updateMany({ where: { userId: session.user.id, isRead: false }, data: { isRead: true } });
          }}
        >
          Mark all as read
        </button>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => window.location.href = `/notifications?page=${page - 1}${isRead ? `&isRead=${isRead}` : ''}`}
          >
            Previous
          </button>
          <span className="text-xs">Page {page} of {totalPages}</span>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => window.location.href = `/notifications?page=${page + 1}${isRead ? `&isRead=${isRead}` : ''}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
} 
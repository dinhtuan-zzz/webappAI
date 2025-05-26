"use client";

import { Notification } from '@/hooks/useNotifications';
import { Bell, MessageCircle, User, AlertTriangle, Star, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

function getIcon(type: string) {
  switch (type) {
    case 'reply':
      return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case 'mention':
      return <User className="w-5 h-5 text-green-500" />;
    case 'like':
      return <Star className="w-5 h-5 text-yellow-500" />;
    case 'system':
      return <Bell className="w-5 h-5 text-gray-500" />;
    case 'report':
    case 'moderation':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'registration':
      return <CheckCircle className="w-5 h-5 text-indigo-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-400" />;
  }
}

export default function NotificationItem({ notification, ...props }: { notification: Notification } & React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const { data: session } = useSession();
  const username = session?.user?.username;
  const { markAsRead } = useNotifications(username);

  const handleClick = useCallback(async (e: React.MouseEvent | React.KeyboardEvent) => {
    if (notification.link) {
      if (!notification.isRead) {
        await markAsRead([notification.id]);
      }
      router.push(notification.link);
    }
  }, [notification, markAsRead, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick(e);
    }
  };

  const clickable = Boolean(notification.link);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 ${!notification.isRead ? 'bg-blue-50' : ''} ${clickable ? 'cursor-pointer hover:bg-blue-100 focus:bg-blue-100' : ''}`}
      tabIndex={clickable ? 0 : -1}
      role="menuitem"
      aria-label={notification.title}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      {...props}
    >
      <div className="mt-1">{getIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{notification.title}</div>
        <div className="text-xs text-gray-600 truncate">{notification.message}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          <span title={new Date(notification.createdAt).toLocaleString()}>
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
} 
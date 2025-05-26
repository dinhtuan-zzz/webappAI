import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';
import NotificationSheet from './NotificationSheet';
import { useSession } from 'next-auth/react';
import Portal from '@/components/Portal';

console.log('NotificationBell rendered');


export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const username = session?.user?.username;
  const notificationsHook = useNotifications(username);

  console.log('NotificationBell unreadCount:', notificationsHook.unreadCount);
  console.log('NotificationBell session:', session, 'username:', username, 'notifications:', notificationsHook.notifications);

  return (
    <div className="relative inline-block">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="w-6 h-6" />
        {notificationsHook.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {notificationsHook.unreadCount}
          </span>
        )}
      </button>
      {open && (
        <Portal>
          <div
            style={{
              position: 'fixed',
              right: 20,
              top: 60, // adjust as needed for your header
              minWidth: 350,
              zIndex: 9999,
            }}
            className="bg-white shadow-lg rounded-lg border"
          >
            <NotificationDropdown
              onClose={() => setOpen(false)}
              notifications={notificationsHook.notifications}
              isLoading={notificationsHook.isLoading}
              markAllAsRead={notificationsHook.markAllAsRead}
              unreadCount={notificationsHook.unreadCount}
            />
          </div>
        </Portal>
      )}
      {/* Mobile sheet */}
      <NotificationSheet
        open={open}
        onClose={() => setOpen(false)}
        notifications={notificationsHook.notifications}
        isLoading={notificationsHook.isLoading}
        markAllAsRead={notificationsHook.markAllAsRead}
        unreadCount={notificationsHook.unreadCount}
      />
    </div>
  );
} 
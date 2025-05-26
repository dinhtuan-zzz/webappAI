import { useNotifications } from '@/hooks/useNotifications';
import { useSession } from 'next-auth/react';
import NotificationItem from './NotificationItem';
import { useEffect, useRef, useCallback } from 'react';

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
      <div className="w-5 h-5 bg-gray-200 rounded-full mt-1" />
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
        <div className="h-3 bg-gray-100 rounded w-3/4 mb-1" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function NotificationDropdown({
  onClose,
  mobile = false,
  notifications,
  isLoading,
  markAllAsRead,
  unreadCount,
}: {
  onClose: () => void;
  mobile?: boolean;
  notifications: any[];
  isLoading: boolean;
  markAllAsRead: () => void;
  unreadCount: number;
}) {
  // Remove useSession and useNotifications
  // Debug log for session and username
  // console.log('[NotificationDropdown] session:', session, 'username:', username);
  // const { notifications, isLoading, markAllAsRead } = useNotifications(username);

  // Wrap markAllAsRead to add debug log
  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount > 0) {
      console.log('[NotificationDropdown] Calling markAllAsRead');
      markAllAsRead();
    }
  }, [unreadCount, markAllAsRead]);

  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click and Escape key
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Focus trap and keyboard navigation
  useEffect(() => {
    if (firstItemRef.current) firstItemRef.current.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        // Trap focus inside dropdown
        const focusable = listRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      // Arrow key navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const focusable = listRef.current?.querySelectorAll<HTMLElement>('button[role="menuitem"]');
        if (!focusable || focusable.length === 0) return;
        const idx = Array.from(focusable).indexOf(document.activeElement as HTMLElement);
        if (e.key === 'ArrowDown') {
          const next = focusable[(idx + 1) % focusable.length];
          next.focus();
        } else if (e.key === 'ArrowUp') {
          const prev = focusable[(idx - 1 + focusable.length) % focusable.length];
          prev.focus();
        }
        e.preventDefault();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={ref}
      onMouseDown={e => e.stopPropagation()}
      className={mobile
        ? 'w-full max-w-full static rounded-t-2xl bg-white shadow-lg z-50 border focus:outline-none'
        : 'absolute right-0 mt-2 w-[350px] max-w-[90vw] bg-white shadow-lg rounded-lg z-50 border transition-all duration-200 ease-out origin-top scale-100 opacity-100 focus:outline-none'}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="font-semibold">Notifications</span>
        <button
          className="text-xs text-blue-600 hover:underline disabled:opacity-50"
          onClick={handleMarkAllAsRead}
          aria-label="Mark all notifications as read"
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>
      <div
        className="max-h-96 overflow-y-auto divide-y"
        aria-live="polite"
        ref={listRef}
        role="menu"
        tabIndex={-1}
      >
        {isLoading ? (
          <>
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No notifications</div>
        ) : (
          notifications.map((n, i) => (
            <NotificationItem
              key={n.id}
              notification={n}
              role="menuitem"
              tabIndex={0}
              aria-label={n.title}
            />
          ))
        )}
      </div>
    </div>
  );
} 
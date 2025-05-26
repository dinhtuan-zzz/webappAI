import { useEffect, useRef } from 'react';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationSheet({ open, onClose, notifications, isLoading, markAllAsRead, unreadCount }: { open: boolean; onClose: () => void; notifications: any[]; isLoading: boolean; markAllAsRead: () => void; unreadCount: number }) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on tap outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  // Close on swipe down (basic)
  useEffect(() => {
    let startY = 0;
    function handleTouchStart(e: TouchEvent) {
      startY = e.touches[0].clientY;
    }
    function handleTouchEnd(e: TouchEvent) {
      const endY = e.changedTouches[0].clientY;
      if (endY - startY > 60) onClose();
    }
    if (open) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:hidden bg-black/40">
      <div ref={ref} className="w-full bg-white rounded-t-2xl shadow-lg max-h-[80vh] overflow-y-auto animate-slide-up">
        <NotificationDropdown onClose={onClose} mobile notifications={notifications} isLoading={isLoading} markAllAsRead={markAllAsRead} unreadCount={unreadCount} />
      </div>
    </div>
  );
} 
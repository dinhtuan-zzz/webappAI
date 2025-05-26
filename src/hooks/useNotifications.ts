import useSWR, { mutate as globalMutate } from 'swr';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export function useNotifications(username: string | undefined) {
  // Use a constant SWR key for consistency
  const SWR_KEY = username ? `/api/users/${username}/notifications/list?page=1&pageSize=10` : null;
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, error, isLoading, mutate } = useSWR(
    SWR_KEY,
    fetcher,
    { refreshInterval: 10000 } // Poll every 10s for fallback
  );

  // Optimistic unread count state
  const [optimisticUnread, setOptimisticUnread] = useState<number | null>(null);

  // WebSocket for real-time updates
  const wsRef = useRef<WebSocket | null>(null);
  const { data: session } = require('next-auth/react').useSession?.() || {};
  const userId = session?.user?.id;
  useEffect(() => {
    if (!username || !userId) return;
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    function connect() {
      // For local/dev: connect to standalone ws server
      const wsUrl = `ws://localhost:3001?userId=${userId}`;
      ws = new WebSocket(wsUrl);
      ws.onmessage = () => {
        setOptimisticUnread(null); // Reset optimistic state on real update
        mutate();
      };
      ws.onclose = () => {
        // Try to reconnect after 5s
        reconnectTimeout = setTimeout(connect, 5000);
      };
      ws.onerror = () => {
        ws?.close();
      };
      wsRef.current = ws;
    }
    connect();
    return () => {
      ws?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [username, userId, mutate]);

  const notifications: Notification[] = data?.notifications || [];
  console.log('[useNotifications] SWR_KEY:', SWR_KEY, 'notifications:', notifications, 'data:', data);
  const unreadCount =
    optimisticUnread !== null ? optimisticUnread : notifications.filter(n => !n.isRead).length;

  const markAsRead = useCallback(async (ids: string[]) => {
    // Optimistically update UI
    setOptimisticUnread(Math.max(0, unreadCount - ids.length));
    await fetch(`/api/users/${username}/notifications/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    // Use global mutate to update all consumers
    if (SWR_KEY) globalMutate(SWR_KEY);
  }, [username, unreadCount, SWR_KEY]);

  const markAllAsRead = useCallback(async () => {
    console.log('[useNotifications] markAllAsRead called', username);
    // Optimistically update SWR cache and unread count
    setOptimisticUnread(0);
    if (SWR_KEY) {
      // Mutate SWR cache: set all notifications as read
      mutate((currentData: any) => {
        if (!currentData || !Array.isArray(currentData.notifications)) return currentData;
        return {
          ...currentData,
          notifications: currentData.notifications.map((n: Notification) => ({ ...n, isRead: true })),
        };
      }, false); // false = don't revalidate yet
    }
    // Fire API call in background
    fetch(`/api/users/${username}/notifications/mark-all-read`, {
      method: 'POST',
    }).then(async (res) => {
      const result = await res.json().catch(() => ({}));
      console.log('[useNotifications] markAllAsRead API response:', result);
      // Revalidate after server confirms
      if (SWR_KEY) {
        await globalMutate(SWR_KEY);
        mutate();
      }
    });
  }, [username, SWR_KEY, mutate]);

  // Debug logging
  useEffect(() => {
     
    console.log('[useNotifications]', {
      SWR_KEY,
      notifications,
      unreadCount,
      optimisticUnread,
      isLoading,
    });
  }, [SWR_KEY, notifications, unreadCount, optimisticUnread, isLoading]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: mutate,
  };
} 
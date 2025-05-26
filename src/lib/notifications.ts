import { prisma } from './prisma';
import type { NotificationCreateInput, NotificationDTO } from '@/types/Notification';

// Dynamically import the WebSocket sender if running in the server environment
let sendNotificationToUser: ((userId: string, notification: any) => void) | undefined;
try {
  // @ts-ignore
  sendNotificationToUser = require('@/app/api/ws/notifications/route').sendNotificationToUser;
} catch {}

/**
 * Create a notification for a user (or admin).
 * Returns the created notification as DTO.
 */
export async function createNotification(input: NotificationCreateInput): Promise<NotificationDTO> {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      data: input.data,
    },
  });
  const dto: NotificationDTO = {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link ?? undefined,
    isRead: notification.isRead,
    createdAt: notification.createdAt instanceof Date ? notification.createdAt.toISOString() : notification.createdAt,
    data: notification.data,
  };
  // Real-time push
  if (sendNotificationToUser) {
    sendNotificationToUser(notification.userId, dto);
  }
  return dto;
}

// Optionally, add helpers for batch creation, seeding, etc. as needed. 
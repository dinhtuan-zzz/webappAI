// Notification types for user and admin
export enum NotificationType {
  Reply = 'reply',
  Mention = 'mention',
  Like = 'like',
  Follow = 'follow',
  System = 'system',
  Report = 'report',
  Moderation = 'moderation',
  Error = 'error',
  Registration = 'registration',
}

export interface NotificationDTO {
  id: string;
  userId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export interface NotificationCreateInput {
  userId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  link?: string;
  data?: any;
} 
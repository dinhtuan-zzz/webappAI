export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface UserNotificationPreference {
  emailComment: boolean;
  emailReply: boolean;
  emailFollower: boolean;
  emailMention: boolean;
  emailNewsletter: boolean;
} 
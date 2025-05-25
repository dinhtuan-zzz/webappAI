export type UserProfile = {
  displayName?: string;
  avatarUrl?: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  profile?: UserProfile;
};

export interface UserNotificationPreference {
  emailComment: boolean;
  emailReply: boolean;
  emailFollower: boolean;
  emailMention: boolean;
  emailNewsletter: boolean;
} 
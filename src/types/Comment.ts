export interface Comment {
  id: string;
  content: string;
  createdAt: string | Date;
  parentId?: string | null;
  author: {
    email?: string;
    username?: string;
    profile?: {
      displayName?: string;
      avatarUrl?: string;
    };
    id?: string;
  };
  children?: Comment[];
} 
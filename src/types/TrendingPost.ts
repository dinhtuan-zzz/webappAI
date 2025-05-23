export interface TrendingPost {
  id: string;
  title: string;
  slug: string;
  author?: {
    email?: string;
    username?: string;
    profile?: {
      displayName?: string;
      avatarUrl?: string;
    };
  };
  _count?: {
    votes?: number;
    comments?: number;
  };
  viewCount?: number;
} 
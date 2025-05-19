// src/types/Post.ts
export type Post = {
    id: string;
    title: string;
    slug: string;
    summary?: string;
    content?: string;
    createdAt: string | Date;
    viewCount?: number;
    votes?: number;
    comments?: number;
    author?: {
      username?: string;
      email?: string;
      profile?: {
        avatarUrl?: string | null;
        displayName?: string | null;
      };
    };
    categories?: string[]; // <-- array of category names or slugs
    tags?: string[];       // <-- array of tag names or slugs
    // Add other fields as needed
  };
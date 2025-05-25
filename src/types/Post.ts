// src/types/Post.ts
/**
 * Blog post type for API and UI.
 */
import type { Category } from "./Category";
import type { CategoryOption } from './Category';
import type { User } from './User';

export interface Tag {
  id: string;
  name: string;
}

export interface Post {
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
  categories?: Category[];
  tags?: Tag[];
  thumbnail?: string;
  _count?: {
    votes?: number;
    comments?: number;
  };
  // Add other fields as needed
}

/**
 * Input type for updating a post via admin PATCH endpoint.
 */
export interface PostUpdateInput {
  title?: string;
  content?: string;
  categoryIds?: string[];
  status?: string;
  thumbnail?: string;
  tags?: string[];
}

export interface PostFormValues {
  title: string;
  content: string;
  categories: import('./Category').CategoryOption[];
  status: string;
  thumbnail?: string;
}

export interface PostResponse {
  id: string;
  title: string;
  content: string;
  categories: CategoryOption[];
  status: string;
  thumbnail?: string;
  tags?: Tag[];
  author: User;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}
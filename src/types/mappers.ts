import type { PostResponse } from './Post';
import type { Category } from './Category';
import type { User, UserProfile } from './User';

// Map Prisma user (with profile) to API User type
export function mapPrismaUserToUser(prismaUser: Record<string, unknown>): User {
  let profile: UserProfile | undefined = undefined;
  if (prismaUser.profile && typeof prismaUser.profile === 'object') {
    const p = prismaUser.profile as Record<string, unknown>;
    profile = {
      displayName: typeof p.displayName === 'string' ? p.displayName : undefined,
      avatarUrl: typeof p.avatarUrl === 'string' ? p.avatarUrl : undefined,
    };
  }
  return {
    id: prismaUser.id as string,
    username: prismaUser.username as string,
    email: prismaUser.email as string,
    role: prismaUser.role as string,
    profile,
  };
}

// Map Prisma post (with includes) to PostResponse
export function mapPrismaPostToPostResponse(prismaPost: Record<string, unknown>): PostResponse {
  return {
    id: prismaPost.id as string,
    title: prismaPost.title as string,
    content: prismaPost.content as string,
    categories: Array.isArray(prismaPost.categories)
      ? (prismaPost.categories as Array<{ category: Category }>).map((pc) => pc.category)
      : [],
    status: prismaPost.status as string,
    // Prisma type lag workaround for thumbnail
    thumbnail: (prismaPost as any).thumbnail ?? undefined,
    tags: Array.isArray(prismaPost.tags)
      ? (prismaPost.tags as Array<{ tag: { id: string; name: string } }>).map((pt) => ({ id: pt.tag.id, name: pt.tag.name }))
      : [],
    author: mapPrismaUserToUser(prismaPost.author as Record<string, unknown>),
    createdAt:
      prismaPost.createdAt instanceof Date
        ? prismaPost.createdAt.toISOString()
        : (prismaPost.createdAt as string),
    updatedAt:
      prismaPost.updatedAt instanceof Date
        ? prismaPost.updatedAt.toISOString()
        : (prismaPost.updatedAt as string),
    viewCount: typeof prismaPost.viewCount === 'number' ? prismaPost.viewCount : 0,
  };
} 
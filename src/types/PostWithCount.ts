import type { Post } from "./Post";

export type PostWithCount = Post & {
  _count: {
    votes: number;
    comments: number;
  };
};
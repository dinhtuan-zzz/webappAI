export interface Category {
  id: string;
  name: string;
  postCount?: number;
}

export interface CategoryOption extends Category {
  archived?: boolean;
} 
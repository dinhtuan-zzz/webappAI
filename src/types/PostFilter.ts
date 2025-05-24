export interface PostFilter {
  search?: string;
  status?: string;
  date?: string;
  categoryIds?: string[];
  page?: number;
  pageSize?: number;
} 
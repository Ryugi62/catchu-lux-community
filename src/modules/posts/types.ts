export interface Post {
  id: string;
  title: string;
  brand: string;
  category: string;
  tags: string[];
  content: string;
  imageUrls: string[];
  authorId: string;
  authorName?: string | null;
  likeCount: number;
  createdAt?: Date;
}

export interface Comment {
  id: string;
  content: string;
  toneTag: string;
  authorId: string;
  authorName?: string | null;
  createdAt?: Date;
}

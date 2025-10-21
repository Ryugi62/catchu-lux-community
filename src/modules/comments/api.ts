import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  type DocumentData,
} from 'firebase/firestore';
import { firestore } from '../../lib/firebase';
import type { Comment } from './types';

const COMMENTS_COLLECTION = 'comments';

const toComment = (docData: DocumentData, id: string): Comment => ({
  id,
  content: docData.content,
  toneTag: docData.toneTag,
  authorId: docData.authorId,
  authorName: docData.authorName,
  createdAt: docData.createdAt?.toDate?.() ?? undefined,
});

export interface CreateCommentInput {
  postId: string;
  content: string;
  toneTag: string;
  authorId: string;
  authorName?: string | null;
}

export const createComment = async ({ postId, content, toneTag, authorId, authorName }: CreateCommentInput) => {
  const commentsRef = collection(firestore, `posts/${postId}/${COMMENTS_COLLECTION}`);
  await addDoc(commentsRef, {
    content,
    toneTag,
    authorId,
    authorName,
    createdAt: serverTimestamp(),
  });
};

interface UpdateCommentInput {
  postId: string;
  commentId: string;
  content?: string;
  toneTag?: string;
}

export const updateComment = async ({ postId, commentId, ...updates }: UpdateCommentInput) => {
  const commentRef = doc(firestore, `posts/${postId}/${COMMENTS_COLLECTION}/${commentId}`);
  await updateDoc(commentRef, updates);
};

interface ListenToCommentsOptions {
  onError?: (error: unknown) => void;
}

export const listenToComments = (
  postId: string,
  onUpdate: (comments: Comment[]) => void,
  options?: ListenToCommentsOptions
) => {
  const { onError } = options ?? {};
  const commentsRef = collection(firestore, `posts/${postId}/${COMMENTS_COLLECTION}`);
  const commentsQuery = query(commentsRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    commentsQuery,
    {
      next: (snapshot) => {
        const comments = snapshot.docs.map((docSnapshot) =>
          toComment(docSnapshot.data(), docSnapshot.id)
        );
        onUpdate(comments);
      },
      error: (error) => {
        console.error(`[listenToComments] snapshot error for post ${postId}`, error);
        onError?.(error);
      },
    }
  );
};

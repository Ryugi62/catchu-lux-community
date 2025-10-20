import { FirebaseError } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../../lib/firebase';
import type { Post } from './types';

export interface CreatePostInput {
  title: string;
  brand: string;
  category: string;
  tags: string[];
  content: string;
  imageUris: string[];
  authorId: string;
  authorName?: string | null;
}

const POSTS_COLLECTION = 'posts';

const toPost = (docData: DocumentData, id: string): Post => ({
  id,
  title: docData.title,
  brand: docData.brand,
  category: docData.category,
  tags: docData.tags ?? [],
  content: docData.content,
  imageUrls: docData.imageUrls ?? [],
  authorId: docData.authorId,
  authorName: docData.authorName,
  likeCount: docData.likeCount ?? 0,
  createdAt: docData.createdAt?.toDate?.() ?? undefined,
});

export const createPost = async ({
  title,
  brand,
  category,
  tags,
  content,
  imageUris,
  authorId,
  authorName,
}: CreatePostInput) => {
  try {
    const uploadedImageUrls = await Promise.all(
      imageUris.map(async (uri, index) => {
        try {
          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error(`이미지(${index + 1})를 불러오지 못했습니다.`);
          }
          const blob = await response.blob();
          const storageRef = ref(storage, `posts/${authorId}/${Date.now()}-${index}.jpg`);
          await uploadBytes(storageRef, blob);
          return getDownloadURL(storageRef);
        } catch (error) {
          console.error(`[createPost] failed to upload image ${uri}`, error);
          throw new Error('이미지 업로드 중 문제가 발생했습니다. 네트워크와 권한 설정을 확인해주세요.');
        }
      })
    );

    const post = await addDoc(collection(firestore, POSTS_COLLECTION), {
      title,
      brand,
      category,
      tags,
      content,
      imageUrls: uploadedImageUrls,
      authorId,
      authorName,
      likeCount: 0,
      createdAt: serverTimestamp(),
    });

    return post.id;
  } catch (error) {
    console.error('[createPost] failed to create post', error);
    if (error instanceof FirebaseError) {
      if (error.code === 'permission-denied') {
        throw new Error('게시글 작성 권한이 없습니다. 로그인 상태와 Firestore 규칙을 확인해주세요.');
      }
      if (error.code === 'storage/unauthorized') {
        throw new Error('이미지 업로드 권한이 없어 실패했습니다. 스토리지 규칙을 확인해주세요.');
      }
    }
    throw error instanceof Error
      ? error
      : new Error('게시글 작성에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
};

interface ListenToLatestPostsOptions {
  pageSize?: number;
  onError?: (error: unknown) => void;
}

export interface PostsSnapshot {
  posts: Post[];
  cursor: QueryDocumentSnapshot<DocumentData> | null;
}

export const listenToLatestPosts = (
  onUpdate: (snapshot: PostsSnapshot) => void,
  options?: ListenToLatestPostsOptions
) => {
  const { pageSize = 50, onError } = options ?? {};
  const feedQuery = query(
    collection(firestore, POSTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  return onSnapshot(
    feedQuery,
    {
      next: (snapshot) => {
        const posts = snapshot.docs.map((docSnapshot) => toPost(docSnapshot.data(), docSnapshot.id));
        const cursor = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
        onUpdate({ posts, cursor });
      },
      error: (error) => {
        console.error('[listenToLatestPosts] snapshot error', error);
        onError?.(error);
      },
    }
  );
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  const docRef = doc(firestore, POSTS_COLLECTION, postId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return null;
  }
  return toPost(docSnap.data(), docSnap.id);
};

interface FetchPostsPageParams {
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}

export const fetchPostsPage = async ({
  pageSize = 20,
  cursor,
}: FetchPostsPageParams = {}) => {
  let feedQuery = query(
    collection(firestore, POSTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (cursor) {
    feedQuery = query(feedQuery, startAfter(cursor));
  }

  const snapshot = await getDocs(feedQuery);
  const posts = snapshot.docs.map((docSnapshot) => toPost(docSnapshot.data(), docSnapshot.id));
  const nextCursor = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

  return {
    posts,
    cursor: nextCursor,
    hasMore: snapshot.size === pageSize,
  };
};

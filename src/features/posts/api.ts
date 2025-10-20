import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
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
  const uploadedImageUrls = await Promise.all(
    imageUris.map(async (uri, index) => {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `posts/${authorId}/${Date.now()}-${index}.jpg`);
      await uploadBytes(storageRef, blob);
      return getDownloadURL(storageRef);
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
};

export const listenToLatestPosts = (onUpdate: (posts: Post[]) => void, pageSize = 50) => {
  const feedQuery = query(
    collection(firestore, POSTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  return onSnapshot(feedQuery, (snapshot) => {
    const posts = snapshot.docs.map((docSnapshot) => toPost(docSnapshot.data(), docSnapshot.id));
    onUpdate(posts);
  });
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  const docRef = doc(firestore, POSTS_COLLECTION, postId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return null;
  }
  return toPost(docSnap.data(), docSnap.id);
};

import { useEffect, useState } from 'react';
import { getPostById } from '../features/posts/api';
import type { Post } from '../features/posts/types';

export const usePost = (postId: string) => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await getPostById(postId);
      if (active) {
        setPost(result);
        setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [postId]);

  return { post, isLoading };
};

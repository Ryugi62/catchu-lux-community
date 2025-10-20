import { useEffect, useMemo, useState } from 'react';
import { listenToLatestPosts } from '../features/posts/api';
import type { Post } from '../features/posts/types';
import { useAuth } from './useAuth';

export const usePostsFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!user) {
      if (!isAuthLoading) {
        setIsLoading(false);
      }
      setPosts([]);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);

    const unsubscribe = listenToLatestPosts(
      (incoming) => {
        setErrorMessage(null);
        setPosts(incoming);
        setIsLoading(false);
      },
      {
        onError: (error) => {
          console.error('[usePostsFeed] listen error', error);
          setIsLoading(false);
          if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
            setErrorMessage('접근 권한이 없습니다. 로그인 상태와 Firestore 규칙을 확인해주세요.');
            return;
          }
          setErrorMessage('피드를 불러오지 못했습니다. 네트워크 상태를 확인한 뒤 새로고침해주세요.');
        },
      }
    );

    return unsubscribe;
  }, [user, isAuthLoading]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (brandFilter && post.brand !== brandFilter) {
        return false;
      }
      if (categoryFilter && post.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [posts, brandFilter, categoryFilter]);

  return {
    posts: filteredPosts,
    isLoading,
    errorMessage,
    brandFilter,
    setBrandFilter,
    categoryFilter,
    setCategoryFilter,
    hasActiveFilter: Boolean(brandFilter || categoryFilter),
    clearFilters: () => {
      setBrandFilter(null);
      setCategoryFilter(null);
    },
  };
};
